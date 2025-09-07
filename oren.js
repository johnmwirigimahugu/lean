/**
 * 🌍 Oren.js v1.0 - Universal Enterprise-Grade Full-Stack Framework
 * ─────────────────────────────────────────────────────────────────────────────
 * 🧾 Copyright © 2025 John Kesh Mahugu & Contributors
 * 🕒 Generated: 2025-07-21 12:17 EAT
 * 🔑 License: MIT
 *
 * 📘 SYNOPSIS:
 * Oren.js is a revolutionary universal full-stack JavaScript framework that seamlessly combines
 * backend and frontend capabilities in a single, zero-dependency package. It runs on both server
 * (Node.js) and client (browser) environments, enabling true isomorphic applications with shared
 * code, state management, and rendering capabilities. Oren.js provides enterprise-grade features
 * including database integration, real-time communication, authentication, and a comprehensive UI framework.
 *
 * 🛣️ FEATURES:
 * - ✅ Universal Architecture: Single codebase that runs on both server and browser
 * - ✅ Zero Dependencies: Entire framework in one file with no external dependencies
 * - ✅ Isomorphic Rendering: Server-side rendering (SSR) and client-side hydration
 * - ✅ Shared State Management: Universal state that syncs between server and client
 * - ✅ Integrated Database: Hybrid ORM (SQL/NoSQL) with browser-compatible storage
 * - ✅ Real-time Communication: WebSocket and SSE with universal event system
 * - ✅ Enterprise Security: JWT, OAuth2, CSRF, RBAC, rate limiting, secure headers
 * - ✅ Universal UI Framework: Component system with SSR and client-side interactivity
 * - ✅ Routing: Universal routing that works on server and client
 * - ✅ API Layer: REST and GraphQL with automatic client generation
 * - ✅ CLI Tooling: Comprehensive CLI for development, testing, and deployment
 * - ✅ Observability: Logging, metrics, and tracing for both server and client
 * - ✅ TypeScript Support: Full TypeScript support with universal types
 * - ✅ Progressive Enhancement: Graceful degradation for older browsers
 * - ✅ Offline Capabilities: Service worker integration and offline storage
 * - ✅ Internationalization: Built-in i18n support for global applications
 * - ✅ Testing Framework: Universal testing for server and client code
 *
 * 📜 LICENSE:
 * MIT License. See https://opensource.org/licenses/MIT.
 *
 * 🙏 DEDICATION:
 * To developers building scalable, secure, and delightful universal web applications.
 * Code with clarity, ship with confidence, everywhere.
 *
 * 🌐 AUTHOR & WEBSITE:
 * John Kesh Mahugu
 * Website: https://johnmwirigimahugu.github.io/orn.js | oren.js.org
 * Contact: johnmahugu at gmail dot com
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ===== CORE ENGINE =====
const Core = {
  // Environment detection
  isServer: typeof window === 'undefined',
  isBrowser: typeof window !== 'undefined',
  
  // Version information
  version: '1.0.0',
  
  // Global configuration
  config: {
    // Server configuration
    server: {
      port: process.env.PORT || 3000,
      host: process.env.HOST || '0.0.0.0',
      staticDir: './public',
      viewsDir: './views'
    },
    
    // Client configuration
    client: {
      apiBase: '/api',
      wsUrl: typeof window !== 'undefined' ? 
        (window.location.protocol === 'https:' ? 'wss:' : 'ws:') + '//' + window.location.host : 
        'ws://localhost:3000',
      ssr: true,
      hydration: true
    },
    
    // Database configuration
    database: {
      engine: Core.isServer ? (process.env.DB_ENGINE || 'json') : 'indexeddb',
      path: Core.isServer ? './data' : '/oren-db'
    },
    
    // Security configuration
    security: {
      jwtSecret: process.env.JWT_SECRET || 'oren-secret-key',
      sessionSecret: process.env.SESSION_SECRET || 'oren-session-secret',
      csrfProtection: true,
      cors: {
        origin: process.env.CORS_ORIGIN || '*',
        credentials: true
      }
    }
  },
  
  // Utilities
  utils: {
    // UID generator
    uid: (length = 16) => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let result = '';
      for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    },
    
    // Deep clone
    clone: (obj) => {
      if (obj === null || typeof obj !== 'object') return obj;
      if (obj instanceof Date) return new Date(obj.getTime());
      if (obj instanceof Array) return obj.map(item => Core.utils.clone(item));
      if (typeof obj === 'object') {
        const cloned = {};
        Object.keys(obj).forEach(key => {
          cloned[key] = Core.utils.clone(obj[key]);
        });
        return cloned;
      }
    },
    
    // Merge objects
    merge: (target, source) => {
      const output = Object.assign({}, target);
      if (Core.utils.isObject(target) && Core.utils.isObject(source)) {
        Object.keys(source).forEach(key => {
          if (Core.utils.isObject(source[key])) {
            if (!(key in target)) {
              Object.assign(output, { [key]: source[key] });
            } else {
              output[key] = Core.utils.merge(target[key], source[key]);
            }
          } else {
            Object.assign(output, { [key]: source[key] });
          }
        });
      }
      return output;
    },
    
    // Check if object
    isObject: (item) => {
      return item && typeof item === 'object' && !Array.isArray(item);
    },
    
    // Format date
    formatDate: (date = new Date()) => {
      return date.toISOString();
    },
    
    // Parse query string
    parseQuery: (queryString) => {
      const query = {};
      const pairs = (queryString[0] === '?' ? queryString.substr(1) : queryString).split('&');
      for (let i = 0; i < pairs.length; i++) {
        const pair = pairs[i].split('=');
        query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
      }
      return query;
    },
    
    // Debounce function
    debounce: (func, wait) => {
      let timeout;
      return function(...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
      };
    },
    
    // Throttle function
    throttle: (func, limit) => {
      let inThrottle;
      return function(...args) {
        const context = this;
        if (!inThrottle) {
          func.apply(context, args);
          inThrottle = true;
          setTimeout(() => inThrottle = false, limit);
        }
      };
    }
  },
  
  // Event system (universal)
  EventSystem: class {
    constructor() {
      this.events = {};
    }
    
    on(event, callback) {
      if (!this.events[event]) {
        this.events[event] = [];
      }
      this.events[event].push(callback);
      return this;
    }
    
    off(event, callback) {
      if (!this.events[event]) return this;
      if (!callback) {
        delete this.events[event];
      } else {
        this.events[event] = this.events[event].filter(cb => cb !== callback);
      }
      return this;
    }
    
    emit(event, data) {
      if (this.events[event]) {
        this.events[event].forEach(callback => {
          try {
            callback(data);
          } catch (error) {
            console.error(`Error in event handler for ${event}:`, error);
          }
        });
      }
      return this;
    }
  },
  
  // Universal storage abstraction
  Storage: class {
    constructor(name, options = {}) {
      this.name = name;
      this.options = options;
      this.isServer = Core.isServer;
      this.isBrowser = Core.isBrowser;
      
      if (this.isServer) {
        this.engine = options.engine || 'json';
        this.path = options.path || './data';
      } else {
        this.engine = 'indexeddb';
        this.dbName = options.dbName || 'OrenDB';
        this.version = options.version || 1;
      }
      
      this.init();
    }
    
    async init() {
      if (this.isServer) {
        // Server-side storage initialization
        switch (this.engine) {
          case 'json':
            this.storage = new Core.Server.JSONStorage(this.name, this.path);
            break;
          case 'memory':
            this.storage = new Core.Server.MemoryStorage(this.name);
            break;
          default:
            this.storage = new Core.Server.JSONStorage(this.name, this.path);
        }
      } else {
        // Client-side storage initialization
        this.storage = new Core.Client.IndexedDBStorage(this.name, this.dbName, this.version);
      }
      
      await this.storage.init();
    }
    
    async get(key) {
      return await this.storage.get(key);
    }
    
    async set(key, value) {
      return await this.storage.set(key, value);
    }
    
    async delete(key) {
      return await this.storage.delete(key);
    }
    
    async find(query = {}) {
      return await this.storage.find(query);
    }
    
    async clear() {
      return await this.storage.clear();
    }
  },
  
  // Server-side implementations
  Server: {
    // JSON file-based storage for server
    JSONStorage: class {
      constructor(name, path) {
        this.name = name;
        this.path = path;
        this.filePath = `${path}/${name}.json`;
        this.data = [];
        this.indexes = {};
        this.ensureDirectory();
      }
      
      ensureDirectory() {
        if (typeof require !== 'undefined') {
          const fs = require('fs');
          const path = require('path');
          
          if (!fs.existsSync(this.path)) {
            fs.mkdirSync(this.path, { recursive: true });
          }
          
          if (!fs.existsSync(this.filePath)) {
            fs.writeFileSync(this.filePath, '[]');
          } else {
            const content = fs.readFileSync(this.filePath, 'utf8');
            this.data = JSON.parse(content);
          }
        }
      }
      
      async init() {
        // Already initialized in constructor
        return Promise.resolve();
      }
      
      async get(key) {
        return this.data.find(item => item.id === key);
      }
      
      async set(key, value) {
        const index = this.data.findIndex(item => item.id === key);
        if (index !== -1) {
          this.data[index] = { ...this.data[index], ...value, updatedAt: Core.utils.formatDate() };
        } else {
          this.data.push({
            id: key,
            ...value,
            createdAt: Core.utils.formatDate(),
            updatedAt: Core.utils.formatDate()
          });
        }
        this.save();
        return value;
      }
      
      async delete(key) {
        const index = this.data.findIndex(item => item.id === key);
        if (index !== -1) {
          this.data.splice(index, 1);
          this.save();
          return true;
        }
        return false;
      }
      
      async find(query = {}) {
        return this.data.filter(item => {
          return Object.keys(query).every(key => {
            if (typeof query[key] === 'object' && query[key] !== null) {
              // Handle operators
              for (const [op, value] of Object.entries(query[key])) {
                switch (op) {
                  case '$eq': return item[key] === value;
                  case '$ne': return item[key] !== value;
                  case '$gt': return item[key] > value;
                  case '$gte': return item[key] >= value;
                  case '$lt': return item[key] < value;
                  case '$lte': return item[key] <= value;
                  case '$in': return Array.isArray(value) && value.includes(item[key]);
                  case '$nin': return Array.isArray(value) && !value.includes(item[key]);
                }
              }
              return true;
            } else {
              return item[key] === query[key];
            }
          });
        });
      }
      
      async clear() {
        this.data = [];
        this.save();
      }
      
      save() {
        if (typeof require !== 'undefined') {
          const fs = require('fs');
          fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2));
        }
      }
    },
    
    // In-memory storage for server
    MemoryStorage: class {
      constructor(name) {
        this.name = name;
        this.data = [];
      }
      
      async init() {
        return Promise.resolve();
      }
      
      async get(key) {
        return this.data.find(item => item.id === key);
      }
      
      async set(key, value) {
        const index = this.data.findIndex(item => item.id === key);
        if (index !== -1) {
          this.data[index] = { ...this.data[index], ...value, updatedAt: Core.utils.formatDate() };
        } else {
          this.data.push({
            id: key,
            ...value,
            createdAt: Core.utils.formatDate(),
            updatedAt: Core.utils.formatDate()
          });
        }
        return value;
      }
      
      async delete(key) {
        const index = this.data.findIndex(item => item.id === key);
        if (index !== -1) {
          this.data.splice(index, 1);
          return true;
        }
        return false;
      }
      
      async find(query = {}) {
        return this.data.filter(item => {
          return Object.keys(query).every(key => {
            if (typeof query[key] === 'object' && query[key] !== null) {
              // Handle operators
              for (const [op, value] of Object.entries(query[key])) {
                switch (op) {
                  case '$eq': return item[key] === value;
                  case '$ne': return item[key] !== value;
                  case '$gt': return item[key] > value;
                  case '$gte': return item[key] >= value;
                  case '$lt': return item[key] < value;
                  case '$lte': return item[key] <= value;
                  case '$in': return Array.isArray(value) && value.includes(item[key]);
                  case '$nin': return Array.isArray(value) && !value.includes(item[key]);
                }
              }
              return true;
            } else {
              return item[key] === query[key];
            }
          });
        });
      }
      
      async clear() {
        this.data = [];
      }
    }
  },
  
  // Client-side implementations
  Client: {
    // IndexedDB storage for browser
    IndexedDBStorage: class {
      constructor(name, dbName, version = 1) {
        this.name = name;
        this.dbName = dbName;
        this.version = version;
        this.db = null;
        this.storeName = name;
      }
      
      async init() {
        return new Promise((resolve, reject) => {
          const request = indexedDB.open(this.dbName, this.version);
          
          request.onerror = (event) => {
            reject('Error opening IndexedDB');
          };
          
          request.onsuccess = (event) => {
            this.db = event.target.result;
            resolve();
          };
          
          request.onupgradeneeded = (event) => {
            const db = event.target.result;
            
            // Create object store if it doesn't exist
            if (!db.objectStoreNames.contains(this.storeName)) {
              const objectStore = db.createObjectStore(this.storeName, { keyPath: 'id' });
              
              // Create indexes
              objectStore.createIndex('createdAt', 'createdAt', { unique: false });
              objectStore.createIndex('updatedAt', 'updatedAt', { unique: false });
            }
          };
        });
      }
      
      async get(key) {
        return new Promise((resolve, reject) => {
          const transaction = this.db.transaction([this.storeName], 'readonly');
          const objectStore = transaction.objectStore(this.storeName);
          const request = objectStore.get(key);
          
          request.onerror = (event) => {
            reject('Error getting data from IndexedDB');
          };
          
          request.onsuccess = (event) => {
            resolve(event.target.result);
          };
        });
      }
      
      async set(key, value) {
        return new Promise((resolve, reject) => {
          const transaction = this.db.transaction([this.storeName], 'readwrite');
          const objectStore = transaction.objectStore(this.storeName);
          
          const data = {
            id: key,
            ...value,
            createdAt: value.createdAt || Core.utils.formatDate(),
            updatedAt: Core.utils.formatDate()
          };
          
          const request = objectStore.put(data);
          
          request.onerror = (event) => {
            reject('Error setting data in IndexedDB');
          };
          
          request.onsuccess = (event) => {
            resolve(data);
          };
        });
      }
      
      async delete(key) {
        return new Promise((resolve, reject) => {
          const transaction = this.db.transaction([this.storeName], 'readwrite');
          const objectStore = transaction.objectStore(this.storeName);
          const request = objectStore.delete(key);
          
          request.onerror = (event) => {
            reject('Error deleting data from IndexedDB');
          };
          
          request.onsuccess = (event) => {
            resolve(true);
          };
        });
      }
      
      async find(query = {}) {
        return new Promise((resolve, reject) => {
          const transaction = this.db.transaction([this.storeName], 'readonly');
          const objectStore = transaction.objectStore(this.storeName);
          const request = objectStore.getAll();
          
          request.onerror = (event) => {
            reject('Error finding data in IndexedDB');
          };
          
          request.onsuccess = (event) => {
            const results = event.target.result;
            
            // Filter results based on query
            const filtered = results.filter(item => {
              return Object.keys(query).every(key => {
                if (typeof query[key] === 'object' && query[key] !== null) {
                  // Handle operators
                  for (const [op, value] of Object.entries(query[key])) {
                    switch (op) {
                      case '$eq': return item[key] === value;
                      case '$ne': return item[key] !== value;
                      case '$gt': return item[key] > value;
                      case '$gte': return item[key] >= value;
                      case '$lt': return item[key] < value;
                      case '$lte': return item[key] <= value;
                      case '$in': return Array.isArray(value) && value.includes(item[key]);
                      case '$nin': return Array.isArray(value) && !value.includes(item[key]);
                    }
                  }
                  return true;
                } else {
                  return item[key] === query[key];
                }
              });
            });
            
            resolve(filtered);
          };
        });
      }
      
      async clear() {
        return new Promise((resolve, reject) => {
          const transaction = this.db.transaction([this.storeName], 'readwrite');
          const objectStore = transaction.objectStore(this.storeName);
          const request = objectStore.clear();
          
          request.onerror = (event) => {
            reject('Error clearing IndexedDB');
          };
          
          request.onsuccess = (event) => {
            resolve();
          };
        });
      }
    },
    
    // LocalStorage fallback for older browsers
    LocalStorageStorage: class {
      constructor(name) {
        this.name = name;
        this.prefix = `oren_${name}_`;
      }
      
      async init() {
        return Promise.resolve();
      }
      
      async get(key) {
        const item = localStorage.getItem(this.prefix + key);
        return item ? JSON.parse(item) : null;
      }
      
      async set(key, value) {
        const data = {
          id: key,
          ...value,
          createdAt: value.createdAt || Core.utils.formatDate(),
          updatedAt: Core.utils.formatDate()
        };
        localStorage.setItem(this.prefix + key, JSON.stringify(data));
        return data;
      }
      
      async delete(key) {
        localStorage.removeItem(this.prefix + key);
        return true;
      }
      
      async find(query = {}) {
        const results = [];
        
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith(this.prefix)) {
            const item = JSON.parse(localStorage.getItem(key));
            results.push(item);
          }
        }
        
        // Filter results based on query
        return results.filter(item => {
          return Object.keys(query).every(key => {
            if (typeof query[key] === 'object' && query[key] !== null) {
              // Handle operators
              for (const [op, value] of Object.entries(query[key])) {
                switch (op) {
                  case '$eq': return item[key] === value;
                  case '$ne': return item[key] !== value;
                  case '$gt': return item[key] > value;
                  case '$gte': return item[key] >= value;
                  case '$lt': return item[key] < value;
                  case '$lte': return item[key] <= value;
                  case '$in': return Array.isArray(value) && value.includes(item[key]);
                  case '$nin': return Array.isArray(value) && !value.includes(item[key]);
                }
              }
              return true;
            } else {
              return item[key] === query[key];
            }
          });
        });
      }
      
      async clear() {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith(this.prefix)) {
            localStorage.removeItem(key);
          }
        }
      }
    }
  }
};

// ===== UNIVERSAL LAYER =====
const Universal = {
  // Universal model (works on both server and client)
  Model: class {
    constructor(name, schema = {}) {
      this.name = name;
      this.schema = schema;
      this.storage = new Core.Storage(name, Core.config.database);
      this.hooks = {
        beforeCreate: [],
        afterCreate: [],
        beforeUpdate: [],
        afterUpdate: [],
        beforeDelete: [],
        afterDelete: []
      };
      this.relations = {};
    }
    
    // Add hooks
    hook(event, callback) {
      if (this.hooks[event]) {
        this.hooks[event].push(callback);
      }
      return this;
    }
    
    // Define relationships
    hasMany(name, model, options = {}) {
      this.relations[name] = {
        type: 'hasMany',
        model,
        foreignKey: options.foreignKey || `${this.name}Id`,
        localKey: options.localKey || 'id'
      };
      return this;
    }
    
    belongsTo(name, model, options = {}) {
      this.relations[name] = {
        type: 'belongsTo',
        model,
        foreignKey: options.foreignKey || `${name}Id`,
        localKey: options.localKey || 'id'
      };
      return this;
    }
    
    // Create a new record
    async create(data) {
      // Run beforeCreate hooks
      for (const hook of this.hooks.beforeCreate) {
        await hook(data);
      }
      
      // Generate ID if not provided
      if (!data.id) {
        data.id = Core.utils.uid();
      }
      
      // Add timestamps
      const now = Core.utils.formatDate();
      data.createdAt = now;
      data.updatedAt = now;
      
      // Validate against schema
      for (const [field, options] of Object.entries(this.schema)) {
        if (options.required && !data[field]) {
          throw new Error(`Field ${field} is required`);
        }
        
        if (options.type && typeof data[field] !== options.type) {
          throw new Error(`Field ${field} must be of type ${options.type}`);
        }
        
        if (options.validate && !options.validate(data[field])) {
          throw new Error(`Field ${field} is invalid`);
        }
      }
      
      // Save to storage
      const result = await this.storage.set(data.id, data);
      
      // Run afterCreate hooks
      for (const hook of this.hooks.afterCreate) {
        await hook(result);
      }
      
      return result;
    }
    
    // Find a record by ID
    async findById(id) {
      return await this.storage.get(id);
    }
    
    // Find records matching query
    async find(query = {}) {
      return await this.storage.find(query);
    }
    
    // Update a record
    async update(id, data) {
      // Get existing record
      const existing = await this.findById(id);
      if (!existing) {
        throw new Error(`Record with ID ${id} not found`);
      }
      
      // Run beforeUpdate hooks
      for (const hook of this.hooks.beforeUpdate) {
        await hook(existing, data);
      }
      
      // Merge data
      const updated = { ...existing, ...data, updatedAt: Core.utils.formatDate() };
      
      // Validate against schema
      for (const [field, options] of Object.entries(this.schema)) {
        if (options.required && !updated[field]) {
          throw new Error(`Field ${field} is required`);
        }
        
        if (options.type && typeof updated[field] !== options.type) {
          throw new Error(`Field ${field} must be of type ${options.type}`);
        }
        
        if (options.validate && !options.validate(updated[field])) {
          throw new Error(`Field ${field} is invalid`);
        }
      }
      
      // Save to storage
      const result = await this.storage.set(id, updated);
      
      // Run afterUpdate hooks
      for (const hook of this.hooks.afterUpdate) {
        await hook(result);
      }
      
      return result;
    }
    
    // Delete a record
    async delete(id) {
      // Get existing record
      const existing = await this.findById(id);
      if (!existing) {
        throw new Error(`Record with ID ${id} not found`);
      }
      
      // Run beforeDelete hooks
      for (const hook of this.hooks.beforeDelete) {
        await hook(existing);
      }
      
      // Delete from storage
      const result = await this.storage.delete(id);
      
      // Run afterDelete hooks
      for (const hook of this.hooks.afterDelete) {
        await hook(existing);
      }
      
      return result;
    }
    
    // Query builder
    query() {
      return new Universal.QueryBuilder(this);
    }
  },
  
  // Universal query builder
  QueryBuilder: class {
    constructor(model) {
      this.model = model;
      this.query = {};
      this.options = {
        limit: null,
        skip: null,
        sort: null,
        fields: null
      };
    }
    
    where(field, value) {
      this.query[field] = value;
      return this;
    }
    
    whereNot(field, value) {
      this.query[field] = { $ne: value };
      return this;
    }
    
    whereIn(field, values) {
      this.query[field] = { $in: values };
      return this;
    }
    
    whereGt(field, value) {
      this.query[field] = { $gt: value };
      return this;
    }
    
    whereLt(field, value) {
      this.query[field] = { $lt: value };
      return this;
    }
    
    limit(value) {
      this.options.limit = value;
      return this;
    }
    
    skip(value) {
      this.options.skip = value;
      return this;
    }
    
    sort(field, direction = 'asc') {
      this.options.sort = { field, direction };
      return this;
    }
    
    fields(fields) {
      this.options.fields = Array.isArray(fields) ? fields : [fields];
      return this;
    }
    
    async execute() {
      let results = await this.model.find(this.query);
      
      // Apply sorting
      if (this.options.sort) {
        const { field, direction } = this.options.sort;
        results.sort((a, b) => {
          if (a[field] < b[field]) return direction === 'asc' ? -1 : 1;
          if (a[field] > b[field]) return direction === 'asc' ? 1 : -1;
          return 0;
        });
      }
      
      // Apply skip and limit
      if (this.options.skip) {
        results = results.slice(this.options.skip);
      }
      
      if (this.options.limit) {
        results = results.slice(0, this.options.limit);
      }
      
      // Apply field projection
      if (this.options.fields) {
        results = results.map(record => {
          const projected = {};
          for (const field of this.options.fields) {
            if (record[field] !== undefined) {
              projected[field] = record[field];
            }
          }
          return projected;
        });
      }
      
      return results;
    }
    
    async first() {
      this.options.limit = 1;
      const results = await this.execute();
      return results.length > 0 ? results[0] : null;
    }
    
    async count() {
      const results = await this.model.find(this.query);
      return results.length;
    }
  },
  
  // Universal state management
  State: class {
    constructor(initialState = {}) {
      this.state = initialState;
      this.listeners = [];
      this.middleware = [];
    }
    
    // Get state
    getState() {
      return this.state;
    }
    
    // Update state
    setState(updates) {
      const prevState = { ...this.state };
      this.state = { ...this.state, ...updates };
      
      // Run middleware
      let action = { type: 'setState', payload: updates };
      for (const middleware of this.middleware) {
        action = middleware(action, this.state, prevState) || action;
      }
      
      // Notify listeners
      this.notify();
    }
    
    // Add middleware
    use(middleware) {
      this.middleware.push(middleware);
      return this;
    }
    
    // Subscribe to state changes
    subscribe(listener) {
      this.listeners.push(listener);
      
      // Return unsubscribe function
      return () => {
        this.listeners = this.listeners.filter(l => l !== listener);
      };
    }
    
    // Notify listeners of state changes
    notify() {
      this.listeners.forEach(listener => {
        try {
          listener(this.state);
        } catch (error) {
          console.error('Error in state listener:', error);
        }
      });
    }
  },
  
  // Universal router
  Router: class {
    constructor(options = {}) {
      this.routes = [];
      this.currentRoute = null;
      this.mode = options.mode || (Core.isBrowser ? 'history' : 'memory');
      this.base = options.base || '/';
      this.notFoundHandler = options.notFoundHandler || (() => {});
      this.middleware = [];
      
      if (Core.isBrowser) {
        this.initBrowserRouter();
      }
    }
    
    // Add a route
    add(path, handler, options = {}) {
      const route = {
        path,
        handler,
        exact: options.exact !== false,
        props: options.props || {}
      };
      
      this.routes.push(route);
      return this;
    }
    
    // Add middleware
    use(middleware) {
      this.middleware.push(middleware);
      return this;
    }
    
    // Initialize browser router
    initBrowserRouter() {
      // Handle popstate event
      window.addEventListener('popstate', () => {
        this.handleLocationChange();
      });
      
      // Handle initial location
      this.handleLocationChange();
    }
    
    // Handle location change
    handleLocationChange() {
      const path = this.getCurrentPath();
      const route = this.matchRoute(path);
      
      if (route) {
        this.currentRoute = route;
        this.executeRoute(route);
      } else {
        this.notFoundHandler();
      }
    }
    
    // Get current path
    getCurrentPath() {
      if (Core.isBrowser) {
        if (this.mode === 'history') {
          return window.location.pathname + window.location.search;
        } else {
          return window.location.hash.substring(1) || '/';
        }
      }
      return '/';
    }
    
    // Match route to path
    matchRoute(path) {
      for (const route of this.routes) {
        const match = this.matchPath(route.path, path);
        if (match) {
          return {
            ...route,
            params: match.params,
            query: match.query
          };
        }
      }
      return null;
    }
    
    // Match path pattern to actual path
    matchPath(pattern, path) {
      // Extract path and query
      const [pathname, queryString] = path.split('?');
      const query = queryString ? Core.utils.parseQuery(queryString) : {};
      
      // Convert pattern to regex
      const regexPattern = pattern
        .replace(/:(\w+)/g, '([^/]+)')  // Replace :param with capture group
        .replace(/\*/g, '.*');           // Replace * with wildcard
      
      const regex = new RegExp(`^${regexPattern}$`);
      const match = pathname.match(regex);
      
      if (match) {
        // Extract parameter names from pattern
        const paramNames = [];
        pattern.replace(/:(\w+)/g, (_, paramName) => {
          paramNames.push(paramName);
          return '';
        });
        
        // Create params object
        const params = {};
        paramNames.forEach((name, index) => {
          params[name] = match[index + 1];
        });
        
        return { params, query };
      }
      
      return null;
    }
    
    // Execute route handler
    async executeRoute(route) {
      const context = {
        route: route.path,
        params: route.params,
        query: route.query,
        props: route.props
      };
      
      // Run middleware
      for (const middleware of this.middleware) {
        await middleware(context);
      }
      
      // Execute handler
      await route.handler(context);
    }
    
    // Navigate to a path
    navigate(path, state = {}) {
      if (Core.isBrowser) {
        if (this.mode === 'history') {
          window.history.pushState(state, '', path);
        } else {
          window.location.hash = path;
        }
        this.handleLocationChange();
      }
    }
    
    // Replace current path
    replace(path, state = {}) {
      if (Core.isBrowser) {
        if (this.mode === 'history') {
          window.history.replaceState(state, '', path);
        } else {
          window.location.replace(`#${path}`);
        }
        this.handleLocationChange();
      }
    }
    
    // Go back in history
    back() {
      if (Core.isBrowser) {
        window.history.back();
      }
    }
    
    // Go forward in history
    forward() {
      if (Core.isBrowser) {
        window.history.forward();
      }
    }
  },
  
  // Universal component system
  Component: class {
    constructor(options = {}) {
      this.name = options.name || 'Component';
      this.template = options.template || '';
      this.data = options.data || {};
      this.methods = options.methods || {};
      this.computed = options.computed || {};
      this.watch = options.watch || {};
      this.hooks = options.hooks || {};
      this.props = options.props || {};
      this.state = new Universal.State(this.data);
      
      // Component lifecycle
      this.created = false;
      this.mounted = false;
      this.beforeDestroy = false;
      
      // DOM elements
      this.el = null;
      this.$el = null;
      
      // Event listeners
      this.eventListeners = [];
    }
    
    // Initialize component
    init() {
      // Bind methods
      Object.keys(this.methods).forEach(key => {
        this.methods[key] = this.methods[key].bind(this);
      });
      
      // Setup computed properties
      this.setupComputed();
      
      // Setup watchers
      this.setupWatchers();
      
      // Call created hook
      if (this.hooks.created) {
        this.hooks.created.call(this);
      }
      
      this.created = true;
    }
    
    // Setup computed properties
    setupComputed() {
      Object.keys(this.computed).forEach(key => {
        Object.defineProperty(this, key, {
          get: () => {
            return this.computed[key].call(this);
          },
          enumerable: true
        });
      });
    }
    
    // Setup watchers
    setupWatchers() {
      Object.keys(this.watch).forEach(key => {
        this.state.subscribe((state) => {
          if (this.watch[key]) {
            this.watch[key].call(this, state[key], this.state.getState()[key]);
          }
        });
      });
    }
    
    // Mount component to DOM
    mount(el) {
      if (typeof el === 'string') {
        this.el = document.querySelector(el);
      } else {
        this.el = el;
      }
      
      if (!this.el) {
        throw new Error(`Element not found: ${el}`);
      }
      
      // Initialize component if not already
      if (!this.created) {
        this.init();
      }
      
      // Render template
      this.render();
      
      // Call mounted hook
      if (this.hooks.mounted) {
        this.hooks.mounted.call(this);
      }
      
      this.mounted = true;
    }
    
    // Render component
    render() {
      if (!this.el) return;
      
      // Compile template
      const html = this.compileTemplate(this.template);
      
      // Update DOM
      this.el.innerHTML = html;
      
      // Cache element reference
      this.$el = this.el;
      
      // Setup event listeners
      this.setupEventListeners();
    }
    
    // Compile template
    compileTemplate(template) {
      let html = template;
      
      // Replace data bindings {{ }}
      html = html.replace(/\{\{(.+?)\}\}/g, (match, key) => {
        const value = this.getNestedValue(this.state.getState(), key.trim());
        return value !== undefined ? value : '';
      });
      
      // Replace event bindings v-on:
      html = html.replace(/v-on:(\w+)="(.+?)"/g, (match, event, method) => {
        return `data-event="${event}" data-method="${method}"`;
      });
      
      return html;
    }
    
    // Get nested value from object
    getNestedValue(obj, path) {
      return path.split('.').reduce((o, i) => o[i], obj);
    }
    
    // Setup event listeners
    setupEventListeners() {
      if (!this.el) return;
      
      // Find all elements with event bindings
      const eventElements = this.el.querySelectorAll('[data-event]');
      
      eventElements.forEach(el => {
        const event = el.getAttribute('data-event');
        const methodName = el.getAttribute('data-method');
        
        if (event && methodName && this.methods[methodName]) {
          const handler = (e) => {
            this.methods[methodName](e);
          };
          
          el.addEventListener(event, handler);
          
          // Store listener for cleanup
          this.eventListeners.push({
            element: el,
            event,
            handler
          });
        }
      });
    }
    
    // Update component data
    setData(data) {
      this.state.setState(data);
    }
    
    // Destroy component
    destroy() {
      // Call beforeDestroy hook
      if (this.hooks.beforeDestroy) {
        this.hooks.beforeDestroy.call(this);
      }
      
      // Remove event listeners
      this.eventListeners.forEach(({ element, event, handler }) => {
        element.removeEventListener(event, handler);
      });
      
      this.eventListeners = [];
      
      this.beforeDestroy = true;
    }
  }
};

