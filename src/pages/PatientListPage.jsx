// CARELOOP - Patient List Page
import React, { useState, useMemo } from 'react';
import { Search, Filter, UserPlus, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { detectCareGaps } from '../engine/careGapEngine';
import {
  PriorityBadge, CareStatusBadge, Td, Th, TableRow, Modal, EmptyState
} from '../components/shared/UI';
import { TopBar } from '../components/shared/Navigation';

const FILTERS = [
  { id: 'all', label: 'All Patients' },
  { id: 'gaps', label: 'Open Gaps' },
  { id: 'high', label: 'High Priority' },
  { id: 'followup', label: 'Follow-up Due' },
  { id: 'review', label: 'Awaiting Review' },
  { id: 'closed', label: 'Closed' },
];

const STAGE_LABELS = {
  CONSULTATION: 'Consultation',
  TEST_ORDERED: 'Test Ordered',
  TEST_COMPLETED: 'Test Completed',
  RESULT_AVAILABLE: 'Result Available',
  DOCTOR_REVIEW: 'Doctor Review',
  REFERRAL: 'Referral',
  FOLLOW_UP: 'Follow-up',
  CARE_CLOSED: 'Care Closed',
};

function getCurrentStage(patient) {
  const stages = ['CARE_CLOSED', 'FOLLOW_UP', 'REFERRAL', 'DOCTOR_REVIEW', 'RESULT_AVAILABLE', 'TEST_COMPLETED', 'TEST_ORDERED', 'CONSULTATION'];
  for (const stage of stages) {
    const e = patient.careEvents?.find((ev) => ev.stage === stage);
    if (e?.status === 'COMPLETED') return STAGE_LABELS[stage] || stage;
  }
  return 'Not Started';
}

function AddPatientModal({ onClose }) {
  const { dispatch, showNotification } = useApp();
  const [form, setForm] = useState({
    name: '',
    age: '',
    gender: 'Male',
    condition: '',
    phone: '',
    email: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const id = `P-${Math.floor(1200 + Math.random() * 900)}`;
    const today = new Date().toISOString().split('T')[0];

    const newPatient = {
      id,
      name: form.name,
      age: parseInt(form.age),
      gender: form.gender,
      condition: form.condition,
      phone: form.phone,
      email: form.email,
      doctorId: 'D003',
      coordinatorId: 'CC001',
      lastAppointment: today,
      careStatus: 'IN_PROGRESS',
      careEvents: [
        {
          id: `CE-${Date.now()}`,
          stage: 'CONSULTATION',
          status: 'COMPLETED',
          date: today,
          notes: 'Initial consultation.',
          doctor: 'Dr. Sunita Rao',
        },
        { id: `CE-${Date.now() + 1}`, stage: 'TEST_ORDERED', status: 'NOT_STARTED', date: null, notes: '' },
        { id: `CE-${Date.now() + 2}`, stage: 'TEST_COMPLETED', status: 'NOT_STARTED', date: null, notes: '' },
        { id: `CE-${Date.now() + 3}`, stage: 'RESULT_AVAILABLE', status: 'NOT_STARTED', date: null, notes: '' },
        { id: `CE-${Date.now() + 4}`, stage: 'DOCTOR_REVIEW', status: 'NOT_STARTED', date: null, notes: '' },
        { id: `CE-${Date.now() + 5}`, stage: 'REFERRAL', status: 'NOT_STARTED', date: null, notes: '' },
        { id: `CE-${Date.now() + 6}`, stage: 'FOLLOW_UP', status: 'NOT_STARTED', date: null, notes: '' },
        { id: `CE-${Date.now() + 7}`, stage: 'CARE_CLOSED', status: 'NOT_STARTED', date: null, notes: '' },
      ],
    };

    dispatch({ type: 'ADD_PATIENT', payload: newPatient });
    showNotification(`Patient ${newPatient.name} (${id}) registered successfully`);
    onClose();
  };

  return (
    <Modal title="Add New Patient" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Full Name *</label>
            <input
              required
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-red-400 focus:bg-white transition-all shadow-sm"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Rahul Sharma"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Age *</label>
            <input
              required
              type="number"
              min="1"
              max="120"
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-red-400 focus:bg-white transition-all shadow-sm"
              value={form.age}
              onChange={(e) => setForm({ ...form, age: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Gender</label>
            <select
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-red-400 focus:bg-white transition-all shadow-sm"
              value={form.gender}
              onChange={(e) => setForm({ ...form, gender: e.target.value })}
            >
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Condition / Diagnosis *</label>
            <input
              required
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-red-400 focus:bg-white transition-all shadow-sm"
              value={form.condition}
              onChange={(e) => setForm({ ...form, condition: e.target.value })}
              placeholder="e.g. Type 2 Diabetes"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Phone</label>
            <input
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-red-400 focus:bg-white transition-all shadow-sm"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+91 98765 43210"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Email</label>
            <input
              type="email"
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-red-400 focus:bg-white transition-all shadow-sm"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="patient@example.com"
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <button type="button" onClick={onClose} className="btn-soft-pill text-xs">Cancel</button>
          <button type="submit" className="btn-coral-pill text-xs">Add Patient</button>
        </div>
      </form>
    </Modal>
  );
}

export function PatientListPage({ onNavigate, onSelectPatient }) {
  const { patients, user } = useApp();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);

  const enriched = useMemo(() => {
    return patients.map((p) => {
      const gaps = detectCareGaps(p);
      const highPriorityGap = gaps.find((g) => g.priority === 'HIGH');
      const hasFollowUpDue = gaps.some((g) => g.type === 'FOLLOW_UP_OVERDUE');
      const hasReviewPending = gaps.some((g) => g.type === 'RESULT_NOT_REVIEWED');
      const careClosed = p.careEvents?.find((e) => e.stage === 'CARE_CLOSED');

      return {
        ...p,
        gaps,
        openGaps: gaps.length,
        highestPriority: highPriorityGap?.priority || (gaps.length > 0 ? gaps[0].priority : null),
        hasFollowUpDue,
        hasReviewPending,
        isClosed: careClosed?.status === 'COMPLETED',
        currentStage: getCurrentStage(p),
      };
    });
  }, [patients]);

  const filtered = useMemo(() => {
    let result = enriched;

    if (filter === 'gaps') result = result.filter((p) => p.openGaps > 0);
    else if (filter === 'high') result = result.filter((p) => p.highestPriority === 'HIGH');
    else if (filter === 'followup') result = result.filter((p) => p.hasFollowUpDue);
    else if (filter === 'review') result = result.filter((p) => p.hasReviewPending);
    else if (filter === 'closed') result = result.filter((p) => p.isClosed);

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.id.toLowerCase().includes(q) ||
          p.condition.toLowerCase().includes(q)
      );
    }

    return result;
  }, [enriched, filter, search]);

  return (
    <div className="flex-1 overflow-y-auto bg-[#fbfcff]">
      <TopBar
        title="Patient Register"
        subtitle={`${patients.length} active patient care journeys tracked`}
        actions={
          (user?.role === 'ADMIN' || user?.role === 'CARE_COORDINATOR') && (
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-coral-pill flex items-center gap-2 text-xs"
            >
              <UserPlus size={14} />
              Add Patient
            </button>
          )
        }
      />

      <div className="p-6 space-y-5 max-w-7xl mx-auto">
        {/* Search and filter */}
        <div className="clean-pill-card p-4 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, ID, or condition..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-full pl-10 pr-4 py-2 text-xs focus:outline-none focus:border-red-400 focus:bg-white transition-all placeholder-slate-400"
            />
          </div>
          <div className="flex gap-1.5 flex-wrap w-full md:w-auto">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`filter-pill text-xs ${filter === f.id ? 'active' : ''}`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="clean-pill-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/80 border-b border-slate-100">
                <tr>
                  <Th>Patient</Th>
                  <Th>Age / Gender</Th>
                  <Th>Condition</Th>
                  <Th>Last Appt.</Th>
                  <Th>Current Stage</Th>
                  <Th>Open Gaps</Th>
                  <Th>Priority</Th>
                  <Th>Care Status</Th>
                  <Th></Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((p) => (
                  <TableRow
                    key={p.id}
                    onClick={() => onSelectPatient(p.id)}
                    highlight={p.highestPriority === 'HIGH'}
                  >
                    <Td>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-red-50 border border-red-100 text-red-500 flex items-center justify-center font-bold text-xs flex-shrink-0">
                          {p.name[0]}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-xs hover:text-red-500 transition-colors">{p.name}</p>
                          <p className="text-slate-400 text-[11px] font-mono">{p.id}</p>
                        </div>
                      </div>
                    </Td>
                    <Td className="text-slate-600 text-xs font-medium">{p.age} / {p.gender[0]}</Td>
                    <Td>
                      <span className="text-xs text-slate-700 font-medium">{p.condition}</span>
                    </Td>
                    <Td className="text-slate-400 text-xs font-mono">{p.lastAppointment}</Td>
                    <Td>
                      <span className="text-[11px] font-medium bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full border border-slate-200">
                        {p.currentStage}
                      </span>
                    </Td>
                    <Td>
                      {p.openGaps > 0 ? (
                        <span className="font-black text-red-500 text-sm bg-red-50 px-2 py-0.5 rounded-full border border-red-100">{p.openGaps}</span>
                      ) : (
                        <span className="text-slate-400 text-xs">0</span>
                      )}
                    </Td>
                    <Td>
                      {p.highestPriority ? (
                        <PriorityBadge priority={p.highestPriority} />
                      ) : (
                        <span className="text-slate-400 text-xs">—</span>
                      )}
                    </Td>
                    <Td><CareStatusBadge status={p.careStatus} /></Td>
                    <Td>
                      <div className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-all">
                        <ChevronRight size={16} />
                      </div>
                    </Td>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={9} className="py-16 text-center text-slate-400 text-xs">
                      No patients match the current search or filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <p className="text-xs text-slate-400 font-medium">
          Showing {filtered.length} of {patients.length} total patient records
        </p>
      </div>

      {showAddModal && <AddPatientModal onClose={() => setShowAddModal(false)} />}
    </div>
  );
}
