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
    <div className="flex-1 overflow-y-auto">
      <TopBar
        title="Demo Mode"
        subtitle="Interactive care gap simulation for demonstration"
      />

      <div className="p-6 space-y-6">
        <SafetyDisclaimer />

        <div className="bg-gradient-to-r from-slate-800 to-slate-700 border border-slate-600 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
              <Activity size={16} className="text-cyan-400" />
            </div>
            <h3 className="font-bold text-white">CARELOOP Demo Simulation</h3>
          </div>
          <p className="text-slate-400 text-sm">
            Select a real-world care gap scenario below to see how CARELOOP detects broken care loops, 
            assigns confidence scores, and explains the gap reasoning step by step.
          </p>
        </div>

        {/* Scenario cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {SCENARIOS.map((s) => {
            const patient = patients.find((p) => p.id === s.patientId);
            const gaps = patient ? detectCareGaps(patient) : [];
            const isSelected = selectedScenario === s.id;
            const colorClasses = {
              red: 'border-red-500/30 hover:border-red-500/60',
              amber: 'border-amber-500/30 hover:border-amber-500/60',
            };

            return (
              <button
                key={s.id}
                onClick={() => { setSelectedScenario(s.id); setStep(0); setCompleted(false); setRunning(false); }}
                className={`card text-left p-4 transition-all border-2 ${colorClasses[s.color]} ${
                  isSelected ? 'ring-2 ring-cyan-500/50 border-cyan-500/50' : ''
                } hover:scale-[1.02]`}
              >
                <div className="text-2xl mb-2">{s.icon}</div>
                <h4 className="font-bold text-white mb-1">{s.title}</h4>
                <p className="text-sm text-slate-400 mb-3">{s.description}</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500">Patient: {patient?.name}</p>
                    <p className="text-xs text-slate-500">{gaps.length} gap(s) detected</p>
                  </div>
                  <ChevronRight size={16} className={isSelected ? 'text-cyan-400' : 'text-slate-600'} />
                </div>
              </button>
            );
          })}
        </div>

        {/* Simulation runner */}
        {selectedScenario && scenario && scenarioPatient && (
          <div className="space-y-5">
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-white text-lg">{scenario.icon} {scenario.title}</h3>
                  <p className="text-slate-400 text-sm mt-0.5">{scenario.description}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={reset} className="btn-secondary flex items-center gap-1.5">
                    <RotateCcw size={13} /> Reset
                  </button>
                  <button
                    onClick={runScenario}
                    disabled={running}
                    className="btn-primary flex items-center gap-2 disabled:opacity-60"
                  >
                    {running ? (
                      <><FastForward size={14} className="animate-pulse" /> Running...</>
                    ) : (
                      <><Play size={14} /> Run Simulation</>
                    )}
                  </button>
                </div>
              </div>

              {/* Step animation */}
              <div className="space-y-2">
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-3">Simulation Steps</p>
                {scenario.steps.map((s, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-3 text-sm p-3 rounded-lg transition-all duration-300 ${
                      i < step
                        ? 'bg-green-500/10 border border-green-500/20'
                        : i === step && running
                        ? 'bg-cyan-500/10 border border-cyan-500/30 animate-pulse'
                        : 'bg-slate-700/20 border border-slate-700/50 opacity-40'
                    }`}
                  >
                    {i < step ? (
                      <CheckCircle2 size={14} className="text-green-400 mt-0.5 flex-shrink-0" />
                    ) : i === step && running ? (
                      <Activity size={14} className="text-cyan-400 mt-0.5 flex-shrink-0 animate-pulse" />
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full border border-slate-600 flex-shrink-0 mt-0.5" />
                    )}
                    <span className={i < step ? 'text-slate-200' : i === step && running ? 'text-cyan-300' : 'text-slate-500'}>
                      {s}
                    </span>
                  </div>
                ))}
              </div>

              {completed && (
                <div className="mt-4 bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 size={16} className="text-green-400" />
                    <p className="text-green-400 font-bold">Simulation Complete</p>
                  </div>
                  <p className="text-slate-300 text-sm mb-3">
                    CARELOOP has detected the following gaps for {scenarioPatient.name}:
                  </p>
                  <div className="space-y-2">
                    {scenarioGaps.map((gap) => (
                      <div key={gap.id} className="flex items-center justify-between bg-slate-700/30 rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <PriorityBadge priority={gap.priority} />
                          <GapTypeChip type={gap.type} />
                        </div>
                        <div className="flex items-center gap-2">
                          <ConfidenceBar score={gap.confidence} />
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => onSelectPatient(scenarioPatient.id)}
                    className="btn-primary mt-3 flex items-center gap-2"
                  >
                    <Zap size={14} />
                    View Full Patient Details & Care Graph
                  </button>
                </div>
              )}
            </div>

            {/* Show the care graph for the scenario patient */}
            <div className="card p-5">
              <h3 className="font-bold text-white mb-4">
                Care Closure Graph — {scenarioPatient.name}
              </h3>
              <CareClosureGraph patient={scenarioPatient} gaps={scenarioGaps} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
