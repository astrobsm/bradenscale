'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Building2,
  Save,
  Info,
  Shield,
  FileText,
  Database,
  Trash2,
  Download,
  Upload,
  CheckCircle,
  AlertTriangle,
  Smartphone,
  Wifi,
  WifiOff,
  HardDrive,
  RefreshCw,
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { BRADEN_SUBSCALES, RISK_CLASSIFICATIONS, MAX_BRADEN_SCORE, MIN_BRADEN_SCORE } from '@/lib/braden-scale';
import { Patient, BradenAssessment } from '@/types';

interface BackupData {
  facilityName: string;
  patients: Patient[];
  assessments: BradenAssessment[];
  exportedAt: string;
  version: string;
}

export function SettingsView() {
  const { facilityName, setFacilityName, patients, assessments } = useAppStore();
  const [tempFacilityName, setTempFacilityName] = useState(facilityName);
  const [saved, setSaved] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [importMessage, setImportMessage] = useState('');
  const [isOnline, setIsOnline] = useState(true);
  const [canInstall, setCanInstall] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [storageEstimate, setStorageEstimate] = useState<{ used: string; quota: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check online status
  useEffect(() => {
    setIsOnline(navigator.onLine);
    
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // PWA install prompt
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
    };
    
    window.addEventListener('beforeinstallprompt', handler);
    
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  // Check storage estimate
  useEffect(() => {
    const checkStorage = async () => {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        try {
          const estimate = await navigator.storage.estimate();
          const used = estimate.usage ? (estimate.usage / (1024 * 1024)).toFixed(2) : '0';
          const quota = estimate.quota ? (estimate.quota / (1024 * 1024)).toFixed(0) : 'Unknown';
          setStorageEstimate({ used: `${used} MB`, quota: `${quota} MB` });
        } catch (e) {
          console.error('Storage estimate error:', e);
        }
      }
    };
    checkStorage();
  }, [patients, assessments]);

  const handleSaveFacility = () => {
    setFacilityName(tempFacilityName);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleExportData = () => {
    const data: BackupData = {
      facilityName,
      patients,
      assessments,
      exportedAt: new Date().toISOString(),
      version: '1.0.0',
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `braden-scale-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data: BackupData = JSON.parse(content);

        // Validate the backup data structure
        if (!data.version || !Array.isArray(data.patients) || !Array.isArray(data.assessments)) {
          throw new Error('Invalid backup file format');
        }

        // Import the data
        const currentState = useAppStore.getState();
        
        // Merge or replace data
        const mergedPatients = [...currentState.patients];
        const mergedAssessments = [...currentState.assessments];
        
        // Add patients that don't already exist
        data.patients.forEach((patient) => {
          if (!mergedPatients.find((p) => p.id === patient.id)) {
            mergedPatients.push(patient);
          }
        });
        
        // Add assessments that don't already exist
        data.assessments.forEach((assessment) => {
          if (!mergedAssessments.find((a) => a.id === assessment.id)) {
            mergedAssessments.push(assessment);
          }
        });

        // Update the store
        useAppStore.setState({
          patients: mergedPatients,
          assessments: mergedAssessments,
          facilityName: data.facilityName || currentState.facilityName,
        });

        setImportStatus('success');
        setImportMessage(`Successfully imported ${data.patients.length} patients and ${data.assessments.length} assessments.`);
        
        // Reset after 5 seconds
        setTimeout(() => {
          setImportStatus('idle');
          setImportMessage('');
        }, 5000);
      } catch (error) {
        setImportStatus('error');
        setImportMessage('Failed to import backup file. Please ensure the file is a valid Braden Scale backup.');
        
        setTimeout(() => {
          setImportStatus('idle');
          setImportMessage('');
        }, 5000);
      }
    };

    reader.readAsText(file);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClearAllData = () => {
    localStorage.removeItem('braden-calculator-storage');
    window.location.reload();
  };

  const handleInstallApp = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setCanInstall(false);
    }
    setDeferredPrompt(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
        <p className="text-gray-600">Configure your Braden Scale Calculator</p>
      </div>

      {/* PWA Status */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Smartphone className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">App Status</h3>
        </div>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Online Status */}
          <div className={`rounded-lg p-4 ${isOnline ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <div className="flex items-center space-x-2">
              {isOnline ? (
                <Wifi className="h-5 w-5 text-green-600" />
              ) : (
                <WifiOff className="h-5 w-5 text-red-600" />
              )}
              <span className={`font-medium ${isOnline ? 'text-green-700' : 'text-red-700'}`}>
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {isOnline ? 'Connected to internet' : 'Working offline - data saved locally'}
            </p>
          </div>

          {/* Storage Info */}
          <div className="rounded-lg p-4 bg-blue-50 border border-blue-200">
            <div className="flex items-center space-x-2">
              <HardDrive className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-blue-700">Local Storage</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {storageEstimate ? `Using ${storageEstimate.used}` : 'Calculating...'}
            </p>
          </div>

          {/* Data Count */}
          <div className="rounded-lg p-4 bg-purple-50 border border-purple-200">
            <div className="flex items-center space-x-2">
              <Database className="h-5 w-5 text-purple-600" />
              <span className="font-medium text-purple-700">Local Data</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {patients.length} patients, {assessments.length} assessments
            </p>
          </div>

          {/* Install Button */}
          <div className="rounded-lg p-4 bg-gray-50 border border-gray-200">
            {canInstall ? (
              <button
                onClick={handleInstallApp}
                className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>Install App</span>
              </button>
            ) : (
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-700">PWA Ready</span>
              </div>
            )}
            <p className="text-xs text-gray-500 mt-1">
              {canInstall ? 'Install for offline use' : 'App can work offline'}
            </p>
          </div>
        </div>
      </div>

      {/* Facility Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Building2 className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Facility Information</h3>
        </div>
        <div className="max-w-md">
          <label htmlFor="facility-name" className="block text-sm font-medium text-gray-700 mb-1">
            Facility Name
          </label>
          <div className="flex space-x-2">
            <input
              id="facility-name"
              type="text"
              value={tempFacilityName}
              onChange={(e) => setTempFacilityName(e.target.value)}
              placeholder="Enter facility name"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              onClick={handleSaveFacility}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {saved ? <CheckCircle className="h-4 w-4" /> : <Save className="h-4 w-4" />}
              <span>{saved ? 'Saved!' : 'Save'}</span>
            </button>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            This name will appear on PDF reports.
          </p>
        </div>
      </div>

      {/* Backup & Restore */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <RefreshCw className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Backup & Restore</h3>
        </div>
        
        <div className="space-y-4">
          {/* Import/Export Status */}
          {importStatus !== 'idle' && (
            <div className={`rounded-lg p-4 ${importStatus === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <div className="flex items-center space-x-2">
                {importStatus === 'success' ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                )}
                <span className={importStatus === 'success' ? 'text-green-700' : 'text-red-700'}>
                  {importMessage}
                </span>
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{patients.length}</div>
                <div className="text-sm text-gray-500">Patients</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">{assessments.length}</div>
                <div className="text-sm text-gray-500">Assessments</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-600">
                  {assessments.length > 0
                    ? (assessments.reduce((sum, a) => sum + a.totalScore, 0) / assessments.length).toFixed(1)
                    : '-'}
                </div>
                <div className="text-sm text-gray-500">Avg Score</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-600">
                  {assessments.filter((a) => a.riskLevel === 'veryHigh' || a.riskLevel === 'high').length}
                </div>
                <div className="text-sm text-gray-500">High Risk</div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleExportData}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Export Backup</span>
            </button>
            
            <button
              onClick={handleImportClick}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Upload className="h-4 w-4" />
              <span>Import Backup</span>
            </button>
            
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImportData}
              className="hidden"
              aria-label="Import backup file"
            />
            
            {showClearConfirm ? (
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleClearAllData}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Confirm Clear All</span>
                </button>
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="flex items-center space-x-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                <span>Clear All Data</span>
              </button>
            )}
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Info className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-amber-800">
                  <strong>Backup Tip:</strong> Export your data regularly to prevent data loss. 
                  Backups can be imported on any device to restore your patients and assessments.
                  All data is stored locally on your device for privacy and offline access.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Braden Scale Reference */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <FileText className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Braden Scale Reference</h3>
        </div>

        <div className="space-y-6">
          {/* Risk Levels */}
          <div>
            <h4 className="font-medium text-gray-700 mb-3">Risk Classification</h4>
            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {Object.values(RISK_CLASSIFICATIONS).map((risk) => (
                <div key={risk.level} className={`rounded-lg p-3 ${risk.bgColor}`}>
                  <div className={`font-semibold ${risk.color}`}>{risk.label}</div>
                  <div className="text-sm text-gray-600">{risk.scoreRange}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Subscales */}
          <div>
            <h4 className="font-medium text-gray-700 mb-3">Subscales</h4>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {BRADEN_SUBSCALES.map((subscale) => (
                <div key={subscale.id} className="bg-gray-50 rounded-lg p-3">
                  <div className="font-medium text-gray-900">{subscale.name}</div>
                  <div className="text-sm text-gray-500">Score: 1-{subscale.maxScore}</div>
                  <div className="text-xs text-gray-400 mt-1">{subscale.description}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Score Range */}
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Info className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm text-blue-800">
                  <strong>Total Score Range:</strong> {MIN_BRADEN_SCORE} - {MAX_BRADEN_SCORE}
                </p>
                <p className="text-sm text-blue-700 mt-1">
                  Lower scores indicate higher risk for pressure injury development.
                  The Braden Scale should be completed on admission and reassessed regularly.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* About & Disclaimer */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Shield className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">About & Disclaimer</h3>
        </div>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Braden Scale Calculator</h4>
            <p className="text-sm text-gray-600">
              Version 1.0.0 | Accurate Risk Assessment. Intelligent Prevention.
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Progressive Web App with offline support and local data storage.
            </p>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-amber-800 mb-1">Important Disclaimer</h4>
                <p className="text-sm text-amber-700">
                  This tool is intended for clinical decision support only. It does not replace 
                  professional clinical judgment. All recommendations generated by the AI engine 
                  should be validated by qualified healthcare providers and adapted to individual 
                  patient needs and institutional protocols.
                </p>
              </div>
            </div>
          </div>

          <div className="text-sm text-gray-500">
            <p><strong>Intended Users:</strong> Nurses, Physicians, Wound Care Specialists</p>
            <p><strong>Settings:</strong> Hospitals, Nursing Homes, Home Care Agencies</p>
            <p><strong>Data Storage:</strong> All data stored locally on device (IndexedDB/LocalStorage)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
