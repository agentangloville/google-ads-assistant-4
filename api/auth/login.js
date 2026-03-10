/**
 * Google OAuth2 Login Endpoint
 * Inicjuje flow autoryzacji Google
 */

export default async function handler(req, res) {
  const clientId = process.env.GOOGLE_CLIENT_ID;

  if (!clientId) {
    return res.status(500).json({ 
      error: 'Configuration error',
      message: 'GOOGLE_CLIENT_ID is not configured. Add it to Vercel Environment Variables.'
    });
  }

  // Scopes wymagane dla Google Ads API
  const scopes = [
    'https://www.googleapis.com/auth/adwords',           // Pełny dostęp do Google Ads
    'https://www.googleapis.com/auth/userinfo.email',    // Email użytkownika (opcjonalne)
  ].join(' ');

  // Redirect URI - automatycznie wykrywa środowisko
  const baseUrl = process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}` 
    : 'http://localhost:3000';
  const redirectUri = `${baseUrl}/api/auth/callback`;

  // Buduj URL autoryzacji Google
  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', scopes);
  authUrl.searchParams.set('access_type', 'offline');  // Wymagane dla refresh_token
  authUrl.searchParams.set('prompt', 'consent');       // Zawsze pytaj o zgodę (gwarantuje refresh_token)
  authUrl.searchParams.set('include_granted_scopes', 'true');

  // Przekieruj do Google
  res.redirect(302, authUrl.toString());
}
