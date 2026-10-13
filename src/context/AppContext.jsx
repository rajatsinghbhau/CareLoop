// CARELOOP - Application Context (Global State Management)
import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { INITIAL_PATIENTS, DOCTORS, CARE_COORDINATORS } from '../data/patients';
import { detectCareGaps } from '../engine/careGapEngine';

// Demo users
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
    { id: 'AL-006', message: 'Gap assigned to Anjali Gupta: Follow-up for P-1071', type: 'info', timestamp: new Date(Date.now() - 21600000).toISOString() },
  ],
  notification: null,
};

function careloopReducer(state, action) {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, user: action.payload };

    case 'LOGOUT':
      return { ...state, user: null, activePatientId: null, activeGapId: null };

    case 'SET_ACTIVE_PATIENT':
      return { ...state, activePatientId: action.payload };

    case 'SET_ACTIVE_GAP':
      return { ...state, activeGapId: action.payload };

    case 'ADD_PATIENT':
      return {
        ...state,
        patients: [...state.patients, action.payload],
        activityLog: [
          {
            id: `AL-${Date.now()}`,
            message: `New patient ${action.payload.id} (${action.payload.name}) registered`,
            type: 'info',
            timestamp: new Date().toISOString(),
          },
          ...state.activityLog,
        ],
      };

    case 'UPDATE_CARE_EVENT': {
      const { patientId, eventId, updates } = action.payload;
      const patients = state.patients.map((p) => {
        if (p.id !== patientId) return p;
        return {
          ...p,
          careEvents: p.careEvents.map((e) =>
            e.id === eventId ? { ...e, ...updates } : e
          ),
        };
      });
      return {
        ...state,
        patients,
        activityLog: [
          {
            id: `AL-${Date.now()}`,
            message: `Care event updated for patient ${patientId}`,
            type: 'success',
            timestamp: new Date().toISOString(),
          },
          ...state.activityLog,
        ],
      };
    }

    case 'ASSIGN_GAP': {
      const { gapId, assignee } = action.payload;
      // Store gap assignments in patient events (simplified)
      return {
        ...state,
        activityLog: [
          {
            id: `AL-${Date.now()}`,
            message: `Gap ${gapId} assigned to ${assignee}`,
            type: 'info',
            timestamp: new Date().toISOString(),
          },
          ...state.activityLog,
        ],
      };
    }

    case 'RESOLVE_GAP': {
      const { patientId, stage, resolution, resolvedBy } = action.payload;
      const patients = state.patients.map((p) => {
        if (p.id !== patientId) return p;
        return {
          ...p,
          careEvents: p.careEvents.map((e) =>
            e.stage === stage
              ? {
                  ...e,
                  status: 'COMPLETED',
                  date: new Date().toISOString().split('T')[0],
                  notes: resolution,
                  resolvedBy,
                }
              : e
          ),
        };
      });
      return {
        ...state,
        patients,
        activityLog: [
          {
            id: `AL-${Date.now()}`,
            message: `Gap resolved: ${stage} for patient ${patientId} by ${resolvedBy}`,
            type: 'success',
            timestamp: new Date().toISOString(),
          },
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
          {
            id: `AL-${Date.now()}`,
            message: `${newPatients.length} patients imported via CSV`,
            type: 'success',
            timestamp: new Date().toISOString(),
          },
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
          careEvents: p.careEvents.map((e) =>
            e.stage === stage
              ? { ...e, status: 'PENDING', waitingDays: 5 }
              : e
          ),
        };
      });
      return {
        ...state,
        patients,
        activityLog: [
          {
            id: `AL-${Date.now()}`,
            message: `[SIMULATION] Care gap injected at ${stage} for ${patientId}`,
            type: 'alert',
            timestamp: new Date().toISOString(),
          },
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

  const login = useCallback((username, password) => {
    const user = DEMO_USERS.find(
      (u) => u.username === username && u.password === password
    );
    if (user) {
      dispatch({ type: 'LOGIN', payload: user });
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    dispatch({ type: 'LOGOUT' });
  }, []);

  const getAllGaps = useCallback(() => {
    return state.patients.flatMap((p) => detectCareGaps(p));
  }, [state.patients]);

  const getPatientGaps = useCallback(
    (patientId) => {
      const patient = state.patients.find((p) => p.id === patientId);
      if (!patient) return [];
      return detectCareGaps(patient);
    },
    [state.patients]
  );

  const showNotification = useCallback((message, type = 'success') => {
    dispatch({ type: 'SHOW_NOTIFICATION', payload: { message, type } });
    setTimeout(() => dispatch({ type: 'CLEAR_NOTIFICATION' }), 4000);
  }, []);

  return (
    <AppContext.Provider
      value={{
        ...state,
        login,
        logout,
        dispatch,
        getAllGaps,
        getPatientGaps,
        showNotification,
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