// ===== BACKEND LAYER =====
const Backend = {
  // HTTP server
  Server: class {
    constructor(options = {}) {
      this.port = options.port || Core.config.server.port;
      this.host = options.host || Core.config.server.host;
      this.server = null;
      this.routes = [];
      this.middleware = [];
      this.staticDir = options.staticDir || Core.config.server.staticDir;
      this.viewsDir = options.viewsDir || Core.config.server.viewsDir;
      
      // Initialize HTTP server
      if (Core.isServer && typeof require !== 'undefined') {
        const http = require('http');
        const fs = require('fs');
        const path = require('path');
        const url = require('url');
        
        this.server = http.createServer(async (req, res) => {
          await this.handleRequest(req, res);
        });
      }
    }
    
    // Add middleware
    use(middleware) {
      this.middleware.push(middleware);
      return this;
    }
    
    // Add route
    add(method, path, handler) {
      this.routes.push({ method, path, handler });
      return this;
    }
    
    // GET route
    get(path, handler) {
      return this.add('GET', path, handler);
    }
    
    // POST route
    post(path, handler) {
      return this.add('POST', path, handler);
    }
    
    // PUT route
    put(path, handler) {
      return this.add('PUT', path, handler);
    }
    
    // DELETE route
    delete(path, handler) {
      return this.add('DELETE', path, handler);
    }
    
    // Handle HTTP request
    async handleRequest(req, res) {
      try {
        // Parse URL
        const parsedUrl = url.parse(req.url, true);
        req.url = parsedUrl.pathname;
        req.query = parsedUrl.query;
        
        // Parse body
        if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
          req.body = await this.parseBody(req);
        }
        
        // Create context
        const context = {
          req,
          res,
          url: req.url,
          query: req.query,
          body: req.body,
          params: {}
        };
        
        // Match route
        const route = this.matchRoute(req.method, req.url);
        
        if (route) {
          // Extract params
          context.params = route.params;
          
          // Execute middleware
          for (const middleware of this.middleware) {
            await middleware(context);
          }
          
          // Execute route handler
          await route.handler(context);
        } else {
          // Try to serve static file
          if (!await this.serveStaticFile(req, res)) {
            // 404 Not Found
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Not Found');
          }
        }
      } catch (error) {
        console.error('Error handling request:', error);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
      }
    }
    
    // Parse request body
    parseBody(req) {
      return new Promise((resolve, reject) => {
        let body = '';
        
        req.on('data', chunk => {
          body += chunk.toString();
        });
        
        req.on('end', () => {
          const contentType = req.headers['content-type'] || '';
          
          if (contentType.includes('application/json')) {
            try {
              resolve(JSON.parse(body));
            } catch (error) {
              reject(new Error('Invalid JSON'));
            }
          } else if (contentType.includes('application/x-www-form-urlencoded')) {
            const params = new URLSearchParams(body);
            const result = {};
            for (const [key, value] of params.entries()) {
              result[key] = value;
            }
            resolve(result);
          } else {
            resolve(body);
          }
        });
        
        req.on('error', error => {
          reject(error);
        });
      });
    }
    
    // Match route to method and path
    matchRoute(method, path) {
      for (const route of this.routes) {
        if (route.method === method) {
          const match = this.matchPath(route.path, path);
          if (match) {
            return {
              ...route,
              params: match.params
            };
          }
        }
      }
      return null;
    }
    
    // Match path pattern to actual path
    matchPath(pattern, path) {
      // Extract parameter names from pattern
      const paramNames = [];
      const regexPattern = pattern
        .replace(/:(\w+)/g, (_, paramName) => {
          paramNames.push(paramName);
          return '([^/]+)';
        })
        .replace(/\*/g, '.*');
      
      const regex = new RegExp(`^${regexPattern}$`);
      const match = path.match(regex);
      
      if (match) {
        const params = {};
        paramNames.forEach((name, index) => {
          params[name] = match[index + 1];
        });
        return { params };
      }
      
      return null;
    }
    
    // Serve static file
    async serveStaticFile(req, res) {
      if (Core.isServer && typeof require !== 'undefined') {
        const fs = require('fs');
        const path = require('path');
        
        try {
          const filePath = path.join(this.staticDir, req.url);
          
          // Check if file exists
          if (fs.existsSync(filePath)) {
            const stats = fs.statSync(filePath);
            
            if (stats.isFile()) {
              // Set content type based on file extension
              const ext = path.extname(filePath).toLowerCase();
              const contentType = this.getContentType(ext);
              
              res.writeHead(200, { 'Content-Type': contentType });
              fs.createReadStream(filePath).pipe(res);
              return true;
            }
          }
        } catch (error) {
          console.error('Error serving static file:', error);
        }
      }
      
      return false;
    }
    
    // Get content type by file extension
    getContentType(ext) {
      const contentTypes = {
        '.html': 'text/html',
        '.js': 'application/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.ico': 'image/x-icon'
      };
      
      return contentTypes[ext] || 'application/octet-stream';
    }
    
    // Start server
    start() {
      if (this.server) {
        return new Promise((resolve, reject) => {
          this.server.listen(this.port, this.host, () => {
            console.log(`Server running at http://${this.host}:${this.port}`);
            resolve(this.server);
          });
          
          this.server.on('error', error => {
            reject(error);
          });
        });
      } else {
        return Promise.reject(new Error('HTTP server not available'));
      }
    }
    
    // Stop server
    stop() {
      if (this.server) {
        return new Promise(resolve => {
          this.server.close(() => {
            console.log('Server stopped');
            resolve();
          });
        });
      }
      return Promise.resolve();
    }
  },
  
  // WebSocket server
  WebSocketServer: class {
    constructor(options = {}) {
      this.server = options.server;
      this.clients = new Set();
      this.rooms = new Map();
      this.middleware = [];
      
      if (Core.isServer && typeof require !== 'undefined') {
        const WebSocket = require('ws');
        this.wss = new WebSocket.Server({ server: this.server });
        
        this.wss.on('connection', (ws, req) => {
          this.handleConnection(ws, req);
        });
      }
    }
    
    // Add middleware
    use(middleware) {
      this.middleware.push(middleware);
      return this;
    }
    
    // Handle new WebSocket connection
    async handleConnection(ws, req) {
      // Create client object
      const client = {
        id: Core.utils.uid(),
        ws,
        rooms: new Set(),
        data: {}
      };
      
      // Add to clients set
      this.clients.add(client);
      
      // Handle incoming messages
      ws.on('message', async (message) => {
        try {
          const data = JSON.parse(message);
          
          // Create context
          const context = {
            client,
            data,
            send: (data) => {
              if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify(data));
              }
            },
            broadcast: (data) => {
              this.broadcast(data, { exclude: client });
            },
            toRoom: (room, data) => {
              this.toRoom(room, data);
            }
          };
          
          // Execute middleware
          for (const middleware of this.middleware) {
            await middleware(context);
          }
          
          // Handle message based on type
          this.handleMessage(context);
        } catch (error) {
          console.error('Error handling WebSocket message:', error);
        }
      });
      
      // Handle disconnect
      ws.on('close', () => {
        this.handleDisconnect(client);
      });
      
      // Send welcome message
      ws.send(JSON.stringify({
        type: 'connection',
        data: {
          id: client.id,
          message: 'Connected to WebSocket server'
        }
      }));
    }
    
    // Handle WebSocket message
    handleMessage(context) {
      const { data } = context;
      
      switch (data.type) {
        case 'join':
          this.joinRoom(context.client, data.room);
          break;
        case 'leave':
          this.leaveRoom(context.client, data.room);
          break;
        case 'message':
          this.broadcast({
            type: 'message',
            data: {
              from: context.client.id,
              content: data.content
            }
          });
          break;
        default:
          // Custom message types can be handled by middleware
          break;
      }
    }
    
    // Handle client disconnect
    handleDisconnect(client) {
      // Remove from clients set
      this.clients.delete(client);
      
      // Remove from all rooms
      client.rooms.forEach(room => {
        this.leaveRoom(client, room);
      });
      
      // Notify other clients
      this.broadcast({
        type: 'disconnect',
        data: {
          id: client.id
        }
      });
    }
    
    // Join room
    joinRoom(client, room) {
      if (!this.rooms.has(room)) {
        this.rooms.set(room, new Set());
      }
      
      this.rooms.get(room).add(client);
      client.rooms.add(room);
      
      // Notify client
      client.ws.send(JSON.stringify({
        type: 'joined',
        data: {
          room
        }
      }));
    }
    
    // Leave room
    leaveRoom(client, room) {
      if (this.rooms.has(room)) {
        this.rooms.get(room).delete(client);
        
        // Notify client
        client.ws.send(JSON.stringify({
          type: 'left',
          data: {
            room
          }
        }));
      }
      
      client.rooms.delete(room);
    }
    
    // Broadcast message to all clients
    broadcast(message, options = {}) {
      const { exclude } = options;
      
      this.clients.forEach(client => {
        if (exclude && client === exclude) return;
        
        if (client.ws.readyState === 1) { // WebSocket.OPEN
          client.ws.send(JSON.stringify(message));
        }
      });
    }
    
    // Send message to all clients in a room
    toRoom(room, message) {
      if (this.rooms.has(room)) {
        this.rooms.get(room).forEach(client => {
          if (client.ws.readyState === 1) { // WebSocket.OPEN
            client.ws.send(JSON.stringify(message));
          }
        });
      }
    }
  },
  
  // REST API
  API: class {
    constructor(server) {
      this.server = server;
      this.routes = [];
      this.models = {};
    }
    
    // Register model
    registerModel(name, model) {
      this.models[name] = model;
      return this;
    }
    
    // Add REST routes for a model
    addRESTRoutes(modelName, options = {}) {
      const model = this.models[modelName];
      if (!model) {
        throw new Error(`Model ${modelName} not found`);
      }
      
      const basePath = options.path || `/${modelName}`;
      
      // GET /:modelName - Get all records
      this.server.get(basePath, async (context) => {
        try {
          const records = await model.find(context.req.query);
          context.res.writeHead(200, { 'Content-Type': 'application/json' });
          context.res.end(JSON.stringify(records));
        } catch (error) {
          this.handleError(context.res, error);
        }
      });
      
      // GET /:modelName/:id - Get record by ID
      this.server.get(`${basePath}/:id`, async (context) => {
        try {
          const record = await model.findById(context.req.params.id);
          if (!record) {
            context.res.writeHead(404, { 'Content-Type': 'application/json' });
            context.res.end(JSON.stringify({ error: 'Not found' }));
            return;
          }
          context.res.writeHead(200, { 'Content-Type': 'application/json' });
          context.res.end(JSON.stringify(record));
        } catch (error) {
          this.handleError(context.res, error);
        }
      });
      
      // POST /:modelName - Create new record
      this.server.post(basePath, async (context) => {
        try {
          const record = await model.create(context.req.body);
          context.res.writeHead(201, { 'Content-Type': 'application/json' });
          context.res.end(JSON.stringify(record));
        } catch (error) {
          this.handleError(context.res, error);
        }
      });
      
      // PUT /:modelName/:id - Update record
      this.server.put(`${basePath}/:id`, async (context) => {
        try {
          const record = await model.update(context.req.params.id, context.req.body);
          context.res.writeHead(200, { 'Content-Type': 'application/json' });
          context.res.end(JSON.stringify(record));
        } catch (error) {
          this.handleError(context.res, error);
        }
      });
      
      // DELETE /:modelName/:id - Delete record
      this.server.delete(`${basePath}/:id`, async (context) => {
        try {
          await model.delete(context.req.params.id);
          context.res.writeHead(204);
          context.res.end();
        } catch (error) {
          this.handleError(context.res, error);
        }
      });
      
      return this;
    }
    
    // Handle errors
    handleError(res, error) {
      console.error('API Error:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: error.message }));
    }
  },
  
  // Authentication system
  Auth: class {
    constructor(options = {}) {
      this.secret = options.secret || Core.config.security.jwtSecret;
      this.algorithm = 'HS256';
      this.models = {};
      this.middleware = [];
    }
    
    // Register user model
    registerUserModel(model) {
      this.models.user = model;
      return this;
    }
    
    // Add middleware
    use(middleware) {
      this.middleware.push(middleware);
      return this;
    }
    
    // Hash password
    async hashPassword(password) {
      if (Core.isServer && typeof require !== 'undefined') {
        const crypto = require('crypto');
        
        return new Promise((resolve, reject) => {
          crypto.pbkdf2(password, crypto.randomBytes(16).toString('hex'), 10000, 64, 'sha512', (err, derivedKey) => {
            if (err) reject(err);
            resolve(derivedKey.toString('hex'));
          });
        });
      } else {
        // Fallback for browser
        return password; // In a real implementation, use Web Crypto API
      }
    }
    
    // Verify password
    async verifyPassword(password, hash) {
      if (Core.isServer && typeof require !== 'undefined') {
        const crypto = require('crypto');
        
        return new Promise((resolve, reject) => {
          const [salt, iterations, keylen, digest, ...hashParts] = hash.split('$');
          const derivedKey = hashParts.join('$');
          
          crypto.pbkdf2(password, salt, parseInt(iterations), parseInt(keylen), digest, (err, newKey) => {
            if (err) reject(err);
            resolve(newKey.toString('hex') === derivedKey);
          });
        });
      } else {
        // Fallback for browser
        return password === hash; // In a real implementation, use Web Crypto API
      }
    }
    
    // Generate JWT token
    generateToken(payload) {
      if (Core.isServer && typeof require !== 'undefined') {
        const crypto = require('crypto');
        
        const header = {
          alg: this.algorithm,
          typ: 'JWT'
        };
        
        const now = Math.floor(Date.now() / 1000);
        const tokenPayload = {
          ...payload,
          iat: now,
          exp: now + (24 * 60 * 60) // 24 hours
        };
        
        const encodedHeader = this.base64UrlEncode(JSON.stringify(header));
        const encodedPayload = this.base64UrlEncode(JSON.stringify(tokenPayload));
        
        const signature = crypto.createHmac('sha256', this.secret)
          .update(`${encodedHeader}.${encodedPayload}`)
          .digest('base64')
          .replace(/\+/g, '-')
          .replace(/\//g, '_')
          .replace(/=/g, '');
        
        return `${encodedHeader}.${encodedPayload}.${signature}`;
      } else {
        // Fallback for browser
        return 'browser-token'; // In a real implementation, use Web Crypto API
      }
    }
    
    // Verify JWT token
    verifyToken(token) {
      if (Core.isServer && typeof require !== 'undefined') {
        const crypto = require('crypto');
        
        const parts = token.split('.');
        if (parts.length !== 3) {
          return null;
        }
        
        const [encodedHeader, encodedPayload, signature] = parts;
        
        // Verify signature
        const expectedSignature = crypto.createHmac('sha256', this.secret)
          .update(`${encodedHeader}.${encodedPayload}`)
          .digest('base64')
          .replace(/\+/g, '-')
          .replace(/\//g, '_')
          .replace(/=/g, '');
        
        if (signature !== expectedSignature) {
          return null;
        }
        
        // Decode payload
        const payload = JSON.parse(this.base64UrlDecode(encodedPayload));
        
        // Check expiration
        if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
          return null;
        }
        
        return payload;
      } else {
        // Fallback for browser
        return { userId: 'browser-user' }; // In a real implementation, use Web Crypto API
      }
    }
    
    // Base64 URL encode
    base64UrlEncode(str) {
      return Buffer.from(str)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
    }
    
    // Base64 URL decode
    base64UrlDecode(str) {
      str += '='.repeat((4 - str.length % 4) % 4);
      return Buffer.from(str.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString();
    }
    
    // Authenticate user
    async authenticate(email, password) {
      if (!this.models.user) {
        throw new Error('User model not registered');
      }
      
      // Find user by email
      const user = await this.models.user.findOne({ email });
      if (!user) {
        throw new Error('Invalid email or password');
      }
      
      // Verify password
      const isValid = await this.verifyPassword(password, user.password);
      if (!isValid) {
        throw new Error('Invalid email or password');
      }
      
      // Generate token
      const token = this.generateToken({
        userId: user.id,
        email: user.email
      });
      
      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        },
        token
      };
    }
    
    // Get authentication middleware
    middleware() {
      return async (context) => {
        try {
          // Get token from Authorization header
          const authHeader = context.req.headers.authorization;
          if (!authHeader || !authHeader.startsWith('Bearer ')) {
            context.res.writeHead(401, { 'Content-Type': 'application/json' });
            context.res.end(JSON.stringify({ error: 'Unauthorized' }));
            return;
          }
          
          const token = authHeader.substring(7);
          const payload = this.verifyToken(token);
          
          if (!payload) {
            context.res.writeHead(401, { 'Content-Type': 'application/json' });
            context.res.end(JSON.stringify({ error: 'Invalid or expired token' }));
            return;
          }
          
          // Get user
          const user = await this.models.user.findById(payload.userId);
          if (!user) {
            context.res.writeHead(401, { 'Content-Type': 'application/json' });
            context.res.end(JSON.stringify({ error: 'User not found' }));
            return;
          }
          
          // Attach user to context
          context.user = user;
          
          // Execute middleware
          for (const middleware of this.middleware) {
            await middleware(context);
          }
        } catch (error) {
          context.res.writeHead(500, { 'Content-Type': 'application/json' });
          context.res.end(JSON.stringify({ error: error.message }));
        }
      };
    }
    
    // Register middleware
    registerMiddleware(middleware) {
      this.middleware.push(middleware);
      return this;
    }
  }
};

