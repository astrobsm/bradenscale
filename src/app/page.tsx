'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Header } from '@/components/Header';
import { Navigation } from '@/components/Navigation';
import { CalculatorView } from '@/components/CalculatorView';
import { PatientsView } from '@/components/PatientsView';
import { HistoryView } from '@/components/HistoryView';
import { SettingsView } from '@/components/SettingsView';
import { Watermark } from '@/components/Watermark';
import { useAppStore } from '@/lib/store';

export default function Home() {
  const activeTab = useAppStore((state) => state.activeTab);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-4">
            <Image
              src="/logo.png"
              alt="Braden Scale Calculator"
              fill
              className="object-contain animate-pulse"
              priority
            />
          </div>
          <p className="text-gray-600">Loading Braden Scale Calculator...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Central Watermark */}
      <Watermark />
      
      {/* Main Content */}
      <div className="relative z-10">
        <Header />
        <Navigation />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {activeTab === 'calculator' && <CalculatorView />}
          {activeTab === 'patients' && <PatientsView />}
          {activeTab === 'history' && <HistoryView />}
          {activeTab === 'settings' && <SettingsView />}
        </main>

        <footer className="bg-white border-t border-gray-200 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <p className="text-center text-sm text-gray-500">
              <span className="font-medium text-gray-700">Disclaimer:</span> This tool is for clinical decision support only. 
              It does not replace professional clinical judgment. All recommendations should be validated by qualified healthcare providers.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
