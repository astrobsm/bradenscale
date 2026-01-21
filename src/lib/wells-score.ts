// Wells Criteria for DVT Probability Assessment

import { WellsCriterion, WellsProbability, WellsClassification } from '@/types';

export const WELLS_CRITERIA: WellsCriterion[] = [
  {
    id: 'active_cancer',
    name: 'Active cancer',
    points: 1,
    description: 'Treatment or palliation within 6 months',
  },
  {
    id: 'bedridden',
    name: 'Bedridden recently >3 days or major surgery within 12 weeks',
    points: 1,
    description: 'Recently bedridden for more than 3 days, or major surgery requiring general or regional anesthesia in the past 12 weeks',
  },
  {
    id: 'calf_swelling',
    name: 'Calf swelling >3 cm compared to the other leg',
    points: 1,
    description: 'Measured 10 cm below tibial tuberosity',
  },
  {
    id: 'collateral_veins',
    name: 'Collateral (non-varicose) superficial veins present',
    points: 1,
    description: 'Non-varicose superficial veins visible',
  },
  {
    id: 'entire_leg_swollen',
    name: 'Entire leg swollen',
    points: 1,
    description: 'Unilateral leg swelling',
  },
  {
    id: 'localized_tenderness',
    name: 'Localized tenderness along the deep venous system',
    points: 1,
    description: 'Tenderness along the distribution of the deep venous system',
  },
  {
    id: 'pitting_edema',
    name: 'Pitting edema, confined to symptomatic leg',
    points: 1,
    description: 'Greater in the symptomatic leg',
  },
  {
    id: 'paralysis_paresis',
    name: 'Paralysis, paresis, or recent plaster immobilization of the lower extremity',
    points: 1,
    description: 'Recent immobilization of the lower extremities',
  },
  {
    id: 'previously_documented_dvt',
    name: 'Previously documented DVT',
    points: 1,
    description: 'History of documented DVT',
  },
  {
    id: 'alternative_diagnosis',
    name: 'Alternative diagnosis to DVT as likely or more likely',
    points: -2,
    description: 'Alternative diagnosis is at least as likely (SUBTRACT 2 points)',
  },
];

export const WELLS_CLASSIFICATIONS: Record<WellsProbability, WellsClassification> = {
  unlikely: {
    probability: 'unlikely',
    label: 'DVT Unlikely',
    color: 'text-green-700',
    bgColor: 'bg-green-100 border-green-300',
    description: 'Low probability of DVT',
    scoreRange: '≤1',
    dvtPrevalence: '~6%',
    nextStep: 'D-dimer testing recommended. If negative, DVT is ruled out.',
  },
  likely: {
    probability: 'likely',
    label: 'DVT Likely',
    color: 'text-red-700',
    bgColor: 'bg-red-100 border-red-300',
    description: 'Moderate to high probability of DVT',
    scoreRange: '≥2',
    dvtPrevalence: '~28%',
    nextStep: 'Compression ultrasound recommended. Consider empiric anticoagulation while awaiting results.',
  },
};

export function calculateWellsScore(selectedCriteriaIds: string[]): number {
  return selectedCriteriaIds.reduce((total, id) => {
    const criterion = WELLS_CRITERIA.find((c) => c.id === id);
    return total + (criterion?.points || 0);
  }, 0);
}

export function calculateWellsProbability(score: number): WellsProbability {
  return score <= 1 ? 'unlikely' : 'likely';
}

export function getSelectedCriteriaNames(selectedCriteriaIds: string[]): string[] {
  return selectedCriteriaIds
    .map((id) => WELLS_CRITERIA.find((c) => c.id === id)?.name)
    .filter((name): name is string => !!name);
}

// Traditional 3-tier model (for reference)
export function calculateWellsProbability3Tier(score: number): 'low' | 'moderate' | 'high' {
  if (score <= 0) return 'low';
  if (score <= 2) return 'moderate';
  return 'high';
}
