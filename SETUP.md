# BitQuest Setup Guide

## Prerequisites

- Node.js 18+
- PostgreSQL with PostGIS extension
- Bitrefill API credentials

## Database Setup

1. **Install PostgreSQL and PostGIS**

   ```bash
   # macOS with Homebrew
   brew install postgresql postgis

   # Ubuntu/Debian
   sudo apt-get install postgresql postgis
   ```

2. **Create Database**

   ```bash
   createdb bitquest
   psql bitquest -c "CREATE EXTENSION postgis;"
   ```

3. **Configure Environment**
   Copy `.env.example` to `.env.local` and update:

   ```bash
   cp .env.example .env.local
   ```

   Update the DATABASE_URL in `.env.local`:

   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/bitquest?schema=public"
   ```

## Application Setup

1. **Install Dependencies**

   ```bash
   npm install
   ```

2. **Generate Prisma Client**

   ```bash
   npm run db:generate
   ```

3. **Push Database Schema**

   ```bash
   npm run db:push
   ```

4. **Seed Database**

   ```bash
   npm run db:seed
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

## Features Implemented

### ✅ Database Layer

- **Prisma ORM** with PostgreSQL
- **Chest Service** for managing treasure chests
- **Collection tracking** with user associations
- **Reward system** with Bitrefill integration
- **Geospatial queries** for nearby chests

### ✅ AR Polish

- **GLB Model Loading** using @react-three/drei
- **3D Treasure Chest** with type-based materials
- **Animated effects** for different chest rarities
- **Interactive collection** via click events

### ✅ Map/AR Data Sync

- **Real-time collection status** updates
- **Visual indicators** for collected vs uncollected chests
- **Seamless AR integration** from map popups
- **Optimistic UI updates** for better UX

### ✅ API Endpoints

- `GET /api/chests/nearby` - Find nearby chests with distance calculation
- `POST /api/chests/[id]/collect` - Collect a chest (with duplicate prevention)
- `GET /api/rewards/pending` - Get user's pending rewards
- `POST /api/rewards/redeem` - Redeem rewards via Bitrefill
- `POST /api/webhooks/bitrefill` - Handle Bitrefill webhooks

## Database Schema

### Chests

- Location (lat/lng)
- Metadata (type, value, model)
- Collection tracking

### Collections

- User associations (Farcaster FID)
- Collection timestamps
- Redemption status

### BitrefillRewards

- Order tracking
- Gift card codes
- Status management

## Chest Types

- **Common** (Brown) - 5 points
- **Rare** (Gold) - 10 points
- **Epic** (Cyan) - 20 points

## Next Steps

1. **Authentication**: Implement Farcaster Sign-in
2. **PostGIS**: Add proper geospatial queries
3. **Webhook Security**: Verify Bitrefill signatures
4. **Email Integration**: Send gift card codes to users
5. **Testing**: Add unit and integration tests
6. **Deployment**: Set up production environment

## Troubleshooting

### Database Connection Issues

- Verify PostgreSQL is running
- Check DATABASE_URL format
- Ensure PostGIS extension is installed

### GLB Model Issues

- Verify chest.glb is in `/public/models/`
- Check browser console for loading errors
- Ensure @react-three/drei is installed

### API Errors

- Check environment variables
- Verify Bitrefill credentials
- Check database connection
