import React from 'react';

/**
 * Karta ze statystyką
 */
export function StatsCard({ icon: Icon, label, value, color = 'gray', trend = null }) {
  const colorClasses = {
    gray: 'bg-gray-50',
    orange: 'bg-orange-50',
    emerald: 'bg-emerald-50',
    blue: 'bg-blue-50',
  };

  const iconColorClasses = {
    gray: 'text-gray-500',
    orange: 'text-orange-500',
    emerald: 'text-emerald-500',
    blue: 'text-blue-500',
  };

  return (
    <div className={`${colorClasses[color]} rounded-xl p-4`}>
      <div className="flex items-center gap-2 mb-2">
        {Icon && <Icon className={`w-4 h-4 ${iconColorClasses[color]}`} />}
        <span className="text-sm text-gray-600">{label}</span>
      </div>
      <div className="flex items-end gap-2">
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {trend !== null && (
          <span className={`text-sm font-medium ${trend >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend).toFixed(1)}%
          </span>
        )}
      </div>
    </div>
  );
}

/**
 * Karta z sugerowaną akcją
 */
export function SuggestedAction({ type, text, impact, onClick }) {
  const typeConfig = {
    optimization: { icon: '⚡', color: 'emerald' },
    warning: { icon: '⚠️', color: 'amber' },
    insight: { icon: '💡', color: 'blue' },
    seasonal: { icon: '📅', color: 'purple' },
  };

  const config = typeConfig[type] || { icon: '📌', color: 'gray' };

  const colorClasses = {
    emerald: 'border-emerald-200 bg-emerald-50 hover:bg-emerald-100',
    amber: 'border-amber-200 bg-amber-50 hover:bg-amber-100',
    blue: 'border-blue-200 bg-blue-50 hover:bg-blue-100',
    purple: 'border-purple-200 bg-purple-50 hover:bg-purple-100',
    gray: 'border-gray-200 bg-gray-50 hover:bg-gray-100',
  };

  return (
    <button 
      onClick={onClick}
      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${colorClasses[config.color]}`}
    >
      <div className="flex items-start gap-3">
        <span className="text-xl">{config.icon}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900">{text}</p>
          <p className="text-xs text-gray-500 mt-1">Wpływ: {impact}</p>
        </div>
      </div>
    </button>
  );
}
