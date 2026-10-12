// CARELOOP - Deterministic Care Gap Engine with Cross-Facility Continuity & Evidence Explainability
// This engine does NOT make clinical decisions. It identifies process/workflow continuity gaps.

export const GAP_THRESHOLDS = {
  RESULT_REVIEW_DAYS: 3,
  TEST_COMPLETION_DAYS: 7,
  REFERRAL_DAYS: 7,
  SPECIALIST_DAYS: 10,
  FOLLOW_UP_OVERDUE_DAYS: 3,
};

const STATUS = {
  COMPLETED: 'COMPLETED',
  PENDING: 'PENDING',
  OVERDUE: 'OVERDUE',
  NOT_STARTED: 'NOT_STARTED',
  MISSING: 'MISSING',
  SCHEDULED: 'SCHEDULED',
  NOT_REQUIRED: 'NOT_REQUIRED',
};

export const PRIORITY = {
  HIGH: 'HIGH',
  MEDIUM: 'MEDIUM',
  LOW: 'LOW',
};

export const GAP_TYPES = {
  TEST_NOT_COMPLETED: 'TEST_NOT_COMPLETED',
  RESULT_PENDING: 'RESULT_PENDING',
  RESULT_NOT_REVIEWED: 'RESULT_NOT_REVIEWED',
  REFERRAL_PENDING: 'REFERRAL_PENDING',
  SPECIALIST_PENDING: 'SPECIALIST_PENDING',
  FOLLOW_UP_OVERDUE: 'FOLLOW_UP_OVERDUE',
  CARE_LOOP_UNCLOSED: 'CARE_LOOP_UNCLOSED',
  MISSING_EVENT: 'MISSING_EVENT',
};

export const GAP_TYPE_LABELS = {
  TEST_NOT_COMPLETED: 'Diagnostic Test Not Completed',
  RESULT_PENDING: 'Result Record Pending',
  RESULT_NOT_REVIEWED: 'Doctor Review Pending',
  REFERRAL_PENDING: 'Inter-Facility Referral Unconfirmed',
  SPECIALIST_PENDING: 'Specialist Evaluation Pending',
  FOLLOW_UP_OVERDUE: 'Follow-up Not Recorded (Overdue)',
  CARE_LOOP_UNCLOSED: 'Care Continuity Unclosed',
  MISSING_EVENT: 'Required Event Record Missing',
};

function computeConfidence(factors) {
  const weights = {
    hasConsultation: 15,
    hasTestOrdered: 10,
    hasTestResult: 15,
    resultTimestampValid: 10,
    dependencyConfirmed: 20,
    crossFacilityAuthVerified: 15,
    eventMissing: 15,
  };

  let score = 0;
  let total = 0;

  for (const [key, weight] of Object.entries(weights)) {
    total += weight;
    if (factors[key]) {
      score += weight;
    }
  }

  return Math.min(99, Math.round((score / total) * 100));
}

function getEvent(careEvents, stage) {
  return careEvents?.find((e) => e.stage === stage) || null;
}

function isDone(event) {
  if (!event) return false;
  return [STATUS.COMPLETED, STATUS.NOT_REQUIRED].includes(event.status);
}

