# Vehicle Maintenance Scheduler

Backend microservice that finds the best set of vehicle maintenance tasks to schedule at each depot, maximising impact within the available mechanic-hours. Uses 0/1 Knapsack DP.

## Setup

```bash
cd logging_middleware && npm install && cd ..
cd vehicle_scheduling && npm install
cp .env.example .env   # add your bearer token
npm run dev
```

## Endpoints

- `GET /api/schedule` — optimal schedule for all depots
- `GET /api/schedule/:depotId` — schedule for one depot
- `GET /api/depots` — list depots
- `GET /api/vehicles` — list vehicle tasks
- `GET /health` — health check