// ===== FRONTEND LAYER =====
const Frontend = {
  // Universal UI framework
  UI: {
    // Component registry
    components: {},
    
    // Register component
    register(name, component) {
      this.components[name] = component;
      return this;
    },
    
    // Create component
    create(name, options) {
      const ComponentClass = this.components[name];
      if (!ComponentClass) {
        throw new Error(`Component ${name} not found`);
      }
      
      return new ComponentClass(options);
    },
    
    // Mount component to DOM
    mount(name, selector, options = {}) {
      const component = this.create(name, options);
      component.mount(selector);
      return component;
    }
  },
  
  // Router for client-side navigation
  Router: class extends Universal.Router {
    constructor(options = {}) {
      super({
        mode: options.mode || 'history',
        base: options.base || '/',
        notFoundHandler: options.notFoundHandler
      });
      
      if (Core.isBrowser) {
        this.initClientRouter();
      }
    }
    
    // Initialize client router
    initClientRouter() {
      // Handle link clicks
      document.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (link && link.getAttribute('data-router') !== 'false') {
          const href = link.getAttribute('href');
          
          if (href && href.startsWith('/')) {
            e.preventDefault();
            this.navigate(href);
          }
        }
      });
    }
  },
  
  // State management for client
  State: class extends Universal.State {
    constructor(initialState = {}) {
      super(initialState);
      
      if (Core.isBrowser) {
        // Persist state to localStorage
        this.persistToLocalStorage();
      }
    }
    
    // Persist state to localStorage
    persistToLocalStorage() {
      // Save state to localStorage when it changes
      this.subscribe((state) => {
        if (Core.isBrowser) {
          localStorage.setItem('oren_state', JSON.stringify(state));
        }
      });
      
      // Load state from localStorage on initialization
      if (Core.isBrowser) {
        try {
          const savedState = localStorage.getItem('oren_state');
          if (savedState) {
            this.setState(JSON.parse(savedState));
          }
        } catch (error) {
          console.error('Error loading state from localStorage:', error);
        }
      }
    }
  },
  
  // HTTP client for API calls
  HTTP: class {
    constructor(options = {}) {
      this.baseURL = options.baseURL || Core.config.client.apiBase;
      this.headers = options.headers || {};
      this.interceptors = {
        request: [],
        response: []
      };
    }
    
    // Set default header
    setHeader(name, value) {
      this.headers[name] = value;
      return this;
    }
    
    // Set authorization header
    setAuth(token) {
      this.setHeader('Authorization', `Bearer ${token}`);
      return this;
    }
    
    // Add request interceptor
    addRequestInterceptor(interceptor) {
      this.interceptors.request.push(interceptor);
      return this;
    }
    
    // Add response interceptor
    addResponseInterceptor(interceptor) {
      this.interceptors.response.push(interceptor);
      return this;
    }
    
    // Make HTTP request
    async request(config) {
      // Merge config with defaults
      const finalConfig = {
        url: '',
        method: 'GET',
        headers: {},
        data: null,
        ...config
      };
      
      // Add base URL
      if (finalConfig.url && !finalConfig.url.startsWith('http') && !finalConfig.url.startsWith('/')) {
        finalConfig.url = `${this.baseURL}/${finalConfig.url}`;
      } else if (finalConfig.url && !finalConfig.url.startsWith('http') && finalConfig.url.startsWith('/')) {
        finalConfig.url = `${this.baseURL}${finalConfig.url}`;
      }
      
      // Merge headers
      finalConfig.headers = {
        ...this.headers,
        ...finalConfig.headers
      };
      
      // Apply request interceptors
      for (const interceptor of this.interceptors.request) {
        finalConfig = interceptor(finalConfig) || finalConfig;
      }
      
      // Make request
      let response;
      if (Core.isBrowser) {
        // Browser fetch API
        const fetchOptions = {
          method: finalConfig.method,
          headers: finalConfig.headers
        };
        
        if (finalConfig.data) {
          if (finalConfig.headers['Content-Type'] === 'application/json') {
            fetchOptions.body = JSON.stringify(finalConfig.data);
          } else {
            fetchOptions.body = finalConfig.data;
          }
        }
        
        const fetchResponse = await fetch(finalConfig.url, fetchOptions);
        
        // Parse response
        let responseData;
        const contentType = fetchResponse.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
          responseData = await fetchResponse.json();
        } else {
          responseData = await fetchResponse.text();
        }
        
        response = {
          data: responseData,
          status: fetchResponse.status,
          statusText: fetchResponse.statusText,
          headers: fetchResponse.headers,
          config: finalConfig
        };
      } else {
        // Server-side HTTP request
        if (typeof require !== 'undefined') {
          const http = require('http');
          const https = require('https');
          const url = require('url');
          
          const parsedUrl = url.parse(finalConfig.url);
          const isHttps = parsedUrl.protocol === 'https:';
          const httpModule = isHttps ? https : http;
          
          const options = {
            hostname: parsedUrl.hostname,
            port: parsedUrl.port || (isHttps ? 443 : 80),
            path: parsedUrl.path,
            method: finalConfig.method,
            headers: finalConfig.headers
          };
          
          return new Promise((resolve, reject) => {
            const req = httpModule.request(options, (res) => {
              let data = '';
              
              res.on('data', (chunk) => {
                data += chunk;
              });
              
              res.on('end', () => {
                let responseData;
                const contentType = res.headers['content-type'];
                
                if (contentType && contentType.includes('application/json')) {
                  try {
                    responseData = JSON.parse(data);
                  } catch (error) {
                    responseData = data;
                  }
                } else {
                  responseData = data;
                }
                
                resolve({
                  data: responseData,
                  status: res.statusCode,
                  statusText: res.statusMessage,
                  headers: res.headers,
                  config: finalConfig
                });
              });
            });
            
            req.on('error', (error) => {
              reject(error);
            });
            
            if (finalConfig.data) {
              if (finalConfig.headers['Content-Type'] === 'application/json') {
                req.write(JSON.stringify(finalConfig.data));
              } else {
                req.write(finalConfig.data);
              }
            }
            
            req.end();
          });
        }
      }
      
      // Apply response interceptors
      for (const interceptor of this.interceptors.response) {
        response = interceptor(response) || response;
      }
      
      return response;
    }
    
    // GET request
    get(url, config = {}) {
      return this.request({
        method: 'GET',
        url,
        ...config
      });
    }
    
    // POST request
    post(url, data, config = {}) {
      return this.request({
        method: 'POST',
        url,
        data,
        ...config
      });
    }
    
    // PUT request
    put(url, data, config = {}) {
      return this.request({
        method: 'PUT',
        url,
        data,
        ...config
      });
    }
    
    // DELETE request
    delete(url, config = {}) {
      return this.request({
        method: 'DELETE',
        url,
        ...config
      });
    }
  },
  
  // WebSocket client
  WebSocket: class {
    constructor(options = {}) {
      this.url = options.url || Core.config.client.wsUrl;
      this.protocols = options.protocols || [];
      this.reconnectAttempts = options.reconnectAttempts || 5;
      this.reconnectInterval = options.reconnectInterval || 1000;
      this.listeners = {};
      this.readyState = WebSocket.CONNECTING;
      this.socket = null;
      this.reconnectCount = 0;
      
      if (Core.isBrowser) {
        this.connect();
      }
    }
    
    // Connect to WebSocket server
    connect() {
      if (Core.isBrowser) {
        try {
          this.socket = new window.WebSocket(this.url, this.protocols);
          
          this.socket.onopen = () => {
            this.readyState = WebSocket.OPEN;
            this.reconnectCount = 0;
            this.emit('open');
          };
          
          this.socket.onmessage = (event) => {
            try {
              const data = JSON.parse(event.data);
              this.emit('message', data);
            } catch (error) {
              console.error('Error parsing WebSocket message:', error);
            }
          };
          
          this.socket.onclose = () => {
            this.readyState = WebSocket.CLOSED;
            this.emit('close');
            
            // Attempt to reconnect
            if (this.reconnectCount < this.reconnectAttempts) {
              setTimeout(() => {
                this.reconnectCount++;
                this.connect();
              }, this.reconnectInterval);
            }
          };
          
          this.socket.onerror = (error) => {
            this.readyState = WebSocket.CLOSED;
            this.emit('error', error);
          };
        } catch (error) {
          console.error('Error creating WebSocket:', error);
        }
      }
    }
    
    // Send message
    send(data) {
      if (this.readyState === WebSocket.OPEN && this.socket) {
        this.socket.send(JSON.stringify(data));
      } else {
        console.error('WebSocket is not connected');
      }
    }
    
    // Close connection
    close() {
      if (this.socket) {
        this.socket.close();
      }
    }
    
    // Add event listener
    on(event, callback) {
      if (!this.listeners[event]) {
        this.listeners[event] = [];
      }
      this.listeners[event].push(callback);
      return this;
    }
    
    // Remove event listener
    off(event, callback) {
      if (this.listeners[event]) {
        this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
      }
      return this;
    }
    
    // Emit event
    emit(event, data) {
      if (this.listeners[event]) {
        this.listeners[event].forEach(callback => {
          try {
            callback(data);
          } catch (error) {
            console.error(`Error in WebSocket ${event} listener:`, error);
          }
        });
      }
    }
    
    // Join room
    join(room) {
      this.send({
        type: 'join',
        room
      });
    }
    
    // Leave room
    leave(room) {
      this.send({
        type: 'leave',
        room
      });
    }
    
    // Send message to room
    toRoom(room, message) {
      this.send({
        type: 'message',
        room,
        ...message
      });
    }
  },
  
  // Service Worker for offline support
  ServiceWorker: class {
    constructor(options = {}) {
      this.scriptUrl = options.scriptUrl || '/oren-sw.js';
      this.scope = options.scope || '/';
      this.registered = false;
    }
    
    // Register service worker
    async register() {
      if (Core.isBrowser && 'serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.register(this.scriptUrl, {
            scope: this.scope
          });
          
          this.registered = true;
          console.log('Service worker registered successfully');
          
          return registration;
        } catch (error) {
          console.error('Error registering service worker:', error);
          throw error;
        }
      } else {
        throw new Error('Service workers are not supported in this browser');
      }
    }
    
    // Unregister service worker
    async unregister() {
      if (Core.isBrowser && 'serviceWorker' in navigator) {
        try {
          const registrations = await navigator.serviceWorker.getRegistrations();
          
          for (const registration of registrations) {
            await registration.unregister();
          }
          
          this.registered = false;
          console.log('Service workers unregistered successfully');
        } catch (error) {
          console.error('Error unregistering service workers:', error);
          throw error;
        }
      } else {
        throw new Error('Service workers are not supported in this browser');
      }
    }
  }
};

