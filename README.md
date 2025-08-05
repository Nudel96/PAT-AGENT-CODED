# PriceActionTalk (PAT) - Trading Platform

A comprehensive SvelteKit trading platform with data-driven tools, education, and community features targeting retail traders aged 18-35 in emerging markets.

## 🚀 Features

### Core Trading Tools
- **Macro Bias Tool**: AI-driven bias scoring engine processing macroeconomic data
- **Heatman Widget**: Real-time market heatmap with multi-pillar currency strength visualization
- **Trading Journal**: Comprehensive trade logging with advanced analytics and psychology matrix
- **Risk Management**: Trade Blocker with automatic disabling and risk management tools

### Learning & Community
- **XP-Based Learning System**: Structured 1-3 year learning roadmap with interactive lessons
- **Community Hub**: Real-time trading challenges with leaderboards and WebSocket-powered chat
- **Forum**: Threaded discussion system with search, moderation, and voting features
- **Demo Trading**: Server-side paper trading system with realistic market simulation

### Technical Features
- **Real-time Data**: WebSocket connections for live data streaming
- **Responsive Design**: Dark/light theme support with mobile-first approach
- **Performance Optimized**: Bundle < 1.8MB gzipped, Lighthouse mobile score ≥ 90
- **Secure**: JWT authentication, rate limiting, CORS protection

## 🛠 Tech Stack

### Frontend
- **SvelteKit** with TypeScript
- **Tailwind CSS** for styling
- **WebSocket** for real-time features

### Backend
- **Node.js/Express** with TypeScript
- **PostgreSQL** database (structured for easy SurrealDB migration)
- **JWT** authentication
- **Stripe** payment integration
- **WebSocket** server for real-time communication

### Development
- **Jest** for unit testing
- **Playwright** for e2e testing
- **ESLint** and **Prettier** for code quality

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- PostgreSQL 14+
- npm or yarn

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd PAT-AGENT-CODED
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Database setup**
   ```bash
   # Create PostgreSQL database
   createdb priceactiontalk
   
   # Run schema
   psql -d priceactiontalk -f server/database/schema.sql
   ```

5. **Start development servers**
   ```bash
   # Terminal 1: Frontend
   npm run dev
   
   # Terminal 2: Backend API
   npm run server:dev
   ```

## 🔧 Development

### Available Scripts

```bash
# Frontend
npm run dev          # Start SvelteKit dev server
npm run build        # Build for production
npm run preview      # Preview production build

# Backend
npm run server:dev   # Start backend with nodemon
npm run server:build # Build backend TypeScript
npm run server:start # Start production backend

# Testing
npm run test         # Run Jest unit tests
npm run test:e2e     # Run Playwright e2e tests
npm run test:watch   # Run tests in watch mode

# Code Quality
npm run lint         # Run ESLint
npm run format       # Run Prettier
npm run check        # Run Svelte type checking
```

### Project Structure

```
├── src/                    # Frontend SvelteKit application
│   ├── lib/
│   │   ├── components/     # Reusable Svelte components
│   │   ├── stores/         # Svelte stores for state management
│   │   ├── types/          # TypeScript type definitions
│   │   └── utils/          # Utility functions
│   ├── routes/             # SvelteKit routes and pages
│   └── app.html           # HTML template
├── server/                 # Backend Express application
│   ├── database/           # Database connection and schema
│   ├── middleware/         # Express middleware
│   ├── routes/             # API route handlers
│   ├── websocket/          # WebSocket server setup
│   └── index.ts           # Server entry point
├── static/                 # Static assets
└── tests/                  # Test files
```

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Trading
- `GET /api/trading` - Get user trades
- `POST /api/trading` - Create new trade
- `PUT /api/trading/:id` - Update trade
- `DELETE /api/trading/:id` - Delete trade
- `GET /api/trading/analytics/summary` - Get trading analytics

### Macro Data
- `GET /api/macro/bias` - Get current macro bias data
- `GET /api/macro/bias/history` - Get historical macro data

### Learning
- `GET /api/learning/paths` - Get learning paths
- `GET /api/learning/paths/:id/modules` - Get modules for path
- `POST /api/learning/modules/:id/progress` - Update progress

### Community
- `GET /api/community/challenges` - Get active challenges
- `POST /api/community/challenges/:id/join` - Join challenge
- `GET /api/community/chat/:room` - Get chat messages
- `POST /api/community/chat/:room` - Send chat message

### Forum
- `GET /api/forum/posts` - Get forum posts
- `POST /api/forum/posts` - Create new post
- `GET /api/forum/posts/:id` - Get post with replies
- `POST /api/forum/posts/:id/replies` - Create reply

### Payments
- `POST /api/stripe/create-checkout-session` - Create Stripe checkout
- `GET /api/stripe/subscription` - Get subscription status
- `POST /api/stripe/cancel-subscription` - Cancel subscription

## 🔌 WebSocket Events

### Client to Server
- `auth` - Authenticate WebSocket connection
- `join_room` - Join a room for updates
- `leave_room` - Leave a room
- `chat_message` - Send chat message
- `subscribe_prices` - Subscribe to price updates
- `subscribe_macro` - Subscribe to macro updates

### Server to Client
- `welcome` - Connection established
- `auth_success` - Authentication successful
- `chat_message` - New chat message
- `price_update` - Real-time price update
- `macro_update` - Macro bias update
- `user_joined` - User joined room
- `user_left` - User left room

## 🎨 Design System

### Color Palette
- **Primary**: #1b9aaa (Light Blue)
- **Secondary**: #0d1b2a (Dark Blue)
- **Accent**: #7cfc00 (Green)
- **Background**: #ffffff (Light) / #0d1b2a (Dark)
- **Surface**: #f8f9fa (Light) / #1e2a3a (Dark)

### Components
- Rounded-XL cards with soft shadows
- ≥12px gutters between elements
- Responsive design with mobile graceful degradation
- WCAG AA compliance (4.5:1 contrast ratio minimum)

## 🔒 Security

- JWT authentication with refresh tokens
- Rate limiting on API endpoints
- Password hashing with argon2id
- CORS, CSRF, and helmet protection
- Input validation with Zod schemas
- Stripe webhook signature verification

## 📊 Performance Targets

- Bundle size < 1.8MB gzipped
- Lighthouse mobile score ≥ 90
- Real-time data updates < 300ms for price ticks
- 3-second response for macro data updates
- Efficient caching strategy for static resources

## 🚀 Deployment

### Production Build
```bash
npm run build
npm run server:build
```

### Environment Variables
See `.env.example` for required environment variables.

### Database Migration
The database schema is designed for easy migration to SurrealDB in the future.

## 📝 License

This project is proprietary software. All rights reserved.

## 🤝 Contributing

This is a private project. Please contact the development team for contribution guidelines.

## 📞 Support

For support, please contact the development team or create an issue in the project repository.

---

**PriceActionTalk** - The Future of Trading is Here 🚀
