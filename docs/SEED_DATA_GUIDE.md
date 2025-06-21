# Seed Data Guide

This guide explains how to seed your database with test users and verify the data.

## Overview

We provide 5 diverse test users with different fitness journeys:

1. **Sarah Chen** - Weight loss journey (Overweight Female)
   - 5'4" (163cm), Started at 180 lbs → 165 lbs (goal: 140 lbs)
   - 6 months of progress data showing steady weight loss

2. **Marcus Johnson** - Bulking journey (Athletic Male)
   - 6'1" (185cm), Started at 175 lbs → 190 lbs (goal: 200 lbs)
   - 4 months of lean bulk data with muscle mass tracking

3. **Emily Rodriguez** - Maintenance phase (Fit Female)
   - 5'7" (170cm), Maintaining at 135 lbs, 22% body fat
   - Personal trainer with consistent metrics

4. **David Kim** - Weight loss journey (Overweight Male)
   - 5'9" (175cm), Started at 220 lbs → 195 lbs (goal: 170 lbs)
   - 8 months of progress, down 25 lbs

5. **Jessica Thompson** - Body recomposition (Athletic Female)
   - 5'6" (168cm), Weight stable at 145 lbs
   - Dropping body fat while building muscle
   - Includes daily step tracking data

## Prerequisites

1. PostgreSQL client (`psql`) installed
2. Database connection configured in `.env.local`
3. Node.js and npm installed

## Running the Seed Script

### Method 1: Using npm script
```bash
npm run seed
```

### Method 2: Direct execution
```bash
./scripts/seed-database.sh
```

### Method 3: Manual PostgreSQL
```bash
psql "$DATABASE_URL" -f supabase/seed-users.sql
```

## Testing the Seeded Data

Run the test script to verify all users were created correctly:

```bash
npm run test:seed
```

This will display:
- User profiles with demographics
- Progress tracking (weight, body fat, muscle mass)
- Journey type and changes over time
- Average daily steps (where available)

## Login Credentials

All test users use the same password for easy testing:
- **Email**: [firstname].[lastname]@example.com
- **Password**: password123

## Viewing in the App

1. Start the development server: `npm run dev`
2. Navigate to `/login`
3. Sign in with any test user credentials
4. View their dashboard with pre-populated data

## Testing Different Scenarios

- **Weight Loss**: Sign in as Sarah Chen or David Kim
- **Muscle Building**: Sign in as Marcus Johnson
- **Maintenance**: Sign in as Emily Rodriguez
- **Body Recomposition**: Sign in as Jessica Thompson

## Cleanup

To remove test users, run:

```sql
DELETE FROM body_metrics WHERE user_id IN (
  SELECT id FROM auth.users WHERE email LIKE '%@example.com'
);
DELETE FROM user_profiles WHERE user_id IN (
  SELECT id FROM auth.users WHERE email LIKE '%@example.com'
);
DELETE FROM auth.users WHERE email LIKE '%@example.com';
```

## Troubleshooting

### "DATABASE_URL not found"
Make sure your `.env.local` file contains:
```
DATABASE_URL=postgresql://[user]:[password]@[host]:[port]/[database]
```

### "Permission denied"
The seed script needs to be executable:
```bash
chmod +x scripts/seed-database.sh
```

### "psql: command not found"
Install PostgreSQL client:
- macOS: `brew install postgresql`
- Ubuntu: `sudo apt-get install postgresql-client`
- Windows: Download from postgresql.org