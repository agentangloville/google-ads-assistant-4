/**
 * Google Ads Service
 * Komunikacja z Google Ads API przez nasze endpointy
 */

export const GoogleAdsService = {
  /**
   * Pobierz listę dostępnych kont
   */
  async getAccounts(accessToken) {
    const response = await fetch('/api/google-ads/accounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accessToken }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new GoogleAdsError(data.error, response.status, data.needsRefresh);
    }

    return data;
  },

  /**
   * Pobierz kampanie z metrykami
   */
  async getCampaigns(accessToken, customerId, dateRange = 'LAST_30_DAYS') {
    const response = await fetch('/api/google-ads/campaigns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accessToken, customerId, dateRange }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new GoogleAdsError(data.error, response.status, data.needsRefresh);
    }

    return data;
  },

  /**
   * Pobierz słowa kluczowe
   */
  async getKeywords(accessToken, customerId, campaignId = null, dateRange = 'LAST_30_DAYS') {
    const response = await fetch('/api/google-ads/keywords', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accessToken, customerId, campaignId, dateRange }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new GoogleAdsError(data.error, response.status, data.needsRefresh);
    }

    return data;
  },

  /**
   * Pobierz grupy reklam
   */
  async getAdGroups(accessToken, customerId, campaignId = null, dateRange = 'LAST_30_DAYS') {
    const response = await fetch('/api/google-ads/ad-groups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accessToken, customerId, campaignId, dateRange }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new GoogleAdsError(data.error, response.status, data.needsRefresh);
    }

    return data;
  },

  /**
   * Wstrzymaj kampanię
   */
  async pauseCampaign(accessToken, customerId, campaignId) {
    return this.updateCampaign(accessToken, customerId, campaignId, 'pause');
  },

  /**
   * Wznów kampanię
   */
  async resumeCampaign(accessToken, customerId, campaignId) {
    return this.updateCampaign(accessToken, customerId, campaignId, 'resume');
  },

  /**
   * Zmień budżet kampanii
   */
  async updateBudget(accessToken, customerId, campaignId, newBudget) {
    return this.updateCampaign(accessToken, customerId, campaignId, 'updateBudget', { newBudget });
  },

  /**
   * Generyczna aktualizacja kampanii
   */
  async updateCampaign(accessToken, customerId, campaignId, action, params = {}) {
    const response = await fetch('/api/google-ads/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        accessToken, 
        customerId, 
        campaignId, 
        action,
        ...params 
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new GoogleAdsError(data.error, response.status, data.needsRefresh);
    }

    return data;
  },
};

/**
 * Custom error dla Google Ads API
 */
export class GoogleAdsError extends Error {
  constructor(message, status, needsRefresh = false) {
    super(message);
    this.name = 'GoogleAdsError';
    this.status = status;
    this.needsRefresh = needsRefresh;
  }
}
