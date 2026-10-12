// CARELOOP - CSV Import Page
import React, { useState, useRef } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle2, Download, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SafetyDisclaimer } from '../components/shared/UI';
import { TopBar } from '../components/shared/Navigation';

const CSV_TEMPLATE = `patient_id,name,age,gender,condition,phone,email,consultation_date,test_ordered,test_completed,result_available,doctor_review,referral,follow_up
P-2001,Meena Krishnan,55,Female,Type 2 Diabetes,+91 99001 23456,meena.k@email.com,2026-09-28,2026-09-28,2026-10-02,2026-10-05,pending,,
P-2002,Suresh Babu,63,Male,Hypertension,+91 88001 34567,suresh.b@email.com,2026-10-01,2026-10-01,2026-10-05,2026-10-08,2026-10-10,,
P-2003,Preethi Venkat,41,Female,Asthma,+91 77001 45678,preethi.v@email.com,2026-10-05,2026-10-05,,,,scheduled`;

function parseCsvRow(headers, row) {
  const values = row.split(',');
  const obj = {};
  headers.forEach((h, i) => {
    obj[h.trim()] = (values[i] || '').trim();
  });
  return obj;
}

function buildPatientFromCsvRow(row) {
  const today = new Date().toISOString().split('T')[0];
  const getStatus = (val) => {
    if (!val || val === '') return 'NOT_STARTED';
    if (val === 'pending') return 'PENDING';
    if (val === 'overdue') return 'OVERDUE';
    if (val === 'scheduled') return 'SCHEDULED';
    if (val === 'not_required') return 'NOT_REQUIRED';
    // If it looks like a date, it's completed
    if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return 'COMPLETED';
    return 'NOT_STARTED';
  };
  const getDate = (val) => {
    if (/^\d{4}-\d{2}-\d{2}$/.test(val || '')) return val;
    return null;
  };

  const id = row.patient_id || `P-${Math.floor(2000 + Math.random() * 1000)}`;

  return {
    id,
    name: row.name || 'Unknown',
    age: parseInt(row.age) || 30,
    gender: row.gender || 'Other',
    condition: row.condition || 'Unknown',
    phone: row.phone || '',
    email: row.email || '',
    doctorId: 'D003',
    coordinatorId: 'CC001',
    lastAppointment: getDate(row.consultation_date) || today,
    careStatus: 'IN_PROGRESS',
    careEvents: [
      {
        id: `CE-${Date.now()}-1`,
        stage: 'CONSULTATION',
        status: getStatus(row.consultation_date),
        date: getDate(row.consultation_date),
        notes: 'Imported via CSV',
      },
      {
        id: `CE-${Date.now()}-2`,
        stage: 'TEST_ORDERED',
        status: getStatus(row.test_ordered),
        date: getDate(row.test_ordered),
        notes: '',
      },
      {
        id: `CE-${Date.now()}-3`,
        stage: 'TEST_COMPLETED',
        status: getStatus(row.test_completed),
        date: getDate(row.test_completed),
        notes: '',
      },
      {
        id: `CE-${Date.now()}-4`,
        stage: 'RESULT_AVAILABLE',
        status: getStatus(row.result_available),
        date: getDate(row.result_available),
        notes: '',
      },
      {
        id: `CE-${Date.now()}-5`,
        stage: 'DOCTOR_REVIEW',
        status: getStatus(row.doctor_review),
        date: getDate(row.doctor_review),
        notes: '',
      },
      {
        id: `CE-${Date.now()}-6`,
        stage: 'REFERRAL',
        status: getStatus(row.referral),
        date: getDate(row.referral),
        notes: '',
      },
      {
        id: `CE-${Date.now()}-7`,
        stage: 'FOLLOW_UP',
        status: getStatus(row.follow_up),
        date: getDate(row.follow_up),
        notes: '',
      },
      {
        id: `CE-${Date.now()}-8`,
        stage: 'CARE_CLOSED',
        status: 'NOT_STARTED',
        date: null,
        notes: '',
      },
    ],
  };
}

