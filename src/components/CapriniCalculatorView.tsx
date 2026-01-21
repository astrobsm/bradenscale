'use client';

import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { 
  CheckCircle, 
  AlertTriangle, 
  FileText, 
  Brain,
  Info,
  ChevronDown,
  ChevronUp,
  Syringe,
  Shield,
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { 
  CAPRINI_CATEGORIES,
  CAPRINI_RISK_CLASSIFICATIONS,
  calculateCapriniScore,
  calculateCapriniRiskLevel,
} from '@/lib/caprini-score';
import { generateCapriniRecommendations } from '@/lib/caprini-ai-engine';
import { CapriniAssessment, Patient, CapriniAIAnalysis } from '@/types';
import { PatientForm } from './PatientForm';
import { CapriniRecommendationsPanel } from './CapriniRecommendationsPanel';

export function CapriniCalculatorView() {
  const { currentPatient, patients, addPatient } = useAppStore();
  
  const [showPatientForm, setShowPatientForm] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [selectedFactors, setSelectedFactors] = useState<Set<string>>(new Set());
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['1_point']));
  const [assessorName, setAssessorName] = useState('');
  const [notes, setNotes] = useState('');
  const [completedAssessment, setCompletedAssessment] = useState<CapriniAssessment | null>(null);
  const [aiAnalysis, setAIAnalysis] = useState<CapriniAIAnalysis | null>(null);
  const [showResults, setShowResults] = useState(false);

  const totalScore = calculateCapriniScore(Array.from(selectedFactors));
  const riskLevel = calculateCapriniRiskLevel(totalScore);
  const riskClass = CAPRINI_RISK_CLASSIFICATIONS[riskLevel];

  const toggleFactor = (factorId: string) => {
    setSelectedFactors(prev => {
      const newSet = new Set(prev);
      if (newSet.has(factorId)) {
        newSet.delete(factorId);
      } else {
        newSet.add(factorId);
      }
      return newSet;
    });
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const handlePatientSelect = (patientId: string) => {
    setSelectedPatientId(patientId);
    const patient = patients.find((p) => p.id === patientId);
    if (patient) {
      useAppStore.getState().setCurrentPatient(patient);
    }
  };

  const handleNewPatient = (patientData: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>) => {
    const patient = addPatient(patientData);
    setSelectedPatientId(patient.id);
    setShowPatientForm(false);
  };

  const handleCompleteAssessment = () => {
    const patient = patients.find((p) => p.id === selectedPatientId) || currentPatient;
    if (!patient) {
      alert('Please select or add a patient first.');
      return;
    }

    const assessment: CapriniAssessment = {
      id: uuidv4(),
      patientId: patient.id,
      date: new Date().toISOString(),
      selectedFactors: Array.from(selectedFactors),
      totalScore,
      riskLevel,
      notes,
      assessedBy: assessorName,
    };

    const analysis = generateCapriniRecommendations({
      selectedFactorIds: Array.from(selectedFactors),
      totalScore,
      riskLevel,
      patient,
    });

    setCompletedAssessment(assessment);
    setAIAnalysis(analysis);
    setShowResults(true);
  };

  const handleReset = () => {
    setSelectedFactors(new Set());
    setExpandedCategories(new Set(['1_point']));
    setNotes('');
    setCompletedAssessment(null);
    setAIAnalysis(null);
    setShowResults(false);
  };

  if (showResults && completedAssessment && aiAnalysis) {
    return (
      <div className="space-y-6">
        {/* Results Header */}
        <div className={`rounded-xl border-2 p-6 ${riskClass.bgColor}`}>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Caprini VTE Assessment Complete</h2>
              <p className="text-gray-600 mt-1">
                Patient: {patients.find((p) => p.id === completedAssessment.patientId)?.name || 'Unknown'}
              </p>
            </div>
            <div className="text-center">
              <div className={`text-4xl font-bold ${riskClass.color}`}>
                {completedAssessment.totalScore}
              </div>
              <div className={`text-lg font-semibold ${riskClass.color}`}>
                {riskClass.label}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                VTE Risk: {riskClass.vteRisk}
              </div>
            </div>
          </div>
        </div>

        {/* Risk Factors Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Selected Risk Factors ({selectedFactors.size})</h3>
          <div className="flex flex-wrap gap-2">
            {Array.from(selectedFactors).map(factorId => {
              const factor = CAPRINI_CATEGORIES
                .flatMap(c => c.factors)
                .find(f => f.id === factorId);
              return factor ? (
                <span key={factorId} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  {factor.name} (+{factor.points})
                </span>
              ) : null;
            })}
            {selectedFactors.size === 0 && (
              <span className="text-gray-500">No risk factors selected</span>
            )}
          </div>
        </div>

        {/* AI Recommendations */}
        <CapriniRecommendationsPanel analysis={aiAnalysis} totalScore={totalScore} />

        {/* Actions */}
        <div className="flex flex-wrap gap-4 justify-center">
          <button
            onClick={handleReset}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
          >
            <Syringe className="h-5 w-5" />
            <span>New Assessment</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-700 rounded-xl p-6 text-white">
        <div className="flex items-center space-x-3 mb-2">
          <Syringe className="h-8 w-8" />
          <h2 className="text-2xl font-bold">Caprini VTE Risk Score</h2>
        </div>
        <p className="text-purple-100">
          Venous Thromboembolism Risk Assessment for Surgical Patients
        </p>
      </div>

      {/* Patient Selection */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Patient Selection</h3>
        
        {showPatientForm ? (
          <PatientForm
            onSubmit={handleNewPatient}
            onCancel={() => setShowPatientForm(false)}
          />
        ) : (
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <label htmlFor="caprini-patient-select" className="block text-sm font-medium text-gray-700 mb-1">
                Select Patient
              </label>
              <select
                id="caprini-patient-select"
                value={selectedPatientId}
                onChange={(e) => handlePatientSelect(e.target.value)}
                aria-label="Select patient for Caprini assessment"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="">-- Select Patient --</option>
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.name} {patient.medicalRecordNumber ? `(${patient.medicalRecordNumber})` : ''}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={() => setShowPatientForm(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Add New Patient
            </button>
          </div>
        )}
      </div>

      {/* Live Score Display */}
      <div className={`rounded-xl border-2 p-4 transition-all ${riskClass.bgColor}`}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-3">
            <Shield className={`h-8 w-8 ${riskClass.color}`} />
            <div>
              <div className="text-sm text-gray-600">Current Score</div>
              <div className={`text-3xl font-bold ${riskClass.color}`}>
                {totalScore}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">Risk Level</div>
            <div className={`text-xl font-semibold ${riskClass.color}`}>
              {riskClass.label}
            </div>
            <div className="text-sm text-gray-600">
              VTE Risk: {riskClass.vteRisk}
            </div>
          </div>
        </div>
      </div>

      {/* Risk Factor Categories */}
      <div className="space-y-4">
        {CAPRINI_CATEGORIES.map((category) => {
          const isExpanded = expandedCategories.has(category.id);
          const selectedCount = category.factors.filter(f => selectedFactors.has(f.id)).length;

          return (
            <div
              key={category.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
            >
              <button
                onClick={() => toggleCategory(category.id)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                    selectedCount > 0 ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {category.label.split(' ')[0]}
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900">{category.label}</h3>
                    <p className="text-sm text-gray-500">{category.factors.length} risk factors</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {selectedCount > 0 && (
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                      {selectedCount} selected
                    </span>
                  )}
                  {isExpanded ? (
                    <ChevronUp className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  )}
                </div>
              </button>

              {isExpanded && (
                <div className="px-6 pb-6 border-t border-gray-100">
                  <div className="grid gap-2 mt-4">
                    {category.factors.map((factor) => {
                      const isSelected = selectedFactors.has(factor.id);
                      return (
                        <button
                          key={factor.id}
                          onClick={() => toggleFactor(factor.id)}
                          className={`text-left p-3 rounded-lg border-2 transition-all ${
                            isSelected
                              ? 'border-purple-600 bg-purple-50'
                              : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                                isSelected
                                  ? 'bg-purple-600 border-purple-600'
                                  : 'border-gray-300'
                              }`}>
                                {isSelected && <CheckCircle className="h-4 w-4 text-white" />}
                              </div>
                              <span className={`${isSelected ? 'text-purple-900 font-medium' : 'text-gray-700'}`}>
                                {factor.name}
                              </span>
                            </div>
                            <span className={`px-2 py-0.5 rounded text-sm font-semibold ${
                              isSelected
                                ? 'bg-purple-600 text-white'
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              +{factor.points}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Assessor & Notes */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Assessment Details</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assessor Name
            </label>
            <input
              type="text"
              value={assessorName}
              onChange={(e) => setAssessorName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional observations"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
        </div>
      </div>

      {/* Complete Assessment Button */}
      <div className="flex justify-center">
        <button
          onClick={handleCompleteAssessment}
          disabled={!selectedPatientId}
          className={`flex items-center space-x-3 px-8 py-4 rounded-xl text-lg font-semibold transition-all ${
            selectedPatientId
              ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-lg hover:shadow-xl'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
        >
          <Brain className="h-6 w-6" />
          <span>Complete Assessment & Get VTE Recommendations</span>
        </button>
      </div>

      {/* Info Box */}
      <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
        <div className="flex items-start space-x-3">
          <Info className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-purple-800">
            <p className="font-medium mb-1">About the Caprini Score</p>
            <p>
              The Caprini Risk Assessment Model predicts venous thromboembolism (VTE) risk in surgical patients. 
              It guides thromboprophylaxis decisions by stratifying patients into risk categories based on 
              clinical, surgical, and hematologic factors. Higher scores indicate greater VTE risk and 
              need for more aggressive prophylaxis.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
