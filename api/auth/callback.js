/**
 * Google OAuth2 Callback Endpoint
 * Wymienia authorization code na access token i refresh token
 */

export default async function handler(req, res) {
  const { code, error, error_description } = req.query;

  // Obsługa błędów z Google
  if (error) {
    console.error('OAuth error from Google:', error, error_description);
    return res.redirect(`/?error=${encodeURIComponent(error)}&error_description=${encodeURIComponent(error_description || '')}`);
  }

  if (!code) {
    return res.redirect('/?error=no_authorization_code');
  }

  // Pobierz credentials
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error('Missing OAuth credentials');
    return res.redirect('/?error=server_misconfigured');
  }

  // Redirect URI musi być identyczny jak w login.js
  const baseUrl = process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}` 
    : 'http://localhost:3000';
  const redirectUri = `${baseUrl}/api/auth/callback`;

  try {
    // Wymień authorization code na tokeny
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      }),
    });

    const tokens = await tokenResponse.json();

    // Sprawdź błędy
    if (tokens.error) {
      console.error('Token exchange error:', tokens);
      return res.redirect(`/?error=${encodeURIComponent(tokens.error)}&error_description=${encodeURIComponent(tokens.error_description || '')}`);
    }

    // Sukces - przekieruj z tokenami
    // UWAGA: W produkcji lepiej użyć httpOnly cookies lub session storage po stronie serwera
    const params = new URLSearchParams({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token || '',
      expires_in: tokens.expires_in.toString(),
      token_type: tokens.token_type,
    });

    res.redirect(`/?${params.toString()}`);

  } catch (error) {
    console.error('Token exchange failed:', error);
    res.redirect('/?error=token_exchange_failed');
  }
}
