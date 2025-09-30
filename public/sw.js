// Service Worker for GHXSTSHIP - Advanced Caching Strategies
const CACHE_VERSION = 'v1.0.0';
const CACHE_NAMES = {
  static: `static-${CACHE_VERSION}`,
  dynamic: `dynamic-${CACHE_VERSION}`,
  images: `images-${CACHE_VERSION}`,
  api: `api-${CACHE_VERSION}`,
};

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/_next/static/css/app.css',
  '/_next/static/chunks/main.js',
  '/_next/static/chunks/webpack.js',
  '/_next/static/chunks/framework.js',
];

// Cache strategies
const CACHE_STRATEGIES = {
  // Network first, fallback to cache
  networkFirst: async (request) => {
    try {
      const networkResponse = await fetch(request);
      if (networkResponse.ok) {
        const cache = await caches.open(CACHE_NAMES.dynamic);
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    } catch (error) {
      const cachedResponse = await caches.match(request);
      if (cachedResponse) {
        return cachedResponse;
      }
      throw error;
    }
  },

  // Cache first, fallback to network
  cacheFirst: async (request) => {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAMES.dynamic);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  },

  // Stale while revalidate
  staleWhileRevalidate: async (request) => {
    const cachedResponse = await caches.match(request);
    const fetchPromise = fetch(request).then(async (networkResponse) => {
      if (networkResponse.ok) {
        const cache = await caches.open(CACHE_NAMES.dynamic);
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    });
    return cachedResponse || fetchPromise;
  },

  // Network only
  networkOnly: async (request) => {
    return fetch(request);
  },

  // Cache only
  cacheOnly: async (request) => {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw new Error('No cached response available');
  },
};

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAMES.static).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            return !Object.values(CACHE_NAMES).includes(cacheName);
          })
          .map((cacheName) => {
            return caches.delete(cacheName);
          })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - apply caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle write operations (POST, PUT, PATCH, DELETE) with offline queuing
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
    event.respondWith(handleWriteRequest(request));
    return;
  }

  // API requests - network first with timeout
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      Promise.race([
        CACHE_STRATEGIES.networkFirst(request),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Network timeout')), 5000)
        ),
      ]).catch(() => {
        return caches.match(request) || new Response(JSON.stringify({
          error: 'Offline',
          message: 'You are currently offline. Data shown may be outdated.'
        }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        });
      })
    );
    return;
  }

  // Images - cache first
  if (request.destination === 'image') {
    event.respondWith(CACHE_STRATEGIES.cacheFirst(request));
    return;
  }

  // Static assets - cache first
  if (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/fonts/') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.js')
  ) {
    event.respondWith(CACHE_STRATEGIES.cacheFirst(request));
    return;
  }

  // HTML pages - stale while revalidate
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      CACHE_STRATEGIES.staleWhileRevalidate(request).catch(() => {
        return caches.match('/offline.html') || new Response('Offline - Please check your connection', {
          status: 503,
          headers: { 'Content-Type': 'text/plain' }
        });
      })
    );
    return;
  }

  // Default - network first
  event.respondWith(CACHE_STRATEGIES.networkFirst(request));
});

