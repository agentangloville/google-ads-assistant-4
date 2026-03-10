import React from 'react';
import { Building2, X } from 'lucide-react';

/**
 * Modal wyboru konta Google Ads
 */
export function AccountSelector({ accounts, onSelect, onClose }) {
  if (!accounts || accounts.length === 0) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Wybierz konto</h2>
              <p className="text-sm text-gray-500">Google Ads</p>
            </div>
          </div>
          {onClose && (
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          )}
        </div>

        {/* Lista kont */}
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {accounts.map(account => (
            <button
              key={account.id}
              onClick={() => onSelect(account)}
              className="w-full text-left p-4 bg-gray-50 hover:bg-orange-50 border border-gray-200 hover:border-orange-300 rounded-xl transition-all group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 group-hover:text-orange-600">
                    {account.name || `Konto ${account.formatted}`}
                  </p>
                  <p className="text-sm text-gray-500 font-mono">
                    {account.formatted}
                  </p>
                </div>
                {account.manager && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                    MCC
                  </span>
                )}
              </div>
              {account.currencyCode && (
                <p className="text-xs text-gray-400 mt-1">
                  {account.currencyCode} • {account.timeZone}
                </p>
              )}
            </button>
          ))}
        </div>

        {/* Footer */}
        <p className="text-xs text-gray-400 text-center mt-4">
          Znaleziono {accounts.length} kont
        </p>
      </div>
    </div>
  );
}
