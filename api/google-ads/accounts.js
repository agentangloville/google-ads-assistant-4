/**
 * Google Ads Accounts Endpoint
 * Pobiera listę dostępnych kont Google Ads
 */

const GOOGLE_ADS_API_VERSION = 'v17';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { accessToken } = req.body;
  const developerToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;
  const loginCustomerId = process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID;

  // Walidacja
  if (!accessToken) {
    return res.status(401).json({ error: 'access_token is required' });
  }

  if (!developerToken) {
    return res.status(500).json({ 
      error: 'GOOGLE_ADS_DEVELOPER_TOKEN is not configured',
      hint: 'Add your Developer Token from Google Ads API Center to Vercel Environment Variables'
    });
  }

  try {
    // Przygotuj headers
    const headers = {
      'Authorization': `Bearer ${accessToken}`,
      'developer-token': developerToken,
      'Content-Type': 'application/json',
    };

    // Jeśli używamy konta menedżera (MCC), dodaj login-customer-id
    if (loginCustomerId) {
      headers['login-customer-id'] = loginCustomerId.replace(/-/g, '');
    }

    // Pobierz listę dostępnych kont
    const response = await fetch(
      `https://googleads.googleapis.com/${GOOGLE_ADS_API_VERSION}/customers:listAccessibleCustomers`,
      {
        method: 'GET',
        headers,
      }
    );

    // Obsługa błędów HTTP
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Google Ads API error:', response.status, errorData);

      if (response.status === 401) {
        return res.status(401).json({ 
          error: 'Token expired or invalid',
          needsRefresh: true 
        });
      }

      return res.status(response.status).json({ 
        error: 'Failed to fetch accounts',
        details: errorData.error?.message || 'Unknown error'
      });
    }

    const data = await response.json();

    // Przekształć resourceNames na czytelne ID
    // Format: customers/1234567890 → { id: '1234567890', formatted: '123-456-7890' }
    const customers = (data.resourceNames || []).map(resourceName => {
      const id = resourceName.replace('customers/', '');
      return {
        id,
        resourceName,
        formatted: id.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3'),
      };
    });

    // Dla każdego konta pobierz szczegóły (nazwa, status)
    const customersWithDetails = await Promise.all(
      customers.slice(0, 10).map(async (customer) => {
        try {
          const detailResponse = await fetch(
            `https://googleads.googleapis.com/${GOOGLE_ADS_API_VERSION}/customers/${customer.id}`,
            { method: 'GET', headers }
          );

          if (detailResponse.ok) {
            const details = await detailResponse.json();
            return {
              ...customer,
              name: details.descriptiveName || `Konto ${customer.formatted}`,
              currencyCode: details.currencyCode,
              timeZone: details.timeZone,
              manager: details.manager || false,
            };
          }
        } catch (e) {
          console.warn(`Failed to fetch details for ${customer.id}:`, e.message);
        }
        return customer;
      })
    );

    return res.status(200).json({ 
      customers: customersWithDetails,
      total: customers.length
    });

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}
