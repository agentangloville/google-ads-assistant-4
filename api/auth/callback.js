// Vercel Serverless Function - Google OAuth2 Callback
// Wymienia authorization code na access token

export default async function handler(req, res) {
  const { code, error } = req.query;

  if (error) {
    return res.redirect('/?error=' + encodeURIComponent(error));
  }

  if (!code) {
    return res.redirect('/?error=no_code');
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = `${process.env.APP_URL || 'http://localhost:3000'}/api/auth/callback`;

  if (!clientId || !clientSecret) {
    return res.redirect('/?error=missing_credentials');
  }

  try {
    // Wymień code na token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      }),
    });

    const tokens = await tokenResponse.json();

    if (tokens.error) {
      console.error('Token error:', tokens);
      return res.redirect('/?error=' + encodeURIComponent(tokens.error));
    }

    // Przekaż tokeny do frontendu przez URL (w produkcji lepiej użyć httpOnly cookies)
    // Dla bezpieczeństwa - tokeny są krótkotrwałe i można je odświeżyć
    const params = new URLSearchParams({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token || '',
      expires_in: tokens.expires_in,
    });

    res.redirect('/?' + params.toString());

  } catch (error) {
    console.error('OAuth callback error:', error);
    res.redirect('/?error=token_exchange_failed');
  }
}
