/**
 * Google Ads Campaigns Endpoint
 * Pobiera kampanie z metrykami z Google Ads API
 */

const GOOGLE_ADS_API_VERSION = 'v17';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { accessToken, customerId, dateRange = 'LAST_30_DAYS' } = req.body;
  const developerToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;
  const loginCustomerId = process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID;

  // Walidacja
  if (!accessToken) {
    return res.status(401).json({ error: 'access_token is required' });
  }

  if (!customerId) {
    return res.status(400).json({ error: 'customerId is required' });
  }

  if (!developerToken) {
    return res.status(500).json({ 
      error: 'GOOGLE_ADS_DEVELOPER_TOKEN is not configured'
    });
  }

  // Wyczyść customer ID (usuń myślniki)
  const cleanCustomerId = customerId.replace(/-/g, '');

  try {
    // Przygotuj headers
    const headers = {
      'Authorization': `Bearer ${accessToken}`,
      'developer-token': developerToken,
      'Content-Type': 'application/json',
    };

    if (loginCustomerId) {
      headers['login-customer-id'] = loginCustomerId.replace(/-/g, '');
    }

    // GAQL Query - Google Ads Query Language
    // Pobiera kampanie z pełnymi metrykami
    const query = `
      SELECT
        campaign.id,
        campaign.name,
        campaign.status,
        campaign.advertising_channel_type,
        campaign.bidding_strategy_type,
        campaign.start_date,
        campaign.end_date,
        campaign_budget.amount_micros,
        campaign_budget.delivery_method,
        metrics.cost_micros,
        metrics.clicks,
        metrics.impressions,
        metrics.ctr,
        metrics.average_cpc,
        metrics.conversions,
        metrics.conversions_value,
        metrics.cost_per_conversion,
        metrics.all_conversions,
        metrics.view_through_conversions
      FROM campaign
      WHERE 
        campaign.status != 'REMOVED'
        AND segments.date DURING ${dateRange}
      ORDER BY metrics.cost_micros DESC
      LIMIT 100
    `;

    const response = await fetch(
      `https://googleads.googleapis.com/${GOOGLE_ADS_API_VERSION}/customers/${cleanCustomerId}/googleAds:searchStream`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({ query: query.trim() }),
      }
    );

    // Obsługa błędów
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google Ads API error:', response.status, errorText);

      if (response.status === 401) {
        return res.status(401).json({ 
          error: 'Token expired',
          needsRefresh: true 
        });
      }

      // Parse error details
      let errorDetails;
      try {
        errorDetails = JSON.parse(errorText);
      } catch {
        errorDetails = { message: errorText };
      }

      return res.status(response.status).json({ 
        error: 'Google Ads API error',
        details: errorDetails.error?.message || errorText
      });
    }

    const data = await response.json();

    // Przekształć dane do przyjaznego formatu
    const campaigns = [];

    // Google Ads searchStream zwraca tablicę wyników
    if (data && Array.isArray(data)) {
      for (const batch of data) {
        if (batch.results) {
          for (const result of batch.results) {
            const campaign = result.campaign || {};
            const metrics = result.metrics || {};
            const budget = result.campaignBudget || {};

            // Konwersja micros na PLN (1 micro = 0.000001 PLN)
            const toMoney = (micros) => micros ? parseInt(micros) / 1_000_000 : 0;

            campaigns.push({
              id: campaign.id,
              name: campaign.name || 'Unnamed Campaign',
              status: (campaign.status || 'UNKNOWN').toLowerCase(),
              channelType: campaign.advertisingChannelType,
              biddingStrategy: campaign.biddingStrategyType,
              startDate: campaign.startDate,
              endDate: campaign.endDate,
              
              // Budżet
              budget: toMoney(budget.amountMicros),
              budgetDelivery: budget.deliveryMethod,
              
              // Metryki
              spent: toMoney(metrics.costMicros),
              clicks: parseInt(metrics.clicks) || 0,
              impressions: parseInt(metrics.impressions) || 0,
              ctr: parseFloat(metrics.ctr) || 0,
              avgCpc: toMoney(metrics.averageCpc),
              
              // Konwersje
              conversions: parseFloat(metrics.conversions) || 0,
              conversionsValue: parseFloat(metrics.conversionsValue) || 0,
              costPerConversion: toMoney(metrics.costPerConversion),
              allConversions: parseFloat(metrics.allConversions) || 0,
              viewThroughConversions: parseFloat(metrics.viewThroughConversions) || 0,
            });
          }
        }
      }
    }

    // Oblicz podsumowanie
    const summary = {
      totalCampaigns: campaigns.length,
      activeCampaigns: campaigns.filter(c => c.status === 'enabled').length,
      totalSpent: campaigns.reduce((sum, c) => sum + c.spent, 0),
      totalClicks: campaigns.reduce((sum, c) => sum + c.clicks, 0),
      totalImpressions: campaigns.reduce((sum, c) => sum + c.impressions, 0),
      totalConversions: campaigns.reduce((sum, c) => sum + c.conversions, 0),
    };

    return res.status(200).json({ 
      campaigns,
      summary,
      dateRange,
      customerId: cleanCustomerId,
    });

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}
