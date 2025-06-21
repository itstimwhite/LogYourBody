# OpenAI Codex Setup for LogYourBody

This directory contains configuration files and setup scripts for using OpenAI Codex with the LogYourBody project.

## Files

### 1. `dependencies.json`
Complete list of all npm dependencies that need to be whitelisted in OpenAI Codex. This includes:
- Core React and Next.js packages
- Supabase client libraries
- UI component libraries (Radix UI, shadcn/ui)
- Utility libraries (date-fns, framer-motion, etc.)
- Development dependencies (testing, linting, etc.)

### 2. `setup.sh`
Automated setup script that:
- Checks Node.js version (requires 18+)
- Installs all dependencies
- Creates `.env.local` template
- Sets up project directories
- Configures Git hooks
- Runs initial build and tests

### 3. `codex-config.json`
Comprehensive project configuration including:
- Project metadata
- Framework specifications
- Database schema overview
- API integrations
- File structure guide
- Coding standards
- Environment variables

### 4. `codex-prompt.md`
Pre-written context prompt for OpenAI Codex with project-specific information.

## Usage

### For OpenAI Codex Setup:

1. **Whitelist Dependencies**: Use the `dependencies.json` file to ensure all required packages are available in your Codex environment.

2. **Run Setup Script**:
   ```bash
   cd /path/to/LogYourBody
   bash codex-setup/setup.sh
   ```

3. **Configure Environment**: Update the generated `.env.local` file with your actual API keys:
   - Supabase credentials
   - OpenAI API key
   - Twilio credentials (optional)
   - RevenueCat keys (optional)

4. **Use Codex Configuration**: Reference `codex-config.json` for project structure and standards when working with AI assistants.

## Environment Variables

### Required:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Optional:
```env
# For PDF parsing
OPENAI_API_KEY=your_openai_api_key

# For SMS authentication
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_auth
TWILIO_PHONE_NUMBER=your_twilio_number
TWILIO_VERIFY_SERVICE_SID=your_verify_sid

# For subscriptions
NEXT_PUBLIC_REVENUECAT_API_KEY_APPLE=your_apple_key
NEXT_PUBLIC_REVENUECAT_API_KEY_GOOGLE=your_google_key
```

## Key Project Information

- **Framework**: Next.js 15.3.3 with App Router
- **Language**: TypeScript with strict mode
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS + shadcn/ui
- **Authentication**: Supabase Auth with SMS support
- **State Management**: React Context + Hooks
- **Testing**: Jest + React Testing Library
- **Mobile**: Capacitor for iOS/Android

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Type checking
npm run typecheck

# Database migrations
npx supabase db push --password your_db_password

# iOS development
npx cap sync ios
npx cap open ios
```

## Support

For issues or questions about the setup, please refer to the main project documentation or open an issue on GitHub.