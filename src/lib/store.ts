// Zustand Store for Application State Management

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { Patient, BradenAssessment, RiskLevel } from '@/types';
import { calculateTotalScore, calculateRiskLevel } from './braden-scale';

interface AppState {
  // Patients
  patients: Patient[];
  currentPatient: Patient | null;
  
  // Assessments
  assessments: BradenAssessment[];
  currentAssessment: Partial<BradenAssessment> | null;
  
  // UI State
  activeTab: 'calculator' | 'patients' | 'history' | 'settings';
  
  // Actions - Patients
  addPatient: (patient: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>) => Patient;
  updatePatient: (id: string, updates: Partial<Patient>) => void;
  deletePatient: (id: string) => void;
  setCurrentPatient: (patient: Patient | null) => void;
  
  // Actions - Assessments
  startAssessment: (patientId: string) => void;
  updateAssessmentScore: (subscaleId: string, score: number) => void;
  saveAssessment: (notes?: string, assessedBy?: string) => BradenAssessment | null;
  deleteAssessment: (id: string) => void;
  getPatientAssessments: (patientId: string) => BradenAssessment[];
  
  // Actions - UI
  setActiveTab: (tab: AppState['activeTab']) => void;
  
  // Facility Settings
  facilityName: string;
  setFacilityName: (name: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial State
      patients: [],
      currentPatient: null,
      assessments: [],
      currentAssessment: null,
      activeTab: 'calculator',
      facilityName: 'Healthcare Facility',
      
      // Patient Actions
      addPatient: (patientData) => {
        const now = new Date().toISOString();
        const newPatient: Patient = {
          ...patientData,
          id: uuidv4(),
          createdAt: now,
          updatedAt: now,
        };
        
        set((state) => ({
          patients: [...state.patients, newPatient],
          currentPatient: newPatient,
        }));
        
        return newPatient;
      },
      
      updatePatient: (id, updates) => {
        set((state) => ({
          patients: state.patients.map((p) =>
            p.id === id
              ? { ...p, ...updates, updatedAt: new Date().toISOString() }
              : p
          ),
          currentPatient:
            state.currentPatient?.id === id
              ? { ...state.currentPatient, ...updates, updatedAt: new Date().toISOString() }
              : state.currentPatient,
        }));
      },
      
      deletePatient: (id) => {
        set((state) => ({
          patients: state.patients.filter((p) => p.id !== id),
          assessments: state.assessments.filter((a) => a.patientId !== id),
          currentPatient:
            state.currentPatient?.id === id ? null : state.currentPatient,
        }));
      },
      
      setCurrentPatient: (patient) => {
        set({ currentPatient: patient });
      },
      
      // Assessment Actions
      startAssessment: (patientId) => {
        set({
          currentAssessment: {
            id: uuidv4(),
            patientId,
            date: new Date().toISOString(),
            scores: {
              sensoryPerception: 0,
              moisture: 0,
              activity: 0,
              mobility: 0,
              nutrition: 0,
              frictionShear: 0,
            },
            totalScore: 0,
            riskLevel: 'none' as RiskLevel,
          },
        });
      },
      
      updateAssessmentScore: (subscaleId, score) => {
        set((state) => {
          if (!state.currentAssessment?.scores) return state;
          
          const newScores = {
            ...state.currentAssessment.scores,
            [subscaleId]: score,
          };
          
          const totalScore = calculateTotalScore(newScores);
          const riskLevel = calculateRiskLevel(totalScore);
          
          return {
            currentAssessment: {
              ...state.currentAssessment,
              scores: newScores,
              totalScore,
              riskLevel,
            },
          };
        });
      },
      
      saveAssessment: (notes, assessedBy) => {
        const state = get();
        const assessment = state.currentAssessment;
        
        if (!assessment?.scores || !assessment.patientId) return null;
        
        // Validate all scores are filled
        const scores = assessment.scores;
        const allFilled = Object.values(scores).every((s) => s > 0);
        if (!allFilled) return null;
        
        const totalScore = calculateTotalScore(scores);
        const riskLevel = calculateRiskLevel(totalScore);
        
        const completeAssessment: BradenAssessment = {
          id: assessment.id || uuidv4(),
          patientId: assessment.patientId,
          date: new Date().toISOString(),
          scores: scores as BradenAssessment['scores'],
          totalScore,
          riskLevel,
          notes,
          assessedBy,
        };
        
        set((state) => ({
          assessments: [...state.assessments, completeAssessment],
          currentAssessment: null,
        }));
        
        return completeAssessment;
      },
      
      deleteAssessment: (id) => {
        set((state) => ({
          assessments: state.assessments.filter((a) => a.id !== id),
        }));
      },
      
      getPatientAssessments: (patientId) => {
        return get().assessments.filter((a) => a.patientId === patientId);
      },
      
      // UI Actions
      setActiveTab: (tab) => {
        set({ activeTab: tab });
      },
      
      setFacilityName: (name) => {
        set({ facilityName: name });
      },
    }),
    {
      name: 'braden-calculator-storage',
      partialize: (state) => ({
        patients: state.patients,
        assessments: state.assessments,
        facilityName: state.facilityName,
      }),
    }
  )
);

// Selector hooks for common queries
export const useCurrentPatient = () => useAppStore((state) => state.currentPatient);
export const usePatients = () => useAppStore((state) => state.patients);
export const useCurrentAssessment = () => useAppStore((state) => state.currentAssessment);
