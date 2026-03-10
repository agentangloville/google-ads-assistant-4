// Vercel Serverless Function - Google OAuth2 Authorization
// Rozpoczyna flow autoryzacji z Google

export default async function handler(req, res) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  
  if (!clientId) {
    return res.status(500).json({ error: 'GOOGLE_CLIENT_ID not configured' });
  }

  // Scopes wymagane dla Google Ads API
  const scopes = [
    'https://www.googleapis.com/auth/adwords',
  ].join(' ');

  // Redirect URI - musi być dodane w Google Cloud Console
  const redirectUri = `${process.env.APP_URL || 'http://localhost:3000'}/api/auth/callback`;

  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', scopes);
  authUrl.searchParams.set('access_type', 'offline');
  authUrl.searchParams.set('prompt', 'consent');

  res.redirect(302, authUrl.toString());
}