// Handle write requests with offline queuing
async function handleWriteRequest(request) {
  try {
    const response = await fetch(request.clone());

    // Cache successful responses for certain endpoints
    if (response.ok && request.method === 'PUT') {
      const cache = await caches.open(CACHE_NAMES.api);
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    console.log('Network request failed, queuing for later:', request.url);

    // Queue the request for later
    try {
      const requestData = {
        id: Date.now() + Math.random(),
        method: request.method,
        url: request.url,
        headers: Object.fromEntries(request.headers.entries()),
        body: request.method !== 'DELETE' ? await request.clone().text() : null,
        timestamp: Date.now(),
        retryCount: 0
      };

      await addPendingRequest(requestData);

      return new Response(JSON.stringify({
        success: true,
        queued: true,
        message: 'Request queued for when connection is restored',
        id: requestData.id
      }), {
        status: 202,
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (queueError) {
      console.error('Failed to queue request:', queueError);
      return new Response(JSON.stringify({
        error: 'Offline',
        message: 'Request cannot be processed while offline'
      }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncOfflineData());
  }
});

// Push notifications
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New update available',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
  };

  event.waitUntil(
    self.registration.showNotification('GHXSTSHIP', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});

// Helper function to sync offline data
async function syncOfflineData() {
  try {
    console.log('Starting offline data sync...');

    // Get all pending requests from IndexedDB
    const pendingRequests = await getPendingRequests();

    console.log(`Processing ${pendingRequests.length} queued requests`);

    // Process each request
    for (const requestData of pendingRequests) {
      try {
        console.log('Processing queued request:', requestData.url);

        const request = new Request(requestData.url, {
          method: requestData.method,
          headers: requestData.headers,
          body: requestData.body
        });

        const response = await fetch(request);

        if (response.ok) {
          await removePendingRequest(requestData.id);
          console.log('Successfully processed queued request:', requestData.url);

          // Notify clients of successful sync
          self.clients.matchAll().then(clients => {
            clients.forEach(client => {
              client.postMessage({
                type: 'SYNC_SUCCESS',
                requestId: requestData.id,
                url: requestData.url
              });
            });
          });
        } else {
          // Increment retry count
          await updateRetryCount(requestData.id);

          // If too many retries, remove from queue
          if (requestData.retryCount >= 5) {
            await removePendingRequest(requestData.id);
            console.log('Removed failed request from queue after max retries:', requestData.url);

            // Notify clients of failed sync
            self.clients.matchAll().then(clients => {
              clients.forEach(client => {
                client.postMessage({
                  type: 'SYNC_FAILED',
                  requestId: requestData.id,
                  url: requestData.url,
                  error: 'Max retries exceeded'
                });
              });
            });
          }
        }
      } catch (error) {
        console.error('Failed to process queued request:', requestData.url, error);

        // Increment retry count
        await updateRetryCount(requestData.id);

        // If too many retries, remove from queue
        if (requestData.retryCount >= 5) {
          await removePendingRequest(requestData.id);

          // Notify clients of failed sync
          self.clients.matchAll().then(clients => {
            clients.forEach(client => {
              client.postMessage({
                type: 'SYNC_FAILED',
                requestId: requestData.id,
                url: requestData.url,
                error: error.message
              });
            });
          });
        }
      }
    }

    console.log('Offline data sync completed');

    // Notify all clients that sync is complete
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'SYNC_COMPLETE',
          timestamp: Date.now()
        });
      });
    });

  } catch (error) {
    console.error('Sync failed:', error);
  }
}

// IndexedDB helpers for offline queue
const DB_NAME = 'ghxstship-offline';
const DB_VERSION = 1;
const STORE_NAME = 'requests';

async function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('timestamp', 'timestamp', { unique: false });
        store.createIndex('method', 'method', { unique: false });
      }
    };
  });
}

async function getPendingRequests() {
  const db = await openDB();
  const transaction = db.transaction([STORE_NAME], 'readonly');
  const store = transaction.objectStore(STORE_NAME);
  const index = store.index('timestamp');

  return new Promise((resolve, reject) => {
    const request = index.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function addPendingRequest(requestData) {
  const db = await openDB();
  const transaction = db.transaction([STORE_NAME], 'readwrite');
  const store = transaction.objectStore(STORE_NAME);

  return new Promise((resolve, reject) => {
    const request = store.add(requestData);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function removePendingRequest(id) {
  const db = await openDB();
  const transaction = db.transaction([STORE_NAME], 'readwrite');
  const store = transaction.objectStore(STORE_NAME);

  return new Promise((resolve, reject) => {
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

async function updateRetryCount(id) {
  const db = await openDB();
  const transaction = db.transaction([STORE_NAME], 'readwrite');
  const store = transaction.objectStore(STORE_NAME);

  return new Promise((resolve, reject) => {
    const getRequest = store.get(id);
    getRequest.onsuccess = () => {
      const item = getRequest.result;
      if (item) {
        item.retryCount = (item.retryCount || 0) + 1;
        const putRequest = store.put(item);
        putRequest.onsuccess = () => resolve();
        putRequest.onerror = () => reject(putRequest.error);
      } else {
        resolve();
      }
    };
    getRequest.onerror = () => reject(getRequest.error);
  });
}

// Message handler for cache management
self.addEventListener('message', (event) => {
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      })
    );
  }
  
  if (event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(CACHE_NAMES.dynamic).then((cache) => {
        return cache.addAll(event.data.urls);
      })
    );
  }
});
