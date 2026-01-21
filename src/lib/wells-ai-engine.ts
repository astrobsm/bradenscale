// AI Recommendation Engine for Wells DVT Score

import { WellsAIAnalysis, AIRecommendation, WellsProbability, Patient } from '@/types';
import { WELLS_CLASSIFICATIONS, getSelectedCriteriaNames } from './wells-score';

interface WellsContext {
  selectedCriteriaIds: string[];
  totalScore: number;
  probability: WellsProbability;
  patient: Patient;
}

export function generateWellsRecommendations(context: WellsContext): WellsAIAnalysis {
  const { selectedCriteriaIds, totalScore, probability, patient } = context;
  const recommendations: AIRecommendation[] = [];
  const selectedCriteria = getSelectedCriteriaNames(selectedCriteriaIds);
  const classification = WELLS_CLASSIFICATIONS[probability];
  const treatmentConsiderations: string[] = [];

  let diagnosticPathway = '';
  let dDimerIndicated = false;
  let ultrasoundIndicated = false;

  if (probability === 'unlikely') {
    // DVT Unlikely (Score ≤1)
    dDimerIndicated = true;
    diagnosticPathway = 'D-dimer → If negative, DVT ruled out. If positive, proceed to ultrasound.';

    recommendations.push({
      category: 'Diagnostic Pathway',
      priority: 'high',
      recommendation: 'Order high-sensitivity D-dimer test. If D-dimer is negative (<500 ng/mL or age-adjusted cutoff), DVT can be safely ruled out without imaging.',
      rationale: 'In low probability patients, negative D-dimer has >99% negative predictive value for DVT',
      icon: 'test-tube',
    });

    recommendations.push({
      category: 'D-dimer Interpretation',
      priority: 'medium',
      recommendation: 'Use age-adjusted D-dimer cutoff for patients >50 years: Age × 10 ng/mL (e.g., 600 ng/mL for 60-year-old).',
      rationale: 'Age-adjusted cutoffs improve specificity while maintaining sensitivity in elderly patients',
      icon: 'calculator',
    });

    recommendations.push({
      category: 'If D-dimer Positive',
      priority: 'high',
      recommendation: 'If D-dimer is elevated, proceed to compression ultrasonography of the symptomatic leg.',
      rationale: 'Positive D-dimer in low-probability patients still requires imaging to rule out DVT',
      icon: 'scan',
    });

    recommendations.push({
      category: 'Clinical Re-evaluation',
      priority: 'medium',
      recommendation: 'If D-dimer negative and DVT ruled out, consider alternative diagnoses: muscle strain, Baker\'s cyst, cellulitis, superficial thrombophlebitis, lymphedema.',
      rationale: 'Low Wells score suggests alternative diagnosis may be more likely',
      icon: 'search',
    });

  } else {
    // DVT Likely (Score ≥2)
    ultrasoundIndicated = true;
    diagnosticPathway = 'Compression ultrasound → If positive, treat. If negative but high suspicion, repeat in 5-7 days or consider D-dimer/whole-leg ultrasound.';

    recommendations.push({
      category: 'Urgent Imaging',
      priority: 'critical',
      recommendation: 'Order compression ultrasonography (CUS) of the symptomatic leg as first-line imaging. Proximal CUS is standard; consider whole-leg ultrasound if available.',
      rationale: 'In DVT-likely patients, imaging should not be delayed for D-dimer testing',
      icon: 'scan',
    });

    recommendations.push({
      category: 'Empiric Anticoagulation',
      priority: 'critical',
      recommendation: 'If ultrasound will be delayed >4 hours, consider empiric anticoagulation (LMWH or DOAC) while awaiting definitive imaging.',
      rationale: 'DVT-likely patients have ~28% prevalence; delay in treatment risks PE',
      icon: 'syringe',
    });

    recommendations.push({
      category: 'If Ultrasound Negative',
      priority: 'high',
      recommendation: 'If initial CUS is negative but clinical suspicion remains high: (1) Repeat CUS in 5-7 days, OR (2) Perform D-dimer - if negative, DVT unlikely; if positive, repeat imaging, OR (3) Consider whole-leg ultrasound or CT/MR venography.',
      rationale: 'Single negative proximal CUS may miss isolated calf DVT or early proximal DVT',
      icon: 'refresh-cw',
    });

    if (totalScore >= 3) {
      recommendations.push({
        category: 'High Clinical Suspicion',
        priority: 'critical',
        recommendation: 'Very high clinical probability (score ≥3). Even with initial negative ultrasound, strongly consider repeat imaging or alternative modalities. Do not dismiss DVT without thorough workup.',
        rationale: 'High Wells score patients have significant DVT risk even with initially negative imaging',
        icon: 'alert-triangle',
      });
    }
  }

  // Analyze specific criteria for targeted recommendations
  if (selectedCriteriaIds.includes('active_cancer')) {
    recommendations.push({
      category: 'Cancer-Associated DVT',
      priority: 'high',
      recommendation: 'Active cancer present. If DVT confirmed, LMWH or DOAC (edoxaban, rivaroxaban) preferred over warfarin for cancer-associated VTE.',
      rationale: 'Cancer patients have higher recurrence risk; LMWH/DOACs show better outcomes than VKA',
      icon: 'activity',
    });
    treatmentConsiderations.push('Prefer LMWH or edoxaban/rivaroxaban for cancer-associated DVT');
  }

  if (selectedCriteriaIds.includes('previously_documented_dvt')) {
    recommendations.push({
      category: 'Recurrent DVT',
      priority: 'high',
      recommendation: 'History of prior DVT. If new DVT confirmed, consider extended or indefinite anticoagulation. Thrombophilia workup may be indicated.',
      rationale: 'Recurrent VTE suggests underlying prothrombotic state',
      icon: 'repeat',
    });
    treatmentConsiderations.push('Consider extended anticoagulation for recurrent DVT');
    treatmentConsiderations.push('Evaluate for underlying thrombophilia');
  }

  if (selectedCriteriaIds.includes('paralysis_paresis')) {
    recommendations.push({
      category: 'Immobility-Related DVT',
      priority: 'medium',
      recommendation: 'Paralysis or recent immobilization present. Ensure ongoing VTE prophylaxis is in place. Physical therapy for early mobilization when appropriate.',
      rationale: 'Immobility significantly increases DVT risk and recurrence',
      icon: 'move',
    });
  }

  if (selectedCriteriaIds.includes('bedridden')) {
    recommendations.push({
      category: 'Post-Surgical/Bedridden',
      priority: 'medium',
      recommendation: 'Recent surgery or prolonged bed rest. Ensure appropriate VTE prophylaxis was/is provided. Early mobilization is key for prevention.',
      rationale: 'Surgery and immobility are major VTE risk factors',
      icon: 'bed',
    });
  }

  // General treatment recommendations if DVT is confirmed
  recommendations.push({
    category: 'Treatment if DVT Confirmed',
    priority: 'high',
    recommendation: 'If DVT confirmed: Initiate anticoagulation immediately (DOAC preferred for most patients: Rivaroxaban 15mg BID × 21 days then 20mg daily, OR Apixaban 10mg BID × 7 days then 5mg BID). Duration: minimum 3 months, longer for unprovoked DVT.',
    rationale: 'Prompt anticoagulation prevents clot extension and PE',
    icon: 'pill',
  });

  recommendations.push({
    category: 'Compression Therapy',
    priority: 'medium',
    recommendation: 'If DVT confirmed in proximal veins, consider graduated compression stockings (30-40 mmHg) for prevention of post-thrombotic syndrome. Early ambulation is encouraged.',
    rationale: 'Compression may reduce risk of post-thrombotic syndrome; bed rest is not indicated',
    icon: 'shield',
  });

  // Warning signs
  recommendations.push({
    category: 'PE Warning Signs',
    priority: 'critical',
    recommendation: 'Assess for pulmonary embolism symptoms: dyspnea, chest pain, tachycardia, hypoxia, syncope. If present, urgent PE workup required (CTPA or V/Q scan).',
    rationale: 'DVT and PE often coexist; PE requires emergent diagnosis and treatment',
    icon: 'alert-triangle',
  });

  // Sort by priority
  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  // Determine escalation
  const escalationNeeded = probability === 'likely' || 
    selectedCriteriaIds.includes('active_cancer') ||
    totalScore >= 3;

  return {
    probability,
    dvtLikelihood: classification.dvtPrevalence,
    selectedCriteria,
    recommendations,
    diagnosticPathway,
    dDimerIndicated,
    ultrasoundIndicated,
    treatmentConsiderations,
    escalationNeeded,
    escalationReason: escalationNeeded
      ? 'Vascular medicine or hematology consultation recommended for confirmed DVT or complex cases.'
      : undefined,
    disclaimer: 'This AI-generated DVT assessment is intended as clinical decision support only. It does not replace professional clinical judgment. The Wells score is a pre-test probability tool and must be combined with appropriate diagnostic testing. All recommendations should be validated by qualified healthcare providers.',
  };
}
