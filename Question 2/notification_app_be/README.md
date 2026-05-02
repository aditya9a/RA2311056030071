# Campus Notifications Microservice

Backend service for campus notifications with custom LRU caching and category-based filtering.

## Setup

```bash
cd logging_middleware && npm install && cd ..
cd notification_app_be && npm install
cp .env.example .env   # add your bearer token
npm run dev
```

## Endpoints

- `GET /api/notifications` — all notifications (cached, sortable)
- `GET /api/notifications/category/:cat` — filter by category
- `GET /api/notifications/type/:type` — filter by type
- `POST /api/notify-all` — broadcast to all students
- `GET /api/cache-stats` — cache status
- `GET /health` — health check
