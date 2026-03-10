/**
 * Auth Service
 * Zarządzanie autoryzacją Google OAuth
 */

export const AuthService = {
  /**
   * Rozpocznij flow logowania Google OAuth
   */
  login() {
    window.location.href = '/api/auth/login';
  },

  /**
   * Odśwież access token
   */
  async refreshToken(refreshToken) {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Token refresh failed');
    }

    return response.json();
  },

  /**
   * Parsuj tokeny z URL (po callbacku OAuth)
   */
  parseTokensFromUrl() {
    const params = new URLSearchParams(window.location.search);
    
    const tokens = {
      accessToken: params.get('access_token'),
      refreshToken: params.get('refresh_token'),
      expiresIn: params.get('expires_in'),
      error: params.get('error'),
      errorDescription: params.get('error_description'),
    };

    // Wyczyść URL
    if (tokens.accessToken || tokens.error) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    return tokens;
  },

  /**
   * Zapisz tokeny w sessionStorage
   */
  saveTokens(accessToken, refreshToken) {
    sessionStorage.setItem('gads_access_token', accessToken);
    if (refreshToken) {
      sessionStorage.setItem('gads_refresh_token', refreshToken);
    }
  },

  /**
   * Pobierz tokeny z sessionStorage
   */
  getTokens() {
    return {
      accessToken: sessionStorage.getItem('gads_access_token'),
      refreshToken: sessionStorage.getItem('gads_refresh_token'),
    };
  },

  /**
   * Wyczyść tokeny (logout)
   */
  clearTokens() {
    sessionStorage.removeItem('gads_access_token');
    sessionStorage.removeItem('gads_refresh_token');
  },
};
