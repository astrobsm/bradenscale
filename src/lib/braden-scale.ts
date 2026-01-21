// Braden Scale Definitions with Clinical Descriptions

import { Subscale, RiskClassification, RiskLevel } from '@/types';

export const BRADEN_SUBSCALES: Subscale[] = [
  {
    id: 'sensoryPerception',
    name: 'Sensory Perception',
    description: 'Ability to respond meaningfully to pressure-related discomfort',
    maxScore: 4,
    options: [
      {
        score: 1,
        label: 'Completely Limited',
        description: 'Unresponsive (does not moan, flinch, or grasp) to painful stimuli, due to diminished level of consciousness or sedation. OR limited ability to feel pain over most of body surface.',
      },
      {
        score: 2,
        label: 'Very Limited',
        description: 'Responds only to painful stimuli. Cannot communicate discomfort except by moaning or restlessness. OR has a sensory impairment which limits the ability to feel pain or discomfort over 1/2 of body.',
      },
      {
        score: 3,
        label: 'Slightly Limited',
        description: 'Responds to verbal commands, but cannot always communicate discomfort or need to be turned. OR has some sensory impairment which limits ability to feel pain or discomfort in 1 or 2 extremities.',
      },
      {
        score: 4,
        label: 'No Impairment',
        description: 'Responds to verbal commands. Has no sensory deficit which would limit ability to feel or voice pain or discomfort.',
      },
    ],
  },
  {
    id: 'moisture',
    name: 'Moisture',
    description: 'Degree to which skin is exposed to moisture',
    maxScore: 4,
    options: [
      {
        score: 1,
        label: 'Constantly Moist',
        description: 'Skin is kept moist almost constantly by perspiration, urine, etc. Dampness is detected every time patient is moved or turned.',
      },
      {
        score: 2,
        label: 'Very Moist',
        description: 'Skin is often, but not always moist. Linen must be changed at least once a shift.',
      },
      {
        score: 3,
        label: 'Occasionally Moist',
        description: 'Skin is occasionally moist, requiring an extra linen change approximately once a day.',
      },
      {
        score: 4,
        label: 'Rarely Moist',
        description: 'Skin is usually dry, linen only requires changing at routine intervals.',
      },
    ],
  },
  {
    id: 'activity',
    name: 'Activity',
    description: 'Degree of physical activity',
    maxScore: 4,
    options: [
      {
        score: 1,
        label: 'Bedfast',
        description: 'Confined to bed.',
      },
      {
        score: 2,
        label: 'Chairfast',
        description: 'Ability to walk severely limited or non-existent. Cannot bear own weight and/or must be assisted into chair or wheelchair.',
      },
      {
        score: 3,
        label: 'Walks Occasionally',
        description: 'Walks occasionally during day, but for very short distances, with or without assistance. Spends majority of each shift in bed or chair.',
      },
      {
        score: 4,
        label: 'Walks Frequently',
        description: 'Walks outside the room at least twice a day and inside room at least once every 2 hours during waking hours.',
      },
    ],
  },
  {
    id: 'mobility',
    name: 'Mobility',
    description: 'Ability to change and control body position',
    maxScore: 4,
    options: [
      {
        score: 1,
        label: 'Completely Immobile',
        description: 'Does not make even slight changes in body or extremity position without assistance.',
      },
      {
        score: 2,
        label: 'Very Limited',
        description: 'Makes occasional slight changes in body or extremity position but unable to make frequent or significant changes independently.',
      },
      {
        score: 3,
        label: 'Slightly Limited',
        description: 'Makes frequent though slight changes in body or extremity position independently.',
      },
      {
        score: 4,
        label: 'No Limitations',
        description: 'Makes major and frequent changes in position without assistance.',
      },
    ],
  },
  {
    id: 'nutrition',
    name: 'Nutrition',
    description: 'Usual food intake pattern',
    maxScore: 4,
    options: [
      {
        score: 1,
        label: 'Very Poor',
        description: 'Never eats a complete meal. Rarely eats more than 1/3 of any food offered. Eats 2 servings or less of protein (meat or dairy products) per day. Takes fluids poorly. Does not take a liquid dietary supplement. OR is NPO and/or maintained on clear liquids or IVs for more than 5 days.',
      },
      {
        score: 2,
        label: 'Probably Inadequate',
        description: 'Rarely eats a complete meal and generally eats only about 1/2 of any food offered. Protein intake includes only 3 servings of meat or dairy products per day. Occasionally will take a dietary supplement. OR receives less than optimum amount of liquid diet or tube feeding.',
      },
      {
        score: 3,
        label: 'Adequate',
        description: 'Eats over half of most meals. Eats a total of 4 servings of protein (meat, dairy products) each day. Occasionally will refuse a meal, but will usually take a supplement if offered. OR is on a tube feeding or TPN regimen which probably meets most of nutritional needs.',
      },
      {
        score: 4,
        label: 'Excellent',
        description: 'Eats most of every meal. Never refuses a meal. Usually eats a total of 4 or more servings of meat and dairy products. Occasionally eats between meals. Does not require supplementation.',
      },
    ],
  },
  {
    id: 'frictionShear',
    name: 'Friction & Shear',
    description: 'Friction occurs when skin moves against support surfaces. Shear occurs when skin and bone move in opposite directions.',
    maxScore: 3,
    options: [
      {
        score: 1,
        label: 'Problem',
        description: 'Requires moderate to maximum assistance in moving. Complete lifting without sliding against sheets is impossible. Frequently slides down in bed or chair, requiring frequent repositioning with maximum assistance. Spasticity, contractures or agitation leads to almost constant friction.',
      },
      {
        score: 2,
        label: 'Potential Problem',
        description: 'Moves feebly or requires minimum assistance. During a move skin probably slides to some extent against sheets, chair, restraints or other devices. Maintains relatively good position in chair or bed most of the time but occasionally slides down.',
      },
      {
        score: 3,
        label: 'No Apparent Problem',
        description: 'Moves in bed and in chair independently and has sufficient muscle strength to lift up completely during move. Maintains good position in bed or chair at all times.',
      },
    ],
  },
];

