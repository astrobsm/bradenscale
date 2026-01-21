// AI Recommendation Engine for Caprini VTE Score

import { CapriniAIAnalysis, AIRecommendation, CapriniRiskLevel, Patient } from '@/types';
import { 
  CAPRINI_RISK_CLASSIFICATIONS, 
  ALL_CAPRINI_FACTORS,
  getSelectedFactorNames 
} from './caprini-score';

interface CapriniContext {
  selectedFactorIds: string[];
  totalScore: number;
  riskLevel: CapriniRiskLevel;
  patient: Patient;
}

export function generateCapriniRecommendations(context: CapriniContext): CapriniAIAnalysis {
  const { selectedFactorIds, totalScore, riskLevel, patient } = context;
  const recommendations: AIRecommendation[] = [];
  const primaryRiskFactors = getSelectedFactorNames(selectedFactorIds);
  const riskClass = CAPRINI_RISK_CLASSIFICATIONS[riskLevel];
  const contraindications: string[] = [];

  // Check for bleeding risk contraindications
  const hasHIT = selectedFactorIds.includes('heparin_thrombocytopenia');
  if (hasHIT) {
    contraindications.push('Heparin-induced thrombocytopenia - avoid heparin products');
  }

  // Prophylaxis recommendations based on risk level
  let prophylaxisRecommendation = '';
  let duration = '';

  switch (riskLevel) {
    case 'veryLow':
      prophylaxisRecommendation = 'No specific pharmacological prophylaxis required. Encourage early and frequent ambulation.';
      duration = 'Until fully ambulatory';
      recommendations.push({
        category: 'Mobilization',
        priority: 'medium',
        recommendation: 'Encourage early ambulation within 24 hours of surgery or admission if no contraindications.',
        rationale: 'Early mobilization is the primary preventive measure for very low-risk patients',
        icon: 'activity',
      });
      break;

    case 'low':
      prophylaxisRecommendation = 'Mechanical prophylaxis recommended: Intermittent pneumatic compression (IPC) or graduated compression stockings (GCS).';
      duration = 'Throughout hospitalization until fully ambulatory';
      recommendations.push({
        category: 'Mechanical Prophylaxis',
        priority: 'high',
        recommendation: 'Apply intermittent pneumatic compression (IPC) devices. Alternative: Graduated compression stockings (18-23 mmHg).',
        rationale: 'Mechanical prophylaxis reduces venous stasis without bleeding risk',
        icon: 'shield',
      });
      recommendations.push({
        category: 'Mobilization',
        priority: 'medium',
        recommendation: 'Encourage early and frequent ambulation.',
        rationale: 'Ambulation complements mechanical prophylaxis',
        icon: 'activity',
      });
      break;

    case 'moderate':
      prophylaxisRecommendation = hasHIT
        ? 'Fondaparinux 2.5mg SC daily (avoid heparin products due to HIT history). Consider mechanical prophylaxis as adjunct.'
        : 'Low-molecular-weight heparin (LMWH) OR low-dose unfractionated heparin (LDUH) OR fondaparinux. Consider mechanical prophylaxis as adjunct.';
      duration = 'Throughout hospitalization; consider extended prophylaxis for high-risk surgery';
      recommendations.push({
        category: 'Pharmacological Prophylaxis',
        priority: 'critical',
        recommendation: hasHIT
          ? 'Initiate Fondaparinux 2.5mg SC once daily (avoid all heparin products).'
          : 'Initiate LMWH (e.g., Enoxaparin 40mg SC daily) OR UFH 5000 units SC q8-12h OR Fondaparinux 2.5mg SC daily.',
        rationale: 'Pharmacological prophylaxis significantly reduces VTE risk in moderate-risk patients',
        icon: 'syringe',
      });
      recommendations.push({
        category: 'Mechanical Prophylaxis',
        priority: 'high',
        recommendation: 'Add intermittent pneumatic compression (IPC) for combined prophylaxis approach.',
        rationale: 'Combined mechanical and pharmacological prophylaxis provides optimal protection',
        icon: 'shield',
      });
      break;

    case 'high':
      prophylaxisRecommendation = hasHIT
        ? 'Fondaparinux 2.5mg SC daily with mechanical prophylaxis. Consider direct oral anticoagulants (DOACs) based on surgical context.'
        : 'LMWH (higher prophylactic dose) OR fondaparinux PLUS mechanical prophylaxis (IPC). Extended prophylaxis may be indicated.';
      duration = 'Throughout hospitalization; extended prophylaxis (up to 35 days) for major orthopedic or cancer surgery';
      recommendations.push({
        category: 'Pharmacological Prophylaxis',
        priority: 'critical',
        recommendation: hasHIT
          ? 'Fondaparinux 2.5mg SC daily. Consider Rivaroxaban or Apixaban if appropriate for indication.'
          : 'Initiate Enoxaparin 40mg SC daily (or 30mg SC q12h for higher risk). Alternative: Fondaparinux 2.5mg SC daily.',
        rationale: 'High-risk patients require aggressive pharmacological prophylaxis',
        icon: 'syringe',
      });
      recommendations.push({
        category: 'Combined Prophylaxis',
        priority: 'high',
        recommendation: 'Apply IPC devices continuously when patient is immobile. Combine with pharmacological prophylaxis.',
        rationale: 'Dual prophylaxis provides synergistic VTE risk reduction',
        icon: 'layers',
      });
      recommendations.push({
        category: 'Extended Prophylaxis',
        priority: 'high',
        recommendation: 'Consider extended prophylaxis post-discharge (up to 35 days) for major abdominal/pelvic cancer surgery or major orthopedic surgery.',
        rationale: 'VTE risk remains elevated for weeks after major surgery',
        icon: 'calendar',
      });
      break;

    case 'highest':
      prophylaxisRecommendation = hasHIT
        ? 'Fondaparinux or DOAC with continuous mechanical prophylaxis. Mandatory extended prophylaxis post-discharge.'
        : 'Aggressive pharmacological prophylaxis (LMWH preferred) PLUS continuous mechanical prophylaxis. Extended prophylaxis (up to 30 days) is mandatory.';
      duration = 'Extended prophylaxis: 28-35 days post-operatively or post-discharge';
      recommendations.push({
        category: 'Pharmacological Prophylaxis',
        priority: 'critical',
        recommendation: hasHIT
          ? 'URGENT: Fondaparinux 2.5mg SC daily. Hematology consultation recommended for optimal anticoagulation strategy.'
          : 'URGENT: Initiate Enoxaparin 40mg SC daily (or 30mg SC q12h). Start within 12 hours of surgery if hemostasis achieved.',
        rationale: 'Highest-risk patients have >10% VTE incidence without prophylaxis',
        icon: 'alert-triangle',
      });
      recommendations.push({
        category: 'Mechanical Prophylaxis',
        priority: 'critical',
        recommendation: 'Apply bilateral IPC devices. Ensure continuous use when patient is in bed.',
        rationale: 'Maximum mechanical prophylaxis complements aggressive pharmacological approach',
        icon: 'shield',
      });
      recommendations.push({
        category: 'Extended Prophylaxis',
        priority: 'critical',
        recommendation: 'MANDATORY extended thromboprophylaxis for minimum 28-35 days. Provide discharge prescription for LMWH or transition to DOAC.',
        rationale: 'Most VTE events in highest-risk patients occur after hospital discharge',
        icon: 'calendar',
      });
      recommendations.push({
        category: 'Specialist Consultation',
        priority: 'high',
        recommendation: 'Consider hematology consultation for optimization of prophylaxis strategy.',
        rationale: 'Complex thrombophilia or multiple risk factors may benefit from specialist input',
        icon: 'user-md',
      });
      break;
  }

  // Check for specific high-risk factors and add targeted recommendations
  if (selectedFactorIds.includes('malignancy')) {
    recommendations.push({
      category: 'Cancer-Associated VTE',
      priority: 'high',
      recommendation: 'For cancer patients: LMWH preferred over UFH. Consider extended prophylaxis during chemotherapy.',
      rationale: 'Cancer significantly increases VTE risk; LMWH shows better outcomes in cancer patients',
      icon: 'activity',
    });
  }

  if (selectedFactorIds.includes('history_dvt_pe') || selectedFactorIds.includes('family_history_vte')) {
    recommendations.push({
      category: 'History of VTE',
      priority: 'high',
      recommendation: 'Consider thrombophilia workup if not previously completed. Extended prophylaxis strongly recommended.',
      rationale: 'Prior VTE significantly increases recurrence risk',
      icon: 'file-text',
    });
  }

  if (selectedFactorIds.some(id => id.includes('factor_v') || id.includes('prothrombin') || id.includes('lupus') || id.includes('anticardiolipin'))) {
    recommendations.push({
      category: 'Thrombophilia',
      priority: 'high',
      recommendation: 'Known thrombophilia present. Hematology consultation recommended for perioperative management.',
      rationale: 'Inherited or acquired thrombophilia requires specialized anticoagulation planning',
      icon: 'alert-triangle',
    });
  }

  if (selectedFactorIds.includes('elective_arthroplasty') || selectedFactorIds.includes('hip_pelvis_leg_fracture')) {
    recommendations.push({
      category: 'Orthopedic Surgery',
      priority: 'critical',
      recommendation: 'Major orthopedic surgery: Extended prophylaxis (minimum 10-14 days, preferably 35 days) with LMWH, Fondaparinux, Rivaroxaban, Apixaban, or Dabigatran.',
      rationale: 'Major orthopedic surgery carries highest VTE risk; extended prophylaxis is standard of care',
      icon: 'bone',
    });
  }

  // Add monitoring recommendation
  recommendations.push({
    category: 'Monitoring',
    priority: 'medium',
    recommendation: 'Monitor for signs/symptoms of DVT (leg swelling, pain, warmth) and PE (dyspnea, chest pain, tachycardia). Reassess Caprini score if clinical status changes.',
    rationale: 'Early detection of breakthrough VTE allows prompt treatment',
    icon: 'eye',
  });

  // Add bleeding risk assessment
  recommendations.push({
    category: 'Bleeding Risk',
    priority: 'medium',
    recommendation: 'Before initiating pharmacological prophylaxis, assess bleeding risk: active bleeding, severe thrombocytopenia, recent CNS surgery/hemorrhage, or planned spinal procedure.',
    rationale: 'Bleeding risk must be balanced against VTE prevention benefit',
    icon: 'alert-circle',
  });

  // Sort by priority
  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  // Determine escalation
  const escalationNeeded = riskLevel === 'highest' || 
    (riskLevel === 'high' && selectedFactorIds.some(id => 
      id.includes('thrombophilia') || id === 'heparin_thrombocytopenia' || id === 'history_dvt_pe'
    ));

  return {
    overallRisk: riskLevel,
    vteIncidence: riskClass.vteRisk,
    primaryRiskFactors,
    recommendations,
    prophylaxisRecommendation,
    duration,
    contraindications,
    escalationNeeded,
    escalationReason: escalationNeeded 
      ? 'Hematology or vascular medicine consultation recommended for optimal VTE prevention strategy.'
      : undefined,
    disclaimer: 'This AI-generated VTE prophylaxis plan is intended as clinical decision support only. It does not replace professional clinical judgment. All recommendations should be validated by qualified healthcare providers, considering individual patient factors, bleeding risk, and institutional protocols.',
  };
}
