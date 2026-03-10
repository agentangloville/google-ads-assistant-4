import { useState, useCallback, useRef, useEffect } from 'react';
import { ChatService } from '../services/chat';
import { generateId } from '../utils/helpers';

/**
 * Hook do zarządzania chatem z AI
 */
export function useChat(campaigns, isConnected, selectedAccount) {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const messagesEndRef = useRef(null);

  // Wiadomość powitalna
  useEffect(() => {
    if (messages.length === 0) {
      addMessage('assistant', getWelcomeMessage(isConnected));
    }
  }, [isConnected]);

  // Scroll do końca przy nowych wiadomościach
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Dodaj wiadomość
  const addMessage = useCallback((role, content) => {
    setMessages(prev => [...prev, {
      id: generateId(),
      role,
      content,
      timestamp: new Date(),
    }]);
  }, []);

  // Wyślij wiadomość
  const sendMessage = useCallback(async (text) => {
    if (!text.trim()) return;

    // Dodaj wiadomość użytkownika
    addMessage('user', text);
    setIsLoading(true);

    try {
      // Przygotuj historię (ostatnie 10 wiadomości)
      const history = messages.slice(-10).concat([{ role: 'user', content: text }]);
      
      // Wyślij do AI
      const response = await ChatService.sendMessage(
        history,
        campaigns,
        isConnected,
        selectedAccount
      );

      // Sprawdź czy to akcja
      const action = ChatService.parseAction(response);
      
      if (action) {
        setPendingAction(action);
        addMessage('assistant', `🎯 **Proponowana akcja:** ${action.description}\n\nZatwierdź lub anuluj poniżej.`);
      } else {
        addMessage('assistant', response);
      }
    } catch (err) {
      console.error('Chat error:', err);
      addMessage('assistant', `❌ Błąd: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [messages, campaigns, isConnected, selectedAccount, addMessage]);

  // Zatwierdź akcję
  const confirmAction = useCallback(() => {
    if (!pendingAction) return null;
    
    const action = pendingAction;
    setPendingAction(null);
    addMessage('assistant', `✅ Akcja "${action.action}" została zatwierdzona.`);
    return action;
  }, [pendingAction, addMessage]);

  // Anuluj akcję
  const cancelAction = useCallback(() => {
    setPendingAction(null);
    addMessage('assistant', '❌ Akcja anulowana.');
  }, [addMessage]);

  // Wyczyść historię
  const clearMessages = useCallback(() => {
    setMessages([]);
    setPendingAction(null);
    addMessage('assistant', getWelcomeMessage(isConnected));
  }, [isConnected, addMessage]);

  return {
    messages,
    isLoading,
    pendingAction,
    messagesEndRef,
    sendMessage,
    confirmAction,
    cancelAction,
    clearMessages,
    addMessage,
  };
}

function getWelcomeMessage(isConnected) {
  return `Cześć! 👋 Jestem asystentem AI do zarządzania Google Ads dla **Angloville**.

${isConnected 
  ? '✅ **Połączono z Google Ads!** Wybieram konto i pobieram kampanie.' 
  : '🔗 **Połącz konto Google Ads** aby zobaczyć prawdziwe kampanie, lub pracuj w trybie demo.'}

**Mogę pomóc z:**
• 🎯 Analizą kampanii i optymalizacją
• 📊 Raportami i insightami
• 🌍 Strategią na różne rynki (UK, USA, PL)
• 📅 Planowaniem sezonowym
• 💰 Zarządzaniem budżetem`;
}
