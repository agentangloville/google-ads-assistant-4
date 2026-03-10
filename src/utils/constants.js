/**
 * Stałe aplikacji
 */

// Kontekst Angloville dla AI
export const ANGLOVILLE_CONTEXT = `
## O ANGLOVILLE
Angloville organizuje programy wymiany kulturalnej w Europie. Łączy native speakerów angielskiego z lokalnymi uczniami w immersyjnych programach językowych.

### PROGRAMY
**Junior (13-17 lat):**
- Poland Summer/Winter - główny program, największy budżet
- Italy Programme - premium, wyższe CPA
- Malta Programme - letni, konkurencyjny rynek
- Eurotrip - multi-country experience
- UK Trip - odwiedziny UK z native speakerami
- SKI Winter - zimowy program narciarski

**Adult (18+):**
- Poland Adult - dla dorosłych uczących się angielskiego

**TEFL:**
- Certyfikat TEFL + placements w Azji (Tajlandia, Korea, Japonia, Wietnam)
- Grupa docelowa: osoby chcące uczyć angielskiego za granicą

### GRUPY DOCELOWE

**1. International Participants (Native Speakers)**
- Kraje: UK, USA, Australia, Kanada, Irlandia
- Wiek: 18-35 lat
- Motywacje: darmowe podróże, wolontariat, gap year, doświadczenie międzynarodowe
- Keywords: "free travel Europe", "volunteer abroad", "gap year programs", "teach English abroad"

**2. Local Participants (Polacy)**
- Dzieci i młodzież ucząca się angielskiego
- Rodzice szukający programów językowych
- Keywords: "obozy językowe", "angielski z native speakerem", "wakacje z angielskim"

### METRYKI I CELE
- **CPA target:** 15-25 PLN za aplikację
- **Główna konwersja:** kliknięcie "Apply Now" / wypełnienie formularza
- **Sezonowość:** 
  - Peak: Styczeń-Kwiecień (summer bookings)
  - Low: Lipiec-Sierpień (programy trwają)
  - Early bird: Wrzesień-Listopad

### KONKURENCJA
- EF Education
- AIESEC
- Workaway
- WWOOF
- Camp America
`;

// Przykładowe kampanie (tryb demo)
export const DEMO_CAMPAIGNS = [
  { 
    id: '1', 
    name: 'Summer Poland Junior 2026', 
    status: 'enabled', 
    budget: 500, 
    spent: 347.20, 
    clicks: 4521, 
    impressions: 125430, 
    ctr: 0.036,
    conversions: 89, 
    costPerConversion: 3.90,
    channelType: 'SEARCH',
  },
  { 
    id: '2', 
    name: 'Italy Programme - UK', 
    status: 'enabled', 
    budget: 400, 
    spent: 289.50, 
    clicks: 3102, 
    impressions: 89450, 
    ctr: 0.0347,
    conversions: 67, 
    costPerConversion: 4.32,
    channelType: 'SEARCH',
  },
  { 
    id: '3', 
    name: 'TEFL Asia - Remarketing', 
    status: 'paused', 
    budget: 150, 
    spent: 0, 
    clicks: 0, 
    impressions: 0, 
    ctr: 0,
    conversions: 0, 
    costPerConversion: 0,
    channelType: 'DISPLAY',
  },
  { 
    id: '4', 
    name: 'Adult Programmes Poland', 
    status: 'enabled', 
    budget: 300, 
    spent: 198.80, 
    clicks: 2890, 
    impressions: 67800, 
    ctr: 0.0426,
    conversions: 54, 
    costPerConversion: 3.68,
    channelType: 'SEARCH',
  },
  { 
    id: '5', 
    name: 'Malta Summer - USA', 
    status: 'enabled', 
    budget: 350, 
    spent: 245.60, 
    clicks: 1890, 
    impressions: 52300, 
    ctr: 0.0361,
    conversions: 42, 
    costPerConversion: 5.85,
    channelType: 'SEARCH',
  },
];

// Sugerowane akcje
export const SUGGESTED_ACTIONS = [
  { 
    type: 'optimization', 
    text: 'Summer Poland ma wysoki CTR - zwiększ budżet', 
    impact: '+35% aplikacji',
    priority: 'high'
  },
  { 
    type: 'warning', 
    text: 'TEFL Asia remarketing wstrzymany', 
    impact: '~40 leadów/tydzień',
    priority: 'medium'
  },
  { 
    type: 'insight', 
    text: 'USA audience konwertuje lepiej na Malta', 
    impact: 'Przenieś 20% budżetu',
    priority: 'medium'
  },
  { 
    type: 'seasonal', 
    text: 'Sezon early bird - kampanie jesienne', 
    impact: 'Niższy CPA o 25%',
    priority: 'high'
  },
];

// Date range options
export const DATE_RANGES = [
  { value: 'TODAY', label: 'Dziś' },
  { value: 'YESTERDAY', label: 'Wczoraj' },
  { value: 'LAST_7_DAYS', label: 'Ostatnie 7 dni' },
  { value: 'LAST_14_DAYS', label: 'Ostatnie 14 dni' },
  { value: 'LAST_30_DAYS', label: 'Ostatnie 30 dni' },
  { value: 'THIS_MONTH', label: 'Ten miesiąc' },
  { value: 'LAST_MONTH', label: 'Poprzedni miesiąc' },
];
