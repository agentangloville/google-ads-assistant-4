/**
 * Google Ads Keywords Endpoint
 * Pobiera słowa kluczowe z metrykami
 */

const GOOGLE_ADS_API_VERSION = 'v17';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { 
    accessToken, 
    customerId, 
    campaignId = null,  // opcjonalnie filtruj po kampanii
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

    // Buduj filtr kampanii jeśli podano
    const campaignFilter = campaignId 
      ? `AND campaign.id = ${campaignId}` 
      : '';

    const query = `
      SELECT
        ad_group.id,
        ad_group.name,
        ad_group.status,
        ad_group_criterion.criterion_id,
        ad_group_criterion.keyword.text,
        ad_group_criterion.keyword.match_type,
        ad_group_criterion.status,
        ad_group_criterion.quality_info.quality_score,
        campaign.id,
        campaign.name,
        metrics.clicks,
        metrics.impressions,
        metrics.ctr,
        metrics.average_cpc,
        metrics.cost_micros,
        metrics.conversions,
        metrics.cost_per_conversion
      FROM keyword_view
      WHERE 
        ad_group_criterion.status != 'REMOVED'
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
    const keywords = [];

    if (data && Array.isArray(data)) {
      for (const batch of data) {
        if (batch.results) {
          for (const result of batch.results) {
            const criterion = result.adGroupCriterion || {};
            const metrics = result.metrics || {};
            const campaign = result.campaign || {};
            const adGroup = result.adGroup || {};

            const toMoney = (micros) => micros ? parseInt(micros) / 1_000_000 : 0;

            if (criterion.keyword) {
              keywords.push({
                id: criterion.criterionId,
                keyword: criterion.keyword.text,
                matchType: criterion.keyword.matchType,
                status: (criterion.status || 'UNKNOWN').toLowerCase(),
                qualityScore: criterion.qualityInfo?.qualityScore || null,
                
                adGroupId: adGroup.id,
                adGroupName: adGroup.name,
                adGroupStatus: (adGroup.status || 'UNKNOWN').toLowerCase(),
                
                campaignId: campaign.id,
                campaignName: campaign.name,

                // Metryki
                clicks: parseInt(metrics.clicks) || 0,
                impressions: parseInt(metrics.impressions) || 0,
                ctr: parseFloat(metrics.ctr) || 0,
                avgCpc: toMoney(metrics.averageCpc),
                spent: toMoney(metrics.costMicros),
                conversions: parseFloat(metrics.conversions) || 0,
                costPerConversion: toMoney(metrics.costPerConversion),
              });
            }
          }
        }
      }
    }

    // Podsumowanie
    const summary = {
      totalKeywords: keywords.length,
      activeKeywords: keywords.filter(k => k.status === 'enabled').length,
      totalSpent: keywords.reduce((sum, k) => sum + k.spent, 0),
      totalClicks: keywords.reduce((sum, k) => sum + k.clicks, 0),
      avgQualityScore: keywords.filter(k => k.qualityScore).length > 0
        ? keywords.filter(k => k.qualityScore).reduce((sum, k) => sum + k.qualityScore, 0) / keywords.filter(k => k.qualityScore).length
        : null,
    };

    return res.status(200).json({ 
      keywords,
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
