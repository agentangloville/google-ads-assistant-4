# Angloville Ads Assistant

AI-powered Google Ads management assistant built with Claude AI and React.

![Screenshot](https://via.placeholder.com/800x450/f97316/ffffff?text=Angloville+Ads+Assistant)

## ✨ Features

- 🤖 **AI Chat** - Rozmawiaj z Claude AI o swoich kampaniach
- 📊 **Real-time Data** - Połączenie z Google Ads API
- 🎯 **Campaign Management** - Pauza, wznowienie, zmiana budżetu
- 📈 **Analytics** - Metryki: CTR, CPC, konwersje, wydatki
- 🔒 **Secure OAuth** - Bezpieczne logowanie przez Google

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone <repo-url>
cd angloville-ads-assistant
npm install
```

### 2. Configure Environment

Skopiuj `.env.example` do `.env.local` i wypełnij:

```bash
cp .env.example .env.local
```

```env
# Claude AI
ANTHROPIC_API_KEY=sk-ant-api03-xxxxx

# Google OAuth
GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxx

# Google Ads
GOOGLE_ADS_DEVELOPER_TOKEN=xxxxx
```

### 3. Google Cloud Setup

1. **Utwórz projekt** w [Google Cloud Console](https://console.cloud.google.com)

2. **Włącz API:**
   - Google Ads API

3. **Utwórz OAuth Credentials:**
   - APIs & Services → Credentials → Create Credentials → OAuth Client ID
   - Application type: **Web application**
   - Authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback` (dev)
     - `https://your-domain.vercel.app/api/auth/callback` (prod)

4. **Skonfiguruj OAuth Consent Screen:**
   - User Type: External
   - Scopes: `../auth/adwords`

### 4. Google Ads Developer Token

1. Zaloguj się do [Google Ads](https://ads.google.com)
2. Narzędzia i ustawienia → Centrum API
3. Skopiuj Developer Token

> ⚠️ Nowe tokeny mają status "Test Account" - działają tylko na kontach testowych. 
> Złóż wniosek o "Basic Access" dla produkcji.

### 5. Run Development Server

```bash
npm run dev
```

Otwórz http://localhost:3000

## 📦 Deploy to Vercel

1. Push do GitHub
2. Import w [Vercel](https://vercel.com)
3. Dodaj Environment Variables w Settings
4. Update redirect URI w Google Cloud

```
https://your-app.vercel.app/api/auth/callback
```

## 📁 Project Structure

```
angloville-ads-assistant/
├── api/                    # Vercel Serverless Functions
│   ├── auth/
│   │   ├── login.js       # OAuth login redirect
│   │   ├── callback.js    # OAuth callback handler
│   │   └── refresh.js     # Token refresh
│   ├── google-ads/
│   │   ├── accounts.js    # List accessible accounts
│   │   ├── campaigns.js   # Get campaigns with metrics
│   │   ├── keywords.js    # Get keywords
│   │   ├── ad-groups.js   # Get ad groups
│   │   └── update.js      # Pause/resume/update budget
│   └── chat.js            # Claude AI proxy
├── src/
│   ├── components/        # React components
│   ├── hooks/             # Custom hooks
│   ├── services/          # API services
│   ├── utils/             # Helpers & constants
│   └── App.jsx            # Main app component
└── ...config files
```

## 🔌 API Endpoints

### Auth
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/login` | GET | Redirect to Google OAuth |
| `/api/auth/callback` | GET | OAuth callback handler |
| `/api/auth/refresh` | POST | Refresh access token |

### Google Ads
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/google-ads/accounts` | POST | List accessible accounts |
| `/api/google-ads/campaigns` | POST | Get campaigns with metrics |
| `/api/google-ads/keywords` | POST | Get keywords by campaign |
| `/api/google-ads/ad-groups` | POST | Get ad groups |
| `/api/google-ads/update` | POST | Update campaign (pause/resume/budget) |

### Chat
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/chat` | POST | Send message to Claude AI |

## 🛠️ Tech Stack

- **Frontend:** React 18, Tailwind CSS, Lucide Icons
- **Backend:** Vercel Serverless Functions
- **AI:** Claude Sonnet 4 (Anthropic API)
- **APIs:** Google Ads API v17, Google OAuth 2.0

## 📝 License

MIT

---

Built with ❤️ for Angloville
