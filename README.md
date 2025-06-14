# LogYourBody

A modern body composition tracking application built with React and TypeScript. Track your fitness journey with detailed metrics, visual progress charts, and subscription-based premium features.

![LogYourBody Screenshot](https://via.placeholder.com/800x400/000000/FFFFFF?text=LogYourBody+Dashboard)

## 🚀 Features

### Core Functionality

- **Body Composition Tracking**: Log weight, body fat percentage, muscle mass, and more
- **Visual Progress Charts**: Interactive charts powered by Recharts
- **Timeline View**: Navigate through your fitness journey with an intuitive timeline
- **Data Export**: Export your data in multiple formats
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices

### Premium Features (Subscription)

- **Advanced Analytics**: Detailed insights and trends analysis
- **Unlimited Data Storage**: Store years of fitness data
- **Premium Charts**: Advanced visualization options
- **Priority Support**: Direct access to customer support

### Technical Features

- **PWA Support**: Install as a native app on any device
- **Offline Capability**: Continue tracking even without internet
- **Real-time Sync**: Automatic data synchronization across devices
- **Secure Authentication**: Powered by Supabase Auth
- **WCAG AA Compliance**: Fully accessible design

## 🛠️ Tech Stack

### Frontend

- **React 18** - Modern React with hooks and concurrent features
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and development server
- **TailwindCSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Recharts** - Beautiful, composable charts
- **React Router** - Client-side routing

### Backend & Services

- **Supabase** - Backend-as-a-Service (Database, Auth, Storage)
- **RevenueCat** - Subscription management and payments
- **Stripe** - Payment processing
- **PostgreSQL** - Relational database

### Development Tools

- **Vitest** - Unit testing framework
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Supabase CLI** - Database management
- **Stripe CLI** - Payment testing

## 📦 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git
- Supabase account
- Stripe account (for payments)
- RevenueCat account (for subscription management)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/itstimwhite/LogYourBody.git
   cd LogYourBody
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**

   ```bash
   cp .env.example .env
   ```

   Fill in your environment variables:

   ```env
   # Supabase Configuration
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

   # RevenueCat Configuration
   VITE_REVENUECAT_IOS_KEY=your_ios_public_key
   VITE_REVENUECAT_WEB_KEY=your_web_public_key
   # Legacy (optional)
   VITE_REVENUECAT_PUBLIC_KEY=your_revenuecat_public_key

   # Stripe Product IDs (for RevenueCat configuration)
   STRIPE_MONTHLY_PRICE_ID=price_1RY9Y2RCO021kiwC8ltF2cFA
   STRIPE_ANNUAL_PRICE_ID=price_1RY9YJRCO021kiwCBzaxnVEU
   STRIPE_MONTHLY_PRODUCT_ID=prod_ST5iisIAa5WOlT
   STRIPE_ANNUAL_PRODUCT_ID=prod_ST5jCsCdmToZ1d
   ```

4. **Database Setup**

   ```bash
   # Start Supabase locally
   npm run supabase:start

   # Run migrations
   npm run supabase:migrate
   ```

5. **Start Development Server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:5173](http://localhost:5173) to view the app.

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run typecheck` - Run TypeScript type checking
- `npm test` - Run unit tests
- `npm run lint` - Lint code with ESLint

### Database Scripts

- `npm run supabase:start` - Start local Supabase instance
- `npm run supabase:stop` - Stop local Supabase instance
- `npm run supabase:reset` - Reset local database
- `npm run supabase:studio` - Open Supabase Studio
- `npm run supabase:migrate` - Push database migrations

### Subscription Scripts

- `npm run revenuecat:validate` - Validate RevenueCat configuration
- `npm run revenuecat:test` - Test RevenueCat integration

### Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (buttons, inputs, etc.)
│   ├── AuthGuard.tsx   # Authentication wrapper
│   ├── Paywall.tsx     # Subscription paywall
│   └── ...
├── contexts/           # React contexts
├── hooks/              # Custom React hooks
├── lib/                # Utility functions and configurations
├── pages/              # Page components
├── types/              # TypeScript type definitions
└── main.tsx           # Application entry point

public/                 # Static assets
supabase/              # Database migrations and configuration
```

## 🔐 Authentication Setup

LogYourBody uses Supabase Auth for user management:

1. **Create Supabase Project**

   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Get your project URL and anon key

2. **Configure Authentication**

   - Enable email/password authentication
   - Configure OAuth providers (optional)
   - Set up email templates

3. **Database Setup**
   - Run the provided migrations
   - Configure Row Level Security (RLS) policies

See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for detailed instructions.

## 💳 Subscription Setup

LogYourBody uses RevenueCat + Stripe for subscription management:

1. **Stripe Configuration**

   - Create products and prices in Stripe
   - Get API keys from Stripe Dashboard

2. **RevenueCat Setup**

   - Connect Stripe to RevenueCat
   - Configure products and offerings
   - Get RevenueCat public API key

3. **Import Configuration**
   - Use the provided `revenuecat-config.json`
   - Follow the step-by-step import guide

See [REVENUECAT_SETUP.md](./REVENUECAT_SETUP.md) and [REVENUECAT_IMPORT_GUIDE.md](./REVENUECAT_IMPORT_GUIDE.md) for detailed instructions.

## 🧪 Testing

### Unit Tests

```bash
npm test
```

### E2E Testing

```bash
# Test authentication flow
npm run test:auth

# Test subscription flow
npm run test:payments

# Test offline functionality
npm run test:offline
```

### Accessibility Testing

The app includes comprehensive accessibility features:

- WCAG AA compliance
- Screen reader support
- Keyboard navigation
- High contrast mode support
- Reduced motion preferences

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main

### Netlify

1. Connect repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Configure environment variables

### Manual Deployment

```bash
npm run build
# Upload dist/ folder to your hosting provider
```

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (`npm test`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Code Style

- Use TypeScript for all new code
- Follow the existing code style
- Use meaningful variable and function names
- Add JSDoc comments for complex functions
- Ensure accessibility compliance

## 📊 Analytics & Monitoring

LogYourBody includes built-in analytics to track:

- User engagement metrics
- Feature usage statistics
- Performance metrics
- Error tracking
- Conversion rates

Privacy-focused analytics ensure user data protection while providing valuable insights.

## 🔒 Security

- All API endpoints are secured with authentication
- Database access uses Row Level Security (RLS)
- Sensitive data is encrypted at rest
- Payment processing is PCI compliant via Stripe
- Regular security audits and updates

## 📱 Progressive Web App (PWA)

LogYourBody is a full PWA with:

- Offline functionality
- App-like experience
- Push notifications (optional)
- Automatic updates
- Cross-platform compatibility

## 🆘 Support

- **Documentation**: Check the setup guides and inline documentation
- **Issues**: Report bugs via [GitHub Issues](https://github.com/itstimwhite/LogYourBody/issues)
- **Discussions**: Join community discussions in [GitHub Discussions](https://github.com/itstimwhite/LogYourBody/discussions)
- **Email**: For premium support, contact support@logyourbody.com

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 👨‍💻 Author

**Tim White**

- GitHub: [@itstimwhite](https://github.com/itstimwhite)
- Website: [timwhite.dev](https://timwhite.dev)
- Email: tim@timwhite.dev

## 🙏 Acknowledgments

- [Supabase](https://supabase.com) for the amazing backend platform
- [RevenueCat](https://revenuecat.com) for subscription management
- [Radix UI](https://radix-ui.com) for accessible components
- [TailwindCSS](https://tailwindcss.com) for utility-first styling
- [Recharts](https://recharts.org) for beautiful data visualization

## 📈 Roadmap

### Near Term (Q1 2024)

- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Social features and sharing
- [ ] Integration with fitness trackers

### Medium Term (Q2-Q3 2024)

- [ ] AI-powered insights and recommendations
- [ ] Nutrition tracking integration
- [ ] Workout planning features
- [ ] API for third-party integrations

### Long Term (Q4 2024+)

- [ ] Community features and challenges
- [ ] Coaching marketplace
- [ ] Enterprise features for gyms/trainers
- [ ] Advanced data science features

---

## 🏃‍♂️ Quick Start for Developers

```bash
# Clone and setup
git clone https://github.com/itstimwhite/LogYourBody.git
cd LogYourBody
npm install
cp .env.example .env

# Start development
npm run supabase:start
npm run dev

# Open http://localhost:5173
```

**Happy coding! 🎉**
