import { useState, useCallback } from 'react';
import { GoogleAdsService, GoogleAdsError } from '../services/googleAds';
import { DEMO_CAMPAIGNS } from '../utils/constants';

/**
 * Hook do zarządzania danymi Google Ads
 */
export function useGoogleAds(accessToken, onTokenExpired) {
  // Konta
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  
  // Kampanie
  const [campaigns, setCampaigns] = useState(DEMO_CAMPAIGNS);
  const [keywords, setKeywords] = useState([]);
  const [adGroups, setAdGroups] = useState([]);
  
  // Stan
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);
  const [isLoadingCampaigns, setIsLoadingCampaigns] = useState(false);
  const [isLoadingKeywords, setIsLoadingKeywords] = useState(false);
  const [isLoadingAdGroups, setIsLoadingAdGroups] = useState(false);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState('LAST_30_DAYS');

  // Obsługa błędów
  const handleError = useCallback((err) => {
    if (err instanceof GoogleAdsError && err.needsRefresh) {
      onTokenExpired?.();
    } else {
      setError(err.message);
    }
  }, [onTokenExpired]);

  // Pobierz konta
  const fetchAccounts = useCallback(async () => {
    if (!accessToken) return;
    
    setIsLoadingAccounts(true);
    setError(null);
    
    try {
      const data = await GoogleAdsService.getAccounts(accessToken);
      setAccounts(data.customers || []);
      return data.customers;
    } catch (err) {
      handleError(err);
      return [];
    } finally {
      setIsLoadingAccounts(false);
    }
  }, [accessToken, handleError]);

  // Wybierz konto
  const selectAccount = useCallback((account) => {
    setSelectedAccount(account);
    // Reset danych przy zmianie konta
    setCampaigns([]);
    setKeywords([]);
    setAdGroups([]);
  }, []);

  // Pobierz kampanie
  const fetchCampaigns = useCallback(async (customerId = selectedAccount?.id) => {
    if (!accessToken || !customerId) return;
    
    setIsLoadingCampaigns(true);
    setError(null);
    
    try {
      const data = await GoogleAdsService.getCampaigns(accessToken, customerId, dateRange);
      setCampaigns(data.campaigns || []);
      return data;
    } catch (err) {
      handleError(err);
      return null;
    } finally {
      setIsLoadingCampaigns(false);
    }
  }, [accessToken, selectedAccount?.id, dateRange, handleError]);

  // Pobierz słowa kluczowe
  const fetchKeywords = useCallback(async (campaignId = null) => {
    if (!accessToken || !selectedAccount?.id) return;
    
    setIsLoadingKeywords(true);
    setError(null);
    
    try {
      const data = await GoogleAdsService.getKeywords(
        accessToken, 
        selectedAccount.id, 
        campaignId, 
        dateRange
      );
      setKeywords(data.keywords || []);
      return data;
    } catch (err) {
      handleError(err);
      return null;
    } finally {
      setIsLoadingKeywords(false);
    }
  }, [accessToken, selectedAccount?.id, dateRange, handleError]);

  // Pobierz grupy reklam
  const fetchAdGroups = useCallback(async (campaignId = null) => {
    if (!accessToken || !selectedAccount?.id) return;
    
    setIsLoadingAdGroups(true);
    setError(null);
    
    try {
      const data = await GoogleAdsService.getAdGroups(
        accessToken, 
        selectedAccount.id, 
        campaignId, 
        dateRange
      );
      setAdGroups(data.adGroups || []);
      return data;
    } catch (err) {
      handleError(err);
      return null;
    } finally {
      setIsLoadingAdGroups(false);
    }
  }, [accessToken, selectedAccount?.id, dateRange, handleError]);

  // Akcje na kampaniach
  const pauseCampaign = useCallback(async (campaignId) => {
    if (!accessToken || !selectedAccount?.id) return;
    
    try {
      const result = await GoogleAdsService.pauseCampaign(
        accessToken, 
        selectedAccount.id, 
        campaignId
      );
      // Odśwież kampanie po akcji
      await fetchCampaigns();
      return result;
    } catch (err) {
      handleError(err);
      return null;
    }
  }, [accessToken, selectedAccount?.id, fetchCampaigns, handleError]);

  const resumeCampaign = useCallback(async (campaignId) => {
    if (!accessToken || !selectedAccount?.id) return;
    
    try {
      const result = await GoogleAdsService.resumeCampaign(
        accessToken, 
        selectedAccount.id, 
        campaignId
      );
      await fetchCampaigns();
      return result;
    } catch (err) {
      handleError(err);
      return null;
    }
  }, [accessToken, selectedAccount?.id, fetchCampaigns, handleError]);

  const updateBudget = useCallback(async (campaignId, newBudget) => {
    if (!accessToken || !selectedAccount?.id) return;
    
    try {
      const result = await GoogleAdsService.updateBudget(
        accessToken, 
        selectedAccount.id, 
        campaignId, 
        newBudget
      );
      await fetchCampaigns();
      return result;
    } catch (err) {
      handleError(err);
      return null;
    }
  }, [accessToken, selectedAccount?.id, fetchCampaigns, handleError]);

  // Reset do demo
  const resetToDemo = useCallback(() => {
    setSelectedAccount(null);
    setAccounts([]);
    setCampaigns(DEMO_CAMPAIGNS);
    setKeywords([]);
    setAdGroups([]);
    setError(null);
  }, []);

  return {
    // Konta
    accounts,
    selectedAccount,
    fetchAccounts,
    selectAccount,
    
    // Dane
    campaigns,
    keywords,
    adGroups,
    dateRange,
    setDateRange,
    
    // Pobieranie
    fetchCampaigns,
    fetchKeywords,
    fetchAdGroups,
    
    // Akcje
    pauseCampaign,
    resumeCampaign,
    updateBudget,
    
    // Stan
    isLoadingAccounts,
    isLoadingCampaigns,
    isLoadingKeywords,
    isLoadingAdGroups,
    error,
    
    // Reset
    resetToDemo,
  };
}
