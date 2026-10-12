// CARELOOP - Demo Simulation Page
import React, { useState } from 'react';
import {
  Play, Zap, AlertCircle, CheckCircle2, RotateCcw,
  ChevronRight, Activity, FastForward
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { detectCareGaps } from '../engine/careGapEngine';
import { PriorityBadge, GapTypeChip, ConfidenceBar, SafetyDisclaimer } from '../components/shared/UI';
import { TopBar } from '../components/shared/Navigation';
import { CareClosureGraph } from '../components/CareClosureGraph';

const SCENARIOS = [
  {
    id: 'result_not_reviewed',
    title: 'Result Not Reviewed',
    description: 'Test results have been available for 5 days but the doctor has not reviewed them.',
    patientId: 'P-1024',
    icon: '🔬',
    color: 'red',
    steps: [
      '1. Patient (Rajesh Iyer) had HbA1c tests ordered',
      '2. Tests completed and results returned (HbA1c: 9.2% – HIGH)',
      '3. Results marked as "Available" in the system',
      '4. Doctor review NOT recorded after 8 days',
      '5. CARELOOP detects: Result_Not_Reviewed gap at HIGH priority',
      '6. Gap confidence: 94% — all upstream events verified',
    ],
  },
  {
    id: 'follow_up_overdue',
    title: 'Follow-up Overdue',
    description: 'A scheduled follow-up appointment was not attended and no contact has been made.',
    patientId: 'P-1017',
    icon: '📞',
    color: 'amber',
    steps: [
      '1. Mohammed Al-Rashid had spirometry test ordered',
      '2. Test was NOT completed (patient did not attend)',
      '3. Separate follow-up was also scheduled 10 days ago',
      '4. Neither the test nor the follow-up has been recorded',
      '5. CARELOOP detects: Test_Not_Completed + Follow_up_Overdue',
      '6. Both gaps flagged — care loop broken at multiple points',
    ],
  },
  {
    id: 'critical_result_waiting',
    title: 'Critical Result Waiting',
    description: 'A cancer marker result has been available for 52 days without oncologist review.',
    patientId: 'P-1082',
    icon: '⚠️',
    color: 'red',
    steps: [
      '1. Anita Desai had post-mastectomy tumor markers ordered',
      '2. Tests completed at Tata Memorial Diagnostics',
      '3. CA 15-3 mildly elevated — flagged as clinically significant',
      '4. Doctor review NOT recorded — 52 days waiting',
      '5. CARELOOP detects: Result_Not_Reviewed at HIGH priority',
      '6. Confidence 96% — all upstream events fully verified',
    ],
  },
  {
    id: 'referral_pending',
    title: 'Referral Confirmation Pending',
    description: 'Doctor review completed but specialist referral has not been confirmed for 12 days.',
    patientId: 'P-1031',
    icon: '🔗',
    color: 'amber',
    steps: [
      '1. Lakshmi Venkatesh diagnosed with CKD Stage 2',
      '2. Dr. Nair reviewed results and decided on specialist referral',
      '3. Referral to senior nephrologist sent',
      '4. No confirmation or appointment received after 12 days',
      '5. CARELOOP detects: Referral_Pending gap at HIGH priority',
      '6. Follow-up and care closure remain blocked',
    ],
  },
  {
    id: 'test_missing',
    title: 'Test Not Completed (90 Days)',
    description: 'A patient has had no test completion recorded 90 days after tests were ordered.',
    patientId: 'P-1090',
    icon: '❌',
    color: 'red',
    steps: [
      '1. Ranjit Singh had OGTT and HbA1c ordered for pre-diabetes screening',
      '2. No test completion event recorded in 90 days',
      '3. Follow-up also overdue by 60 days',
      '4. CARELOOP detects: Test_Not_Completed + Follow_up_Overdue',
      '5. Care loop completely stalled since initial consultation',
      '6. MISSING_EVENT status — requires urgent coordination',
    ],
  },
];

export function DemoSimulationPage({ onSelectPatient }) {
  const { patients, dispatch, showNotification } = useApp();
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [step, setStep] = useState(0);
  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = useState(false);

  const scenario = SCENARIOS.find((s) => s.id === selectedScenario);
  const scenarioPatient = scenario
    ? patients.find((p) => p.id === scenario.patientId)
    : null;
  const scenarioGaps = scenarioPatient ? detectCareGaps(scenarioPatient) : [];

  const runScenario = async () => {
    if (!scenario) return;
    setRunning(true);
    setStep(0);
    setCompleted(false);

    for (let i = 0; i <= scenario.steps.length; i++) {
      await new Promise((r) => setTimeout(r, 700));
      setStep(i);
    }

    setRunning(false);
    setCompleted(true);
    showNotification(`Demo scenario completed: ${scenario.title}`, 'info');
  };

  const reset = () => {
    setSelectedScenario(null);
    setStep(0);
    setRunning(false);
    setCompleted(false);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#fbfcff]">
      <TopBar
        title="Demo Simulation Lab"
        subtitle="Interactive care gap scenario walkthroughs for clinical judges"
      />

      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <SafetyDisclaimer />

        <div className="clean-pill-card p-6 bg-white border border-slate-100 flex items-start gap-4">
          <div className="w-10 h-10 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center flex-shrink-0 text-red-500">
            <Activity size={20} />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm mb-1">CARELOOP Clinical Journey Simulation</h3>
            <p className="text-slate-500 text-xs leading-relaxed">
              Select an archetype care gap scenario below to see how CARELOOP detects cross-provider breakdowns, 
              calculates confidence probabilities, and proves why human intervention is triggered.
            </p>
          </div>
        </div>

        {/* Scenario cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {SCENARIOS.map((s) => {
            const patient = patients.find((p) => p.id === s.patientId);
            const gaps = patient ? detectCareGaps(patient) : [];
            const isSelected = selectedScenario === s.id;

            return (
              <button
                key={s.id}
                onClick={() => { setSelectedScenario(s.id); setStep(0); setCompleted(false); setRunning(false); }}
                className={`clean-pill-card text-left p-5 transition-all border-2 ${
                  isSelected ? 'border-red-500 bg-red-50/20 shadow-md ring-2 ring-red-400/20' : 'border-slate-100 hover:border-slate-300'
                } hover:scale-[1.01]`}
              >
                <div className="text-3xl mb-3">{s.icon}</div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">{s.title}</h4>
                <p className="text-xs text-slate-500 mb-4 line-clamp-2 leading-relaxed">{s.description}</p>
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <div>
                    <p className="text-[11px] text-slate-800 font-bold">{patient?.name}</p>
                    <p className="text-[10px] text-red-500 font-bold">{gaps.length} gap(s) detected</p>
                  </div>
                  <div className={`p-1.5 rounded-full ${isSelected ? 'bg-red-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                    <ChevronRight size={14} />
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Simulation runner */}
        {selectedScenario && scenario && scenarioPatient && (
          <div className="space-y-6">
            <div className="clean-pill-card p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                    <span>{scenario.icon}</span> {scenario.title}
                  </h3>
                  <p className="text-slate-500 text-xs mt-0.5">{scenario.description}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={reset} className="btn-soft-pill flex items-center gap-1.5 text-xs">
                    <RotateCcw size={13} /> Reset
                  </button>
                  <button
                    onClick={runScenario}
                    disabled={running}
                    className="btn-coral-pill flex items-center gap-2 text-xs disabled:opacity-60"
                  >
                    {running ? (
                      <><FastForward size={14} className="animate-pulse" /> Running Protocol...</>
                    ) : (
                      <><Play size={14} /> Run Simulation</>
                    )}
                  </button>
                </div>
              </div>

              {/* Step animation */}
              <div className="space-y-2.5">
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-3">Simulation Sequence</p>
                {scenario.steps.map((s, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-3 text-xs p-3.5 rounded-xl transition-all duration-300 ${
                      i < step
                        ? 'bg-emerald-50/80 border border-emerald-200 text-emerald-900'
                        : i === step && running
                        ? 'bg-red-50 border border-red-300 text-red-900 animate-pulse font-bold'
                        : 'bg-slate-50 border border-slate-100 opacity-40 text-slate-400'
                    }`}
                  >
                    {i < step ? (
                      <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                    ) : i === step && running ? (
                      <Activity size={16} className="text-red-500 mt-0.5 flex-shrink-0 animate-pulse" />
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full border border-slate-300 flex-shrink-0 mt-0.5" />
                    )}
                    <span className="leading-relaxed font-medium">
                      {s}
                    </span>
                  </div>
                ))}
              </div>

              {completed && (
                <div className="mt-6 bg-emerald-50/80 border border-emerald-200 rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 size={20} className="text-emerald-500" />
                    <p className="text-emerald-900 font-bold text-sm">Simulation Verification Complete</p>
                  </div>
                  <p className="text-slate-600 text-xs mb-4">
                    CARELOOP has confirmed broken continuity and flagged the following gaps for <span className="font-bold text-slate-900">{scenarioPatient.name}</span>:
                  </p>
                  <div className="space-y-2 mb-4">
                    {scenarioGaps.map((gap) => (
                      <div key={gap.id} className="flex items-center justify-between bg-white border border-emerald-100 rounded-xl p-3 shadow-sm">
                        <div className="flex items-center gap-2">
                          <PriorityBadge priority={gap.priority} />
                          <GapTypeChip type={gap.type} />
                          <span className="text-xs font-bold text-slate-800 ml-1">{gap.description}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <ConfidenceBar score={gap.confidence} />
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => onSelectPatient(scenarioPatient.id)}
                    className="btn-coral-pill flex items-center gap-2 text-xs"
                  >
                    <Zap size={14} />
                    View Live Patient Journey & Graph
                  </button>
                </div>
              )}
            </div>

            {/* Show the care graph for the scenario patient */}
            <div className="clean-pill-card p-6">
              <h3 className="font-bold text-slate-900 text-sm mb-4">
                Care Closure Protocol — {scenarioPatient.name}
              </h3>
              <CareClosureGraph patient={scenarioPatient} gaps={scenarioGaps} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
