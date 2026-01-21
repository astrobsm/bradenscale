'use client';

import {
  AlertTriangle,
  Eye,
  Clock,
  Droplets,
  Shield,
  Activity,
  RotateCcw,
  Layers,
  Utensils,
  TrendingUp,
  Move,
  Bed,
  FileText,
  ShieldCheck,
  Brain,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useState } from 'react';
import { AIAnalysis, AIRecommendation } from '@/types';

interface AIRecommendationsPanelProps {
  analysis: AIAnalysis;
}

const iconMap: Record<string, React.ElementType> = {
  'eye': Eye,
  'clock': Clock,
  'droplets': Droplets,
  'shield': Shield,
  'activity': Activity,
  'rotate-ccw': RotateCcw,
  'layers': Layers,
  'utensils': Utensils,
  'trending-up': TrendingUp,
  'move': Move,
  'bed': Bed,
  'file-text': FileText,
  'shield-check': ShieldCheck,
  'alert-triangle': AlertTriangle,
};

const priorityStyles: Record<string, { bg: string; text: string; border: string }> = {
  critical: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300' },
  high: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300' },
  medium: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-300' },
  low: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300' },
};

function RecommendationCard({ rec, index }: { rec: AIRecommendation; index: number }) {
  const [isExpanded, setIsExpanded] = useState(index < 3);
  const Icon = iconMap[rec.icon] || Shield;
  const styles = priorityStyles[rec.priority] || priorityStyles.medium;

  return (
    <div className={`border rounded-lg overflow-hidden ${styles.border}`}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full flex items-center justify-between p-3 text-left ${styles.bg} hover:opacity-90 transition-opacity`}
      >
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg bg-white/50`}>
            <Icon className={`h-4 w-4 ${styles.text}`} />
          </div>
          <div>
            <span className={`text-xs font-semibold uppercase ${styles.text}`}>
              {rec.priority}
            </span>
            <h4 className="font-medium text-gray-900">{rec.category}</h4>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4 text-gray-500" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-500" />
        )}
      </button>
      
      {isExpanded && (
        <div className="p-4 bg-white space-y-2">
          <p className="text-gray-800">{rec.recommendation}</p>
          <p className="text-sm text-gray-500 italic">
            <span className="font-medium">Rationale:</span> {rec.rationale}
          </p>
        </div>
      )}
    </div>
  );
}

export function AIRecommendationsPanel({ analysis }: AIRecommendationsPanelProps) {
  const criticalCount = analysis.recommendations.filter(r => r.priority === 'critical').length;
  const highCount = analysis.recommendations.filter(r => r.priority === 'high').length;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-4">
        <div className="flex items-center space-x-3">
          <div className="bg-white/20 p-2 rounded-lg">
            <Brain className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">AI-Powered Prevention Plan</h3>
            <p className="text-sm text-purple-100">
              Personalized recommendations based on assessment results
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-blue-600">{analysis.recommendations.length}</div>
            <div className="text-xs text-gray-500">Total Recommendations</div>
          </div>
          <div className="bg-red-50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-red-600">{criticalCount}</div>
            <div className="text-xs text-gray-500">Critical Priority</div>
          </div>
          <div className="bg-orange-50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-orange-600">{highCount}</div>
            <div className="text-xs text-gray-500">High Priority</div>
          </div>
          <div className={`rounded-lg p-3 text-center ${analysis.escalationNeeded ? 'bg-red-50' : 'bg-green-50'}`}>
            <div className={`text-lg font-bold ${analysis.escalationNeeded ? 'text-red-600' : 'text-green-600'}`}>
              {analysis.escalationNeeded ? 'Yes' : 'No'}
            </div>
            <div className="text-xs text-gray-500">Escalation Needed</div>
          </div>
        </div>

        {/* Primary Concerns */}
        {analysis.primaryConcerns.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-red-800 mb-2">Primary Risk Factors</h4>
                <ul className="space-y-1">
                  {analysis.primaryConcerns.map((concern, index) => (
                    <li key={index} className="text-sm text-red-700 flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                      <span>{concern}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Key Parameters */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <h4 className="font-semibold text-blue-800">Repositioning Frequency</h4>
            </div>
            <p className="text-blue-700">{analysis.repositioningFrequency}</p>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Bed className="h-5 w-5 text-purple-600" />
              <h4 className="font-semibold text-purple-800">Support Surface</h4>
            </div>
            <p className="text-purple-700 text-sm">{analysis.mattressRecommendation}</p>
          </div>
        </div>

        {/* Escalation Alert */}
        {analysis.escalationNeeded && analysis.escalationReason && (
          <div className="bg-amber-50 border-2 border-amber-400 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-6 w-6 text-amber-600 flex-shrink-0" />
              <div>
                <h4 className="font-bold text-amber-800 mb-1">Escalation Required</h4>
                <p className="text-amber-700">{analysis.escalationReason}</p>
              </div>
            </div>
          </div>
        )}

        {/* Recommendations List */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-3">Detailed Recommendations</h4>
          <div className="space-y-3">
            {analysis.recommendations.map((rec, index) => (
              <RecommendationCard key={index} rec={rec} index={index} />
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-gray-100 rounded-lg p-4 mt-6">
          <p className="text-xs text-gray-600">
            <span className="font-semibold">Important:</span> {analysis.disclaimer}
          </p>
        </div>
      </div>
    </div>
  );
}
