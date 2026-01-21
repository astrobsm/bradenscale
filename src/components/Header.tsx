'use client';

import Image from 'next/image';
import { Activity } from 'lucide-react';
import { useAppStore } from '@/lib/store';

export function Header() {
  const facilityName = useAppStore((state) => state.facilityName);

  return (
    <header className="bg-gradient-to-r from-blue-700 to-blue-900 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-white/20 p-1">
              <Image
                src="/logo.png"
                alt="Braden Scale Calculator Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div>
              <h1 className="text-xl font-bold">Braden Scale Calculator</h1>
              <p className="text-xs text-blue-200">Accurate Risk Assessment. Intelligent Prevention.</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-2 bg-white/10 px-3 py-1.5 rounded-lg">
              <Activity className="h-4 w-4 text-blue-200" />
              <span className="text-sm font-medium">{facilityName}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
