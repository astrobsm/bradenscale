// Caprini VTE Risk Assessment Score

import { CapriniRiskFactor, CapriniRiskLevel, CapriniRiskClassification } from '@/types';

// 1 Point Risk Factors
export const CAPRINI_1_POINT: CapriniRiskFactor[] = [
  { id: 'age_41_60', name: 'Age 41-60 years', points: 1, category: 'clinical' },
  { id: 'minor_surgery', name: 'Minor surgery planned', points: 1, category: 'surgical' },
  { id: 'history_major_surgery', name: 'History of major surgery (<1 month)', points: 1, category: 'surgical' },
  { id: 'varicose_veins', name: 'Varicose veins', points: 1, category: 'clinical' },
  { id: 'ibd', name: 'Inflammatory bowel disease', points: 1, category: 'medical' },
  { id: 'swollen_legs', name: 'Swollen legs (current)', points: 1, category: 'clinical' },
  { id: 'obesity_bmi_25', name: 'Obesity (BMI > 25)', points: 1, category: 'clinical' },
  { id: 'ami', name: 'Acute myocardial infarction', points: 1, category: 'medical' },
  { id: 'chf', name: 'Congestive heart failure (<1 month)', points: 1, category: 'medical' },
  { id: 'sepsis', name: 'Sepsis (<1 month)', points: 1, category: 'medical' },
  { id: 'lung_disease', name: 'Serious lung disease incl. pneumonia (<1 month)', points: 1, category: 'medical' },
  { id: 'copd', name: 'COPD', points: 1, category: 'medical' },
  { id: 'oral_contraceptives', name: 'Oral contraceptives or HRT', points: 1, category: 'medical' },
  { id: 'pregnant', name: 'Pregnancy or postpartum (<1 month)', points: 1, category: 'clinical' },
  { id: 'unexplained_stillborn', name: 'History of unexplained stillborn, miscarriage (≥3), premature birth with toxemia or growth-restricted infant', points: 1, category: 'medical' },
];

// 2 Point Risk Factors
export const CAPRINI_2_POINTS: CapriniRiskFactor[] = [
  { id: 'age_61_74', name: 'Age 61-74 years', points: 2, category: 'clinical' },
  { id: 'arthroscopic_surgery', name: 'Arthroscopic surgery', points: 2, category: 'surgical' },
  { id: 'major_surgery_45min', name: 'Major surgery (>45 min)', points: 2, category: 'surgical' },
  { id: 'laparoscopic_surgery', name: 'Laparoscopic surgery (>45 min)', points: 2, category: 'surgical' },
  { id: 'malignancy', name: 'Malignancy (present or previous)', points: 2, category: 'medical' },
  { id: 'confined_bed', name: 'Confined to bed (>72 hours)', points: 2, category: 'clinical' },
  { id: 'immobilizing_cast', name: 'Immobilizing plaster cast (<1 month)', points: 2, category: 'clinical' },
  { id: 'central_venous', name: 'Central venous access', points: 2, category: 'medical' },
];

// 3 Point Risk Factors
export const CAPRINI_3_POINTS: CapriniRiskFactor[] = [
  { id: 'age_75', name: 'Age ≥75 years', points: 3, category: 'clinical' },
  { id: 'history_dvt_pe', name: 'History of DVT/PE', points: 3, category: 'hematologic' },
  { id: 'family_history_vte', name: 'Family history of VTE', points: 3, category: 'hematologic' },
  { id: 'factor_v_leiden', name: 'Factor V Leiden', points: 3, category: 'hematologic' },
  { id: 'prothrombin', name: 'Prothrombin 20210A', points: 3, category: 'hematologic' },
  { id: 'lupus_anticoagulant', name: 'Lupus anticoagulant', points: 3, category: 'hematologic' },
  { id: 'anticardiolipin', name: 'Anticardiolipin antibodies', points: 3, category: 'hematologic' },
  { id: 'homocysteine', name: 'Elevated serum homocysteine', points: 3, category: 'hematologic' },
  { id: 'heparin_thrombocytopenia', name: 'Heparin-induced thrombocytopenia (HIT)', points: 3, category: 'hematologic' },
  { id: 'other_thrombophilia', name: 'Other congenital or acquired thrombophilia', points: 3, category: 'hematologic' },
];

