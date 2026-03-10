/**
 * Google Ads Ad Groups Endpoint
 * Pobiera grupy reklam z metrykami
 */

const GOOGLE_ADS_API_VERSION = 'v17';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { 
    accessToken, 
    customerId, 
    campaignId = null,
    dateRange = 'LAST_30_DAYS',
    limit = 100
  } = req.body;

  const developerToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;
  const loginCustomerId = process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID;

  if (!accessToken) {
    return res.status(401).json({ error: 'access_token is required' });
  }

  if (!customerId) {
    return res.status(400).json({ error: 'customerId is required' });
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

    const campaignFilter = campaignId 
      ? `AND campaign.id = ${campaignId}` 
      : '';

    const query = `
      SELECT
        ad_group.id,
        ad_group.name,
        ad_group.status,
        ad_group.type,
        ad_group.cpc_bid_micros,
        campaign.id,
        campaign.name,
        campaign.status,
        metrics.clicks,
        metrics.impressions,
        metrics.ctr,
        metrics.average_cpc,
        metrics.cost_micros,
        metrics.conversions,
        metrics.cost_per_conversion,
        metrics.all_conversions
      FROM ad_group
      WHERE 
        ad_group.status != 'REMOVED'
        ${campaignFilter}
        AND segments.date DURING ${dateRange}
      ORDER BY metrics.cost_micros DESC
      LIMIT ${limit}
    `;

    const response = await fetch(
      `https://googleads.googleapis.com/${GOOGLE_ADS_API_VERSION}/customers/${cleanCustomerId}/googleAds:searchStream`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({ query: query.trim() }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google Ads API error:', response.status, errorText);

      if (response.status === 401) {
        return res.status(401).json({ error: 'Token expired', needsRefresh: true });
      }

      return res.status(response.status).json({ 
        error: 'Google Ads API error',
        details: errorText 
      });
    }

    const data = await response.json();
    const adGroups = [];

    if (data && Array.isArray(data)) {
      for (const batch of data) {
        if (batch.results) {
          for (const result of batch.results) {
            const adGroup = result.adGroup || {};
            const metrics = result.metrics || {};
            const campaign = result.campaign || {};

            const toMoney = (micros) => micros ? parseInt(micros) / 1_000_000 : 0;

            adGroups.push({
              id: adGroup.id,
              name: adGroup.name,
              status: (adGroup.status || 'UNKNOWN').toLowerCase(),
              type: adGroup.type,
              cpcBid: toMoney(adGroup.cpcBidMicros),
              
              campaignId: campaign.id,
              campaignName: campaign.name,
              campaignStatus: (campaign.status || 'UNKNOWN').toLowerCase(),

              // Metryki
              clicks: parseInt(metrics.clicks) || 0,
              impressions: parseInt(metrics.impressions) || 0,
              ctr: parseFloat(metrics.ctr) || 0,
              avgCpc: toMoney(metrics.averageCpc),
              spent: toMoney(metrics.costMicros),
              conversions: parseFloat(metrics.conversions) || 0,
              costPerConversion: toMoney(metrics.costPerConversion),
              allConversions: parseFloat(metrics.allConversions) || 0,
            });
          }
        }
      }
    }

    const summary = {
      totalAdGroups: adGroups.length,
      activeAdGroups: adGroups.filter(g => g.status === 'enabled').length,
      totalSpent: adGroups.reduce((sum, g) => sum + g.spent, 0),
      totalClicks: adGroups.reduce((sum, g) => sum + g.clicks, 0),
      totalConversions: adGroups.reduce((sum, g) => sum + g.conversions, 0),
    };

    return res.status(200).json({ 
      adGroups,
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
