# mmWave Dashboard

## Getting Started

### Prerequisites

- Node.js, Bun
- Docker

### Installation

1. Rename `.env.example` to `.env.local`

2. Go to [Google Cloud Console](https://console.cloud.google.com/google/maps-apis/credentials) and create a Google Maps API key.

3. Add the API key to the `.env.local` file:

   ```
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=<your_api_key_here>
   ```

4. Run `bun dev` to start the development server.
