/**
 * Claude AI Chat Endpoint
 * Proxy do Anthropic API - chroni klucz API
 */

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ 
      error: 'ANTHROPIC_API_KEY is not configured',
      hint: 'Add your Anthropic API key to Vercel Environment Variables'
    });
  }

  try {
    const { messages, system, tools = null } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'messages array is required' });
    }

    // Przygotuj request do Anthropic
    const requestBody = {
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      system: system || '',
      messages: messages,
    };

    // Dodaj tools jeśli przekazane
    if (tools) {
      requestBody.tools = tools;
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Anthropic API error:', response.status, errorData);
      
      return res.status(response.status).json({ 
        error: errorData.error?.message || 'Anthropic API error',
        type: errorData.error?.type
      });
    }

    const data = await response.json();
    return res.status(200).json(data);

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}