export const RISK_CLASSIFICATIONS: Record<RiskLevel, RiskClassification> = {
  veryHigh: {
    level: 'veryHigh',
    label: 'Very High Risk',
    color: 'text-red-700',
    bgColor: 'bg-red-100 border-red-300',
    description: 'Immediate intervention required. Implement comprehensive pressure injury prevention protocol.',
    scoreRange: '≤ 9',
  },
  high: {
    level: 'high',
    label: 'High Risk',
    color: 'text-orange-700',
    bgColor: 'bg-orange-100 border-orange-300',
    description: 'High priority for prevention measures. Frequent reassessment needed.',
    scoreRange: '10-12',
  },
  moderate: {
    level: 'moderate',
    label: 'Moderate Risk',
    color: 'text-amber-700',
    bgColor: 'bg-amber-100 border-amber-300',
    description: 'Prevention measures recommended. Regular monitoring required.',
    scoreRange: '13-14',
  },
  mild: {
    level: 'mild',
    label: 'Mild Risk',
    color: 'text-lime-700',
    bgColor: 'bg-lime-100 border-lime-300',
    description: 'Standard preventive care. Continue regular assessment.',
    scoreRange: '15-18',
  },
  none: {
    level: 'none',
    label: 'No Risk',
    color: 'text-green-700',
    bgColor: 'bg-green-100 border-green-300',
    description: 'Continue routine skin assessment and care.',
    scoreRange: '> 18',
  },
};

export function calculateRiskLevel(totalScore: number): RiskLevel {
  if (totalScore <= 9) return 'veryHigh';
  if (totalScore <= 12) return 'high';
  if (totalScore <= 14) return 'moderate';
  if (totalScore <= 18) return 'mild';
  return 'none';
}

export function calculateTotalScore(scores: Record<string, number>): number {
  return Object.values(scores).reduce((sum, score) => sum + score, 0);
}

export const CARE_SETTINGS = [
  { value: 'hospital', label: 'Hospital' },
  { value: 'nursingHome', label: 'Nursing Home' },
  { value: 'homeCare', label: 'Home Care' },
] as const;

export const MAX_BRADEN_SCORE = 23; // 4+4+4+4+4+3
export const MIN_BRADEN_SCORE = 6;  // 1+1+1+1+1+1
