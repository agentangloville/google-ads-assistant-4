import React from 'react';
import { Play, Pause, Settings } from 'lucide-react';
import { StatusBadge, ProgramBadge } from './Badge';
import { formatCurrency, formatNumber, formatPercent, getProgramType } from '../utils/helpers';

/**
 * Karta kampanii
 */
export function CampaignCard({ campaign, onPause, onResume, onSettings }) {
  const isActive = campaign.status === 'enabled' || campaign.status === 'active';
  const program = getProgramType(campaign.name);

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-lg transition-all">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="font-semibold text-gray-900 truncate">{campaign.name}</h3>
            <ProgramBadge type={program.type} label={program.label} />
            <StatusBadge status={campaign.status} />
          </div>
          <p className="text-sm text-gray-500">
            Budżet: {formatCurrency(campaign.budget, 0)} • Wydano: {formatCurrency(campaign.spent)}
          </p>
        </div>
        
        {/* Actions */}
        <div className="flex gap-2 ml-4">
          <button 
            onClick={() => isActive ? onPause?.(campaign.id) : onResume?.(campaign.id)}
            className="p-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
            title={isActive ? 'Wstrzymaj' : 'Wznów'}
          >
            {isActive ? (
              <Pause className="w-4 h-4 text-gray-600" />
            ) : (
              <Play className="w-4 h-4 text-gray-600" />
            )}
          </button>
          <button 
            onClick={() => onSettings?.(campaign)}
            className="p-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
            title="Ustawienia"
          >
            <Settings className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Metryki */}
      <div className="grid grid-cols-4 gap-3">
        <MetricBox label="Wyświetlenia" value={formatNumber(campaign.impressions)} />
        <MetricBox label="Kliknięcia" value={formatNumber(campaign.clicks)} />
        <MetricBox label="CTR" value={formatPercent(campaign.ctr)} />
        <MetricBox 
          label="Konwersje" 
          value={campaign.conversions || 0} 
          highlight 
        />
      </div>

      {/* Dodatkowe metryki jeśli dostępne */}
      {(campaign.avgCpc || campaign.costPerConversion) && (
        <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-gray-100">
          {campaign.avgCpc > 0 && (
            <div className="text-sm">
              <span className="text-gray-500">Śr. CPC:</span>{' '}
              <span className="font-medium">{formatCurrency(campaign.avgCpc)}</span>
            </div>
          )}
          {campaign.costPerConversion > 0 && (
            <div className="text-sm">
              <span className="text-gray-500">CPA:</span>{' '}
              <span className="font-medium">{formatCurrency(campaign.costPerConversion)}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MetricBox({ label, value, highlight = false }) {
  return (
    <div className={`rounded-xl p-3 ${highlight ? 'bg-emerald-50' : 'bg-gray-50'}`}>
      <p className={`text-xs mb-0.5 ${highlight ? 'text-emerald-600' : 'text-gray-500'}`}>
        {label}
      </p>
      <p className={`text-lg font-bold ${highlight ? 'text-emerald-700' : 'text-gray-900'}`}>
        {value}
      </p>
    </div>
  );
}