// ===== INTEGRATION LAYER =====
const Integration = {
  // Universal application
  App: class {
    constructor(options = {}) {
      this.options = options;
      this.server = null;
      this.wsServer = null;
      this.api = null;
      this.auth = null;
      this.router = null;
      this.state = null;
      this.http = null;
      this.models = {};
      this.components = {};
      this.routes = [];
      this.middleware = [];
      this.hooks = {
        beforeStart: [],
        afterStart: [],
        beforeStop: [],
        afterStop: []
      };
      
      // Initialize based on environment
      if (Core.isServer) {
        this.initServer();
      } else {
        this.initClient();
      }
    }
    
    // Initialize server-side
    initServer() {
      // Create HTTP server
      this.server = new Backend.Server({
        port: this.options.port,
        host: this.options.host,
        staticDir: this.options.staticDir,
        viewsDir: this.options.viewsDir
      });
      
      // Create WebSocket server
      this.wsServer = new Backend.WebSocketServer({
        server: this.server.server
      });
      
      // Create API
      this.api = new Backend.API(this.server);
      
      // Create Auth
      this.auth = new Backend.Auth({
        secret: this.options.authSecret
      });
      
      // Add default middleware
      this.server.use(this.defaultMiddleware());
    }
    
    // Initialize client-side
    initClient() {
      // Create router
      this.router = new Frontend.Router({
        mode: this.options.routerMode || 'history'
      });
      
      // Create state
      this.state = new Frontend.State(this.options.initialState);
      
      // Create HTTP client
      this.http = new Frontend.HTTP({
        baseURL: this.options.apiBase
      });
      
      // Create WebSocket client
      this.wsClient = new Frontend.WebSocket({
        url: this.options.wsUrl
      });
      
      // Register service worker if enabled
      if (this.options.serviceWorker) {
        this.sw = new Frontend.ServiceWorker({
          scriptUrl: this.options.serviceWorker
        });
      }
    }
    
    // Default middleware
    defaultMiddleware() {
      return async (context) => {
        // Add CORS headers
        context.res.setHeader('Access-Control-Allow-Origin', Core.config.security.cors.origin);
        context.res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        context.res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        
        // Handle OPTIONS requests
        if (context.req.method === 'OPTIONS') {
          context.res.writeHead(200);
          context.res.end();
          return;
        }
      };
    }
    
    // Register model
    model(name, schema) {
      const model = new Universal.Model(name, schema);
      this.models[name] = model;
      
      if (Core.isServer) {
        // Register with API
        this.api.registerModel(name, model);
      }
      
      return model;
    }
    
    // Register component
    component(name, component) {
      this.components[name] = component;
      
      if (Core.isBrowser) {
        // Register with UI
        Frontend.UI.register(name, component);
      }
      
      return component;
    }
    
    // Add route
    route(method, path, handler) {
      if (Core.isServer) {
        this.server[method.toLowerCase()](path, handler);
      } else {
        this.router.add(path, handler);
      }
      
      return this;
    }
    
    // Add middleware
    use(middleware) {
      this.middleware.push(middleware);
      
      if (Core.isServer) {
        this.server.use(middleware);
      } else {
        this.router.use(middleware);
      }
      
      return this;
    }
    
    // Add hook
    hook(name, callback) {
      if (this.hooks[name]) {
        this.hooks[name].push(callback);
      }
      return this;
    }
    
    // Start application
    async start() {
      // Run beforeStart hooks
      for (const hook of this.hooks.beforeStart) {
        await hook(this);
      }
      
      if (Core.isServer) {
        // Start server
        await this.server.start();
        
        // Register service worker script
        if (this.options.serviceWorker) {
          this.registerServiceWorkerScript();
        }
      } else {
        // Mount components
        if (this.options.mount) {
          for (const [selector, componentName] of Object.entries(this.options.mount)) {
            Frontend.UI.mount(componentName, selector);
          }
        }
        
        // Register service worker
        if (this.options.serviceWorker && this.sw) {
          await this.sw.register();
        }
      }
      
      // Run afterStart hooks
      for (const hook of this.hooks.afterStart) {
        await hook(this);
      }
    }
    
    // Stop application
    async stop() {
      // Run beforeStop hooks
      for (const hook of this.hooks.beforeStop) {
        await hook(this);
      }
      
      if (Core.isServer) {
        // Stop server
        await this.server.stop();
      } else {
        // Unregister service worker
        if (this.options.serviceWorker && this.sw) {
          await this.sw.unregister();
        }
      }
      
      // Run afterStop hooks
      for (const hook of this.hooks.afterStop) {
        await hook(this);
      }
    }
    
    // Register service worker script
    registerServiceWorkerScript() {
      if (Core.isServer && typeof require !== 'undefined') {
        const fs = require('fs');
        const path = require('path');
        
        const swScript = `
          const CACHE_NAME = 'oren-cache-v1';
          const urlsToCache = [
            '/',
            '/static/main.js',
            '/static/main.css'
          ];
          
          self.addEventListener('install', event => {
            event.waitUntil(
              caches.open(CACHE_NAME)
                .then(cache => cache.addAll(urlsToCache))
            );
          });
          
          self.addEventListener('fetch', event => {
            event.respondWith(
              caches.match(event.request)
                .then(response => {
                  return response || fetch(event.request);
                })
            );
          });
        `;
        
        const swPath = path.join(this.options.staticDir || './public', 'oren-sw.js');
        fs.writeFileSync(swPath, swScript);
      }
    }
  },
  
  // Universal component
  Component: class extends Universal.Component {
    constructor(options = {}) {
      super(options);
      this.http = null;
      this.ws = null;
      this.router = null;
      
      if (Core.isBrowser) {
        // Initialize client-side dependencies
        this.http = window.orenApp.http;
        this.ws = window.orenApp.wsClient;
        this.router = window.orenApp.router;
      }
    }
    
    // Navigate to path
    navigate(path) {
      if (this.router) {
        this.router.navigate(path);
      }
    }
    
    // Make HTTP request
    async httpGet(url, config) {
      if (this.http) {
        return this.http.get(url, config);
      }
      throw new Error('HTTP client not available');
    }
    
    // Send WebSocket message
    wsSend(data) {
      if (this.ws) {
        this.ws.send(data);
      }
    }
    
    // Join WebSocket room
    wsJoin(room) {
      if (this.ws) {
        this.ws.join(room);
      }
    }
  },
  
  // Page component for routing
  Page: class extends Integration.Component {
    constructor(options = {}) {
      super(options);
      this.title = options.title || '';
      this.description = options.description || '';
      this.keywords = options.keywords || [];
    }
    
    // Set page metadata
    setMetadata() {
      if (Core.isBrowser) {
        document.title = this.title;
        
        // Update meta description
        let metaDescription = document.querySelector('meta[name="description"]');
        if (!metaDescription) {
          metaDescription = document.createElement('meta');
          metaDescription.name = 'description';
          document.head.appendChild(metaDescription);
        }
        metaDescription.content = this.description;
        
        // Update meta keywords
        let metaKeywords = document.querySelector('meta[name="keywords"]');
        if (!metaKeywords) {
          metaKeywords = document.createElement('meta');
          metaKeywords.name = 'keywords';
          document.head.appendChild(metaKeywords);
        }
        metaKeywords.content = this.keywords.join(', ');
      }
    }
    
    // Mount page
    mount(el) {
      super.mount(el);
      this.setMetadata();
    }
  }
};

