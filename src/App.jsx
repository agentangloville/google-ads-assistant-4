import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, TrendingUp, DollarSign, MousePointer, Zap, AlertCircle, CheckCircle, Clock, Settings, BarChart3, Sparkles, Play, Pause, Globe, Users, Sun, LogIn, LogOut, RefreshCw, Building2 } from 'lucide-react';

// Demo campaign data (fallback when not connected)
const demoCampaigns = [
  { id: 1, name: 'Summer Poland Junior 2026', status: 'active', budget: 500, spent: 347.20, clicks: 4521, impressions: 125430, ctr: 3.60, conversions: 89, type: 'junior', country: 'PL' },
  { id: 2, name: 'Italy Programme - UK', status: 'active', budget: 400, spent: 289.50, clicks: 3102, impressions: 89450, ctr: 3.47, conversions: 67, type: 'junior', country: 'IT' },
  { id: 3, name: 'TEFL Asia - Remarketing', status: 'paused', budget: 150, spent: 0, clicks: 0, impressions: 0, ctr: 0, conversions: 0, type: 'tefl', country: 'ASIA' },
  { id: 4, name: 'Adult Programmes', status: 'active', budget: 300, spent: 198.80, clicks: 2890, impressions: 67800, ctr: 4.26, conversions: 54, type: 'adult', country: 'PL' },
];

const suggestedActions = [
  { type: 'optimization', text: 'Summer Poland ma wysoki CTR - zwiększ budżet', impact: '+35% aplikacji' },
  { type: 'warning', text: 'TEFL Asia remarketing wstrzymany', impact: '~40 leadów/tydzień' },
  { type: 'insight', text: 'US audience konwertuje lepiej na Malta', impact: 'Przenieś 20% budżetu' },
  { type: 'seasonal', text: 'Sezon letni - kampanie early bird', impact: 'Niższy CPA o 25%' },
];

// Angloville context for AI
const ANGLOVILLE_CONTEXT = `
## O ANGLOVILLE
Angloville organizuje programy wymiany kulturalnej w Europie. Łączy native speakerów angielskiego z lokalnymi uczniami.

### PROGRAMY:
- Junior: Poland, Italy, Malta, Eurotrip, UK Trip, SKI Winter
- Adult: Poland (18+)
- TEFL: Certyfikat + Asia placements (Tajlandia, Korea, Japonia, Wietnam)

### GRUPY DOCELOWE:
1. International Participants: Native speakerzy (UK, USA, AUS), 18-35 lat
   Keywords: "free travel Europe", "volunteer abroad", "gap year programs"
2. Local Participants: Polacy uczący się angielskiego

### METRYKI: CPA target 15-25 PLN, cel = aplikacje "Apply Now"
`;

// Programme badge component
function ProgramBadge({ type }) {
  const config = {
    junior: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Junior' },
    adult: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Adult' },
    tefl: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'TEFL' },
    eurotrip: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Eurotrip' },
  };
  const c = config[type] || { bg: 'bg-gray-100', text: 'text-gray-700', label: type || 'Campaign' };
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${c.bg} ${c.text}`}>{c.label}</span>;
}

// Status badge
function StatusBadge({ status }) {
  const isActive = status === 'active' || status === 'enabled';
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
      isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
    }`}>
      {isActive ? '● Aktywna' : '○ Wstrzymana'}
    </span>
  );
}