// 5 Point Risk Factors
export const CAPRINI_5_POINTS: CapriniRiskFactor[] = [
  { id: 'stroke', name: 'Stroke (<1 month)', points: 5, category: 'medical' },
  { id: 'elective_arthroplasty', name: 'Elective major lower extremity arthroplasty', points: 5, category: 'surgical' },
  { id: 'hip_pelvis_leg_fracture', name: 'Hip, pelvis, or leg fracture (<1 month)', points: 5, category: 'surgical' },
  { id: 'acute_spinal_cord', name: 'Acute spinal cord injury (paralysis) (<1 month)', points: 5, category: 'medical' },
  { id: 'multiple_trauma', name: 'Multiple trauma (<1 month)', points: 5, category: 'surgical' },
];

// All risk factors combined
export const ALL_CAPRINI_FACTORS: CapriniRiskFactor[] = [
  ...CAPRINI_1_POINT,
  ...CAPRINI_2_POINTS,
  ...CAPRINI_3_POINTS,
  ...CAPRINI_5_POINTS,
];

// Risk factor categories for display
export const CAPRINI_CATEGORIES = [
  { id: '1_point', label: '1 Point Each', factors: CAPRINI_1_POINT },
  { id: '2_points', label: '2 Points Each', factors: CAPRINI_2_POINTS },
  { id: '3_points', label: '3 Points Each', factors: CAPRINI_3_POINTS },
  { id: '5_points', label: '5 Points Each', factors: CAPRINI_5_POINTS },
];

// Risk Classifications
export const CAPRINI_RISK_CLASSIFICATIONS: Record<CapriniRiskLevel, CapriniRiskClassification> = {
  veryLow: {
    level: 'veryLow',
    label: 'Very Low Risk',
    color: 'text-green-700',
    bgColor: 'bg-green-100 border-green-300',
    description: 'Minimal risk of VTE',
    scoreRange: '0',
    vteRisk: '<0.5%',
    prophylaxis: 'Early ambulation',
  },
  low: {
    level: 'low',
    label: 'Low Risk',
    color: 'text-lime-700',
    bgColor: 'bg-lime-100 border-lime-300',
    description: 'Low risk of VTE',
    scoreRange: '1-2',
    vteRisk: '~1.5%',
    prophylaxis: 'Mechanical prophylaxis (IPC or GCS)',
  },
  moderate: {
    level: 'moderate',
    label: 'Moderate Risk',
    color: 'text-amber-700',
    bgColor: 'bg-amber-100 border-amber-300',
    description: 'Moderate risk - prophylaxis recommended',
    scoreRange: '3-4',
    vteRisk: '~3%',
    prophylaxis: 'Pharmacological prophylaxis ± mechanical',
  },
  high: {
    level: 'high',
    label: 'High Risk',
    color: 'text-orange-700',
    bgColor: 'bg-orange-100 border-orange-300',
    description: 'High risk - pharmacologic prophylaxis required',
    scoreRange: '5-8',
    vteRisk: '~6%',
    prophylaxis: 'Pharmacological prophylaxis + mechanical',
  },
  highest: {
    level: 'highest',
    label: 'Highest Risk',
    color: 'text-red-700',
    bgColor: 'bg-red-100 border-red-300',
    description: 'Highest risk - aggressive prophylaxis required',
    scoreRange: '≥9',
    vteRisk: '>10%',
    prophylaxis: 'Extended pharmacological prophylaxis (up to 30 days)',
  },
};

export function calculateCapriniScore(selectedFactorIds: string[]): number {
  return selectedFactorIds.reduce((total, id) => {
    const factor = ALL_CAPRINI_FACTORS.find((f) => f.id === id);
    return total + (factor?.points || 0);
  }, 0);
}

export function calculateCapriniRiskLevel(score: number): CapriniRiskLevel {
  if (score === 0) return 'veryLow';
  if (score <= 2) return 'low';
  if (score <= 4) return 'moderate';
  if (score <= 8) return 'high';
  return 'highest';
}

export function getSelectedFactorNames(selectedFactorIds: string[]): string[] {
  return selectedFactorIds
    .map((id) => ALL_CAPRINI_FACTORS.find((f) => f.id === id)?.name)
    .filter((name): name is string => !!name);
}
