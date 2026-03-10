/**
 * Funkcje pomocnicze
 */

/**
 * Formatuj liczbę jako walutę (PLN)
 */
export function formatCurrency(value, decimals = 2) {
  if (value === null || value === undefined) return '—';
  return new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: 'PLN',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Formatuj liczbę z separatorami tysięcy
 */
export function formatNumber(value) {
  if (value === null || value === undefined) return '—';
  return new Intl.NumberFormat('pl-PL').format(value);
}

/**
 * Formatuj procent
 */
export function formatPercent(value, decimals = 2) {
  if (value === null || value === undefined) return '—';
  // Jeśli wartość jest już w formacie 0.0x, pomnóż przez 100
  const percent = value < 1 ? value * 100 : value;
  return `${percent.toFixed(decimals)}%`;
}

/**
 * Formatuj datę
 */
export function formatDate(dateString) {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('pl-PL', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Formatuj czas
 */
export function formatTime(date) {
  return new Date(date).toLocaleTimeString('pl-PL', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Skróć tekst do max długości
 */
export function truncate(text, maxLength = 50) {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * Oblicz zmianę procentową
 */
export function percentChange(current, previous) {
  if (!previous || previous === 0) return null;
  return ((current - previous) / previous) * 100;
}

/**
 * Klasyfikuj status kampanii
 */
export function getCampaignStatusInfo(status) {
  const statusMap = {
    enabled: { label: 'Aktywna', color: 'emerald', icon: '●' },
    active: { label: 'Aktywna', color: 'emerald', icon: '●' },
    paused: { label: 'Wstrzymana', color: 'amber', icon: '○' },
    removed: { label: 'Usunięta', color: 'red', icon: '✕' },
    unknown: { label: 'Nieznany', color: 'gray', icon: '?' },
  };
  return statusMap[status?.toLowerCase()] || statusMap.unknown;
}

/**
 * Klasyfikuj typ programu na podstawie nazwy kampanii
 */
export function getProgramType(campaignName) {
  const name = campaignName?.toLowerCase() || '';
  
  if (name.includes('junior') || name.includes('summer') || name.includes('winter') || name.includes('ski')) {
    return { type: 'junior', label: 'Junior', color: 'blue' };
  }
  if (name.includes('adult')) {
    return { type: 'adult', label: 'Adult', color: 'emerald' };
  }
  if (name.includes('tefl')) {
    return { type: 'tefl', label: 'TEFL', color: 'purple' };
  }
  if (name.includes('italy') || name.includes('italia')) {
    return { type: 'italy', label: 'Italy', color: 'green' };
  }
  if (name.includes('malta')) {
    return { type: 'malta', label: 'Malta', color: 'orange' };
  }
  if (name.includes('eurotrip')) {
    return { type: 'eurotrip', label: 'Eurotrip', color: 'indigo' };
  }
  
  return { type: 'other', label: 'Campaign', color: 'gray' };
}

/**
 * Generuj ID
 */
export function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

/**
 * Debounce function
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
