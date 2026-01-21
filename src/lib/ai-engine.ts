// AI Recommendation Engine - Rule-Based Clinical Logic

import { AIAnalysis, AIRecommendation, RiskLevel, BradenAssessment, Patient } from '@/types';
import { RISK_CLASSIFICATIONS } from './braden-scale';

interface AssessmentContext {
  assessment: BradenAssessment;
  patient: Patient;
}

export function generateAIRecommendations(context: AssessmentContext): AIAnalysis {
  const { assessment, patient } = context;
  const { scores, riskLevel, totalScore } = assessment;
  
  const recommendations: AIRecommendation[] = [];
  const primaryConcerns: string[] = [];
  
  // Analyze each subscale for specific recommendations
  
  // 1. Sensory Perception Analysis
  if (scores.sensoryPerception <= 2) {
    primaryConcerns.push('Impaired sensory perception');
    recommendations.push({
      category: 'Sensory Care',
      priority: scores.sensoryPerception === 1 ? 'critical' : 'high',
      recommendation: 'Implement regular skin inspection protocol (every shift minimum)',
      rationale: 'Patient cannot adequately perceive pressure-related discomfort',
      icon: 'eye',
    });
    recommendations.push({
      category: 'Positioning',
      priority: 'high',
      recommendation: 'Use visual repositioning schedule at bedside',
      rationale: 'Patient may not request position changes independently',
      icon: 'clock',
    });
  }
  
  // 2. Moisture Analysis
  if (scores.moisture <= 2) {
    primaryConcerns.push('Excessive moisture exposure');
    recommendations.push({
      category: 'Moisture Management',
      priority: scores.moisture === 1 ? 'critical' : 'high',
      recommendation: scores.moisture === 1 
        ? 'Apply barrier cream after each incontinence episode. Consider moisture-wicking pads.'
        : 'Use absorbent underpads. Change linens immediately when damp.',
      rationale: 'Excessive moisture increases friction and skin breakdown risk',
      icon: 'droplets',
    });
    if (scores.moisture === 1) {
      recommendations.push({
        category: 'Incontinence Care',
        priority: 'high',
        recommendation: 'Evaluate for incontinence management program. Consider indwelling catheter assessment.',
        rationale: 'Constant moisture significantly elevates pressure injury risk',
        icon: 'shield',
      });
    }
  }
  
  // 3. Activity Analysis
  if (scores.activity <= 2) {
    primaryConcerns.push('Limited physical activity');
    recommendations.push({
      category: 'Activity Enhancement',
      priority: 'high',
      recommendation: scores.activity === 1
        ? 'Initiate bed mobility exercises. Consult physical therapy for safe mobilization plan.'
        : 'Assist to chair for meals when possible. Encourage any tolerated activity.',
      rationale: 'Immobility is a primary risk factor for pressure injuries',
      icon: 'activity',
    });
  }
  
  // 4. Mobility Analysis
  if (scores.mobility <= 2) {
    primaryConcerns.push('Impaired mobility');
    const repoFreq = getRepositioningFrequency(riskLevel, scores.mobility);
    recommendations.push({
      category: 'Repositioning',
      priority: 'critical',
      recommendation: `Reposition every ${repoFreq}. Use 30-degree lateral positioning. Avoid positioning on existing pressure areas.`,
      rationale: 'Frequent repositioning redistributes pressure and maintains tissue perfusion',
      icon: 'rotate-ccw',
    });
    recommendations.push({
      category: 'Positioning Aids',
      priority: 'high',
      recommendation: 'Use pillows or foam wedges to maintain positions. Elevate heels off bed surface.',
      rationale: 'Proper positioning devices reduce pressure concentration',
      icon: 'layers',
    });
  }
  
  // 5. Nutrition Analysis
  if (scores.nutrition <= 2) {
    primaryConcerns.push('Nutritional deficit');
    recommendations.push({
      category: 'Nutrition',
      priority: scores.nutrition === 1 ? 'critical' : 'high',
      recommendation: scores.nutrition === 1
        ? 'URGENT: Consult dietitian. Consider nutritional supplements. Evaluate for enteral feeding if oral intake inadequate.'
        : 'Offer high-protein supplements between meals. Monitor meal intake percentages.',
      rationale: 'Adequate protein and calories are essential for tissue integrity and healing',
      icon: 'utensils',
    });
    if (scores.nutrition <= 2) {
      recommendations.push({
        category: 'Nutrition Monitoring',
        priority: 'medium',
        recommendation: 'Obtain weekly weights. Monitor serum albumin and pre-albumin if available.',
        rationale: 'Objective measures help track nutritional status improvement',
        icon: 'trending-up',
      });
    }
  }
  
  // 6. Friction & Shear Analysis
  if (scores.frictionShear === 1) {
    primaryConcerns.push('Friction and shear forces');
    recommendations.push({
      category: 'Transfer Technique',
      priority: 'critical',
      recommendation: 'Use lift sheets for repositioning. Never drag patient. Ensure adequate staff for safe transfers.',
      rationale: 'Friction and shear cause direct tissue damage',
      icon: 'move',
    });
    recommendations.push({
      category: 'Bed Position',
      priority: 'high',
      recommendation: 'Keep head of bed at lowest safe angle (≤30° unless contraindicated). Use knee gatch to prevent sliding.',
      rationale: 'Elevated head positions increase shear forces on sacrum and heels',
      icon: 'bed',
    });
  }
  
  // Mattress Recommendation
  const mattressRec = getMattressRecommendation(riskLevel, scores, patient.careSetting);
  recommendations.push(mattressRec);
  
  // Skin Protection
  recommendations.push(getSkinProtectionRecommendation(riskLevel, scores));
  
  // Determine escalation needs
  const { escalationNeeded, escalationReason } = determineEscalation(riskLevel, scores, patient);
  
  if (escalationNeeded && escalationReason) {
    recommendations.push({
      category: 'Escalation',
      priority: 'critical',
      recommendation: escalationReason,
      rationale: 'Specialist intervention may prevent pressure injury development',
      icon: 'alert-triangle',
    });
  }
  
  // Add documentation recommendation
  recommendations.push({
    category: 'Documentation',
    priority: 'medium',
    recommendation: `Reassess Braden Score ${getReassessmentFrequency(riskLevel)}. Document all preventive interventions.`,
    rationale: 'Regular reassessment identifies changes in risk status early',
    icon: 'file-text',
  });
  
  // Sort recommendations by priority
  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  
  return {
    overallRisk: riskLevel,
    primaryConcerns,
    recommendations,
    repositioningFrequency: getRepositioningFrequency(riskLevel, scores.mobility),
    mattressRecommendation: mattressRec.recommendation,
    escalationNeeded,
    escalationReason,
    disclaimer: 'This AI-generated care plan is intended as clinical decision support only. It does not replace professional clinical judgment. All recommendations should be validated by qualified healthcare providers and adapted to individual patient needs and institutional protocols.',
  };
}

