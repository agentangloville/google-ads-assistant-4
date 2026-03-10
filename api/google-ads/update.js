/**
 * Google Ads Campaign Update Endpoint
 * Modyfikuje kampanie (budżet, status, itp.)
 */

const GOOGLE_ADS_API_VERSION = 'v17';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { 
    accessToken, 
    customerId, 
    action,      // 'pause', 'resume', 'updateBudget'
    campaignId,
    newBudget,   // w PLN (dla updateBudget)
  } = req.body;

  const developerToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;
  const loginCustomerId = process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID;

  // Walidacja
  if (!accessToken) {
    return res.status(401).json({ error: 'access_token is required' });
  }

  if (!customerId || !campaignId) {
    return res.status(400).json({ error: 'customerId and campaignId are required' });
  }

  if (!action) {
    return res.status(400).json({ error: 'action is required (pause, resume, updateBudget)' });
  }

  if (!developerToken) {
    return res.status(500).json({ error: 'GOOGLE_ADS_DEVELOPER_TOKEN is not configured' });
  }

  const cleanCustomerId = customerId.replace(/-/g, '');

  try {
    const headers = {
      'Authorization': `Bearer ${accessToken}`,
      'developer-token': developerToken,
      'Content-Type': 'application/json',
    };

    if (loginCustomerId) {
      headers['login-customer-id'] = loginCustomerId.replace(/-/g, '');
    }

    let operations = [];
    let mutateUrl;

    // Buduj operację w zależności od akcji
    switch (action) {
      case 'pause':
        mutateUrl = `https://googleads.googleapis.com/${GOOGLE_ADS_API_VERSION}/customers/${cleanCustomerId}/campaigns:mutate`;
        operations = [{
          updateMask: 'status',
          update: {
            resourceName: `customers/${cleanCustomerId}/campaigns/${campaignId}`,
            status: 'PAUSED'
          }
        }];
        break;

      case 'resume':
        mutateUrl = `https://googleads.googleapis.com/${GOOGLE_ADS_API_VERSION}/customers/${cleanCustomerId}/campaigns:mutate`;
        operations = [{
          updateMask: 'status',
          update: {
            resourceName: `customers/${cleanCustomerId}/campaigns/${campaignId}`,
            status: 'ENABLED'
          }
        }];
        break;

      case 'updateBudget':
        if (!newBudget || newBudget <= 0) {
          return res.status(400).json({ error: 'newBudget must be a positive number' });
        }

        // Najpierw pobierz ID budżetu kampanii
        const budgetQuery = `
          SELECT campaign.campaign_budget
          FROM campaign
          WHERE campaign.id = ${campaignId}
        `;

        const queryResponse = await fetch(
          `https://googleads.googleapis.com/${GOOGLE_ADS_API_VERSION}/customers/${cleanCustomerId}/googleAds:search`,
          {
            method: 'POST',
            headers,
            body: JSON.stringify({ query: budgetQuery.trim() }),
          }
        );

        if (!queryResponse.ok) {
          const errorText = await queryResponse.text();
          return res.status(queryResponse.status).json({ 
            error: 'Failed to fetch campaign budget',
            details: errorText 
          });
        }

        const queryData = await queryResponse.json();
        const budgetResourceName = queryData.results?.[0]?.campaign?.campaignBudget;

        if (!budgetResourceName) {
          return res.status(404).json({ error: 'Campaign budget not found' });
        }

        // Aktualizuj budżet (konwersja PLN → micros)
        mutateUrl = `https://googleads.googleapis.com/${GOOGLE_ADS_API_VERSION}/${budgetResourceName}:mutate`;
        const budgetMicros = Math.round(newBudget * 1_000_000);
        
        // Dla budżetu używamy innego endpointu
        mutateUrl = `https://googleads.googleapis.com/${GOOGLE_ADS_API_VERSION}/customers/${cleanCustomerId}/campaignBudgets:mutate`;
        operations = [{
          updateMask: 'amount_micros',
          update: {
            resourceName: budgetResourceName,
            amountMicros: budgetMicros.toString()
          }
        }];
        break;

      default:
        return res.status(400).json({ 
          error: `Unknown action: ${action}`,
          validActions: ['pause', 'resume', 'updateBudget']
        });
    }

    // Wykonaj mutację
    const mutateResponse = await fetch(mutateUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({ operations }),
    });

    if (!mutateResponse.ok) {
      const errorText = await mutateResponse.text();
      console.error('Mutate error:', mutateResponse.status, errorText);

      if (mutateResponse.status === 401) {
        return res.status(401).json({ error: 'Token expired', needsRefresh: true });
      }

      return res.status(mutateResponse.status).json({ 
        error: 'Failed to update campaign',
        details: errorText 
      });
    }

    const result = await mutateResponse.json();

    return res.status(200).json({ 
      success: true,
      action,
      campaignId,
      result: result.results?.[0] || result,
      message: getSuccessMessage(action, newBudget)
    });

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}

function getSuccessMessage(action, newBudget) {
  switch (action) {
    case 'pause': return 'Kampania została wstrzymana';
    case 'resume': return 'Kampania została wznowiona';
    case 'updateBudget': return `Budżet zmieniony na ${newBudget} PLN`;
    default: return 'Operacja wykonana pomyślnie';
  }
}
