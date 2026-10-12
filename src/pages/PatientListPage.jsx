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
            <label className="block text-sm font-medium text-slate-300 mb-1">Full Name *</label>
            <input
              required
              className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-500"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Patient full name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Age *</label>
            <input
              required
              type="number"
              min="1"
              max="120"
              className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-500"
              value={form.age}
              onChange={(e) => setForm({ ...form, age: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Gender</label>
            <select
              className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-500"
              value={form.gender}
              onChange={(e) => setForm({ ...form, gender: e.target.value })}
            >
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-slate-300 mb-1">Condition / Diagnosis *</label>
            <input
              required
              className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-500"
              value={form.condition}
              onChange={(e) => setForm({ ...form, condition: e.target.value })}
              placeholder="e.g. Type 2 Diabetes"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Phone</label>
            <input
              className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-500"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
            <input
              type="email"
              className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-500"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          <button type="submit" className="btn-primary">Add Patient</button>
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
    <div className="flex-1 overflow-y-auto">
      <TopBar
        title="Patient List"
        subtitle={`${patients.length} patients total`}
        actions={
          (user?.role === 'ADMIN' || user?.role === 'CARE_COORDINATOR') && (
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary flex items-center gap-2"
            >
              <UserPlus size={14} />
              Add Patient
            </button>
          )
        }
      />

      <div className="p-6">
        {/* Search and filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, ID, or condition..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-800 border border-slate-600 text-white rounded-lg pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-cyan-500 placeholder-slate-500"
            />
          </div>
          <div className="flex gap-1 flex-wrap">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  filter === f.id
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                    : 'bg-slate-800 text-slate-400 border border-slate-700 hover:border-slate-600'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800/80 border-b border-slate-700">
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
              <tbody>
                {filtered.map((p) => (
                  <TableRow
                    key={p.id}
                    onClick={() => onSelectPatient(p.id)}
                    highlight={p.highestPriority === 'HIGH'}
                  >
                    <Td>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {p.name[0]}
                        </div>
                        <div>
                          <p className="font-semibold text-white text-xs">{p.name}</p>
                          <p className="text-slate-500 text-xs">{p.id}</p>
                        </div>
                      </div>
                    </Td>
                    <Td className="text-slate-300">{p.age} / {p.gender[0]}</Td>
                    <Td>
                      <span className="text-xs text-slate-300">{p.condition}</span>
                    </Td>
                    <Td className="text-slate-400 text-xs">{p.lastAppointment}</Td>
                    <Td>
                      <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded border border-slate-600">
                        {p.currentStage}
                      </span>
                    </Td>
                    <Td>
                      {p.openGaps > 0 ? (
                        <span className="font-bold text-red-400">{p.openGaps}</span>
                      ) : (
                        <span className="text-slate-500">0</span>
                      )}
                    </Td>
                    <Td>
                      {p.highestPriority ? (
                        <PriorityBadge priority={p.highestPriority} />
                      ) : (
                        <span className="text-slate-500 text-xs">—</span>
                      )}
                    </Td>
                    <Td><CareStatusBadge status={p.careStatus} /></Td>
                    <Td>
                      <ChevronRight size={14} className="text-slate-500" />
                    </Td>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-500 text-sm">
                      No patients match the current filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <p className="text-xs text-slate-500 mt-3">
          Showing {filtered.length} of {patients.length} patients
        </p>
      </div>

      {showAddModal && <AddPatientModal onClose={() => setShowAddModal(false)} />}
    </div>
  );
}