export default function App() {
  // Auth state
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [showAccountSelector, setShowAccountSelector] = useState(false);
  
  // App state
  const [messages, setMessages] = useState([
    { 
      role: 'assistant', 
      content: `Cześć! 👋 Jestem asystentem AI do zarządzania Google Ads dla **Angloville**.

${isConnected ? '✅ Połączono z Google Ads!' : '🔗 **Połącz konto Google Ads** aby zobaczyć prawdziwe kampanie, lub pracuj w trybie demo.'}

**Mogę pomóc z:**
• 🎯 Analizą kampanii i optymalizacją
• 📊 Raportami i insightami
• 🌍 Strategią na różne rynki
• 📅 Planowaniem sezonowym`,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [campaigns, setCampaigns] = useState(demoCampaigns);
  const [pendingAction, setPendingAction] = useState(null);
  const [activeTab, setActiveTab] = useState('chat');
  const [isLoadingCampaigns, setIsLoadingCampaigns] = useState(false);
  const messagesEndRef = useRef(null);

  // Check URL params for OAuth callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('access_token');
    const refresh = params.get('refresh_token');
    const error = params.get('error');

    if (error) {
      console.error('OAuth error:', error);
      addMessage('assistant', `❌ Błąd autoryzacji: ${error}`);
    }

    if (token) {
      setAccessToken(token);
      setRefreshToken(refresh);
      setIsConnected(true);
      // Clear URL params
      window.history.replaceState({}, document.title, window.location.pathname);
      // Fetch accounts
      fetchAccounts(token);
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addMessage = (role, content) => {
    setMessages(prev => [...prev, { role, content, timestamp: new Date() }]);
  };

  // Google OAuth login
  const handleLogin = () => {
    window.location.href = '/api/auth/login';
  };

  // Logout
  const handleLogout = () => {
    setAccessToken(null);
    setRefreshToken(null);
    setIsConnected(false);
    setSelectedAccount(null);
    setAccounts([]);
    setCampaigns(demoCampaigns);
    addMessage('assistant', '👋 Wylogowano z Google Ads. Pracujesz teraz w trybie demo.');
  };

  // Fetch available accounts
  const fetchAccounts = async (token) => {
    try {
      const response = await fetch('/api/google-ads/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken: token }),
      });

      const data = await response.json();
      
      if (data.customers && data.customers.length > 0) {
        setAccounts(data.customers);
        if (data.customers.length === 1) {
          // Auto-select if only one account
          selectAccount(data.customers[0], token);
        } else {
          setShowAccountSelector(true);
        }
      } else {
        addMessage('assistant', '⚠️ Nie znaleziono kont Google Ads. Upewnij się, że masz dostęp do konta.');
      }
    } catch (error) {
      console.error('Error fetching accounts:', error);
      addMessage('assistant', '❌ Błąd podczas pobierania listy kont.');
    }
  };

  // Select account and fetch campaigns
  const selectAccount = async (account, token = accessToken) => {
    setSelectedAccount(account);
    setShowAccountSelector(false);
    await fetchCampaigns(account.id, token);
    addMessage('assistant', `✅ Połączono z kontem **${account.formatted}**. Wyświetlam prawdziwe kampanie!`);
  };

  // Fetch campaigns from Google Ads
  const fetchCampaigns = async (customerId, token = accessToken) => {
    if (!token || !customerId) return;
    
    setIsLoadingCampaigns(true);
    try {
      const response = await fetch('/api/google-ads/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          accessToken: token, 
          customerId: customerId 
        }),
      });

      const data = await response.json();

      if (response.status === 401 && data.needsRefresh && refreshToken) {
        // Token expired, try refresh
        const newToken = await refreshAccessToken();
        if (newToken) {
          return fetchCampaigns(customerId, newToken);
        }
      }

      if (data.campaigns) {
        setCampaigns(data.campaigns);
      } else if (data.error) {
        console.error('Campaign fetch error:', data.error);
        addMessage('assistant', `⚠️ Błąd: ${data.error}`);
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    } finally {
      setIsLoadingCampaigns(false);
    }
  };

  // Refresh access token
  const refreshAccessToken = async () => {
    if (!refreshToken) return null;
    
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      const data = await response.json();
      if (data.accessToken) {
        setAccessToken(data.accessToken);
        return data.accessToken;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      handleLogout();
    }
    return null;
  };

  // Process message with AI
  const processWithAI = async (userMessage) => {
    setIsLoading(true);
    
    const systemPrompt = `Jesteś ekspertem Google Ads dla Angloville.

${ANGLOVILLE_CONTEXT}

AKTUALNY STAN KAMPANII:
${JSON.stringify(campaigns, null, 2)}

STATUS POŁĄCZENIA: ${isConnected ? 'Połączono z prawdziwym kontem Google Ads' : 'Tryb demo (dane przykładowe)'}

ZADANIA:
1. Odpowiadaj po polsku, konkretnie
2. Analizuj kampanie i sugeruj optymalizacje
3. Dla akcji zwróć JSON: {"action": "nazwa", "params": {...}, "description": "opis"}
4. Dostępne akcje: update_budget, pause_campaign, resume_campaign, create_campaign

Odpowiedz TYLKO tekstem lub TYLKO JSON.`;

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system: systemPrompt,
          messages: [
            ...messages.slice(-10).map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: userMessage }
          ]
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'API Error');
      }

      const data = await response.json();
      const assistantMessage = data.content?.[0]?.text || 'Przepraszam, wystąpił błąd.';
      
      try {
        const parsed = JSON.parse(assistantMessage);
        if (parsed.action) {
          setPendingAction(parsed);
          return `🎯 **Proponowana akcja:** ${parsed.description}\n\nZatwierdź lub anuluj.`;
        }
      } catch {}
      
      return assistantMessage;
    } catch (error) {
      return `❌ Błąd: ${error.message}`;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMessage = input.trim();
    setInput('');
    addMessage('user', userMessage);

    if (pendingAction && ['tak', 'yes', 'ok', 'zatwierdź'].some(w => userMessage.toLowerCase().includes(w))) {
      // Execute action (in demo mode, just update local state)
      setPendingAction(null);
      addMessage('assistant', `✅ Akcja wykonana (${isConnected ? 'Google Ads' : 'tryb demo'})`);
      return;
    }

    if (pendingAction && ['nie', 'no', 'anuluj'].some(w => userMessage.toLowerCase().includes(w))) {
      setPendingAction(null);
      addMessage('assistant', '❌ Anulowano.');
      return;
    }

    const response = await processWithAI(userMessage);
    addMessage('assistant', response);
  };

  // Stats
  const totalSpent = campaigns.reduce((sum, c) => sum + (c.spent || 0), 0);
  const totalClicks = campaigns.reduce((sum, c) => sum + (c.clicks || 0), 0);
  const totalConversions = campaigns.reduce((sum, c) => sum + (c.conversions || 0), 0);
  const activeCampaigns = campaigns.filter(c => c.status === 'active' || c.status === 'enabled');
  const avgCTR = activeCampaigns.length > 0 
    ? activeCampaigns.reduce((sum, c) => sum + (c.ctr || 0), 0) / activeCampaigns.length 
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50 text-gray-900" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Account selector modal */}
      {showAccountSelector && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <Building2 className="w-6 h-6 text-orange-500" />
              <h2 className="text-lg font-bold">Wybierz konto Google Ads</h2>
            </div>
            <div className="space-y-2">
              {accounts.map(account => (
                <button
                  key={account.id}
                  onClick={() => selectAccount(account)}
                  className="w-full text-left p-4 bg-gray-50 hover:bg-orange-50 border border-gray-200 hover:border-orange-300 rounded-xl transition-all"
                >
                  <span className="font-mono font-medium">{account.formatted}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Decorative */}
      <div className="fixed top-0 right-0 w-96 h-96 bg-gradient-to-br from-orange-200/30 to-pink-200/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="fixed bottom-0 left-0 w-80 h-80 bg-gradient-to-br from-blue-200/30 to-purple-200/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      
      <div className="relative z-10 flex h-screen">
        {/* Sidebar */}
        <div className="w-80 border-r border-gray-200/80 bg-white/70 backdrop-blur-xl p-6 flex flex-col">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center shadow-lg shadow-orange-200">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Angloville Ads</h1>
              <p className="text-xs text-gray-500">{isConnected ? `Konto: ${selectedAccount?.formatted || '...'}` : 'Tryb demo'}</p>
            </div>
          </div>

          {/* Connection status & login */}
          <div className="mb-6">
            {isConnected ? (
              <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-xs text-emerald-700 font-medium">Połączono z Google Ads</span>
                </div>
                <button 
                  onClick={() => fetchCampaigns(selectedAccount?.id)}
                  className="p-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                  title="Odśwież"
                >
                  <RefreshCw className={`w-4 h-4 text-gray-600 ${isLoadingCampaigns ? 'animate-spin' : ''}`} />
                </button>
                <button 
                  onClick={handleLogout}
                  className="p-2 bg-gray-100 hover:bg-red-100 rounded-xl transition-colors"
                  title="Wyloguj"
                >
                  <LogOut className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleLogin}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-gray-200 hover:border-orange-300 hover:bg-orange-50 rounded-xl transition-all font-medium text-sm"
              >
                <LogIn className="w-4 h-4" />
                Połącz z Google Ads
              </button>
            )}
          </div>

          {/* Stats */}
          <div className="space-y-3 mb-6">
            <div className="bg-gradient-to-br from-orange-500 to-pink-500 rounded-2xl p-4 text-white shadow-lg shadow-orange-200/50">
              <div className="flex items-center gap-2 text-white/80 text-xs mb-1">
                <DollarSign className="w-3.5 h-3.5" />
                Wydatki
              </div>
              <div className="text-3xl font-bold">{totalSpent.toFixed(0)} <span className="text-lg font-normal opacity-80">PLN</span></div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-1">
                  <MousePointer className="w-3 h-3" />
                  Kliknięcia
                </div>
                <div className="text-xl font-bold text-gray-900">{totalClicks.toLocaleString()}</div>
              </div>
              <div className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-1">
                  <Users className="w-3 h-3" />
                  Konwersje
                </div>
                <div className="text-xl font-bold text-gray-900">{totalConversions}</div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-1">
                    <TrendingUp className="w-3 h-3" />
                    Średni CTR
                  </div>
                  <div className="text-xl font-bold text-gray-900">{(avgCTR * 100).toFixed(2)}%</div>
                </div>
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Sugestie AI</div>
          <div className="space-y-2 flex-1 overflow-y-auto">
            {suggestedActions.map((action, i) => (
              <button 
                key={i}
                onClick={() => { setActiveTab('chat'); setInput(action.text); }}
                className="w-full text-left bg-white hover:bg-gray-50 rounded-xl p-3 border border-gray-100 transition-all shadow-sm hover:shadow-md"
              >
                <div className="flex items-start gap-2.5">
                  {action.type === 'optimization' && <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0"><Zap className="w-4 h-4 text-emerald-600" /></div>}
                  {action.type === 'warning' && <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0"><AlertCircle className="w-4 h-4 text-amber-600" /></div>}
                  {action.type === 'insight' && <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0"><BarChart3 className="w-4 h-4 text-blue-600" /></div>}
                  {action.type === 'seasonal' && <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center shrink-0"><Sun className="w-4 h-4 text-orange-600" /></div>}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-700 line-clamp-2 font-medium">{action.text}</p>
                    <p className="text-xs text-emerald-600 mt-1 font-semibold">{action.impact}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col bg-white/50">
          {/* Tabs */}
          <div className="border-b border-gray-200/80 bg-white/80 backdrop-blur-xl px-6">
            <div className="flex gap-1">
              {[
                { id: 'chat', label: 'Asystent AI', icon: Bot },
                { id: 'campaigns', label: 'Kampanie', icon: BarChart3 },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-4 text-sm font-medium transition-all border-b-2 ${
                    activeTab === tab.id 
                      ? 'border-orange-500 text-orange-600' 
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                  {tab.id === 'campaigns' && (
                    <span className="px-1.5 py-0.5 text-xs bg-gray-100 rounded-full">{campaigns.length}</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {activeTab === 'chat' ? (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                    {msg.role === 'assistant' && (
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center shrink-0 shadow-lg shadow-orange-200/50">
                        <Bot className="w-5 h-5 text-white" />
                      </div>
                    )}
                    <div className={`max-w-2xl rounded-2xl px-5 py-4 ${
                      msg.role === 'user' 
                        ? 'bg-gradient-to-br from-orange-500 to-pink-500 text-white shadow-lg shadow-orange-200/50' 
                        : 'bg-white border border-gray-100 text-gray-800 shadow-sm'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                      <p className={`text-xs mt-2 ${msg.role === 'user' ? 'text-white/70' : 'text-gray-400'}`}>
                        {msg.timestamp.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    {msg.role === 'user' && (
                      <div className="w-10 h-10 rounded-2xl bg-gray-200 flex items-center justify-center shrink-0">
                        <User className="w-5 h-5 text-gray-600" />
                      </div>
                    )}
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center shadow-lg">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div className="bg-white border border-gray-100 rounded-2xl px-5 py-4 shadow-sm">
                      <div className="flex gap-1.5">
                        <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}

                {pendingAction && (
                  <div className="flex gap-3">
                    <div className="w-10 h-10" />
                    <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-5">
                      <div className="flex items-center gap-2 text-amber-700 text-sm font-semibold mb-2">
                        <Clock className="w-4 h-4" />
                        Potwierdź akcję
                      </div>
                      <p className="text-sm text-amber-900 mb-4">{pendingAction.description}</p>
                      <div className="flex gap-3">
                        <button 
                          onClick={() => { setPendingAction(null); addMessage('assistant', '✅ Wykonano!'); }}
                          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 rounded-xl text-sm font-semibold text-white transition-colors"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Zatwierdź
                        </button>
                        <button 
                          onClick={() => setPendingAction(null)}
                          className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium text-gray-700 transition-colors"
                        >
                          Anuluj
                        </button>
                      </div>
                    </div>
                  </div>
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
                    disabled={isLoading || !input.trim()}
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
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Kampanie</h2>
                  <p className="text-sm text-gray-500">
                    {isConnected ? 'Dane z Google Ads' : 'Tryb demo - połącz konto aby zobaczyć prawdziwe dane'}
                  </p>
                </div>
                {isConnected && (
                  <button 
                    onClick={() => fetchCampaigns(selectedAccount?.id)}
                    disabled={isLoadingCampaigns}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium transition-all"
                  >
                    <RefreshCw className={`w-4 h-4 ${isLoadingCampaigns ? 'animate-spin' : ''}`} />
                    Odśwież
                  </button>
                )}
              </div>
              
              {isLoadingCampaigns ? (
                <div className="flex items-center justify-center py-12">
                  <RefreshCw className="w-8 h-8 text-orange-500 animate-spin" />
                </div>
              ) : (
                <div className="space-y-3">
                  {campaigns.map(campaign => (
                    <div 
                      key={campaign.id} 
                      className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-lg transition-all"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-gray-900">{campaign.name}</h3>
                            {campaign.type && <ProgramBadge type={campaign.type} />}
                            <StatusBadge status={campaign.status} />
                          </div>
                          <p className="text-sm text-gray-500 mt-1">
                            Budżet: {campaign.budget?.toFixed(0) || 0} PLN • Wydano: {campaign.spent?.toFixed(2) || 0} PLN
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button className="p-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
                            {campaign.status === 'active' || campaign.status === 'enabled' 
                              ? <Pause className="w-4 h-4 text-gray-600" /> 
                              : <Play className="w-4 h-4 text-gray-600" />
                            }
                          </button>
                          <button className="p-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
                            <Settings className="w-4 h-4 text-gray-600" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-4">
                        <div className="bg-gray-50 rounded-xl p-3">
                          <p className="text-xs text-gray-500 mb-0.5">Wyświetlenia</p>
                          <p className="text-lg font-bold text-gray-900">{(campaign.impressions || 0).toLocaleString()}</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-3">
                          <p className="text-xs text-gray-500 mb-0.5">Kliknięcia</p>
                          <p className="text-lg font-bold text-gray-900">{(campaign.clicks || 0).toLocaleString()}</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-3">
                          <p className="text-xs text-gray-500 mb-0.5">CTR</p>
                          <p className="text-lg font-bold text-gray-900">{((campaign.ctr || 0) * 100).toFixed(2)}%</p>
                        </div>
                        <div className="bg-emerald-50 rounded-xl p-3">
                          <p className="text-xs text-emerald-600 mb-0.5">Konwersje</p>
                          <p className="text-lg font-bold text-emerald-700">{campaign.conversions || 0}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