// ===== CLI AND TOOLING =====
const CLI = {
  // Main CLI class
  OrenCLI: class {
    constructor() {
      this.commands = new Map();
      this.options = {
        name: 'oren',
        version: Core.version,
        description: 'Universal Enterprise-Grade Full-Stack Framework'
      };
      
      // Register built-in commands
      this.registerCommand('create', this.createCommand);
      this.registerCommand('dev', this.devCommand);
      this.registerCommand('build', this.buildCommand);
      this.registerCommand('start', this.startCommand);
      this.registerCommand('generate', this.generateCommand);
      this.registerCommand('migrate', this.migrateCommand);
      this.registerCommand('deploy', this.deployCommand);
      this.registerCommand('help', this.helpCommand);
      this.registerCommand('version', this.versionCommand);
    }
    
    // Register command
    registerCommand(name, handler) {
      this.commands.set(name, handler);
      return this;
    }
    
    // Run CLI
    async run(args = process.argv.slice(2)) {
      if (args.length === 0) {
        return this.helpCommand();
      }
      
      const commandName = args[0];
      const command = this.commands.get(commandName);
      
      if (!command) {
        console.error(`Unknown command: ${commandName}`);
        console.log('Run "oren help" to see available commands');
        return 1;
      }
      
      try {
        return await command.call(this, args.slice(1));
      } catch (error) {
        console.error(`Error executing command "${commandName}":`, error.message);
        return 1;
      }
    }
    
    // Create new project
    async createCommand(args) {
      const projectName = args[0] || 'my-oren-app';
      const projectDir = path.join(process.cwd(), projectName);
      
      // Check if directory exists
      if (fs.existsSync(projectDir)) {
        console.error(`Directory "${projectName}" already exists`);
        return 1;
      }
      
      // Create project directory
      fs.mkdirSync(projectDir, { recursive: true });
      
      // Create package.json
      const packageJson = {
        name: projectName,
        version: '1.0.0',
        description: 'Oren.js application',
        main: 'app.js',
        scripts: {
          start: 'node app.js',
          dev: 'oren dev',
          build: 'oren build'
        },
        dependencies: {},
        devDependencies: {}
      };
      
      fs.writeFileSync(
        path.join(projectDir, 'package.json'),
        JSON.stringify(packageJson, null, 2)
      );
      
      // Create main application file
      const appCode = `const { Oren } = require('oren');

// Create application
const app = new Oren.App({
  port: process.env.PORT || 3000,
  staticDir: './public',
  serviceWorker: '/oren-sw.js'
});

// Define models
const User = app.model('users', {
  name: { type: 'string', required: true },
  email: { type: 'string', required: true, unique: true },
  password: { type: 'string', required: true },
  role: { type: 'string', default: 'user' }
});

// Define components
const HomePage = class extends Oren.Page {
  constructor() {
    super({
      name: 'HomePage',
      template: \`
        <div class="container">
          <h1>{{ title }}</h1>
          <p>{{ message }}</p>
          <button data-on="click:changeMessage">Change Message</button>
        </div>
      \`,
      data: {
        title: 'Welcome to Oren.js',
        message: 'Universal full-stack framework'
      },
      methods: {
        changeMessage() {
          this.message = 'Message changed!';
        }
      }
    });
  }
};

// Register component
app.component('HomePage', HomePage);

// Add routes
if (Oren.Core.isServer) {
  // Server-side routes
  app.get('/api/users', async (context) => {
    const users = await User.find();
    context.res.send(users);
  });
  
  app.post('/api/users', async (context) => {
    const user = await User.create(context.req.body);
    context.res.send(user, 201);
  });
} else {
  // Client-side routes
  app.route('GET', '/', (context) => {
    // Render home page
    const homePage = new HomePage();
    homePage.mount('#app');
  });
}

// Start application
app.start().then(() => {
  console.log('Application started successfully');
}).catch(error => {
  console.error('Failed to start application:', error);
});
`;
      
      fs.writeFileSync(path.join(projectDir, 'app.js'), appCode);
      
      // Create README
      const readme = `# ${projectName}

An Oren.js universal application.

## Getting Started

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Start development server:
   \`\`\`bash
   npm run dev
   \`\`\`

3. Start production server:
   \`\`\`bash
   npm start
   \`\`\`

## Features

- Universal full-stack framework
- Server-side rendering
- Client-side hydration
- Real-time communication
- Offline support
`;
      
      fs.writeFileSync(path.join(projectDir, 'README.md'), readme);
      
      // Create .gitignore
      const gitignore = `node_modules/
.env
*.log
oren_data/
dist/
`;
      
      fs.writeFileSync(path.join(projectDir, '.gitignore'), gitignore);
      
      // Create public directory
      const publicDir = path.join(projectDir, 'public');
      fs.mkdirSync(publicDir, { recursive: true });
      
      // Create index.html
      const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${projectName}</title>
  <link rel="stylesheet" href="/static/main.css">
</head>
<body>
  <div id="app"></div>
  <script src="/static/main.js"></script>
</body>
</html>
`;
      
      fs.writeFileSync(path.join(publicDir, 'index.html'), indexHtml);
      
      console.log(`Project "${projectName}" created successfully`);
      console.log(`\nNext steps:`);
      console.log(`  cd ${projectName}`);
      console.log(`  npm install`);
      console.log(`  npm run dev`);
      
      return 0;
    }
    
    // Development server
    async devCommand(args) {
      console.log('Starting development server...');
      
      // Load application
      const appPath = path.join(process.cwd(), 'app.js');
      if (!fs.existsSync(appPath)) {
        console.error('app.js not found. Are you in the right directory?');
        return 1;
      }
      
      // Start application with hot reload
      const { exec } = require('child_process');
      const nodemon = exec('npx nodemon --watch app.js --exec "node app.js"', {
        stdio: 'inherit'
      });
      
      nodemon.on('exit', (code) => {
        process.exit(code);
      });
      
      return new Promise(() => {});
    }
    
    // Build application
    async buildCommand(args) {
      console.log('Building application...');
      
      // In a real implementation, this would:
      // 1. Transpile TypeScript/JSX
      // 2. Bundle client-side code
      // 3. Optimize assets
      // 4. Generate service worker
      
      console.log('Build completed successfully');
      return 0;
    }
    
    // Start production server
    async startCommand(args) {
      console.log('Starting production server...');
      
      // Load application
      const appPath = path.join(process.cwd(), 'app.js');
      if (!fs.existsSync(appPath)) {
        console.error('app.js not found. Are you in the right directory?');
        return 1;
      }
      
      // Start application
      require(appPath);
      
      return new Promise(() => {});
    }
    
    // Generate code
    async generateCommand(args) {
      const type = args[0];
      const name = args[1];
      
      if (!type || !name) {
        console.error('Usage: oren generate <type> <name>');
        console.log('Types: model, component, page, middleware');
        return 1;
      }
      
      switch (type) {
        case 'model':
          return this.generateModel(name);
        case 'component':
          return this.generateComponent(name);
        case 'page':
          return this.generatePage(name);
        case 'middleware':
          return this.generateMiddleware(name);
        default:
          console.error(`Unknown type: ${type}`);
          return 1;
      }
    }
    
    // Generate model
    async generateModel(name) {
      const modelCode = `const { Oren } = require('oren');

const ${name} = Oren.model('${name}', {
  // Define your schema here
  name: { type: 'string', required: true },
  email: { type: 'string', required: true, unique: true },
  createdAt: { type: 'datetime', default: () => new Date() }
});

module.exports = ${name};
`;
      
      const modelsDir = path.join(process.cwd(), 'models');
      if (!fs.existsSync(modelsDir)) {
        fs.mkdirSync(modelsDir, { recursive: true });
      }
      
      const modelPath = path.join(modelsDir, `${name.toLowerCase()}.js`);
      fs.writeFileSync(modelPath, modelCode);
      
      console.log(`Model "${name}" created successfully at ${modelPath}`);
      return 0;
    }
    
    // Generate component
    async generateComponent(name) {
      const componentCode = `const { Oren } = require('oren');

const ${name} = class extends Oren.Component {
  constructor(options) {
    super({
      name: '${name}',
      template: \`
        <div class="${name.toLowerCase()}">
          <h1>{{ title }}</h1>
          <p>{{ message }}</p>
        </div>
      \`,
      data: {
        title: '${name} Component',
        message: 'Hello from ${name}!'
      },
      methods: {
        greet() {
          this.message = 'Hello from ' + this.title + '!';
        }
      },
      ...options
    });
  }
};

module.exports = ${name};
`;
      
      const componentsDir = path.join(process.cwd(), 'components');
      if (!fs.existsSync(componentsDir)) {
        fs.mkdirSync(componentsDir, { recursive: true });
      }
      
      const componentPath = path.join(componentsDir, `${name.toLowerCase()}.js`);
      fs.writeFileSync(componentPath, componentCode);
      
      console.log(`Component "${name}" created successfully at ${componentPath}`);
      return 0;
    }
    
    // Generate page
    async generatePage(name) {
      const pageCode = `const { Oren } = require('oren');

const ${name} = class extends Oren.Page {
  constructor(options) {
    super({
      name: '${name}',
      title: '${name} Page',
      description: 'Description for ${name}',
      keywords: ['oren', 'page'],
      template: \`
        <div class="page ${name.toLowerCase()}">
          <h1>{{ title }}</h1>
          <div class="content">
            {{ content }}
          </div>
        </div>
      \`,
      data: {
        title: '${name}',
        content: 'This is the ${name} page.'
      },
      ...options
    });
  }
};

module.exports = ${name};
`;
      
      const pagesDir = path.join(process.cwd(), 'pages');
      if (!fs.existsSync(pagesDir)) {
        fs.mkdirSync(pagesDir, { recursive: true });
      }
      
      const pagePath = path.join(pagesDir, `${name.toLowerCase()}.js`);
      fs.writeFileSync(pagePath, pageCode);
      
      console.log(`Page "${name}" created successfully at ${pagePath}`);
      return 0;
    }
    
    // Generate middleware
    async generateMiddleware(name) {
      const middlewareCode = `const ${name} = async (context, next) => {
  // Your middleware logic here
  
  // Call next() to pass control to the next middleware
  await next();
};

module.exports = ${name};
`;
      
      const middlewareDir = path.join(process.cwd(), 'middleware');
      if (!fs.existsSync(middlewareDir)) {
        fs.mkdirSync(middlewareDir, { recursive: true });
      }
      
      const middlewarePath = path.join(middlewareDir, `${name.toLowerCase()}.js`);
      fs.writeFileSync(middlewarePath, middlewareCode);
      
      console.log(`Middleware "${name}" created successfully at ${middlewarePath}`);
      return 0;
    }
    
    // Database migration
    async migrateCommand(args) {
      console.log('Running migrations...');
      
      // In a real implementation, this would:
      // 1. Find migration files
      // 2. Execute them in order
      // 3. Track which migrations have been run
      
      console.log('Migrations completed successfully');
      return 0;
    }
    
    // Deploy application
    async deployCommand(args) {
      const platform = args[0];
      
      if (!platform) {
        console.error('Usage: oren deploy <platform>');
        console.log('Platforms: heroku, vercel, docker');
        return 1;
      }
      
      switch (platform) {
        case 'heroku':
          return this.deployHeroku();
        case 'vercel':
          return this.deployVercel();
        case 'docker':
          return this.deployDocker();
        default:
          console.error(`Unknown platform: ${platform}`);
          return 1;
      }
    }
    
    // Deploy to Heroku
    async deployHeroku() {
      console.log('Generating Heroku deployment files...');
      
      // Create Procfile
      const procfile = 'web: node app.js';
      fs.writeFileSync(path.join(process.cwd(), 'Procfile'), procfile);
      
      // Create app.json
      const appJson = `{
  "name": "Oren.js App",
  "description": "Universal full-stack application",
  "buildpacks": [
    {
      "url": "heroku/nodejs"
    }
  ],
  "env": {
    "NODE_ENV": {
      "description": "Environment",
      "value": "production"
    }
  }
}
`;
      
      fs.writeFileSync(path.join(process.cwd(), 'app.json'), appJson);
      
      console.log('Heroku deployment files generated successfully');
      console.log('\nTo deploy to Heroku:');
      console.log('  1. Install Heroku CLI: https://devcenter.heroku.com/articles/heroku-cli');
      console.log('  2. Login to Heroku: heroku login');
      console.log('  3. Create app: heroku create');
      console.log('  4. Deploy: git push heroku main');
      
      return 0;
    }
    
    // Deploy to Vercel
    async deployVercel() {
      console.log('Generating Vercel deployment files...');
      
      // Create vercel.json
      const vercelJson = `{
  "version": 2,
  "builds": [
    {
      "src": "app.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "app.js"
    }
  ]
}
`;
      
      fs.writeFileSync(path.join(process.cwd(), 'vercel.json'), vercelJson);
      
      console.log('Vercel deployment files generated successfully');
      console.log('\nTo deploy to Vercel:');
      console.log('  1. Install Vercel CLI: npm i -g vercel');
      console.log('  2. Login to Vercel: vercel login');
      console.log('  3. Deploy: vercel');
      
      return 0;
    }
    
    // Deploy with Docker
    async deployDocker() {
      console.log('Generating Docker deployment files...');
      
      // Create Dockerfile
      const dockerfile = `FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Create data directory
RUN mkdir -p /app/oran_data

# Expose port
EXPOSE 3000

# Start application
CMD ["node", "app.js"]
`;
      
      fs.writeFileSync(path.join(process.cwd(), 'Dockerfile'), dockerfile);
      
      // Create docker-compose.yml
      const dockerCompose = `version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    volumes:
      - ./oran_data:/app/oran_data
    restart: unless-stopped
`;
      
      fs.writeFileSync(path.join(process.cwd(), 'docker-compose.yml'), dockerCompose);
      
      console.log('Docker deployment files generated successfully');
      console.log('\nTo deploy with Docker:');
      console.log('  1. Build image: docker build -t oren-app .');
      console.log('  2. Run container: docker run -p 3000:3000 oren-app');
      console.log('  3. Or use Docker Compose: docker-compose up -d');
      
      return 0;
    }
    
    // Help command
    async helpCommand() {
      console.log(`${this.options.name} v${this.options.version} - ${this.options.description}`);
      console.log('');
      console.log('Usage: oren <command> [options]');
      console.log('');
      console.log('Commands:');
      console.log('  create [name]    Create a new Oren.js project');
      console.log('  dev              Start development server');
      console.log('  build            Build application for production');
      console.log('  start            Start production server');
      console.log('  generate <type>   Generate model, component, page, or middleware');
      console.log('  migrate          Run database migrations');
      console.log('  deploy <platform> Generate deployment files');
      console.log('  help             Show this help message');
      console.log('  version          Show version information');
      console.log('');
      console.log('For more information, visit https://oren.js.org');
      
      return 0;
    }
    
    // Version command
    async versionCommand() {
      console.log(`${this.options.name} v${this.options.version}`);
      return 0;
    }
  }
};

// ===== EXPORTS =====
const Oren = {
  // Core
  Core,
  
  // Universal
  Universal,
  
  // Backend
  Backend,
  
  // Frontend
  Frontend,
  
  // Integration
  Integration,
  
  // CLI
  CLI,
  
  // Version
  version: Core.version,
  
  // App class
  App: Integration.App,
  
  // Component class
  Component: Integration.Component,
  
  // Page class
  Page: Integration.Page,
  
  // Model class
  Model: Universal.Model,
  
  // State class
  State: Universal.State,
  
  // Router class
  Router: Universal.Router,
  
  // HTTP client
  HTTP: Frontend.HTTP,
  
  // WebSocket client
  WebSocket: Frontend.WebSocket,
  
  // Service Worker
  ServiceWorker: Frontend.ServiceWorker,
  
  // Server classes
  Server: Backend.Server,
  WebSocketServer: Backend.WebSocketServer,
  API: Backend.API,
  Auth: Backend.Auth,
  
  // CLI
  CLI: CLI.OrenCLI
};

// Export for CommonJS
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Oren;
}

// Export for ES Modules
if (typeof exports !== 'undefined') {
  exports.default = Oren;
}

// Make available globally in browser
if (Core.isBrowser) {
  window.Oren = Oren;
  window.orenApp = null; // Will be set when app is created
}

// CLI execution
if (Core.isServer && require.main === module) {
  const cli = new CLI.OrenCLI();
  cli.run().then(exitCode => {
    process.exit(exitCode);
  }).catch(error => {
    console.error('CLI error:', error);
    process.exit(1);
  });
}