function getRepositioningFrequency(riskLevel: RiskLevel, mobilityScore: number): string {
  if (riskLevel === 'veryHigh' || mobilityScore === 1) {
    return '2 hours (or more frequently if on specialty surface)';
  }
  if (riskLevel === 'high' || mobilityScore === 2) {
    return '2-3 hours';
  }
  if (riskLevel === 'moderate') {
    return '3-4 hours';
  }
  return '4 hours or as needed';
}

function getMattressRecommendation(
  riskLevel: RiskLevel, 
  scores: BradenAssessment['scores'],
  careSetting: Patient['careSetting']
): AIRecommendation {
  let recommendation: string;
  let priority: AIRecommendation['priority'];
  
  if (riskLevel === 'veryHigh' || (scores.mobility === 1 && scores.activity === 1)) {
    recommendation = 'ALTERNATING PRESSURE MATTRESS (APM) or LOW AIR LOSS surface required. Consider air-fluidized bed if multiple stage III/IV pressure injuries present.';
    priority = 'critical';
  } else if (riskLevel === 'high') {
    recommendation = 'Pressure redistribution mattress required (foam with density ≥1.3 lb/ft³ or alternating pressure overlay). Standard hospital mattress inadequate.';
    priority = 'high';
  } else if (riskLevel === 'moderate') {
    recommendation = 'High-specification foam mattress recommended. Evaluate current surface adequacy.';
    priority = 'medium';
  } else {
    recommendation = 'Standard pressure-redistribution mattress adequate. Ensure mattress is not bottomed out.';
    priority = 'low';
  }
  
  // Adjust for care setting
  if (careSetting === 'homeCare') {
    recommendation += ' For home care: Assess home bed suitability. Arrange rental of appropriate surface if needed.';
  }
  
  return {
    category: 'Support Surface',
    priority,
    recommendation,
    rationale: 'Appropriate support surfaces redistribute pressure and reduce tissue interface pressure',
    icon: 'bed',
  };
}

