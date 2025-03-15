# mmWave Dashboard

## Getting Started

### Prerequisites

- Node.js or Bun
- Docker
- Google Maps API key
- OpenAI API key

### Installation

1. Clone the repository

   ```bash
   git clone https://github.com/wise-ntust/mmwave-dashboard.git
   git clone https://github.com/wise-ntust/mmwave-middleware.git
   git clone https://github.com/wise-ntust/mmwave-mininet.git
   git clone https://github.com/wise-ntust/mmwave-ryu.git
   ```

2. Build the images

   ```bash
   docker build mmwave-dashboard -t mmwave-dashboard
   docker build mmwave-middleware -t mmwave-middleware
   docker build mmwave-mininet -t mmwave-mininet
   docker build mmwave-ryu -t mmwave-ryu
   ```

3. Add the API keys to the docker-compose.yml file:

   ```
   services:
     middleware:
       environment:
         - OPENAI_API_KEY=<your_openai_api_key_here>
     dashboard:
       environment:
         - NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=<your_google_maps_api_key_here>
   ```

4. Run the containers

   ```bash
   cd mmwave-dashboard
   docker compose up -d
   ```

5. Open the dashboard

   - [http://localhost:3000](http://localhost:3000)
