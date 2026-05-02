/**
 * Custom LRU (Least Recently Used) Cache — Stage 4
 *
 * Implemented from scratch using a doubly-linked list + hash map.
 * No external caching libraries used.
 *
 * Time complexity: O(1) for both get and put operations
 * Space complexity: O(capacity)
 */

/* ------------------------------------------------------------------ */
/*  Doubly-linked list node                                            */
/* ------------------------------------------------------------------ */

interface CacheNode<T> {
  key: string;
  value: T;
  createdAt: number;  // timestamp for TTL
  prev: CacheNode<T> | null;
  next: CacheNode<T> | null;
}

/* ------------------------------------------------------------------ */
/*  LRU Cache                                                          */
/* ------------------------------------------------------------------ */

export class LRUCache<T> {
  private capacity: number;
  private ttlMs: number;
  private map: Map<string, CacheNode<T>>;

  // Sentinel nodes simplify edge-case handling
  private head: CacheNode<T>;
  private tail: CacheNode<T>;

  /**
   * @param capacity - Max number of entries
   * @param ttlSeconds - Time-to-live in seconds (default: 60s)
   */
  constructor(capacity: number, ttlSeconds: number = 60) {
    this.capacity = capacity;
    this.ttlMs = ttlSeconds * 1000;
    this.map = new Map();

    // Create sentinel head/tail nodes (never hold real data)
    this.head = { key: "__head__", value: null as T, createdAt: 0, prev: null, next: null };
    this.tail = { key: "__tail__", value: null as T, createdAt: 0, prev: null, next: null };
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  /**
   * Retrieve a value from the cache.
   * Returns undefined if not found or expired.
   */
  get(key: string): T | undefined {
    const node = this.map.get(key);
    if (!node) return undefined;

    // Check TTL
    if (Date.now() - node.createdAt > this.ttlMs) {
      this.removeNode(node);
      this.map.delete(key);
      return undefined;
    }

    // Move to front (most recently used)
    this.moveToFront(node);
    return node.value;
  }

  /**
   * Insert or update a value in the cache.
   * Evicts the least recently used entry if at capacity.
   */
  put(key: string, value: T): void {
    const existing = this.map.get(key);

    if (existing) {
      // Update existing entry
      existing.value = value;
      existing.createdAt = Date.now();
      this.moveToFront(existing);
      return;
    }

    // Evict LRU entry if at capacity
    if (this.map.size >= this.capacity) {
      const lru = this.tail.prev!;
      if (lru !== this.head) {
        this.removeNode(lru);
        this.map.delete(lru.key);
      }
    }

    // Insert new entry at front
    const newNode: CacheNode<T> = {
      key,
      value,
      createdAt: Date.now(),
      prev: null,
      next: null,
    };

    this.addToFront(newNode);
    this.map.set(key, newNode);
  }

  /**
   * Check if a key exists and is not expired.
   */
  has(key: string): boolean {
    return this.get(key) !== undefined;
  }

  /**
   * Remove a specific key from the cache.
   */
  delete(key: string): boolean {
    const node = this.map.get(key);
    if (!node) return false;

    this.removeNode(node);
    this.map.delete(key);
    return true;
  }

  /**
   * Clear all entries from the cache.
   */
  clear(): void {
    this.map.clear();
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  /**
   * Current number of entries in the cache.
   */
  get size(): number {
    return this.map.size;
  }

  /* ---------------------------------------------------------------- */
  /*  Internal linked-list operations                                  */
  /* ---------------------------------------------------------------- */

  private addToFront(node: CacheNode<T>): void {
    node.prev = this.head;
    node.next = this.head.next;
    this.head.next!.prev = node;
    this.head.next = node;
  }

  private removeNode(node: CacheNode<T>): void {
    node.prev!.next = node.next;
    node.next!.prev = node.prev;
  }

  private moveToFront(node: CacheNode<T>): void {
    this.removeNode(node);
    this.addToFront(node);
  }
}