function getSkinProtectionRecommendation(
  riskLevel: RiskLevel,
  scores: BradenAssessment['scores']
): AIRecommendation {
  let recommendation: string;
  let priority: AIRecommendation['priority'];
  
  if (riskLevel === 'veryHigh' || riskLevel === 'high') {
    recommendation = 'Apply prophylactic foam dressings to sacrum and heels. Use silicone-bordered dressings for high-friction areas. Inspect all bony prominences each shift.';
    priority = 'high';
  } else if (riskLevel === 'moderate') {
    recommendation = 'Consider prophylactic dressings for sacrum if patient is incontinent or has limited mobility. Apply heel protectors during sleep.';
    priority = 'medium';
  } else {
    recommendation = 'Maintain skin hydration with appropriate moisturizers. Perform routine skin inspection during care activities.';
    priority = 'low';
  }
  
  // Add moisture-specific protection
  if (scores.moisture <= 2) {
    recommendation += ' Apply moisture barrier products to perineal area and skin folds.';
  }
  
  return {
    category: 'Skin Protection',
    priority,
    recommendation,
    rationale: 'Protective dressings reduce friction, shear, and moisture exposure at high-risk areas',
    icon: 'shield-check',
  };
}

function determineEscalation(
  riskLevel: RiskLevel,
  scores: BradenAssessment['scores'],
  patient: Patient
): { escalationNeeded: boolean; escalationReason?: string } {
  const reasons: string[] = [];
  
  // Check for critical conditions requiring specialist referral
  if (riskLevel === 'veryHigh') {
    reasons.push('Consult wound care specialist for comprehensive prevention plan');
  }
  
  if (scores.nutrition === 1) {
    reasons.push('Urgent dietitian referral for nutritional intervention');
  }
  
  if (scores.mobility === 1 && scores.activity === 1) {
    reasons.push('Physical/occupational therapy consult for mobility optimization');
  }
  
  // Age-based considerations
  if (patient.age >= 80 && riskLevel !== 'none' && riskLevel !== 'mild') {
    reasons.push('Consider geriatric consultation given advanced age and elevated risk');
  }
  
  if (reasons.length === 0) {
    return { escalationNeeded: false };
  }
  
  return {
    escalationNeeded: true,
    escalationReason: reasons.join('. '),
  };
}

function getReassessmentFrequency(riskLevel: RiskLevel): string {
  switch (riskLevel) {
    case 'veryHigh':
      return 'daily';
    case 'high':
      return 'every 48 hours';
    case 'moderate':
      return 'twice weekly';
    case 'mild':
      return 'weekly';
    default:
      return 'weekly or with significant condition change';
  }
}

export function analyzeTrend(assessments: BradenAssessment[]): {
  trend: 'improving' | 'stable' | 'deteriorating';
  percentageChange: number;
  recommendation: string;
  assessmentCount: number;
  lastAssessmentDate: string;
} | null {
  if (assessments.length < 2) return null;
  
  // Sort by date, most recent first
  const sorted = [...assessments].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  const current = sorted[0].totalScore;
  const previous = sorted[1].totalScore;
  const oldest = sorted[sorted.length - 1].totalScore;
  
  const recentChange = current - previous;
  const overallChange = current - oldest;
  const percentageChange = ((current - oldest) / oldest) * 100;
  
  let trend: 'improving' | 'stable' | 'deteriorating';
  let recommendation: string;
  
  if (overallChange > 2) {
    trend = 'improving';
    recommendation = 'Patient risk is decreasing. Continue current prevention protocol. Consider step-down of interventions if improvement sustained.';
  } else if (overallChange < -2) {
    trend = 'deteriorating';
    recommendation = 'ALERT: Patient risk is increasing. Intensify prevention measures immediately. Re-evaluate care plan and consider specialist consultation.';
  } else {
    trend = 'stable';
    recommendation = 'Risk level stable. Maintain current prevention measures. Continue regular monitoring.';
  }
  
  return { 
    trend, 
    percentageChange, 
    recommendation,
    assessmentCount: assessments.length,
    lastAssessmentDate: sorted[0].date,
  };
}