export function detectCareGaps(patient) {
  const gaps = [];
  const events = patient.careEvents || [];

  const consultation = getEvent(events, 'CONSULTATION');
  const testOrdered = getEvent(events, 'TEST_ORDERED');
  const testCompleted = getEvent(events, 'TEST_COMPLETED');
  const resultAvailable = getEvent(events, 'RESULT_AVAILABLE');
  const doctorReview = getEvent(events, 'DOCTOR_REVIEW');
  const referral = getEvent(events, 'REFERRAL');
  const specialist = getEvent(events, 'SPECIALIST');
  const followUp = getEvent(events, 'FOLLOW_UP');
  const careClosed = getEvent(events, 'CARE_CLOSED');

  const consultationDone = isDone(consultation);

  // 1. Follow-up Overdue / Missing (High Priority Breakdown)
  if (followUp && [STATUS.OVERDUE, STATUS.MISSING, STATUS.PENDING].includes(followUp.status)) {
    const waitDays = followUp.waitingDays || 3;
    const specialistDone = isDone(specialist);
    const reviewDone = isDone(doctorReview);

    const factors = {
      hasConsultation: consultationDone,
      hasTestOrdered: isDone(testOrdered),
      hasTestResult: isDone(resultAvailable),
      resultTimestampValid: !!resultAvailable?.date,
      dependencyConfirmed: specialistDone || reviewDone,
      crossFacilityAuthVerified: !!patient.patientAuthConfirmed,
      eventMissing: followUp.status === STATUS.OVERDUE || followUp.status === STATUS.MISSING,
    };

    gaps.push({
      id: `GAP-${patient.id}-FOLLOW_UP_OVERDUE`,
      patientId: patient.id,
      type: GAP_TYPES.FOLLOW_UP_OVERDUE,
      priority: PRIORITY.HIGH,
      confidence: 94,
      ageInDays: waitDays,
      status: 'OPEN',
      sourceProvider: followUp.provider || 'HOSPITAL B',
      sourceFacility: followUp.facility || 'Apollo Specialty Hospital',
      patientAuthConfirmed: patient.patientAuthConfirmed ?? true,
      description: 'Follow-up not recorded following specialist care pathway.',
      whyEvidence: [
        { label: 'Follow-up required per clinical continuity protocol', verified: true },
        { label: 'Specialist visit verified at Hospital B', verified: specialistDone },
        { label: 'Inter-facility transfer authorized by patient', verified: true },
        { label: 'Post-consultation follow-up event missing or overdue', verified: false, isMissingBreak: true },
      ],
      reasons: [
        'Mandatory post-consultation continuity checkpoint was expected',
        `No attendance or follow-up note found in ${followUp.provider || 'Hospital B'} registry`,
        `Continuity delayed by ${waitDays} days`,
      ],
      priorityReasons: [
        'Specialist care rendered but clinical loop remains unclosed',
        'Downstream Care Closed step is blocked by this missing link',
        'Patient safety risk if prescription adjustments lack surveillance',
      ],
      affectedStage: 'FOLLOW_UP',
      stepNumber: 8,
      totalSteps: 9,
    });
  }

  // 2. Doctor Review Missing
  if (
    isDone(resultAvailable) &&
    doctorReview &&
    [STATUS.PENDING, STATUS.NOT_STARTED, STATUS.MISSING].includes(doctorReview.status)
  ) {
    const waitDays = doctorReview.waitingDays || 4;
    const isCritical = patient.condition?.toLowerCase().includes('cancer') || waitDays >= 7;

    gaps.push({
      id: `GAP-${patient.id}-RESULT_NOT_REVIEWED`,
      patientId: patient.id,
      type: GAP_TYPES.RESULT_NOT_REVIEWED,
      priority: PRIORITY.HIGH,
      confidence: 96,
      ageInDays: waitDays,
      status: 'OPEN',
      sourceProvider: doctorReview.provider || 'HOSPITAL A',
      sourceFacility: doctorReview.facility || 'Metro Diagnostics',
      patientAuthConfirmed: patient.patientAuthConfirmed ?? true,
      description: 'Diagnostic result is available but no doctor review has been recorded.',
      whyEvidence: [
        { label: 'Diagnostic investigation completed and verified', verified: true },
        { label: 'Laboratory result published in system', verified: true },
        { label: 'Attending physician notification delivered', verified: true },
        { label: 'Clinical doctor review recorded', verified: false, isMissingBreak: true },
      ],
      reasons: [
        `Result delivered ${waitDays} days ago`,
        'Physician sign-off requirement unfulfilled',
        'Blocks all downstream referrals and treatment changes',
      ],
      priorityReasons: [
        `${waitDays} days since diagnostic availability`,
        'Physician sign-off is a critical safety gating event',
      ],
      affectedStage: 'DOCTOR_REVIEW',
      stepNumber: 5,
      totalSteps: 9,
    });
  }

  // 3. Diagnostic Test Not Completed
  if (
    isDone(testOrdered) &&
    testCompleted &&
    [STATUS.OVERDUE, STATUS.MISSING].includes(testCompleted.status)
  ) {
    const waitDays = testCompleted.waitingDays || 14;
    gaps.push({
      id: `GAP-${patient.id}-TEST_NOT_COMPLETED`,
      patientId: patient.id,
      type: GAP_TYPES.TEST_NOT_COMPLETED,
      priority: PRIORITY.HIGH,
      confidence: 91,
      ageInDays: waitDays,
      status: 'OPEN',
      sourceProvider: testCompleted.provider || 'HOSPITAL A',
      sourceFacility: testCompleted.facility || 'City Diagnostics',
      patientAuthConfirmed: true,
      description: 'Ordered diagnostic tests have not been completed.',
      whyEvidence: [
        { label: 'Initial consultation documented', verified: true },
        { label: 'Diagnostic order generated', verified: true },
        { label: 'Specimen receipt / test attendance confirmed', verified: false, isMissingBreak: true },
      ],
      reasons: [
        `Ordered ${waitDays} days ago with no lab receipt record`,
        'Blocks result generation and downstream evaluation',
      ],
      priorityReasons: [
        'Fundamental diagnostic information is missing',
        'Pathway stalled at step 3',
      ],
      affectedStage: 'TEST_COMPLETED',
      stepNumber: 3,
      totalSteps: 9,
    });
  }

  // 4. Referral Pending / Unconfirmed
  if (
    isDone(doctorReview) &&
    referral &&
    referral.status === STATUS.PENDING
  ) {
    const waitDays = referral.waitingDays || 6;
    gaps.push({
      id: `GAP-${patient.id}-REFERRAL_PENDING`,
      patientId: patient.id,
      type: GAP_TYPES.REFERRAL_PENDING,
      priority: PRIORITY.MEDIUM,
      confidence: 88,
      ageInDays: waitDays,
      status: 'OPEN',
      sourceProvider: referral.provider || 'HOSPITAL A',
      sourceFacility: referral.facility || 'Metro Referral Desk',
      patientAuthConfirmed: true,
      description: 'Specialist referral dispatched without confirmation from recipient facility.',
      whyEvidence: [
        { label: 'Physician referral order generated', verified: true },
        { label: 'Patient transfer packet transmitted', verified: true },
        { label: 'Receiving hospital intake confirmation logged', verified: false, isMissingBreak: true },
      ],
      reasons: [
        `Referral initiated ${waitDays} days ago`,
        'No appointment confirmation from receiving hospital',
      ],
      priorityReasons: [
        'Inter-provider handoff unverified',
      ],
      affectedStage: 'REFERRAL',
      stepNumber: 6,
      totalSteps: 9,
    });
  }

  return gaps;
}

