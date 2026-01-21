// Braden Scale Type Definitions

export interface SubscaleOption {
  score: number;
  label: string;
  description: string;
}

export interface Subscale {
  id: string;
  name: string;
  description: string;
  maxScore: number;
  options: SubscaleOption[];
}

export interface BradenAssessment {
  id: string;
  patientId: string;
  date: string;
  scores: {
    sensoryPerception: number;
    moisture: number;
    activity: number;
    mobility: number;
    nutrition: number;
    frictionShear: number;
  };
  totalScore: number;
  riskLevel: RiskLevel;
  notes?: string;
  assessedBy?: string;
}

export type RiskLevel = 'veryHigh' | 'high' | 'moderate' | 'mild' | 'none';

export interface RiskClassification {
  level: RiskLevel;
  label: string;
  color: string;
  bgColor: string;
  description: string;
  scoreRange: string;
}

export interface Patient {
  id: string;
  name: string;
  dateOfBirth: string;
  age: number;
  sex: 'male' | 'female' | 'other';
  medicalRecordNumber?: string;
  diagnosis?: string;
  careSetting: 'hospital' | 'nursingHome' | 'homeCare';
  admissionDate: string;
  roomNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AIRecommendation {
  category: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  recommendation: string;
  rationale: string;
  icon: string;
}

export interface AIAnalysis {
  overallRisk: RiskLevel;
  primaryConcerns: string[];
  recommendations: AIRecommendation[];
  repositioningFrequency: string;
  mattressRecommendation: string;
  escalationNeeded: boolean;
  escalationReason?: string;
  disclaimer: string;
}

export interface TrendAnalysis {
  trend: 'improving' | 'stable' | 'deteriorating';
  percentageChange: number;
  assessmentCount: number;
  lastAssessmentDate: string;
  recommendation: string;
}

export interface PDFReportData {
  facilityName: string;
  patient: Patient;
  assessment: BradenAssessment;
  aiAnalysis: AIAnalysis;
  trendAnalysis?: TrendAnalysis;
  generatedAt: string;
  assessorName?: string;
  supervisorName?: string;
}

// ============ CAPRINI SCORE TYPES ============

export interface CapriniRiskFactor {
  id: string;
  name: string;
  points: number;
  category: 'clinical' | 'surgical' | 'medical' | 'hematologic';
  description?: string;
}

export interface CapriniAssessment {
  id: string;
  patientId: string;
  date: string;
  selectedFactors: string[]; // IDs of selected risk factors
  totalScore: number;
  riskLevel: CapriniRiskLevel;
  notes?: string;
  assessedBy?: string;
}

export type CapriniRiskLevel = 'veryLow' | 'low' | 'moderate' | 'high' | 'highest';

export interface CapriniRiskClassification {
  level: CapriniRiskLevel;
  label: string;
  color: string;
  bgColor: string;
  description: string;
  scoreRange: string;
  vteRisk: string;
  prophylaxis: string;
}

export interface CapriniAIAnalysis {
  overallRisk: CapriniRiskLevel;
  vteIncidence: string;
  primaryRiskFactors: string[];
  recommendations: AIRecommendation[];
  prophylaxisRecommendation: string;
  duration: string;
  contraindications: string[];
  escalationNeeded: boolean;
  escalationReason?: string;
  disclaimer: string;
}

// ============ WELLS DVT SCORE TYPES ============

export interface WellsCriterion {
  id: string;
  name: string;
  points: number;
  description: string;
}

export interface WellsAssessment {
  id: string;
  patientId: string;
  date: string;
  selectedCriteria: string[]; // IDs of selected criteria
  totalScore: number;
  probability: WellsProbability;
  notes?: string;
  assessedBy?: string;
}

export type WellsProbability = 'unlikely' | 'likely';

export interface WellsClassification {
  probability: WellsProbability;
  label: string;
  color: string;
  bgColor: string;
  description: string;
  scoreRange: string;
  dvtPrevalence: string;
  nextStep: string;
}

export interface WellsAIAnalysis {
  probability: WellsProbability;
  dvtLikelihood: string;
  selectedCriteria: string[];
  recommendations: AIRecommendation[];
  diagnosticPathway: string;
  dDimerIndicated: boolean;
  ultrasoundIndicated: boolean;
  treatmentConsiderations: string[];
  escalationNeeded: boolean;
  escalationReason?: string;
  disclaimer: string;
}
