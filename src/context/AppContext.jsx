// CARELOOP - Application Context (Supabase-powered Global State)
// CARELOOP does NOT diagnose diseases or prescribe treatment.
import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import {
  authService,
  patientService,
  careGapService,
  activityService,
  statsService,
} from '../lib/supabaseService';
import { INITIAL_PATIENTS, DOCTORS, CARE_COORDINATORS } from '../data/patients';
import { detectCareGaps } from '../engine/careGapEngine';

// ─── Demo fallback users (used when Supabase auth is not configured) ─
export const DEMO_USERS = [
  {
    id: 'U001',
    username: 'admin',
    password: 'admin123',
    name: 'Dr. Admin',
    role: 'ADMIN',
    avatar: 'A',
    email: 'admin@careloop.health',
  },
  {
    id: 'U002',
    username: 'doctor',
    password: 'doctor123',
    name: 'Dr. Priya Sharma',
    role: 'DOCTOR',
    avatar: 'P',
    email: 'priya@careloop.health',
    doctorId: 'D001',
  },
  {
    id: 'U003',
    username: 'patient',
    password: 'patient123',
    name: 'Rahul Sharma',
    role: 'PATIENT',
    avatar: 'RS',
    email: 'rahul.sharma@careloop.health',
    patientId: 'P-1001',
  },
];

const initialState = {
  user: null,
  supabaseUser: null,        // raw Supabase auth user
  userProfile: null,         // user_profiles row
  patients: INITIAL_PATIENTS,
  doctors: DOCTORS,
  coordinators: CARE_COORDINATORS,
  activePatientId: null,
  activeGapId: null,
  activityLog: [
    { id: 'AL-001', message: 'Doctor review completed for P-1055 (Arvind Chaudhary)', type: 'success', timestamp: new Date(Date.now() - 3600000).toISOString() },
    { id: 'AL-002', message: 'High-priority care gap detected for P-1082 (Anita Desai)', type: 'alert', timestamp: new Date(Date.now() - 7200000).toISOString() },
    { id: 'AL-003', message: 'Follow-up overdue for P-1017 (Mohammed Al-Rashid)', type: 'warning', timestamp: new Date(Date.now() - 10800000).toISOString() },
    { id: 'AL-004', message: 'Care loop closed for P-1055 (Arvind Chaudhary)', type: 'success', timestamp: new Date(Date.now() - 14400000).toISOString() },
    { id: 'AL-005', message: 'New patient P-1103 (Kamala Subramaniam) registered', type: 'info', timestamp: new Date(Date.now() - 18000000).toISOString() },
  ],
  notification: null,
  dbStats: null,
  isLoadingDb: false,
};

