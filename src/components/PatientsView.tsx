'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { 
  Plus, 
  Search, 
  User, 
  Calendar, 
  MapPin, 
  FileText, 
  Trash2, 
  Edit2, 
  Calculator,
  ChevronRight,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { Patient, BradenAssessment } from '@/types';
import { RISK_CLASSIFICATIONS } from '@/lib/braden-scale';
import { analyzeTrend } from '@/lib/ai-engine';
import { PatientForm } from './PatientForm';

export function PatientsView() {
  const { patients, assessments, addPatient, updatePatient, deletePatient, setActiveTab, setCurrentPatient } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const filteredPatients = patients.filter((patient) =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.medicalRecordNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPatientAssessments = (patientId: string): BradenAssessment[] => {
    return assessments
      .filter((a) => a.patientId === patientId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const getLatestAssessment = (patientId: string): BradenAssessment | undefined => {
    const patientAssessments = getPatientAssessments(patientId);
    return patientAssessments[0];
  };

  const getPatientTrend = (patientId: string) => {
    const patientAssessments = getPatientAssessments(patientId);
    return analyzeTrend(patientAssessments);
  };

  const handleAddPatient = (patientData: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>) => {
    addPatient(patientData);
    setShowForm(false);
  };

  const handleEditPatient = (patientData: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingPatient) {
      updatePatient(editingPatient.id, patientData);
      setEditingPatient(null);
    }
  };

  const handleDeletePatient = (id: string) => {
    deletePatient(id);
    setDeleteConfirm(null);
  };

  const handleStartAssessment = (patient: Patient) => {
    setCurrentPatient(patient);
    setActiveTab('calculator');
  };

  const formatCareSetting = (setting: string) => {
    switch (setting) {
      case 'hospital': return 'Hospital';
      case 'nursingHome': return 'Nursing Home';
      case 'homeCare': return 'Home Care';
      default: return setting;
    }
  };

  const TrendIcon = ({ trend }: { trend: 'improving' | 'stable' | 'deteriorating' }) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'deteriorating':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  if (showForm || editingPatient) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <PatientForm
          onSubmit={editingPatient ? handleEditPatient : handleAddPatient}
          onCancel={() => {
            setShowForm(false);
            setEditingPatient(null);
          }}
          initialData={editingPatient || undefined}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Patient Management</h2>
          <p className="text-gray-600">Manage patients and track their assessments</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" />
          <span>Add Patient</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, MRN, or diagnosis..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Patient List */}
      {filteredPatients.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <User className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {patients.length === 0 ? 'No patients yet' : 'No matching patients'}
          </h3>
          <p className="text-gray-500 mb-4">
            {patients.length === 0
              ? 'Add your first patient to start tracking their assessments.'
              : 'Try adjusting your search terms.'}
          </p>
          {patients.length === 0 && (
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Add Patient</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredPatients.map((patient) => {
            const latestAssessment = getLatestAssessment(patient.id);
            const trend = getPatientTrend(patient.id);
            const assessmentCount = getPatientAssessments(patient.id).length;
            const riskClass = latestAssessment ? RISK_CLASSIFICATIONS[latestAssessment.riskLevel] : null;

            return (
              <div
                key={patient.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    {/* Patient Info */}
                    <div className="flex-1">
                      <div className="flex items-start space-x-4">
                        <div className="bg-blue-100 p-3 rounded-full">
                          <User className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-3 flex-wrap">
                            <h3 className="text-lg font-semibold text-gray-900">{patient.name}</h3>
                            {patient.medicalRecordNumber && (
                              <span className="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                                MRN: {patient.medicalRecordNumber}
                              </span>
                            )}
                          </div>
                          
                          <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
                            <span className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>{patient.age} years old</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <MapPin className="h-4 w-4" />
                              <span>{formatCareSetting(patient.careSetting)}</span>
                            </span>
                            {patient.roomNumber && (
                              <span>Room: {patient.roomNumber}</span>
                            )}
                          </div>
                          
                          {patient.diagnosis && (
                            <p className="mt-2 text-sm text-gray-600">
                              <span className="font-medium">Diagnosis:</span> {patient.diagnosis}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Assessment Status */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 lg:ml-4">
                      {latestAssessment && riskClass ? (
                        <div className={`rounded-lg p-3 ${riskClass.bgColor} min-w-[140px]`}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-gray-600">Latest Score</span>
                            {trend && <TrendIcon trend={trend.trend} />}
                          </div>
                          <div className={`text-2xl font-bold ${riskClass.color}`}>
                            {latestAssessment.totalScore}
                          </div>
                          <div className={`text-sm font-medium ${riskClass.color}`}>
                            {riskClass.label}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {format(new Date(latestAssessment.date), 'MMM d, yyyy')}
                          </div>
                        </div>
                      ) : (
                        <div className="rounded-lg p-3 bg-gray-100 border border-gray-200 min-w-[140px]">
                          <div className="flex items-center space-x-2 text-gray-500">
                            <AlertTriangle className="h-4 w-4" />
                            <span className="text-sm">No assessments</span>
                          </div>
                        </div>
                      )}

                      <div className="text-center px-3">
                        <div className="text-2xl font-bold text-gray-700">{assessmentCount}</div>
                        <div className="text-xs text-gray-500">Assessments</div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => handleStartAssessment(patient)}
                      className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      <Calculator className="h-4 w-4" />
                      <span>New Assessment</span>
                    </button>
                    <button
                      onClick={() => setEditingPatient(patient)}
                      className="flex items-center space-x-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                    >
                      <Edit2 className="h-4 w-4" />
                      <span>Edit</span>
                    </button>
                    {deleteConfirm === patient.id ? (
                      <>
                        <button
                          onClick={() => handleDeletePatient(patient.id)}
                          className="flex items-center space-x-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                        >
                          Confirm Delete
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="px-3 py-2 text-gray-600 hover:text-gray-800 text-sm"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirm(patient.id)}
                        className="flex items-center space-x-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>Delete</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Summary */}
      {patients.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center space-x-4 text-sm text-blue-800">
            <span><strong>{patients.length}</strong> total patients</span>
            <span>•</span>
            <span><strong>{assessments.length}</strong> total assessments</span>
          </div>
        </div>
      )}
    </div>
  );
}
