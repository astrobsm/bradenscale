'use client';

import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import {
  Search,
  Calendar,
  User,
  FileText,
  Download,
  Trash2,
  Filter,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { BradenAssessment, Patient, RiskLevel } from '@/types';
import { BRADEN_SUBSCALES, RISK_CLASSIFICATIONS } from '@/lib/braden-scale';
import { generateAIRecommendations, analyzeTrend } from '@/lib/ai-engine';
import { generatePDFReport, downloadPDF } from '@/lib/pdf-generator';

type SortField = 'date' | 'score' | 'patient';
type SortDirection = 'asc' | 'desc';

export function HistoryView() {
  const { patients, assessments, deleteAssessment, facilityName } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState<RiskLevel | 'all'>('all');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const getPatient = (patientId: string): Patient | undefined => {
    return patients.find((p) => p.id === patientId);
  };

  const filteredAndSortedAssessments = useMemo(() => {
    let filtered = assessments.filter((assessment) => {
      const patient = getPatient(assessment.patientId);
      const matchesSearch =
        !searchTerm ||
        patient?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient?.medicalRecordNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assessment.assessedBy?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRisk = riskFilter === 'all' || assessment.riskLevel === riskFilter;

      return matchesSearch && matchesRisk;
    });

    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case 'score':
          comparison = a.totalScore - b.totalScore;
          break;
        case 'patient':
          const patientA = getPatient(a.patientId)?.name || '';
          const patientB = getPatient(b.patientId)?.name || '';
          comparison = patientA.localeCompare(patientB);
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [assessments, searchTerm, riskFilter, sortField, sortDirection, patients]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleDownloadPDF = (assessment: BradenAssessment) => {
    const patient = getPatient(assessment.patientId);
    if (!patient) return;

    const aiAnalysis = generateAIRecommendations({ assessment, patient });
    
    // Get trend analysis
    const patientAssessments = assessments
      .filter((a) => a.patientId === patient.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const trendAnalysis = analyzeTrend(patientAssessments);

    const doc = generatePDFReport({
      facilityName,
      patient,
      assessment,
      aiAnalysis,
      trendAnalysis: trendAnalysis || undefined,
      generatedAt: new Date().toISOString(),
      assessorName: assessment.assessedBy,
    });

    downloadPDF(doc, patient.name);
  };

  const handleDelete = (id: string) => {
    deleteAssessment(id);
    setDeleteConfirm(null);
  };

  const SortButton = ({ field, label }: { field: SortField; label: string }) => (
    <button
      onClick={() => handleSort(field)}
      className={`flex items-center space-x-1 text-sm font-medium transition-colors ${
        sortField === field ? 'text-blue-600' : 'text-gray-600 hover:text-gray-800'
      }`}
    >
      <span>{label}</span>
      {sortField === field && (
        sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
      )}
    </button>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Assessment History</h2>
        <p className="text-gray-600">View and manage all Braden Scale assessments</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by patient name, MRN, or assessor..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value as RiskLevel | 'all')}
              aria-label="Filter by risk level"
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Risk Levels</option>
              <option value="veryHigh">Very High Risk</option>
              <option value="high">High Risk</option>
              <option value="moderate">Moderate Risk</option>
              <option value="mild">Mild Risk</option>
              <option value="none">No Risk</option>
            </select>
          </div>
        </div>

        {/* Sort Options */}
        <div className="flex items-center space-x-6 mt-4 pt-4 border-t border-gray-100">
          <span className="text-sm text-gray-500">Sort by:</span>
          <SortButton field="date" label="Date" />
          <SortButton field="score" label="Score" />
          <SortButton field="patient" label="Patient" />
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        Showing {filteredAndSortedAssessments.length} of {assessments.length} assessments
      </div>

      {/* Assessment List */}
      {filteredAndSortedAssessments.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {assessments.length === 0 ? 'No assessments yet' : 'No matching assessments'}
          </h3>
          <p className="text-gray-500">
            {assessments.length === 0
              ? 'Complete your first Braden Scale assessment to see it here.'
              : 'Try adjusting your search or filter criteria.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAndSortedAssessments.map((assessment) => {
            const patient = getPatient(assessment.patientId);
            const riskClass = RISK_CLASSIFICATIONS[assessment.riskLevel];
            const isExpanded = expandedId === assessment.id;

            return (
              <div
                key={assessment.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
              >
                {/* Main Row */}
                <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center space-x-4">
                    {/* Score Badge */}
                    <div className={`rounded-lg p-3 ${riskClass.bgColor} text-center min-w-[80px]`}>
                      <div className={`text-2xl font-bold ${riskClass.color}`}>
                        {assessment.totalScore}
                      </div>
                      <div className={`text-xs font-medium ${riskClass.color}`}>
                        {riskClass.label}
                      </div>
                    </div>

                    {/* Patient & Date Info */}
                    <div>
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="font-semibold text-gray-900">
                          {patient?.name || 'Unknown Patient'}
                        </span>
                        {patient?.medicalRecordNumber && (
                          <span className="text-sm text-gray-500">
                            ({patient.medicalRecordNumber})
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                        <span className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{format(new Date(assessment.date), 'PPp')}</span>
                        </span>
                        {assessment.assessedBy && (
                          <span>By: {assessment.assessedBy}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : assessment.id)}
                      className="flex items-center space-x-1 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors text-sm"
                    >
                      <span>Details</span>
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => handleDownloadPDF(assessment)}
                      className="flex items-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      <Download className="h-4 w-4" />
                      <span>PDF</span>
                    </button>
                    {deleteConfirm === assessment.id ? (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleDelete(assessment.id)}
                          className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="px-3 py-2 text-gray-600 hover:text-gray-800 text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirm(assessment.id)}
                        aria-label="Delete assessment"
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-gray-200 bg-gray-50 p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Score Breakdown</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                      {BRADEN_SUBSCALES.map((subscale) => {
                        const score = assessment.scores[subscale.id as keyof typeof assessment.scores];
                        const option = subscale.options.find((o) => o.score === score);
                        return (
                          <div key={subscale.id} className="bg-white rounded-lg p-3 border border-gray-200">
                            <div className="text-xs text-gray-500 mb-1">{subscale.name}</div>
                            <div className="text-xl font-bold text-blue-600">
                              {score}/{subscale.maxScore}
                            </div>
                            <div className="text-xs text-gray-600">{option?.label}</div>
                          </div>
                        );
                      })}
                    </div>
                    {assessment.notes && (
                      <div className="mt-4 p-3 bg-white rounded-lg border border-gray-200">
                        <span className="text-sm font-medium text-gray-700">Notes: </span>
                        <span className="text-sm text-gray-600">{assessment.notes}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Statistics Summary */}
      {assessments.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Assessment Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {(['veryHigh', 'high', 'moderate', 'mild', 'none'] as RiskLevel[]).map((level) => {
              const count = assessments.filter((a) => a.riskLevel === level).length;
              const riskClass = RISK_CLASSIFICATIONS[level];
              return (
                <div key={level} className={`rounded-lg p-3 ${riskClass.bgColor}`}>
                  <div className={`text-2xl font-bold ${riskClass.color}`}>{count}</div>
                  <div className="text-sm text-gray-600">{riskClass.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