function careloopReducer(state, action) {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, user: action.payload };

    case 'SUPABASE_LOGIN':
      return {
        ...state,
        supabaseUser: action.payload.supabaseUser,
        userProfile: action.payload.userProfile,
        user: action.payload.user, // normalized user object
      };

    case 'LOGOUT':
      return { ...state, user: null, supabaseUser: null, userProfile: null, activePatientId: null, activeGapId: null };

    case 'SET_ACTIVE_PATIENT':
      return { ...state, activePatientId: action.payload };

    case 'SET_ACTIVE_GAP':
      return { ...state, activeGapId: action.payload };

    case 'SET_PATIENTS':
      return { ...state, patients: action.payload };

    case 'ADD_PATIENT':
      return {
        ...state,
        patients: [...state.patients, action.payload],
        activityLog: [
          { id: `AL-${Date.now()}`, message: `New patient ${action.payload.id} (${action.payload.name}) registered`, type: 'info', timestamp: new Date().toISOString() },
          ...state.activityLog,
        ],
      };

    case 'UPDATE_CARE_EVENT': {
      const { patientId, eventId, updates } = action.payload;
      const patients = state.patients.map((p) => {
        if (p.id !== patientId) return p;
        return {
          ...p,
          careEvents: p.careEvents.map((e) => e.id === eventId ? { ...e, ...updates } : e),
        };
      });
      return {
        ...state,
        patients,
        activityLog: [
          { id: `AL-${Date.now()}`, message: `Care event updated for patient ${patientId}`, type: 'success', timestamp: new Date().toISOString() },
          ...state.activityLog,
        ],
      };
    }

    case 'ASSIGN_GAP':
      return {
        ...state,
        activityLog: [
          { id: `AL-${Date.now()}`, message: `Gap ${action.payload.gapId} assigned to ${action.payload.assignee}`, type: 'info', timestamp: new Date().toISOString() },
          ...state.activityLog,
        ],
      };

    case 'RESOLVE_GAP': {
      const { patientId, stage, resolution, resolvedBy } = action.payload;
      const patients = state.patients.map((p) => {
        if (p.id !== patientId) return p;
        return {
          ...p,
          careEvents: p.careEvents.map((e) =>
            e.stage === stage
              ? { ...e, status: 'COMPLETED', date: new Date().toISOString().split('T')[0], notes: resolution, resolvedBy }
              : e
          ),
        };
      });
      return {
        ...state,
        patients,
        activityLog: [
          { id: `AL-${Date.now()}`, message: `Gap resolved: ${stage} for patient ${patientId} by ${resolvedBy}`, type: 'success', timestamp: new Date().toISOString() },
          ...state.activityLog,
        ],
      };
    }

    case 'IMPORT_PATIENTS': {
      const newPatients = action.payload;
      return {
        ...state,
        patients: [...state.patients, ...newPatients],
        activityLog: [
          { id: `AL-${Date.now()}`, message: `${newPatients.length} patients imported via CSV`, type: 'success', timestamp: new Date().toISOString() },
          ...state.activityLog,
        ],
      };
    }

    case 'SHOW_NOTIFICATION':
      return { ...state, notification: action.payload };

    case 'CLEAR_NOTIFICATION':
      return { ...state, notification: null };

    case 'SIMULATE_GAP': {
      const { patientId, stage } = action.payload;
      const patients = state.patients.map((p) => {
        if (p.id !== patientId) return p;
        return {
          ...p,
          careEvents: p.careEvents.map((e) => e.stage === stage ? { ...e, status: 'PENDING', waitingDays: 5 } : e),
        };
      });
      return {
        ...state,
        patients,
        activityLog: [
          { id: `AL-${Date.now()}`, message: `[SIMULATION] Care gap injected at ${stage} for ${patientId}`, type: 'alert', timestamp: new Date().toISOString() },
          ...state.activityLog,
        ],
      };
    }

    case 'SET_DB_STATS':
      return { ...state, dbStats: action.payload };

    case 'SET_LOADING_DB':
      return { ...state, isLoadingDb: action.payload };

    case 'ADD_ACTIVITY': {
      const { message, type } = action.payload;
      return {
        ...state,
        activityLog: [
          { id: `AL-${Date.now()}`, message, type, timestamp: new Date().toISOString() },
          ...state.activityLog,
        ],
      };
    }

    default:
      return state;
  }
}

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(careloopReducer, initialState);

  // ─── Supabase auth listener ──────────────────────────────────────
  useEffect(() => {
    const { data: { subscription } } = authService.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        try {
          const profile = await authService.getProfile(session.user.id);
          const normalizedUser = {
            id: profile.id,
            username: profile.username,
            name: profile.full_name,
            role: profile.role,
            avatar: profile.avatar || profile.full_name?.charAt(0).toUpperCase(),
            email: profile.email || session.user.email,
            doctorId: profile.doctor_id,
            patientId: profile.patient_id,
          };
          dispatch({ type: 'SUPABASE_LOGIN', payload: { supabaseUser: session.user, userProfile: profile, user: normalizedUser } });
        } catch {
          // Profile not found — may be using demo mode
        }
      } else if (event === 'SIGNED_OUT') {
        dispatch({ type: 'LOGOUT' });
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  // ─── Load DB stats on mount ───────────────────────────────────────
  useEffect(() => {
    statsService.getAggregateStats()
      .then((stats) => dispatch({ type: 'SET_DB_STATS', payload: stats }))
      .catch(() => {}); // silent — use local fallback
  }, []);

  // ─── Demo login (no Supabase email required) ─────────────────────
  const login = useCallback((username, password) => {
    const user = DEMO_USERS.find((u) => u.username === username && u.password === password);
    if (user) {
      dispatch({ type: 'LOGIN', payload: user });
      activityService.log(null, `Demo login: ${user.name} (${user.role})`, 'info').catch(() => {});
      return true;
    }
    return false;
  }, []);

  // ─── Supabase email/password login ───────────────────────────────
  const loginWithSupabase = useCallback(async (email, password) => {
    const data = await authService.signIn(email, password);
    // Auth state change listener handles the rest
    return data;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.signOut();
    } catch {
      // Already signed out
    }
    dispatch({ type: 'LOGOUT' });
  }, []);

  // ─── Gap helpers (local engine, enhanced by Supabase data) ───────
  const getAllGaps = useCallback(() => {
    return state.patients.flatMap((p) => detectCareGaps(p));
  }, [state.patients]);

  const getPatientGaps = useCallback((patientId) => {
    const patient = state.patients.find((p) => p.id === patientId);
    if (!patient) return [];
    return detectCareGaps(patient);
  }, [state.patients]);

  // ─── Load patients from Supabase ─────────────────────────────────
  const loadPatientsFromDb = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING_DB', payload: true });
      const dbPatients = await patientService.getAll();
      if (dbPatients?.length > 0) {
        // Merge DB patients with local careEvents (from static data) for gap engine
        const merged = dbPatients.map((dbP) => {
          const local = INITIAL_PATIENTS.find((lp) => lp.id === dbP.id);
          return {
            ...dbP,
            careEvents: local?.careEvents || [],
            careStatus: dbP.care_status,
          };
        });
        dispatch({ type: 'SET_PATIENTS', payload: merged });
      }
    } catch {
      // Use local data as fallback
    } finally {
      dispatch({ type: 'SET_LOADING_DB', payload: false });
    }
  }, []);

  // ─── Notification helper ─────────────────────────────────────────
  const showNotification = useCallback((message, type = 'success') => {
    dispatch({ type: 'SHOW_NOTIFICATION', payload: { message, type } });
    setTimeout(() => dispatch({ type: 'CLEAR_NOTIFICATION' }), 4000);
  }, []);

  return (
    <AppContext.Provider
      value={{
        ...state,
        login,
        loginWithSupabase,
        logout,
        dispatch,
        getAllGaps,
        getPatientGaps,
        showNotification,
        loadPatientsFromDb,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
