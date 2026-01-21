'use client';

import { useState } from 'react';
import { X, Save, User } from 'lucide-react';
import { Patient } from '@/types';
import { CARE_SETTINGS } from '@/lib/braden-scale';

interface PatientFormProps {
  onSubmit: (patient: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  initialData?: Partial<Patient>;
}

export function PatientForm({ onSubmit, onCancel, initialData }: PatientFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    dateOfBirth: initialData?.dateOfBirth || '',
    sex: initialData?.sex || 'male' as const,
    medicalRecordNumber: initialData?.medicalRecordNumber || '',
    diagnosis: initialData?.diagnosis || '',
    careSetting: initialData?.careSetting || 'hospital' as const,
    admissionDate: initialData?.admissionDate || new Date().toISOString().split('T')[0],
    roomNumber: initialData?.roomNumber || '',
    notes: initialData?.notes || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const calculateAge = (dateOfBirth: string): number => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Patient name is required';
    }
    
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    } else {
      const age = calculateAge(formData.dateOfBirth);
      if (age < 0 || age > 150) {
        newErrors.dateOfBirth = 'Please enter a valid date of birth';
      }
    }
    
    if (!formData.admissionDate) {
      newErrors.admissionDate = 'Admission date is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const age = calculateAge(formData.dateOfBirth);
    
    onSubmit({
      ...formData,
      age,
    });
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-100 p-2 rounded-lg">
            <User className="h-5 w-5 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            {initialData ? 'Edit Patient' : 'New Patient'}
          </h3>
        </div>
        <button
          type="button"
          onClick={onCancel}
          aria-label="Close patient form"
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Patient Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Full name"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
        </div>

        {/* Medical Record Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Medical Record Number
          </label>
          <input
            type="text"
            value={formData.medicalRecordNumber}
            onChange={(e) => handleChange('medicalRecordNumber', e.target.value)}
            placeholder="MRN"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Date of Birth */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date of Birth <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            id="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={(e) => handleChange('dateOfBirth', e.target.value)}
            aria-label="Date of birth"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.dateOfBirth ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.dateOfBirth && <p className="mt-1 text-sm text-red-500">{errors.dateOfBirth}</p>}
          {formData.dateOfBirth && !errors.dateOfBirth && (
            <p className="mt-1 text-sm text-gray-500">Age: {calculateAge(formData.dateOfBirth)} years</p>
          )}
        </div>

        {/* Sex */}
        <div>
          <label htmlFor="sex-select" className="block text-sm font-medium text-gray-700 mb-1">
            Sex <span className="text-red-500">*</span>
          </label>
          <select
            id="sex-select"
            value={formData.sex}
            onChange={(e) => handleChange('sex', e.target.value)}
            aria-label="Patient sex"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Care Setting */}
        <div>
          <label htmlFor="care-setting-select" className="block text-sm font-medium text-gray-700 mb-1">
            Care Setting <span className="text-red-500">*</span>
          </label>
          <select
            id="care-setting-select"
            value={formData.careSetting}
            onChange={(e) => handleChange('careSetting', e.target.value)}
            aria-label="Care setting"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {CARE_SETTINGS.map((setting) => (
              <option key={setting.value} value={setting.value}>
                {setting.label}
              </option>
            ))}
          </select>
        </div>

        {/* Admission Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Admission Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            id="admissionDate"
            value={formData.admissionDate}
            onChange={(e) => handleChange('admissionDate', e.target.value)}
            aria-label="Admission date"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.admissionDate ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.admissionDate && <p className="mt-1 text-sm text-red-500">{errors.admissionDate}</p>}
        </div>

        {/* Room Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Room Number
          </label>
          <input
            type="text"
            value={formData.roomNumber}
            onChange={(e) => handleChange('roomNumber', e.target.value)}
            placeholder="e.g., 401-A"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Diagnosis */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Primary Diagnosis
          </label>
          <input
            type="text"
            value={formData.diagnosis}
            onChange={(e) => handleChange('diagnosis', e.target.value)}
            placeholder="Enter diagnosis"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notes
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          placeholder="Additional patient information..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Save className="h-4 w-4" />
          <span>{initialData ? 'Update Patient' : 'Add Patient'}</span>
        </button>
      </div>
    </form>
  );
}
