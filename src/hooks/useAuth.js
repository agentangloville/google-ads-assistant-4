import { useState, useEffect, useCallback } from 'react';
import { AuthService } from '../services/auth';

/**
 * Hook do zarządzania autoryzacją Google
 */
export function useAuth() {
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sprawdź tokeny przy starcie
  useEffect(() => {
    const init = async () => {
      try {
        // Sprawdź URL po OAuth callback
        const urlTokens = AuthService.parseTokensFromUrl();
        
        if (urlTokens.error) {
          setError(urlTokens.errorDescription || urlTokens.error);
          setIsLoading(false);
          return;
        }

        if (urlTokens.accessToken) {
          // Nowe tokeny z OAuth
          setAccessToken(urlTokens.accessToken);
          setRefreshToken(urlTokens.refreshToken);
          setIsConnected(true);
          AuthService.saveTokens(urlTokens.accessToken, urlTokens.refreshToken);
        } else {
          // Sprawdź zapisane tokeny
          const savedTokens = AuthService.getTokens();
          if (savedTokens.accessToken) {
            setAccessToken(savedTokens.accessToken);
            setRefreshToken(savedTokens.refreshToken);
            setIsConnected(true);
          }
        }
      } catch (err) {
        console.error('Auth init error:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, []);

  // Login
  const login = useCallback(() => {
    AuthService.login();
  }, []);

  // Logout
  const logout = useCallback(() => {
    AuthService.clearTokens();
    setAccessToken(null);
    setRefreshToken(null);
    setIsConnected(false);
    setError(null);
  }, []);

  // Refresh token
  const refresh = useCallback(async () => {
    if (!refreshToken) {
      logout();
      return null;
    }

    try {
      const result = await AuthService.refreshToken(refreshToken);
      setAccessToken(result.accessToken);
      AuthService.saveTokens(result.accessToken, refreshToken);
      return result.accessToken;
    } catch (err) {
      console.error('Token refresh failed:', err);
      logout();
      return null;
    }
  }, [refreshToken, logout]);

  return {
    accessToken,
    refreshToken,
    isConnected,
    isLoading,
    error,
    login,
    logout,
    refresh,
  };
}
