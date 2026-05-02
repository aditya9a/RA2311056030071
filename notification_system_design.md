# Campus Notification System — Design Document

## Stage 1: Frontend Caching Strategy

### Problem
The campus notification system has 6 categories (Placements, Exams, Campus Events, Club Events, Sports, Cultural Events). The product manager changes category subscriptions frequently, causing excessive API calls.

### Caching Strategy
I'd use an in-memory cache (a simple Map/object) on the client side with a TTL (time-to-live) of 5 minutes. Each cache entry stores the category list along with a timestamp.

**How it works:**
1. On first load, fetch categories from the API and store in memory
2. On subsequent loads, check if cache is still valid (within TTL)
3. If valid, return cached data — no API call
4. If expired, refetch from API and update cache

**Cache invalidation triggers:**
- TTL expiry (5 min default)
- User manually refreshes
- WebSocket event from server when categories change
- Tab/window regains focus (visibility change)

### Trade-offs
- **Pros**: Fewer API calls, faster UI, works offline briefly
- **Cons**: Data can be stale for up to TTL duration
- **Stale cache**: Acceptable for categories since they don't change every second. The TTL keeps staleness bounded
- **Categories added/removed**: If a user is actively browsing when categories change, they won't see updates until TTL expires or they refresh. A WebSocket push from the server solves this in real-time

### Metrics to track
- Cache hit rate (should be > 80%)
- Average API call frequency per session
- Time between cache refresh

---

## Stage 2: Storage Strategy

### Database choice
For a notification system at scale, I'd use **PostgreSQL** as the primary store and **Redis** as the caching layer.

**Why PostgreSQL:**
- Strong ACID compliance — notifications must not be lost or duplicated
- Supports indexing on category, type, timestamp for fast lookups
- JSON support for flexible notification payloads
- Proven at scale with proper indexing

**Why Redis for caching:**
- In-memory, sub-millisecond reads
- Built-in TTL and eviction policies (LRU)
- Pub/Sub for real-time cache invalidation across instances

### Scaling concerns
- As data grows to millions, we need pagination (cursor-based, not offset)
- Indexes on (category, timestamp) and (user_id, read) become critical
- Archiving old notifications (> 30 days) to cold storage
- Read replicas for read-heavy workloads

---

## Stage 3: Large Dataset Handling

### Problem
1.2 TB JSON file with 25,000 notification records, 6,000 subscribed students.

### Strategy
1. **Don't load entire file into memory** — use streaming JSON parsers (e.g., JSONStream) to process records one at a time
2. **Batch inserts** — insert records in batches of 500-1000 to avoid overwhelming the DB
3. **Index on Category and Read** — since the API filters by these fields, composite indexes are essential
4. **Partition by Category** — if using PostgreSQL, table partitioning by category speeds up filtered queries
5. **Cache hot data** — most students query recent, unread notifications. Cache the top N per category in Redis/LRU cache

### Real-time scaling
- Use WebSockets or SSE for push notifications instead of polling
- Queue notification delivery through a message broker (RabbitMQ/Redis Streams)
- Rate-limit the notification API to prevent thundering herd on page loads