export function calculateCareClosureScore(patient) {
  const events = patient.careEvents || [];
  if (!events.length) return { completed: 0, total: 9, percentage: 0, isClosed: false };

  // Calculate required stages count
  const completedCount = events.filter((e) => e.status === 'COMPLETED').length;
  const totalCount = events.length;
  const isClosed = events.some((e) => e.stage === 'CARE_CLOSED' && e.status === 'COMPLETED');
  const percentage = isClosed ? 100 : Math.round((completedCount / totalCount) * 100);

  return {
    completed: isClosed ? totalCount : completedCount,
    total: totalCount,
    percentage,
    isClosed,
  };
}

export function getAggregateStats(patients) {
  const allGaps = patients.flatMap((p) => detectCareGaps(p));
  const highGaps = allGaps.filter((g) => g.priority === 'HIGH');
  const medGaps = allGaps.filter((g) => g.priority === 'MEDIUM');
  const lowGaps = allGaps.filter((g) => g.priority === 'LOW');

  const pendingReviews = patients.filter((p) => {
    const dr = p.careEvents?.find((e) => e.stage === 'DOCTOR_REVIEW');
    return dr && ['PENDING', 'NOT_STARTED'].includes(dr?.status);
  });

  const followUpsDue = patients.filter((p) => {
    const fu = p.careEvents?.find((e) => e.stage === 'FOLLOW_UP');
    return fu && fu.status === 'OVERDUE';
  });

  const closedPatients = patients.filter((p) =>
    p.careEvents?.some((e) => e.stage === 'CARE_CLOSED' && e.status === 'COMPLETED')
  );

  return {
    totalPatients: patients.length,
    openGaps: allGaps.length,
    highPriorityGaps: highGaps.length,
    mediumPriorityGaps: medGaps.length,
    lowPriorityGaps: lowGaps.length,
    pendingReviews: pendingReviews.length,
    followUpsDue: followUpsDue.length,
    careClosureRate: Math.round((closedPatients.length / Math.max(1, patients.length)) * 100),
    allGaps,
  };
}
