# BitQuest

BitQuest is a web-first Farcaster Mini App that creates an engaging treasure hunt experience using location-based Augmented Reality (AR). Users can discover and collect virtual treasure chests in the real world, which can be redeemed for rewards through Bitrefill.

## Features

- Location-based AR treasure hunting using AR.js
- Farcaster authentication and social features
- Interactive map interface with nearby treasure locations
- Reward redemption through Bitrefill integration
- Real-time geospatial queries for chest discovery

## Tech Stack

- **Frontend**: Next.js, TypeScript, Tailwind CSS
- **AR**: AR.js, Three.js
- **Authentication**: Farcaster AuthKit
- **Maps**: Mapbox GL
- **Backend**: Node.js, Express, PostgreSQL + PostGIS
- **Rewards**: Bitrefill API integration

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL with PostGIS extension
- Farcaster Developer Account
- Bitrefill API credentials
- Mapbox API key

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/bitquest.git
   cd bitquest
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env.local` file:

   ```
   NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token
   NEXT_PUBLIC_FARCASTER_APP_ID=your_farcaster_app_id
   BITREFILL_CLIENT_ID=your_bitrefill_client_id
   BITREFILL_CLIENT_SECRET=your_bitrefill_client_secret
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Architecture

### Farcaster Mini App Integration

The app is built as a Farcaster Mini App with:

- `fc:miniapp` meta tag for app discovery
- `/.well-known/farcaster.json` manifest
- Farcaster AuthKit for authentication
- SDK context for user data and client metadata

### AR Implementation

Uses AR.js for location-based AR features:

- Marker-less AR using device GPS
- 3D chest models rendered with Three.js
- Touch interaction for chest collection

### Backend Services

Node.js/Express backend with:

- PostgreSQL + PostGIS for geospatial queries
- RESTful API endpoints
- Secure reward redemption flow
- Bitrefill API integration

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Farcaster](https://www.farcaster.xyz/) for the Mini Apps platform
- [AR.js](https://ar-js-org.github.io/) for web AR capabilities
- [Bitrefill](https://www.bitrefill.com/) for reward integration