export function CsvImportPage() {
  const { dispatch, showNotification } = useApp();
  const fileInputRef = useRef();
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  const [imported, setImported] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const parseFile = (file) => {
    setError('');
    setImported(false);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const lines = text.trim().split('\n').filter(Boolean);
        if (lines.length < 2) {
          setError('CSV must have at least one data row.');
          return;
        }
        const headers = lines[0].split(',').map((h) => h.trim());
        const rows = lines.slice(1).map((row) => parseCsvRow(headers, row));
        const patients = rows.map(buildPatientFromCsvRow);
        setPreview({ headers, rows, patients });
      } catch (err) {
        setError('Failed to parse CSV. Check the file format.');
      }
    };
    reader.readAsText(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) parseFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file?.type === 'text/csv' || file?.name.endsWith('.csv')) {
      parseFile(file);
    } else {
      setError('Please upload a CSV file.');
    }
  };

  const handleImport = () => {
    if (!preview) return;
    dispatch({ type: 'IMPORT_PATIENTS', payload: preview.patients });
    showNotification(`${preview.patients.length} patients imported successfully`);
    setImported(true);
    setPreview(null);
  };

  const downloadTemplate = () => {
    const blob = new Blob([CSV_TEMPLATE], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'careloop_import_template.csv';
    a.click();
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <TopBar
        title="CSV Import"
        subtitle="Import patient records from a CSV file"
        actions={
          <button onClick={downloadTemplate} className="btn-secondary flex items-center gap-2">
            <Download size={14} />
            Download Template
          </button>
        }
      />

      <div className="p-6 space-y-6 max-w-4xl">
        <SafetyDisclaimer />

        {/* Format guide */}
        <div className="card p-5">
          <h3 className="font-bold text-white mb-3 flex items-center gap-2">
            <FileText size={16} className="text-cyan-400" /> CSV Format
          </h3>
          <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto">
            <code className="text-xs text-green-400 font-mono whitespace-nowrap">
              patient_id, name, age, gender, condition, phone, email, consultation_date, test_ordered, test_completed, result_available, doctor_review, referral, follow_up
            </code>
          </div>
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-slate-700/30 rounded-lg p-3">
              <p className="text-xs font-medium text-slate-300 mb-1">Date values (YYYY-MM-DD)</p>
              <p className="text-xs text-slate-400">Use a date to mark the stage as COMPLETED</p>
              <p className="text-xs text-slate-500 font-mono mt-1">e.g. 2026-10-01</p>
            </div>
            <div className="bg-slate-700/30 rounded-lg p-3">
              <p className="text-xs font-medium text-slate-300 mb-1">Status keywords</p>
              <p className="text-xs text-slate-400">pending, overdue, scheduled, not_required</p>
              <p className="text-xs text-slate-500 font-mono mt-1">Leave blank for NOT_STARTED</p>
            </div>
          </div>
        </div>

        {/* Drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-cyan-500 bg-cyan-500/5'
              : 'border-slate-600 hover:border-slate-500 hover:bg-slate-800/30'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
          />
          <Upload size={32} className={`mx-auto mb-3 ${isDragging ? 'text-cyan-400' : 'text-slate-500'}`} />
          <p className="text-white font-medium">
            {isDragging ? 'Drop your CSV file here' : 'Drag and drop or click to upload'}
          </p>
          <p className="text-slate-400 text-sm mt-1">CSV files only</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-4 py-3 text-sm">
            <AlertCircle size={14} />
            {error}
          </div>
        )}

        {imported && (
          <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 text-green-400 rounded-lg px-4 py-3 text-sm">
            <CheckCircle2 size={14} />
            Import successful! Patients have been added to the system.
          </div>
        )}

        {/* Preview */}
        {preview && (
          <div className="card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700">
              <div>
                <h3 className="font-bold text-white">Import Preview</h3>
                <p className="text-xs text-slate-400 mt-0.5">{preview.patients.length} patient(s) ready to import</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setPreview(null)} className="btn-secondary flex items-center gap-1">
                  <X size={12} /> Cancel
                </button>
                <button onClick={handleImport} className="btn-primary flex items-center gap-2">
                  <Upload size={14} />
                  Import {preview.patients.length} Patient(s)
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-slate-800/60">
                  <tr>
                    {['ID', 'Name', 'Age', 'Gender', 'Condition', 'Stages Detected'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-slate-400 font-medium uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.patients.map((p) => {
                    const completed = p.careEvents.filter((e) => e.status === 'COMPLETED').length;
                    return (
                      <tr key={p.id} className="border-b border-slate-700/50">
                        <td className="px-4 py-3 text-cyan-400 font-mono">{p.id}</td>
                        <td className="px-4 py-3 text-white font-medium">{p.name}</td>
                        <td className="px-4 py-3 text-slate-300">{p.age}</td>
                        <td className="px-4 py-3 text-slate-300">{p.gender}</td>
                        <td className="px-4 py-3 text-slate-300">{p.condition}</td>
                        <td className="px-4 py-3">
                          <span className="text-green-400 font-medium">{completed}</span>
                          <span className="text-slate-500"> / {p.careEvents.length} stages</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
