# StratAxis Frontend

Professional real estate intelligence platform for Cameroon.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
copy .env.example .env

# Start development server
npm run dev
```

The application will be available at `http://localhost:3000`

## 📁 Project Structure

```
src/
├── components/       # Reusable UI components
│   ├── auth/        # Authentication components
│   └── common/      # Common components (Header, Footer, etc.)
├── contexts/        # React contexts (Auth, Theme, etc.)
├── layouts/         # Page layouts
├── pages/           # Page components
├── services/        # API services
├── types/           # TypeScript type definitions
├── utils/           # Utility functions
│   ├── constants.ts # Application constants
│   ├── formatters.ts # Formatting utilities
│   └── validators.ts # Validation utilities
├── data/            # Static data files
├── App.tsx          # Main app component
├── main.tsx         # Entry point
└── index.css        # Global styles
```

## 🎨 Design System

StratAxis uses a minimal, data-first design philosophy:

- **Colors**: Black, White, Cream, Grey, Gold accents
- **Typography**: Inter (sans-serif), JetBrains Mono (monospace)
- **Dark Mode**: Fully supported
- **Components**: TailwindCSS utility classes with custom components

## 🔑 Key Features

### Public Pages
- Home (bilingual EN/FR)
- Blog / Market Insights
- Methodology
- Pricing
- Book Consultation
- Login / Register

### Authenticated Pages
- Dashboard (Intelligence Overview)
- Interactive Quarter Maps
- Land Price Intelligence
- Rent Price Intelligence
- Time Series & Trend Analysis
- Smart Insights
- Data Quality & Confidence
- Watchlists
- Comparison Tool
- Scenario & Yield Estimation
- Alerts & Notifications
- Export & Reporting

### Admin Panel
- User Management
- Data Health Monitoring
- Scraper Status
- Manual Overrides

## 🛠️ Development

### Available Scripts

```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

### Environment Variables

See `.env.example` for required environment variables.

## 📦 Tech Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Maps**: Leaflet + React Leaflet
- **Charts**: Recharts
- **Icons**: Lucide React
- **State Management**: React Context API

## 🌍 Internationalization

The application supports English and French:
- UI labels and messages
- Number and currency formatting (XAF)
- Date formatting

## 🔐 Authentication

- JWT-based authentication
- Role-based access control (FREE_USER, PAID_USER, ADMIN)
- Protected routes
- Automatic token refresh

## 📊 Data Sources

The frontend integrates with:
- Land price intelligence data (31 neighborhoods)
- Rental intelligence data (Douala & Yaoundé)
- Real-time analytics from backend API

## 🚧 Development Status

### Phase 1: Core Infrastructure ✅ COMPLETE
- Auth Context & Protected Routes
- API service layer
- Data utility functions
- Common components (Header, Footer, Navigation, Loading)

### Phase 2: Public Pages (In Progress)
- Home page (5 sections, bilingual)
- Login/Register
- Methodology, Pricing, Blog
- Book Consultation

### Phase 3: Dashboard & Intelligence (Planned)
- Dashboard with market snapshot
- Interactive Maps with heatmaps
- Land & Rent Intelligence panels
- Time Series Analysis

### Phase 4: Decision Tools (Planned)
- Smart Insights
- Data Quality & Confidence
- Watchlists, Comparison, Scenario tools
- Alerts & Export

### Phase 5: Admin Panel (Planned)
- User management
- Data health monitoring
- System administration

## 📝 License

Proprietary - StratAxis © 2026

## 👥 Contact

- Email: contact@strataxis.cm
- Location: Douala & Yaoundé, Cameroon
