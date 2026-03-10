/**
 * Chat Service
 * Komunikacja z Claude AI
 */

import { ANGLOVILLE_CONTEXT } from '../utils/constants';

export const ChatService = {
  /**
   * Wyślij wiadomość do Claude z kontekstem kampanii
   */
  async sendMessage(messages, campaigns, isConnected, selectedAccount) {
    const systemPrompt = buildSystemPrompt(campaigns, isConnected, selectedAccount);

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system: systemPrompt,
        messages: messages.map(m => ({
          role: m.role,
          content: m.content
        })),
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Chat API error');
    }

    const data = await response.json();
    return data.content?.[0]?.text || 'Przepraszam, wystąpił błąd.';
  },

  /**
   * Parsuj akcję z odpowiedzi AI
   */
  parseAction(text) {
    try {
      // Szukaj JSON w odpowiedzi
      const jsonMatch = text.match(/\{[\s\S]*"action"[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.action) {
          return parsed;
        }
      }
    } catch {
      // Nie jest to JSON z akcją
    }
    return null;
  },
};

/**
 * Buduj system prompt z pełnym kontekstem
 */
function buildSystemPrompt(campaigns, isConnected, selectedAccount) {
  const campaignsJson = JSON.stringify(campaigns, null, 2);
  const accountInfo = selectedAccount 
    ? `Konto: ${selectedAccount.name || selectedAccount.formatted}` 
    : 'Brak wybranego konta';

  return `Jesteś ekspertem Google Ads dla Angloville. Odpowiadasz po polsku.

${ANGLOVILLE_CONTEXT}

## STATUS POŁĄCZENIA
${isConnected ? `✅ Połączono z Google Ads (${accountInfo})` : '⚠️ Tryb demo - dane przykładowe'}

## AKTUALNE KAMPANIE
\`\`\`json
${campaignsJson}
\`\`\`

## TWOJE ZADANIA
1. Analizuj kampanie i sugeruj optymalizacje
2. Odpowiadaj konkretnie, z liczbami
3. Dla działań zwróć JSON:

\`\`\`json
{
  "action": "pause_campaign" | "resume_campaign" | "update_budget",
  "params": { "campaignId": "123", "newBudget": 500 },
  "description": "Opis akcji po polsku"
}
\`\`\`

Dostępne akcje: pause_campaign, resume_campaign, update_budget

## STYL ODPOWIEDZI
- Konkretne dane i liczby
- Emoji dla czytelności (sparingly)
- Formatowanie markdown
- Proaktywne sugestie optymalizacji`;
}
