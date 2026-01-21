'use client';

import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Play, FileText, Brain, AlertTriangle, CheckCircle, ChevronRight, ChevronDown, Info } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { BRADEN_SUBSCALES, RISK_CLASSIFICATIONS, calculateTotalScore, calculateRiskLevel } from '@/lib/braden-scale';
import { generateAIRecommendations } from '@/lib/ai-engine';
import { generatePDFReport, downloadPDF } from '@/lib/pdf-generator';
import { BradenAssessment, Patient, AIAnalysis } from '@/types';
import { PatientForm } from './PatientForm';
import { AIRecommendationsPanel } from './AIRecommendationsPanel';

export function CalculatorView() {
  const { currentPatient, patients, addPatient, startAssessment, saveAssessment } = useAppStore();
  const facilityName = useAppStore((state) => state.facilityName);
  
  const [showPatientForm, setShowPatientForm] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [scores, setScores] = useState<Record<string, number>>({
    sensoryPerception: 0,
    moisture: 0,
    activity: 0,
    mobility: 0,
    nutrition: 0,
    frictionShear: 0,
  });
  const [expandedSubscale, setExpandedSubscale] = useState<string | null>('sensoryPerception');
  const [assessorName, setAssessorName] = useState('');
  const [notes, setNotes] = useState('');
  const [completedAssessment, setCompletedAssessment] = useState<BradenAssessment | null>(null);
  const [aiAnalysis, setAIAnalysis] = useState<AIAnalysis | null>(null);
  const [showResults, setShowResults] = useState(false);

  const totalScore = calculateTotalScore(scores);
  const allScoresFilled = Object.values(scores).every((s) => s > 0);
  const riskLevel = calculateRiskLevel(totalScore);
  const riskClass = RISK_CLASSIFICATIONS[riskLevel];

  const handleScoreSelect = (subscaleId: string, score: number) => {
    setScores((prev) => ({ ...prev, [subscaleId]: score }));
    
    // Auto-advance to next subscale
    const currentIndex = BRADEN_SUBSCALES.findIndex((s) => s.id === subscaleId);
    if (currentIndex < BRADEN_SUBSCALES.length - 1) {
      setExpandedSubscale(BRADEN_SUBSCALES[currentIndex + 1].id);
    }
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
    if (!allScoresFilled) return;
    
    const patient = patients.find((p) => p.id === selectedPatientId) || currentPatient;
    if (!patient) return;

    const assessment: BradenAssessment = {
      id: uuidv4(),
      patientId: patient.id,
      date: new Date().toISOString(),
      scores: scores as BradenAssessment['scores'],
      totalScore,
      riskLevel,
      notes,
      assessedBy: assessorName,
    };

    const analysis = generateAIRecommendations({ assessment, patient });
    
    // Save to store
    useAppStore.setState((state) => ({
      assessments: [...state.assessments, assessment],
    }));

    setCompletedAssessment(assessment);
    setAIAnalysis(analysis);
    setShowResults(true);
  };

  const handleDownloadPDF = () => {
    if (!completedAssessment || !aiAnalysis) return;
    
    const patient = patients.find((p) => p.id === completedAssessment.patientId) || currentPatient;
    if (!patient) return;

    const doc = generatePDFReport({
      facilityName,
      patient,
      assessment: completedAssessment,
      aiAnalysis,
      generatedAt: new Date().toISOString(),
      assessorName: assessorName || undefined,
    });

    downloadPDF(doc, patient.name);
  };

  const handleReset = () => {
    setScores({
      sensoryPerception: 0,
      moisture: 0,
      activity: 0,
      mobility: 0,
      nutrition: 0,
      frictionShear: 0,
    });
    setExpandedSubscale('sensoryPerception');
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
              <h2 className="text-2xl font-bold text-gray-900">Assessment Complete</h2>
              <p className="text-gray-600 mt-1">
                Patient: {patients.find((p) => p.id === completedAssessment.patientId)?.name || 'Quick Assessment'}
              </p>
            </div>
            <div className="text-center">
              <div className={`text-4xl font-bold ${riskClass.color}`}>
                {completedAssessment.totalScore}
              </div>
              <div className={`text-lg font-semibold ${riskClass.color}`}>
                {riskClass.label}
              </div>
            </div>
          </div>
        </div>

        {/* Score Breakdown */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Score Breakdown</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {BRADEN_SUBSCALES.map((subscale) => {
              const score = completedAssessment.scores[subscale.id as keyof typeof completedAssessment.scores];
              const option = subscale.options.find((o) => o.score === score);
              return (
                <div key={subscale.id} className="bg-gray-50 rounded-lg p-3 text-center">
                  <div className="text-xs text-gray-500 mb-1">{subscale.name}</div>
                  <div className="text-2xl font-bold text-blue-600">{score}</div>
                  <div className="text-xs text-gray-600">{option?.label}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI Recommendations */}
        <AIRecommendationsPanel analysis={aiAnalysis} />

        {/* Actions */}
        <div className="flex flex-wrap gap-4 justify-center">
          <button
            onClick={handleDownloadPDF}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
          >
            <FileText className="h-5 w-5" />
            <span>Download PDF Report</span>
          </button>
          <button
            onClick={handleReset}
            className="flex items-center space-x-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Play className="h-5 w-5" />
            <span>New Assessment</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Patient Selection */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Patient Selection</h2>
        
        {showPatientForm ? (
          <PatientForm
            onSubmit={handleNewPatient}
            onCancel={() => setShowPatientForm(false)}
          />
        ) : (
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <label htmlFor="patient-select" className="block text-sm font-medium text-gray-700 mb-1">
                Select Patient (Optional)
              </label>
              <select
                id="patient-select"
                value={selectedPatientId}
                onChange={(e) => handlePatientSelect(e.target.value)}
                aria-label="Select patient for assessment"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">-- Quick Assessment (No Patient) --</option>
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.name} {patient.medicalRecordNumber ? `(${patient.medicalRecordNumber})` : ''}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={() => setShowPatientForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add New Patient
            </button>
          </div>
        )}
      </div>

      {/* Live Score Display */}
      <div className={`rounded-xl border-2 p-4 transition-all ${allScoresFilled ? riskClass.bgColor : 'bg-gray-50 border-gray-200'}`}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-3">
            {allScoresFilled ? (
              <CheckCircle className={`h-8 w-8 ${riskClass.color}`} />
            ) : (
              <AlertTriangle className="h-8 w-8 text-gray-400" />
            )}
            <div>
              <div className="text-sm text-gray-600">Current Score</div>
              <div className={`text-3xl font-bold ${allScoresFilled ? riskClass.color : 'text-gray-400'}`}>
                {totalScore} / 23
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">Risk Level</div>
            <div className={`text-xl font-semibold ${allScoresFilled ? riskClass.color : 'text-gray-400'}`}>
              {allScoresFilled ? riskClass.label : 'Complete all subscales'}
            </div>
          </div>
        </div>
        
        {/* Progress indicators */}
        <div className="mt-4 flex gap-1">
          {BRADEN_SUBSCALES.map((subscale) => (
            <div
              key={subscale.id}
              className={`h-2 flex-1 rounded-full transition-colors ${
                scores[subscale.id] > 0 ? 'bg-blue-600' : 'bg-gray-300'
              }`}
              title={subscale.name}
            />
          ))}
        </div>
      </div>

      {/* Subscale Cards */}
      <div className="space-y-4">
        {BRADEN_SUBSCALES.map((subscale, index) => {
          const isExpanded = expandedSubscale === subscale.id;
          const selectedScore = scores[subscale.id];
          const selectedOption = subscale.options.find((o) => o.score === selectedScore);

          return (
            <div
              key={subscale.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
            >
              <button
                onClick={() => setExpandedSubscale(isExpanded ? null : subscale.id)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    selectedScore > 0 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900">{subscale.name}</h3>
                    <p className="text-sm text-gray-500">{subscale.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {selectedScore > 0 && (
                    <div className="text-right">
                      <div className="text-lg font-bold text-blue-600">{selectedScore}/{subscale.maxScore}</div>
                      <div className="text-xs text-gray-500">{selectedOption?.label}</div>
                    </div>
                  )}
                  {isExpanded ? (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  )}
                </div>
              </button>

              {isExpanded && (
                <div className="px-6 pb-6 border-t border-gray-100">
                  <div className="grid gap-3 mt-4">
                    {subscale.options.map((option) => (
                      <button
                        key={option.score}
                        onClick={() => handleScoreSelect(subscale.id, option.score)}
                        className={`text-left p-4 rounded-lg border-2 transition-all score-option ${
                          selectedScore === option.score
                            ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-200'
                            : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3">
                              <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                                selectedScore === option.score
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-gray-100 text-gray-600'
                              }`}>
                                {option.score}
                              </span>
                              <span className="font-medium text-gray-900">{option.label}</span>
                            </div>
                            <p className="mt-2 text-sm text-gray-600 ml-11">{option.description}</p>
                          </div>
                          {selectedScore === option.score && (
                            <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0 ml-2" />
                          )}
                        </div>
                      </button>
                    ))}
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Complete Assessment Button */}
      <div className="flex justify-center">
        <button
          onClick={handleCompleteAssessment}
          disabled={!allScoresFilled}
          className={`flex items-center space-x-3 px-8 py-4 rounded-xl text-lg font-semibold transition-all ${
            allScoresFilled
              ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
        >
          <Brain className="h-6 w-6" />
          <span>Complete Assessment & Get AI Recommendations</span>
        </button>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start space-x-3">
          <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">About the Braden Scale</p>
            <p>
              The Braden Scale is the most widely used tool for assessing pressure injury risk. 
              It evaluates 6 factors that contribute to prolonged pressure or reduced tissue tolerance. 
              Lower scores indicate higher risk. Assessment should be completed on admission and 
              regularly reassessed based on patient condition.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
