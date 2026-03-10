import React, { useState, useEffect } from 'react';
import { 
  Send, Bot, TrendingUp, DollarSign, MousePointer, BarChart3, 
  LogIn, LogOut, RefreshCw, Building2, MessageSquare, LayoutGrid,
  Zap, AlertCircle
} from 'lucide-react';

// Hooks
import { useAuth } from './hooks/useAuth';
import { useGoogleAds } from './hooks/useGoogleAds';
import { useChat } from './hooks/useChat';

// Components
import { ChatMessage, LoadingIndicator } from './components/ChatMessage';
import { CampaignCard } from './components/CampaignCard';
import { AccountSelector } from './components/AccountSelector';
import { ActionConfirm } from './components/ActionConfirm';
import { StatsCard, SuggestedAction } from './components/StatsCard';

// Utils
import { formatCurrency, formatNumber, formatPercent } from './utils/helpers';
import { SUGGESTED_ACTIONS, DATE_RANGES } from './utils/constants';

export default function App() {
  // Auth
  const { accessToken, isConnected, isLoading: authLoading, login, logout, refresh } = useAuth();

  // Google Ads
  const {
    accounts, selectedAccount, fetchAccounts, selectAccount,
    campaigns, dateRange, setDateRange,
    fetchCampaigns, pauseCampaign, resumeCampaign, updateBudget,
    isLoadingAccounts, isLoadingCampaigns,
    resetToDemo,
  } = useGoogleAds(accessToken, refresh);

  // Chat
  const {
    messages, isLoading: chatLoading, pendingAction, messagesEndRef,
    sendMessage, confirmAction, cancelAction, addMessage,
  } = useChat(campaigns, isConnected, selectedAccount);

  // UI State
  const [input, setInput] = useState('');
  const [activeTab, setActiveTab] = useState('chat');
  const [showAccountSelector, setShowAccountSelector] = useState(false);

  // Efekty
  useEffect(() => {
    if (isConnected && accessToken && accounts.length === 0) {
      fetchAccounts().then(accs => {
        if (accs && accs.length === 1) {
          handleSelectAccount(accs[0]);
        } else if (accs && accs.length > 1) {
          setShowAccountSelector(true);
        }
      });
    }
  }, [isConnected, accessToken]);

  useEffect(() => {
    if (selectedAccount) {
      fetchCampaigns();
    }
  }, [selectedAccount, dateRange]);

  // Handlers
  const handleSelectAccount = async (account) => {
    selectAccount(account);
    setShowAccountSelector(false);
    addMessage('assistant', `✅ Połączono z kontem **${account.name || account.formatted}**. Pobieram kampanie...`);
  };

  const handleLogout = () => {
    logout();
    resetToDemo();
    addMessage('assistant', '👋 Wylogowano z Google Ads. Pracujesz teraz w trybie demo.');
  };

  const handleSend = async () => {
    if (!input.trim() || chatLoading) return;
    const text = input.trim();
    setInput('');
    await sendMessage(text);
  };

  const handleConfirmAction = async () => {
    const action = confirmAction();
    if (!action || !isConnected || !selectedAccount) return;

    // Wykonaj akcję w Google Ads
    try {
      switch (action.action) {
        case 'pause_campaign':
          await pauseCampaign(action.params.campaignId);
          addMessage('assistant', '✅ Kampania została wstrzymana.');
          break;
        case 'resume_campaign':
          await resumeCampaign(action.params.campaignId);
          addMessage('assistant', '✅ Kampania została wznowiona.');
          break;
        case 'update_budget':
          await updateBudget(action.params.campaignId, action.params.newBudget);
          addMessage('assistant', `✅ Budżet zmieniony na ${action.params.newBudget} PLN.`);
          break;
        default:
          addMessage('assistant', `⚠️ Nieznana akcja: ${action.action}`);
      }
    } catch (err) {
      addMessage('assistant', `❌ Błąd: ${err.message}`);
    }
  };

  const handleSuggestedAction = (action) => {
    setInput(action.text);
    setActiveTab('chat');
  };

  // Oblicz statystyki
  const stats = {
    totalSpent: campaigns.reduce((sum, c) => sum + (c.spent || 0), 0),
    totalClicks: campaigns.reduce((sum, c) => sum + (c.clicks || 0), 0),
    totalConversions: campaigns.reduce((sum, c) => sum + (c.conversions || 0), 0),
    activeCampaigns: campaigns.filter(c => c.status === 'enabled' || c.status === 'active').length,
    avgCTR: campaigns.length > 0 
      ? campaigns.reduce((sum, c) => sum + (c.ctr || 0), 0) / campaigns.length 
      : 0,
  };

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50 flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Account selector modal */}
      {showAccountSelector && (
        <AccountSelector 
          accounts={accounts} 
          onSelect={handleSelectAccount}
          onClose={() => setShowAccountSelector(false)}
        />
      )}

      <div className="max-w-7xl mx-auto p-4 lg:p-6">
        {/* Header */}
        <header className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center shadow-lg">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Angloville Ads</h1>
              <p className="text-sm text-gray-500">
                {isConnected && selectedAccount 
                  ? `${selectedAccount.name || selectedAccount.formatted}`
                  : 'Tryb demo'}
              </p>
            </div>
          </div>

          {/* Auth buttons */}
          <div className="flex items-center gap-3">
            {isConnected ? (
              <>
                {accounts.length > 1 && (
                  <button 
                    onClick={() => setShowAccountSelector(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium transition-all"
                  >
                    <Building2 className="w-4 h-4" />
                    Zmień konto
                  </button>
                )}
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  Wyloguj
                </button>
              </>
            ) : (
              <button 
                onClick={login}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 rounded-xl text-sm font-semibold text-white shadow-lg shadow-orange-200 transition-all"
              >
                <LogIn className="w-4 h-4" />
                Połącz Google Ads
              </button>
            )}
          </div>
        </header>

        {/* Main layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar - Stats & Actions */}
          <div className="space-y-6">
            {/* Stats */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 p-5 shadow-lg">
              <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-orange-500" />
                Podsumowanie
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <StatsCard icon={DollarSign} label="Wydatki" value={formatCurrency(stats.totalSpent)} color="orange" />
                <StatsCard icon={MousePointer} label="Kliknięcia" value={formatNumber(stats.totalClicks)} color="blue" />
                <StatsCard icon={TrendingUp} label="CTR" value={formatPercent(stats.avgCTR)} color="emerald" />
                <StatsCard icon={Zap} label="Konwersje" value={stats.totalConversions} color="emerald" />
              </div>
            </div>

            {/* Suggested actions */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 p-5 shadow-lg">
              <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-500" />
                Sugerowane akcje
              </h2>
              <div className="space-y-3">
                {SUGGESTED_ACTIONS.slice(0, 3).map((action, i) => (
                  <SuggestedAction 
                    key={i}
                    {...action}
                    onClick={() => handleSuggestedAction(action)}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Main content area */}
          <div className="lg:col-span-2">
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-lg overflow-hidden flex flex-col" style={{ height: 'calc(100vh - 180px)' }}>
              {/* Tabs */}
              <div className="flex border-b border-gray-200/80">
                <button
                  onClick={() => setActiveTab('chat')}
                  className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 text-sm font-medium transition-all ${
                    activeTab === 'chat'
                      ? 'text-orange-600 border-b-2 border-orange-500 bg-orange-50/50'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  Chat AI
                </button>
                <button
                  onClick={() => setActiveTab('campaigns')}
                  className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 text-sm font-medium transition-all ${
                    activeTab === 'campaigns'
                      ? 'text-orange-600 border-b-2 border-orange-500 bg-orange-50/50'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                  Kampanie ({campaigns.length})
                </button>
              </div>

              {activeTab === 'chat' ? (
                <>
                  {/* Chat messages */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {messages.map(msg => (
                      <ChatMessage key={msg.id} message={msg} />
                    ))}
                    
                    {chatLoading && <LoadingIndicator />}
                    
                    {pendingAction && (
                      <ActionConfirm 
                        action={pendingAction}
                        onConfirm={handleConfirmAction}
                        onCancel={cancelAction}
                      />
                    )}
                    
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input */}
                  <div className="p-6 border-t border-gray-200/80 bg-white/80 backdrop-blur-xl">
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                        placeholder="Napisz polecenie..."
                        className="flex-1 bg-gray-50 border-2 border-gray-200 rounded-xl px-5 py-3.5 text-sm placeholder:text-gray-400 focus:outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100 transition-all"
                      />
                      <button
                        onClick={handleSend}
                        disabled={chatLoading || !input.trim()}
                        className="px-6 py-3.5 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 disabled:opacity-50 rounded-xl font-semibold text-sm text-white transition-all flex items-center gap-2 shadow-lg shadow-orange-200"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                /* Campaigns tab */
                <div className="flex-1 overflow-y-auto p-6">
                  {/* Header z filtrem */}
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">Kampanie</h2>
                      <p className="text-sm text-gray-500">
                        {isConnected ? 'Dane z Google Ads' : 'Tryb demo'}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <select
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                        className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-orange-400"
                      >
                        {DATE_RANGES.map(dr => (
                          <option key={dr.value} value={dr.value}>{dr.label}</option>
                        ))}
                      </select>
                      {isConnected && (
                        <button 
                          onClick={() => fetchCampaigns()}
                          disabled={isLoadingCampaigns}
                          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium transition-all"
                        >
                          <RefreshCw className={`w-4 h-4 ${isLoadingCampaigns ? 'animate-spin' : ''}`} />
                          Odśwież
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {/* Lista kampanii */}
                  {isLoadingCampaigns ? (
                    <div className="flex items-center justify-center py-12">
                      <RefreshCw className="w-8 h-8 text-orange-500 animate-spin" />
                    </div>
                  ) : campaigns.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <LayoutGrid className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>Brak kampanii do wyświetlenia</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {campaigns.map(campaign => (
                        <CampaignCard 
                          key={campaign.id}
                          campaign={campaign}
                          onPause={pauseCampaign}
                          onResume={resumeCampaign}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
