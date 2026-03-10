import React from 'react';
import { Clock, CheckCircle } from 'lucide-react';

/**
 * Komponent potwierdzenia akcji
 */
export function ActionConfirm({ action, onConfirm, onCancel }) {
  if (!action) return null;

  return (
    <div className="flex gap-3">
      <div className="w-10 h-10" /> {/* Spacer dla wyrównania z wiadomościami */}
      <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-5 max-w-md">
        {/* Header */}
        <div className="flex items-center gap-2 text-amber-700 text-sm font-semibold mb-2">
          <Clock className="w-4 h-4" />
          Potwierdź akcję
        </div>
        
        {/* Opis akcji */}
        <p className="text-sm text-amber-900 mb-4">
          {action.description}
        </p>
        
        {/* Szczegóły akcji */}
        {action.params && (
          <div className="bg-amber-100/50 rounded-lg p-3 mb-4 text-xs font-mono text-amber-800">
            {Object.entries(action.params).map(([key, value]) => (
              <div key={key}>
                <span className="text-amber-600">{key}:</span> {value}
              </div>
            ))}
          </div>
        )}
        
        {/* Przyciski */}
        <div className="flex gap-3">
          <button 
            onClick={onConfirm}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 rounded-xl text-sm font-semibold text-white transition-colors"
          >
            <CheckCircle className="w-4 h-4" />
            Zatwierdź
          </button>
          <button 
            onClick={onCancel}
            className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium text-gray-700 transition-colors"
          >
            Anuluj
          </button>
        </div>
      </div>
    </div>
  );
}
