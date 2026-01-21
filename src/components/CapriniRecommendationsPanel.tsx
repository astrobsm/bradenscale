'use client';

import { 
  Syringe, 
  Shield, 
  Activity, 
  AlertTriangle, 
  Clock, 
  FileText,
  CheckCircle,
  XCircle,
  Info,
  Stethoscope,
  Pill,
} from 'lucide-react';
import { CapriniAIAnalysis, AIRecommendation, CapriniRiskLevel } from '@/types';
import { CAPRINI_RISK_CLASSIFICATIONS } from '@/lib/caprini-score';

interface CapriniRecommendationsPanelProps {
  analysis: CapriniAIAnalysis;
  totalScore: number;
}

const iconMap: Record<string, React.ReactNode> = {
  syringe: <Syringe className="w-5 h-5" />,
  shield: <Shield className="w-5 h-5" />,
  activity: <Activity className="w-5 h-5" />,
  alert: <AlertTriangle className="w-5 h-5" />,
  clock: <Clock className="w-5 h-5" />,
  file: <FileText className="w-5 h-5" />,
  check: <CheckCircle className="w-5 h-5" />,
  stethoscope: <Stethoscope className="w-5 h-5" />,
  pill: <Pill className="w-5 h-5" />,
};

const priorityStyles: Record<string, { bg: string; border: string; text: string }> = {
  critical: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-800',
  },
  high: {
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    text: 'text-orange-800',
  },
  medium: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    text: 'text-yellow-800',
  },
  low: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-800',
  },
};

function RecommendationCard({ recommendation }: { recommendation: AIRecommendation }) {
  const styles = priorityStyles[recommendation.priority] || priorityStyles.medium;
  const icon = iconMap[recommendation.icon] || <Info className="w-5 h-5" />;

  return (
    <div className={`p-4 rounded-lg border ${styles.bg} ${styles.border}`}>
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 ${styles.text}`}>{icon}</div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <h4 className={`font-semibold ${styles.text}`}>{recommendation.category}</h4>
            <span className={`text-xs px-2 py-0.5 rounded-full ${styles.bg} ${styles.text} border ${styles.border}`}>
              {recommendation.priority.toUpperCase()}
            </span>
          </div>
          <p className="text-gray-700 text-sm mb-2">{recommendation.recommendation}</p>
          {recommendation.rationale && (
            <p className="text-gray-500 text-xs italic">
              <strong>Rationale:</strong> {recommendation.rationale}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export function CapriniRecommendationsPanel({ analysis, totalScore }: CapriniRecommendationsPanelProps) {
  const riskClass = CAPRINI_RISK_CLASSIFICATIONS[analysis.overallRisk];

  return (
    <div className="space-y-6">
      {/* Risk Summary Header */}
      <div className={`p-6 rounded-xl ${riskClass.bgColor} border-2`} style={{ borderColor: riskClass.color }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Syringe className="w-8 h-8" style={{ color: riskClass.color }} />
            <div>
              <h3 className="text-xl font-bold" style={{ color: riskClass.color }}>
                {riskClass.label} VTE Risk
              </h3>
              <p className="text-gray-600 text-sm">Caprini Score: {totalScore} ({riskClass.scoreRange})</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold" style={{ color: riskClass.color }}>
              {analysis.vteIncidence}
            </div>
            <p className="text-sm text-gray-600">VTE Incidence</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="bg-white/60 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Pill className="w-4 h-4" />
              Recommended Prophylaxis
            </h4>
            <p className="text-sm text-gray-600">{analysis.prophylaxisRecommendation}</p>
          </div>
          <div className="bg-white/60 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Duration
            </h4>
            <p className="text-sm text-gray-600">{analysis.duration}</p>
          </div>
        </div>
      </div>

      {/* Contraindications Warning */}
      {analysis.contraindications.length > 0 && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-3">
            <XCircle className="w-6 h-6 text-red-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-red-800 mb-2">Contraindications / Cautions</h4>
              <ul className="list-disc list-inside space-y-1">
                {analysis.contraindications.map((ci, index) => (
                  <li key={index} className="text-red-700 text-sm">{ci}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Escalation Alert */}
      {analysis.escalationNeeded && (
        <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <div className="flex items-start gap-3">
            <Stethoscope className="w-6 h-6 text-purple-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-purple-800 mb-1">Specialist Consultation Recommended</h4>
              <p className="text-purple-700 text-sm">{analysis.escalationReason}</p>
            </div>
          </div>
        </div>
      )}

      {/* Primary Risk Factors */}
      {analysis.primaryRiskFactors.length > 0 && (
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Primary Risk Factors Identified
          </h4>
          <div className="flex flex-wrap gap-2">
            {analysis.primaryRiskFactors.map((factor, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm"
              >
                {factor}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      <div>
        <h4 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-600" />
          VTE Prevention Recommendations
        </h4>
        <div className="space-y-3">
          {analysis.recommendations.map((rec, index) => (
            <RecommendationCard key={index} recommendation={rec} />
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-semibold text-blue-800 mb-1">Clinical Disclaimer</h4>
            <p className="text-blue-700 text-sm">{analysis.disclaimer}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
