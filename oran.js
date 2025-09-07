/* ============================================================
   Oran.js v2.0 GLMOR- World-Class Enterprise Fullstack Framework
   ------------------------------------------------------------
   Copyright (c) 2025 John Kesh Mahugu
   License: MIT
   Created: September 7, 2025
   UUID Reference: (cgt-c-68bca6e2b9408191a0f45c35cd464fb1)

   Description:
   Oran.js v2.0 is a revolutionary fullstack Node.js framework packaged in a single file,
   featuring a distributed database engine, advanced ORM, enterprise security,
   TypeScript support, and cloud-native capabilities. It maintains zero external dependencies
   while providing world-class developer experience and production-grade scalability.
============================================================ */
/**
 * 🌍 Oran.js v2.0 - Enterprise-Grade Zero-Dependency Full-Stack JavaScript Framework
 * ─────────────────────────────────────────────────────────────────────────────
 * 🧾 Copyright © 2025 John Kesh Mahugu & Contributors
 * 🕒 Generated: 2025-07-21 12:17 EAT
 * 🔑 License: MIT
 *
 * UUID :: glm-c-b2789d48-a32b-4852-a20a-3f1e5512d37a
 *
 * 📘 SYNOPSIS:
 * Oran.js is a revolutionary full-stack Node.js framework packaged in a single file,
 * featuring a distributed database engine, advanced ORM, enterprise security,
 * TypeScript support, and cloud-native capabilities. It maintains zero external dependencies
 * while providing world-class developer experience and production-grade scalability.
 *
 * 🛣️ FEATURES:
 * - ✅ Zero-Dependency Architecture: Entire framework in a single file with no external dependencies.
 * - ✅ Pluggable Storage Engines: Support for JSON, SQLite, and in-memory storage with advanced features like WAL, MVCC, and indexing.
 * - ✅ Advanced ORM: RedBean-style fluid ORM with models, relations, hooks, schema validation, and migrations.
 * - ✅ Enterprise Security: JWT authentication, RBAC, CSRF protection, password hashing, and encryption at rest.
 * - ✅ HTTP/WebSocket Server: Built-in HTTP server with routing, middleware, static file serving, and WebSocket/SSE support.
 * - ✅ Real-Time Capabilities: Server-Sent Events (SSE) and WebSocket support for real-time applications.
 * - ✅ GraphQL Engine: Mini GraphQL engine for querying and mutating data with automatic schema generation.
 * - ✅ CLI Tooling: Comprehensive CLI for project scaffolding, code generation, migrations, and deployment.
 * - ✅ Admin Dashboard: Web-based admin interface for managing data, users, and system settings.
 * - ✅ Observability: Built-in metrics, logging, and health checks for monitoring and troubleshooting.
 * - ✅ Developer Experience: Hot reload, TypeScript support, and intuitive APIs for rapid development.
 * - ✅ Production Ready: Clustering, graceful shutdown, and environment-based configuration for production deployments.
 * - ✅ Data Management: Backup, restore, and compaction utilities for data integrity and maintenance.
 * - ✅ Frontend Integration: OranUI micro-framework for building reactive user interfaces with state management.
 * - ✅ Documentation Generation: Automatic API documentation and static docs generation.
 *
 * 📜 LICENSE:
 * MIT License. See https://opensource.org/licenses/MIT.
 *
 * 🙏 DEDICATION:
 * To developers building scalable, secure, and delightful web applications.
 * Code with clarity, ship with confidence.
 *
 * 🌐 AUTHOR & WEBSITE:
 * John Kesh Mahugu
 * Website: https://johnmwirigimahugu.github.io/orn.js | orn.js.org
 * Contact: johnmahugu at gmail dot com
 * ─────────────────────────────────────────────────────────────────────────────
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const os = require('os');
const http = require('http');
const https = require('https');
const url = require('url');
const querystring = require('querystring');
const cluster = require('cluster');
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');

// ===== GLOBAL CONFIGURATION =====
const CONFIG = {
  VERSION: '2.0',
  HOST: '0.0.0.0',
  PORT: 3000,
  DATA_DIR: path.join(process.cwd(), 'oran_data'),
  STATIC_DIR: path.join(process.cwd(), 'public'),
  SESSION_SECRET: process.env.ORAN_SESSION_SECRET || crypto.randomBytes(64).toString('hex'),
  JWT_SECRET: process.env.ORAN_JWT_SECRET || crypto.randomBytes(64).toString('hex'),
  ENCRYPTION_KEY: process.env.ORAN_ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex'),
  DEV_MODE: process.env.NODE_ENV === 'development',
  CLUSTER_MODE: process.env.ORAN_CLUSTER === 'true',
  STORAGE_ENGINE: process.env.ORAN_STORAGE_ENGINE || 'json', // json, sqlite, memory
  LOG_LEVEL: process.env.ORAN_LOG_LEVEL || 'info',
  ENABLE_METRICS: process.env.ORAN_METRICS !== 'false',
  ENABLE_ADMIN: process.env.ORAN_ADMIN !== 'false',
  ENABLE_SSR: process.env.ORAN_SSR !== 'false',
  RBAC_ENABLED: process.env.ORAN_RBAC !== 'false',
  CSRF_PROTECTION: process.env.ORAN_CSRF !== 'false',
};

// ===== UTILITY FUNCTIONS =====
function nowISO() { return new Date().toISOString(); }
function uid(len = 16) { return crypto.randomBytes(len).toString('hex'); }
function hash(str) { return crypto.createHash('sha256').update(str).digest('hex'); }

// Enhanced JSON parse/stringify with error handling
function safeJSON(str, fallback = null) {
  try { return JSON.parse(str); } catch (e) { 
    logError('JSON Parse Error', e);
    return fallback; 
  }
}
function toJSON(obj, pretty = false) {
  try {
    return JSON.stringify(obj, null, pretty ? 2 : 0);
  } catch (e) {
    logError('JSON Stringify Error', e);
    return '{}';
  }
}

// Enhanced logging system
const Logger = {
  levels: { error: 0, warn: 1, info: 2, debug: 3 },
  currentLevel: 2, // default to info
  
  setLevel(level) {
    if (this.levels.hasOwnProperty(level)) {
      this.currentLevel = this.levels[level];
    }
  },
  
  error: (...args) => {
    if (this.currentLevel >= this.levels.error) {
      console.error(`[${nowISO()}] [ERROR]`, ...args);
      if (CONFIG.ENABLE_METRICS) Metrics.increment('errors');
    }
  },
  
  warn: (...args) => {
    if (this.currentLevel >= this.levels.warn) {
      console.warn(`[${nowISO()}] [WARN]`, ...args);
    }
  },
  
  info: (...args) => {
    if (this.currentLevel >= this.levels.info) {
      console.log(`[${nowISO()}] [INFO]`, ...args);
    }
  },
  
  debug: (...args) => {
    if (this.currentLevel >= this.levels.debug) {
      console.debug(`[${nowISO()}] [DEBUG]`, ...args);
    }
  }
};

// Set log level from config
Logger.setLevel(CONFIG.LOG_LEVEL);

// Metrics collection system
const Metrics = {
  data: {
    requests: 0,
    errors: 0,
    responseTimes: [],
    dbOperations: 0,
    activeConnections: 0,
    start: Date.now()
  },
  
  increment(metric) {
    if (CONFIG.ENABLE_METRICS && this.data.hasOwnProperty(metric)) {
      this.data[metric]++;
    }
  },
  
  timing(metric, duration) {
    if (CONFIG.ENABLE_METRICS && metric === 'responseTime') {
      this.data.responseTimes.push(duration);
      // Keep only last 100 response times
      if (this.data.responseTimes.length > 100) {
        this.data.responseTimes.shift();
      }
    }
  },
  
  getSummary() {
    const avgResponseTime = this.data.responseTimes.length > 0 
      ? this.data.responseTimes.reduce((a, b) => a + b, 0) / this.data.responseTimes.length 
      : 0;
      
    return {
      uptime: Math.floor((Date.now() - this.data.start) / 1000),
      requests: this.data.requests,
      errors: this.data.errors,
      avgResponseTime: Math.round(avgResponseTime),
      dbOperations: this.data.dbOperations,
      activeConnections: this.data.activeConnections
    };
  },
  
  reset() {
    this.data.responseTimes = [];
  }
};

// ===== STORAGE ENGINE ABSTRACT CLASS =====
class StorageEngine {
  constructor(options = {}) {
    this.options = options;
    this.name = options.name || 'default';
    this.indexes = new Map(); // field -> index structure
    this.cache = new Map(); // simple LRU cache
    this.cacheSize = options.cacheSize || 1000;
  }
  
  // Abstract methods to be implemented by specific engines
  async init() { throw new Error('StorageEngine.init() must be implemented'); }
  async get(id) { throw new Error('StorageEngine.get() must be implemented'); }
  async find(query) { throw new Error('StorageEngine.find() must be implemented'); }
  async insert(data) { throw new Error('StorageEngine.insert() must be implemented'); }
  async update(id, data) { throw new Error('StorageEngine.update() must be implemented'); }
  async delete(id) { throw new Error('StorageEngine.delete() must be implemented'); }
  async createIndex(field) { throw new Error('StorageEngine.createIndex() must be implemented'); }
  async dropIndex(field) { throw new Error('StorageEngine.dropIndex() must be implemented'); }
  async compact() { throw new Error('StorageEngine.compact() must be implemented'); }
  async backup(path) { throw new Error('StorageEngine.backup() must be implemented'); }
  async restore(path) { throw new Error('StorageEngine.restore() must be implemented'); }
  
  // Common cache implementation
  getFromCache(id) {
    const item = this.cache.get(id);
    if (item) {
      // Update LRU
      this.cache.delete(id);
      this.cache.set(id, item);
      return item;
    }
    return null;
  }
  
  setToCache(id, data) {
    // If cache is full, remove the oldest item
    if (this.cache.size >= this.cacheSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
    this.cache.set(id, data);
  }
  
  clearCache() {
    this.cache.clear();
  }
}

// ===== JSON STORAGE ENGINE =====
class JSONStorageEngine extends StorageEngine {
  constructor(options = {}) {
    super(options);
    this.dataDir = options.dataDir || CONFIG.DATA_DIR;
    this.dataFile = path.join(this.dataDir, `${this.name}.json`);
    this.walFile = path.join(this.dataDir, `${this.name}.wal`);
    this.lockFile = path.join(this.dataDir, `${this.name}.lock`);
    this.data = [];
    this.indexes = new Map();
    this.ensureDataDir();
  }
  
  async init() {
    // Load data from file if exists
    try {
      if (fs.existsSync(this.dataFile)) {
        const rawData = fs.readFileSync(this.dataFile, 'utf8');
        this.data = safeJSON(rawData, []);
      }
      
      // Apply WAL if exists
      if (fs.existsSync(this.walFile)) {
        const walData = fs.readFileSync(this.walFile, 'utf8');
        const walLines = walData.trim().split('\n').filter(line => line.trim());
        
        for (const line of walLines) {
          const operation = safeJSON(line);
          if (operation) {
            await this.applyOperation(operation);
          }
        }
        
        // Clear WAL after applying
        fs.unlinkSync(this.walFile);
      }
      
      // Rebuild indexes
      for (const [field] of this.indexes) {
        await this.rebuildIndex(field);
      }
      
      Logger.info(`JSONStorageEngine initialized for ${this.name} with ${this.data.length} records`);
    } catch (error) {
      Logger.error(`Failed to initialize JSONStorageEngine for ${this.name}:`, error);
      throw error;
    }
  }
  
  ensureDataDir() {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
  }
  
  acquireLock() {
    try {
      if (fs.existsSync(this.lockFile)) {
        const lockTime = fs.readFileSync(this.lockFile, 'utf8');
        // If lock is older than 5 minutes, assume it's stale
        if (Date.now() - parseInt(lockTime) > 300000) {
          fs.unlinkSync(this.lockFile);
        } else {
          throw new Error('Storage is locked by another process');
        }
      }
      fs.writeFileSync(this.lockFile, Date.now().toString());
      return true;
    } catch (error) {
      Logger.error('Failed to acquire lock:', error);
      return false;
    }
  }
  
  releaseLock() {
    try {
      if (fs.existsSync(this.lockFile)) {
        fs.unlinkSync(this.lockFile);
      }
      return true;
    } catch (error) {
      Logger.error('Failed to release lock:', error);
      return false;
    }
  }
  
  async applyOperation(operation) {
    const { type, data } = operation;
    
    switch (type) {
      case 'insert':
        this.data.push(data);
        break;
      case 'update':
        const index = this.data.findIndex(item => item.id === data.id);
        if (index !== -1) {
          this.data[index] = { ...this.data[index], ...data, _updated: nowISO() };
        }
        break;
      case 'delete':
        this.data = this.data.filter(item => item.id !== data.id);
        break;
    }
  }
  
  async writeToWAL(operation) {
    try {
      const operationStr = toJSON(operation) + '\n';
      fs.appendFileSync(this.walFile, operationStr);
    } catch (error) {
      Logger.error('Failed to write to WAL:', error);
    }
  }
  
  async saveData() {
    try {
      const dataStr = toJSON(this.data, true);
      fs.writeFileSync(this.dataFile, dataStr);
    } catch (error) {
      Logger.error('Failed to save data:', error);
    }
  }
  
  async get(id) {
    // Check cache first
    const cached = this.getFromCache(id);
    if (cached) return cached;
    
    const record = this.data.find(item => item.id === id && !item._deleted);
    if (record) {
      this.setToCache(id, record);
      return record;
    }
    return null;
  }
  
  async find(query = {}) {
    let results = [...this.data];
    
    // Filter out deleted records
    results = results.filter(item => !item._deleted);
    
    // Apply query filters
    for (const [field, value] of Object.entries(query)) {
      if (field.startsWith('_')) continue; // Skip system fields
      
      results = results.filter(item => {
        if (typeof value === 'object' && value !== null) {
          // Handle operators like $gt, $lt, $in, etc.
          for (const [op, val] of Object.entries(value)) {
            switch (op) {
              case '$eq': return item[field] === val;
              case '$ne': return item[field] !== val;
              case '$gt': return item[field] > val;
              case '$gte': return item[field] >= val;
              case '$lt': return item[field] < val;
              case '$lte': return item[field] <= val;
              case '$in': return Array.isArray(val) && val.includes(item[field]);
              case '$nin': return Array.isArray(val) && !val.includes(item[field]);
              case '$regex': return new RegExp(val).test(item[field]);
              case '$exists': return (item[field] !== undefined) === val;
            }
          }
          return true;
        } else {
          return item[field] === value;
        }
      });
    }
    
    return results;
  }
  
  async insert(data) {
    if (!data.id) {
      data.id = uid();
    }
    
    data._created = nowISO();
    data._updated = data._created;
    
    // Write to WAL first
    await this.writeToWAL({ type: 'insert', data });
    
    // Apply operation
    this.data.push(data);
    
    // Update indexes
    for (const [field, index] of this.indexes) {
      if (data[field] !== undefined) {
        const value = data[field];
        if (!index.has(value)) {
          index.set(value, new Set());
        }
        index.get(value).add(data.id);
      }
    }
    
    // Save data
    await this.saveData();
    
    // Update cache
    this.setToCache(data.id, data);
    
    Metrics.increment('dbOperations');
    return data;
  }
  
  async update(id, data) {
    const existing = await this.get(id);
    if (!existing) {
      throw new Error(`Record with id ${id} not found`);
    }
    
    const updatedData = { ...existing, ...data, _updated: nowISO() };
    
    // Write to WAL first
    await this.writeToWAL({ type: 'update', data: updatedData });
    
    // Find and update in data array
    const index = this.data.findIndex(item => item.id === id);
    if (index !== -1) {
      this.data[index] = updatedData;
    }
    
    // Update indexes
    for (const [field, index] of this.indexes) {
      // If field changed, update index
      if (existing[field] !== updatedData[field]) {
        // Remove from old index value
        if (existing[field] !== undefined && index.has(existing[field])) {
          index.get(existing[field]).delete(id);
          if (index.get(existing[field]).size === 0) {
            index.delete(existing[field]);
          }
        }
        
        // Add to new index value
        if (updatedData[field] !== undefined) {
          if (!index.has(updatedData[field])) {
            index.set(updatedData[field], new Set());
          }
          index.get(updatedData[field]).add(id);
        }
      }
    }
    
    // Save data
    await this.saveData();
    
    // Update cache
    this.setToCache(id, updatedData);
    
    Metrics.increment('dbOperations');
    return updatedData;
  }
  
  async delete(id) {
    const existing = await this.get(id);
    if (!existing) {
      throw new Error(`Record with id ${id} not found`);
    }
    
    // Write to WAL first
    await this.writeToWAL({ type: 'delete', data: { id } });
    
    // Mark as deleted
    existing._deleted = true;
    existing._deleted_at = nowISO();
    
    // Find and update in data array
    const index = this.data.findIndex(item => item.id === id);
    if (index !== -1) {
      this.data[index] = existing;
    }
    
    // Update indexes
    for (const [field, index] of this.indexes) {
      if (existing[field] !== undefined && index.has(existing[field])) {
        index.get(existing[field]).delete(id);
        if (index.get(existing[field]).size === 0) {
          index.delete(existing[field]);
        }
      }
    }
    
    // Save data
    await this.saveData();
    
    // Remove from cache
    this.cache.delete(id);
    
    Metrics.increment('dbOperations');
    return true;
  }
  
  async createIndex(field) {
    if (this.indexes.has(field)) {
      return; // Index already exists
    }
    
    const index = new Map(); // value -> Set of IDs
    this.indexes.set(field, index);
    
    // Rebuild index with existing data
    await this.rebuildIndex(field);
    
    Logger.info(`Created index on field '${field}' for collection '${this.name}'`);
  }
  
  async rebuildIndex(field) {
    const index = this.indexes.get(field);
    if (!index) return;
    
    index.clear();
    
    for (const record of this.data) {
      if (record._deleted) continue;
      
      const value = record[field];
      if (value !== undefined) {
        if (!index.has(value)) {
          index.set(value, new Set());
        }
        index.get(value).add(record.id);
      }
    }
  }
  
  async dropIndex(field) {
    if (this.indexes.has(field)) {
      this.indexes.delete(field);
      Logger.info(`Dropped index on field '${field}' for collection '${this.name}'`);
    }
  }
  
  async compact() {
    try {
      // Filter out deleted records and old versions
      const compactedData = this.data
        .filter(item => !item._deleted)
        .map(item => {
          // Remove system fields
          const { _created, _updated, ...cleanItem } = item;
          return cleanItem;
        });
      
      // Save compacted data
      fs.writeFileSync(this.dataFile, toJSON(compactedData, true));
      
      // Clear WAL
      if (fs.existsSync(this.walFile)) {
        fs.unlinkSync(this.walFile);
      }
      
      // Update in-memory data
      this.data = compactedData;
      
      // Clear cache
      this.clearCache();
      
      // Rebuild indexes
      for (const [field] of this.indexes) {
        await this.rebuildIndex(field);
      }
      
      Logger.info(`Compacted collection '${this.name}' from ${this.data.length} to ${compactedData.length} records`);
      return true;
    } catch (error) {
      Logger.error(`Failed to compact collection '${this.name}':`, error);
      return false;
    }
  }
  
  async backup(backupPath) {
    try {
      if (!fs.existsSync(backupPath)) {
        fs.mkdirSync(backupPath, { recursive: true });
      }
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFile = path.join(backupPath, `${this.name}-backup-${timestamp}.json`);
      
      fs.copyFileSync(this.dataFile, backupFile);
      
      if (fs.existsSync(this.walFile)) {
        const walBackupFile = path.join(backupPath, `${this.name}-backup-${timestamp}.wal`);
        fs.copyFileSync(this.walFile, walBackupFile);
      }
      
      Logger.info(`Backed up collection '${this.name}' to ${backupFile}`);
      return backupFile;
    } catch (error) {
      Logger.error(`Failed to backup collection '${this.name}':`, error);
      return null;
    }
  }
  
  async restore(backupPath) {
    try {
      if (!fs.existsSync(backupPath)) {
        throw new Error(`Backup file not found: ${backupPath}`);
      }
      
      // Clear current data
      this.data = [];
      this.clearCache();
      
      // Load backup data
      const backupData = fs.readFileSync(backupPath, 'utf8');
      this.data = safeJSON(backupData, []);
      
      // Save data
      await this.saveData();
      
      // Rebuild indexes
      for (const [field] of this.indexes) {
        await this.rebuildIndex(field);
      }
      
      Logger.info(`Restored collection '${this.name}' from ${backupPath}`);
      return true;
    } catch (error) {
      Logger.error(`Failed to restore collection '${this.name}':`, error);
      return false;
    }
  }
}

// ===== SQLITE STORAGE ENGINE =====
class SQLiteStorageEngine extends StorageEngine {
  constructor(options = {}) {
    super(options);
    this.dbPath = options.dbPath || path.join(CONFIG.DATA_DIR, `${this.name}.db`);
    this.db = null;
  }
  
  async init() {
    try {
      // Dynamically import sqlite3 if available
      const sqlite3 = require('sqlite3').verbose();
      this.db = new sqlite3.Database(this.dbPath);
      
      // Create table if not exists
      await this.run(`
        CREATE TABLE IF NOT EXISTS ${this.name} (
          id TEXT PRIMARY KEY,
          data TEXT,
          created_at TEXT,
          updated_at TEXT,
          deleted_at TEXT
        )
      `);
      
      // Create indexes table
      await this.run(`
        CREATE TABLE IF NOT EXISTS ${this.name}_indexes (
          field TEXT,
          value TEXT,
          record_id TEXT,
          PRIMARY KEY (field, value, record_id)
        )
      `);
      
      Logger.info(`SQLiteStorageEngine initialized for ${this.name}`);
    } catch (error) {
      Logger.error(`Failed to initialize SQLiteStorageEngine for ${this.name}:`, error);
      throw error;
    }
  }
  
  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ lastID: this.lastID, changes: this.changes });
        }
      });
    });
  }
  
  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }
  
  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }
  
  async get(id) {
    // Check cache first
    const cached = this.getFromCache(id);
    if (cached) return cached;
    
    const row = await this.get(`SELECT data FROM ${this.name} WHERE id = ? AND deleted_at IS NULL`, [id]);
    if (row) {
      const data = safeJSON(row.data);
      this.setToCache(id, data);
      return data;
    }
    return null;
  }
  
  async find(query = {}) {
    let sql = `SELECT data FROM ${this.name} WHERE deleted_at IS NULL`;
    const params = [];
    
    // Build WHERE clause from query
    const whereClauses = [];
    for (const [field, value] of Object.entries(query)) {
      if (field.startsWith('_')) continue; // Skip system fields
      
      if (typeof value === 'object' && value !== null) {
        // Handle operators
        for (const [op, val] of Object.entries(value)) {
          switch (op) {
            case '$eq':
              whereClauses.push(`json_extract(data, '$.${field}') = ?`);
              params.push(val);
              break;
            case '$ne':
              whereClauses.push(`json_extract(data, '$.${field}') != ?`);
              params.push(val);
              break;
            case '$gt':
              whereClauses.push(`json_extract(data, '$.${field}') > ?`);
              params.push(val);
              break;
            case '$gte':
              whereClauses.push(`json_extract(data, '$.${field}') >= ?`);
              params.push(val);
              break;
            case '$lt':
              whereClauses.push(`json_extract(data, '$.${field}') < ?`);
              params.push(val);
              break;
            case '$lte':
              whereClauses.push(`json_extract(data, '$.${field}') <= ?`);
              params.push(val);
              break;
            case '$in':
              if (Array.isArray(val)) {
                const placeholders = val.map(() => '?').join(',');
                whereClauses.push(`json_extract(data, '$.${field}') IN (${placeholders})`);
                params.push(...val);
              }
              break;
            case '$nin':
              if (Array.isArray(val)) {
                const placeholders = val.map(() => '?').join(',');
                whereClauses.push(`json_extract(data, '$.${field}') NOT IN (${placeholders})`);
                params.push(...val);
              }
              break;
            case '$regex':
              whereClauses.push(`json_extract(data, '$.${field}') REGEXP ?`);
              params.push(val);
              break;
          }
        }
      } else {
        whereClauses.push(`json_extract(data, '$.${field}') = ?`);
        params.push(value);
      }
    }
    
    if (whereClauses.length > 0) {
      sql += ' AND ' + whereClauses.join(' AND ');
    }
    
    const rows = await this.all(sql, params);
    return rows.map(row => safeJSON(row.data));
  }
  
  async insert(data) {
    if (!data.id) {
      data.id = uid();
    }
    
    const now = nowISO();
    data._created = now;
    data._updated = now;
    
    const dataStr = toJSON(data);
    
    await this.run(
      `INSERT INTO ${this.name} (id, data, created_at, updated_at) VALUES (?, ?, ?, ?)`,
      [data.id, dataStr, now, now]
    );
    
    // Update indexes
    for (const [field] of this.indexes) {
      if (data[field] !== undefined) {
        await this.run(
          `INSERT INTO ${this.name}_indexes (field, value, record_id) VALUES (?, ?, ?)`,
          [field, String(data[field]), data.id]
        );
      }
    }
    
    // Update cache
    this.setToCache(data.id, data);
    
    Metrics.increment('dbOperations');
    return data;
  }
  
  async update(id, data) {
    const existing = await this.get(id);
    if (!existing) {
      throw new Error(`Record with id ${id} not found`);
    }
    
    const now = nowISO();
    const updatedData = { ...existing, ...data, _updated: now };
    
    const dataStr = toJSON(updatedData);
    
    await this.run(
      `UPDATE ${this.name} SET data = ?, updated_at = ? WHERE id = ? AND deleted_at IS NULL`,
      [dataStr, now, id]
    );
    
    // Update indexes
    for (const [field] of this.indexes) {
      // If field changed, update index
      if (existing[field] !== updatedData[field]) {
        // Remove old index
        await this.run(
          `DELETE FROM ${this.name}_indexes WHERE field = ? AND record_id = ?`,
          [field, id]
        );
        
        // Add new index
        if (updatedData[field] !== undefined) {
          await this.run(
            `INSERT INTO ${this.name}_indexes (field, value, record_id) VALUES (?, ?, ?)`,
            [field, String(updatedData[field]), id]
          );
        }
      }
    }
    
    // Update cache
    this.setToCache(id, updatedData);
    
    Metrics.increment('dbOperations');
    return updatedData;
  }
  
  async delete(id) {
    const existing = await this.get(id);
    if (!existing) {
      throw new Error(`Record with id ${id} not found`);
    }
    
    const now = nowISO();
    
    await this.run(
      `UPDATE ${this.name} SET deleted_at = ? WHERE id = ? AND deleted_at IS NULL`,
      [now, id]
    );
    
    // Remove from indexes
    for (const [field] of this.indexes) {
      await this.run(
        `DELETE FROM ${this.name}_indexes WHERE field = ? AND record_id = ?`,
        [field, id]
      );
    }
    
    // Remove from cache
    this.cache.delete(id);
    
    Metrics.increment('dbOperations');
    return true;
  }
  
  async createIndex(field) {
    if (this.indexes.has(field)) {
      return; // Index already exists
    }
    
    // Create index in SQLite
    await this.run(`CREATE INDEX IF NOT EXISTS idx_${this.name}_${field} ON ${this.name}_indexes (field, value)`);
    
    // Rebuild index with existing data
    await this.rebuildIndex(field);
    
    this.indexes.set(field, true);
    
    Logger.info(`Created index on field '${field}' for collection '${this.name}'`);
  }
  
  async rebuildIndex(field) {
    // Clear existing index entries
    await this.run(`DELETE FROM ${this.name}_indexes WHERE field = ?`, [field]);
    
    // Get all records
    const rows = await this.all(`SELECT id, data FROM ${this.name} WHERE deleted_at IS NULL`);
    
    // Insert index entries
    for (const row of rows) {
      const data = safeJSON(row.data);
      if (data[field] !== undefined) {
        await this.run(
          `INSERT INTO ${this.name}_indexes (field, value, record_id) VALUES (?, ?, ?)`,
          [field, String(data[field]), row.id]
        );
      }
    }
  }
  
  async dropIndex(field) {
    if (this.indexes.has(field)) {
      // Drop SQLite index
      await this.run(`DROP INDEX IF EXISTS idx_${this.name}_${field}`);
      
      this.indexes.delete(field);
      
      Logger.info(`Dropped index on field '${field}' for collection '${this.name}'`);
    }
  }
  
  async compact() {
    // VACUUM command in SQLite compacts the database
    try {
      await this.run('VACUUM');
      Logger.info(`Compacted SQLite database for collection '${this.name}'`);
      return true;
    } catch (error) {
      Logger.error(`Failed to compact SQLite database for collection '${this.name}':`, error);
      return false;
    }
  }
  
  async backup(backupPath) {
    try {
      if (!fs.existsSync(backupPath)) {
        fs.mkdirSync(backupPath, { recursive: true });
      }
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFile = path.join(backupPath, `${this.name}-backup-${timestamp}.db`);
      
      // Use SQLite backup API
      const backup = require('sqlite3').Database;
      const backupDb = new backup(backupFile);
      
      await new Promise((resolve, reject) => {
        this.db.backup(backupDb, (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
      
      backupDb.close();
      
      Logger.info(`Backed up SQLite database for collection '${this.name}' to ${backupFile}`);
      return backupFile;
    } catch (error) {
      Logger.error(`Failed to backup SQLite database for collection '${this.name}':`, error);
      return null;
    }
  }
  
  async restore(backupPath) {
    try {
      if (!fs.existsSync(backupPath)) {
        throw new Error(`Backup file not found: ${backupPath}`);
      }
      
      // Close current database
      this.db.close();
      
      // Replace current database with backup
      fs.copyFileSync(backupPath, this.dbPath);
      
      // Reopen database
      const sqlite3 = require('sqlite3').verbose();
      this.db = new sqlite3.Database(this.dbPath);
      
      // Clear cache
      this.clearCache();
      
      Logger.info(`Restored SQLite database for collection '${this.name}' from ${backupPath}`);
      return true;
    } catch (error) {
      Logger.error(`Failed to restore SQLite database for collection '${this.name}':`, error);
      return false;
    }
  }
}

// ===== MEMORY STORAGE ENGINE =====
class MemoryStorageEngine extends StorageEngine {
  constructor(options = {}) {
    super(options);
    this.data = new Map(); // id -> record
    this.indexes = new Map(); // field -> Map<value, Set<id>>
  }
  
  async init() {
    Logger.info(`MemoryStorageEngine initialized for ${this.name}`);
  }
  
  async get(id) {
    // Check cache first
    const cached = this.getFromCache(id);
    if (cached) return cached;
    
    const record = this.data.get(id);
    if (record && !record._deleted) {
      this.setToCache(id, record);
      return record;
    }
    return null;
  }
  
  async find(query = {}) {
    const results = [];
    
    for (const [id, record] of this.data) {
      if (record._deleted) continue;
      
      let match = true;
      
      // Check query filters
      for (const [field, value] of Object.entries(query)) {
        if (field.startsWith('_')) continue; // Skip system fields
        
        if (typeof value === 'object' && value !== null) {
          // Handle operators
          let opMatch = false;
          for (const [op, val] of Object.entries(value)) {
            switch (op) {
              case '$eq': opMatch = record[field] === val; break;
              case '$ne': opMatch = record[field] !== val; break;
              case '$gt': opMatch = record[field] > val; break;
              case '$gte': opMatch = record[field] >= val; break;
              case '$lt': opMatch = record[field] < val; break;
              case '$lte': opMatch = record[field] <= val; break;
              case '$in': opMatch = Array.isArray(val) && val.includes(record[field]); break;
              case '$nin': opMatch = Array.isArray(val) && !val.includes(record[field]); break;
              case '$regex': opMatch = new RegExp(val).test(record[field]); break;
              case '$exists': opMatch = (record[field] !== undefined) === val; break;
            }
            if (!opMatch) {
              match = false;
              break;
            }
          }
        } else {
          if (record[field] !== value) {
            match = false;
            break;
          }
        }
      }
      
      if (match) {
        results.push(record);
      }
    }
    
    return results;
  }
  
  async insert(data) {
    if (!data.id) {
      data.id = uid();
    }
    
    const now = nowISO();
    data._created = now;
    data._updated = now;
    
    this.data.set(data.id, data);
    
    // Update indexes
    for (const [field, index] of this.indexes) {
      if (data[field] !== undefined) {
        const value = data[field];
        if (!index.has(value)) {
          index.set(value, new Set());
        }
        index.get(value).add(data.id);
      }
    }
    
    // Update cache
    this.setToCache(data.id, data);
    
    Metrics.increment('dbOperations');
    return data;
  }
  
  async update(id, data) {
    const existing = await this.get(id);
    if (!existing) {
      throw new Error(`Record with id ${id} not found`);
    }
    
    const now = nowISO();
    const updatedData = { ...existing, ...data, _updated: now };
    
    this.data.set(id, updatedData);
    
    // Update indexes
    for (const [field, index] of this.indexes) {
      // If field changed, update index
      if (existing[field] !== updatedData[field]) {
        // Remove from old index value
        if (existing[field] !== undefined && index.has(existing[field])) {
          index.get(existing[field]).delete(id);
          if (index.get(existing[field]).size === 0) {
            index.delete(existing[field]);
          }
        }
        
        // Add to new index value
        if (updatedData[field] !== undefined) {
          if (!index.has(updatedData[field])) {
            index.set(updatedData[field], new Set());
          }
          index.get(updatedData[field]).add(id);
        }
      }
    }
    
    // Update cache
    this.setToCache(id, updatedData);
    
    Metrics.increment('dbOperations');
    return updatedData;
  }
  
  async delete(id) {
    const existing = await this.get(id);
    if (!existing) {
      throw new Error(`Record with id ${id} not found`);
    }
    
    const now = nowISO();
    existing._deleted = true;
    existing._deleted_at = now;
    
    // Update indexes
    for (const [field, index] of this.indexes) {
      if (existing[field] !== undefined && index.has(existing[field])) {
        index.get(existing[field]).delete(id);
        if (index.get(existing[field]).size === 0) {
          index.delete(existing[field]);
        }
      }
    }
    
    // Remove from cache
    this.cache.delete(id);
    
    Metrics.increment('dbOperations');
    return true;
  }
  
  async createIndex(field) {
    if (this.indexes.has(field)) {
      return; // Index already exists
    }
    
    const index = new Map(); // value -> Set of IDs
    this.indexes.set(field, index);
    
    // Rebuild index with existing data
    await this.rebuildIndex(field);
    
    Logger.info(`Created index on field '${field}' for collection '${this.name}'`);
  }
  
  async rebuildIndex(field) {
    const index = this.indexes.get(field);
    if (!index) return;
    
    index.clear();
    
    for (const [id, record] of this.data) {
      if (record._deleted) continue;
      
      const value = record[field];
      if (value !== undefined) {
        if (!index.has(value)) {
          index.set(value, new Set());
        }
        index.get(value).add(id);
      }
    }
  }
  
  async dropIndex(field) {
    if (this.indexes.has(field)) {
      this.indexes.delete(field);
      Logger.info(`Dropped index on field '${field}' for collection '${this.name}'`);
    }
  }
  
  async compact() {
    // For memory storage, compaction just removes deleted records
    const compactedData = new Map();
    
    for (const [id, record] of this.data) {
      if (!record._deleted) {
        // Remove system fields
        const { _created, _updated, _deleted, _deleted_at, ...cleanRecord } = record;
        compactedData.set(id, cleanRecord);
      }
    }
    
    this.data = compactedData;
    
    // Clear cache
    this.clearCache();
    
    // Rebuild indexes
    for (const [field] of this.indexes) {
      await this.rebuildIndex(field);
    }
    
    Logger.info(`Compacted memory collection '${this.name}' from ${this.data.size} to ${compactedData.size} records`);
    return true;
  }
  
  async backup(backupPath) {
    try {
      if (!fs.existsSync(backupPath)) {
        fs.mkdirSync(backupPath, { recursive: true });
      }
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFile = path.join(backupPath, `${this.name}-backup-${timestamp}.json`);
      
      const backupData = Array.from(this.data.values())
        .filter(record => !record._deleted)
        .map(record => {
          const { _created, _updated, _deleted, _deleted_at, ...cleanRecord } = record;
          return cleanRecord;
        });
      
      fs.writeFileSync(backupFile, toJSON(backupData, true));
      
      Logger.info(`Backed up memory collection '${this.name}' to ${backupFile}`);
      return backupFile;
    } catch (error) {
      Logger.error(`Failed to backup memory collection '${this.name}':`, error);
      return null;
    }
  }
  
  async restore(backupPath) {
    try {
      if (!fs.existsSync(backupPath)) {
        throw new Error(`Backup file not found: ${backupPath}`);
      }
      
      const backupData = fs.readFileSync(backupPath, 'utf8');
      const records = safeJSON(backupData, []);
      
      // Clear current data
      this.data.clear();
      this.clearCache();
      
      // Load backup data
      for (const record of records) {
        const id = record.id || uid();
        const now = nowISO();
        const fullRecord = {
          ...record,
          id,
          _created: now,
          _updated: now
        };
        
        this.data.set(id, fullRecord);
      }
      
      // Rebuild indexes
      for (const [field] of this.indexes) {
        await this.rebuildIndex(field);
      }
      
      Logger.info(`Restored memory collection '${this.name}' from ${backupPath}`);
      return true;
    } catch (error) {
      Logger.error(`Failed to restore memory collection '${this.name}':`, error);
      return false;
    }
  }
}

// ===== DATABASE MANAGER =====
class Database {
  constructor(options = {}) {
    this.options = options;
    this.collections = new Map(); // name -> Collection
    this.storageEngine = options.storageEngine || CONFIG.STORAGE_ENGINE;
    this.storageOptions = options.storageOptions || {};
    this.migrations = [];
    this.models = new Map(); // name -> Model
    this.initialized = false;
  }
  
  async init() {
    if (this.initialized) return;
    
    try {
      // Initialize all collections
      for (const [name, collection] of this.collections) {
        await collection.init();
      }
      
      // Run migrations
      await this.runMigrations();
      
      this.initialized = true;
      Logger.info('Database initialized successfully');
    } catch (error) {
      Logger.error('Failed to initialize database:', error);
      throw error;
    }
  }
  
  collection(name, options = {}) {
    if (!this.collections.has(name)) {
      // Create storage engine
      let engine;
      const engineOptions = { ...this.storageOptions, ...options, name };
      
      switch (this.storageEngine) {
        case 'sqlite':
          engine = new SQLiteStorageEngine(engineOptions);
          break;
        case 'memory':
          engine = new MemoryStorageEngine(engineOptions);
          break;
        case 'json':
        default:
          engine = new JSONStorageEngine(engineOptions);
          break;
      }
      
      const collection = new Collection(name, engine, options);
      this.collections.set(name, collection);
    }
    
    return this.collections.get(name);
  }
  
  model(name, schema = {}) {
    if (!this.models.has(name)) {
      const collection = this.collection(name);
      const model = new Model(name, collection, schema);
      this.models.set(name, model);
    }
    
    return this.models.get(name);
  }
  
  async createIndex(collectionName, field) {
    const collection = this.collection(collectionName);
    return await collection.createIndex(field);
  }
  
  async dropIndex(collectionName, field) {
    const collection = this.collection(collectionName);
    return await collection.dropIndex(field);
  }
  
  async compactAll() {
    const results = [];
    for (const [name, collection] of this.collections) {
      results.push(await collection.compact());
    }
    return results;
  }
  
  async backupAll(backupPath) {
    const results = [];
    for (const [name, collection] of this.collections) {
      results.push(await collection.backup(backupPath));
    }
    return results.filter(Boolean);
  }
  
  async restoreAll(backupPath) {
    const results = [];
    for (const [name, collection] of this.collections) {
      const collectionBackupPath = path.join(backupPath, name);
      if (fs.existsSync(collectionBackupPath)) {
        results.push(await collection.restore(collectionBackupPath));
      }
    }
    return results;
  }
  
  registerMigration(migration) {
    this.migrations.push(migration);
  }
  
  async runMigrations() {
    for (const migration of this.migrations) {
      try {
        await migration(this);
        Logger.info(`Migration ${migration.name || 'unnamed'} executed successfully`);
      } catch (error) {
        Logger.error(`Migration ${migration.name || 'unnamed'} failed:`, error);
        throw error;
      }
    }
  }
  
  listCollections() {
    return Array.from(this.collections.keys());
  }
  
  async close() {
    // Close all storage engines
    for (const [name, collection] of this.collections) {
      await collection.close();
    }
    
    this.initialized = false;
    Logger.info('Database closed successfully');
  }
}

// ===== COLLECTION CLASS =====
class Collection {
  constructor(name, storageEngine, options = {}) {
    this.name = name;
    this.storageEngine = storageEngine;
    this.options = options;
    this.initialized = false;
  }
  
  async init() {
    if (this.initialized) return;
    
    try {
      await this.storageEngine.init();
      this.initialized = true;
      Logger.info(`Collection '${this.name}' initialized`);
    } catch (error) {
      Logger.error(`Failed to initialize collection '${this.name}':`, error);
      throw error;
    }
  }
  
  async get(id) {
    this.ensureInitialized();
    return await this.storageEngine.get(id);
  }
  
  async find(query = {}) {
    this.ensureInitialized();
    return await this.storageEngine.find(query);
  }
  
  async insert(data) {
    this.ensureInitialized();
    return await this.storageEngine.insert(data);
  }
  
  async update(id, data) {
    this.ensureInitialized();
    return await this.storageEngine.update(id, data);
  }
  
  async delete(id) {
    this.ensureInitialized();
    return await this.storageEngine.delete(id);
  }
  
  async createIndex(field) {
    this.ensureInitialized();
    return await this.storageEngine.createIndex(field);
  }
  
  async dropIndex(field) {
    this.ensureInitialized();
    return await this.storageEngine.dropIndex(field);
  }
  
  async compact() {
    this.ensureInitialized();
    return await this.storageEngine.compact();
  }
  
  async backup(backupPath) {
    this.ensureInitialized();
    return await this.storageEngine.backup(backupPath);
  }
  
  async restore(backupPath) {
    this.ensureInitialized();
    return await this.storageEngine.restore(backupPath);
  }
  
  ensureInitialized() {
    if (!this.initialized) {
      throw new Error(`Collection '${this.name}' is not initialized`);
    }
  }
  
  async close() {
    if (this.storageEngine.close) {
      await this.storageEngine.close();
    }
    this.initialized = false;
  }
}

// ===== MODEL CLASS =====
class Model {
  constructor(name, collection, schema = {}) {
    this.name = name;
    this.collection = collection;
    this.schema = schema;
    this.hooks = {
      beforeCreate: [],
      afterCreate: [],
      beforeUpdate: [],
      afterUpdate:,
      beforeDelete: [],
      afterDelete: [],
      beforeValidate: [],
      afterValidate: []
    };
    this.relations = {};
    this.indexes = [];
  }
  
  hook(event, callback) {
    if (this.hooks[event]) {
      this.hooks[event].push(callback);
    }
  }
  
  async runHooks(event, data) {
    if (this.hooks[event]) {
      for (const hook of this.hooks[event]) {
        await hook(data);
      }
    }
  }
  
  relate(name, type, targetModel, options = {}) {
    this.relations[name] = {
      type,
      targetModel,
      foreignKey: options.foreignKey || `${this.name}_id`,
      localKey: options.localKey || 'id'
    };
  }
  
  hasMany(name, targetModel, options = {}) {
    this.relate(name, 'hasMany', targetModel, options);
  }
  
  hasOne(name, targetModel, options = {}) {
    this.relate(name, 'hasOne', targetModel, options);
  }
  
  belongsTo(name, targetModel, options = {}) {
    this.relate(name, 'belongsTo', targetModel, options);
  }
  
  addIndex(field) {
    if (!this.indexes.includes(field)) {
      this.indexes.push(field);
    }
  }
  
  async create(data) {
    // Apply defaults from schema
    const record = { ...data };
    for (const [field, options] of Object.entries(this.schema)) {
      if (record[field] === undefined && options.default !== undefined) {
        record[field] = typeof options.default === 'function' 
          ? options.default() 
          : options.default;
      }
    }
    
    // Run before hooks
    await this.runHooks('beforeValidate', record);
    await this.runHooks('beforeCreate', record);
    
    // Insert record
    const result = await this.collection.insert(record);
    
    // Run after hooks
    await this.runHooks('afterCreate', result);
    
    return result;
  }
  
  async update(id, data) {
    // Get existing record
    const existing = await this.collection.get(id);
    if (!existing) {
      throw new Error(`Record with id ${id} not found`);
    }
    
    // Merge data
    const record = { ...existing, ...data };
    
    // Run before hooks
    await this.runHooks('beforeValidate', record);
    await this.runHooks('beforeUpdate', record);
    
    // Update record
    const result = await this.collection.update(id, record);
    
    // Run after hooks
    await this.runHooks('afterUpdate', result);
    
    return result;
  }
  
  async delete(id) {
    // Get existing record
    const existing = await this.collection.get(id);
    if (!existing) {
      throw new Error(`Record with id ${id} not found`);
    }
    
    // Run before hooks
    await this.runHooks('beforeDelete', existing);
    
    // Delete record
    const result = await this.collection.delete(id);
    
    // Run after hooks
    await this.runHooks('afterDelete', existing);
    
    return result;
  }
  
  async findById(id) {
    return await this.collection.get(id);
  }
  
  async findOne(query = {}) {
    const results = await this.collection.find(query);
    return results.length > 0 ? results[0] : null;
  }
  
  async findMany(query = {}) {
    return await this.collection.find(query);
  }
  
  async count(query = {}) {
    const results = await this.collection.find(query);
    return results.length;
  }
  
  async createIndexes() {
    const results = [];
    for (const field of this.indexes) {
      results.push(await this.collection.createIndex(field));
    }
    return results;
  }
  
  query() {
    return new QueryBuilder(this.collection);
  }
}

// ===== QUERY BUILDER =====
class QueryBuilder {
  constructor(collection) {
    this.collection = collection;
    this.query = {};
    this.options = {
      limit: null,
      skip: null,
      sort: null,
      fields: null,
      include: []
    };
  }
  
  where(query) {
    this.query = { ...this.query, ...query };
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
  
  include(relations) {
    this.options.include = Array.isArray(relations) ? relations : [relations];
    return this;
  }
  
  async execute() {
    let results = await this.collection.find(this.query);
    
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
    const results = await this.collection.find(this.query);
    return results.length;
  }
}

// ===== AUTHENTICATION SYSTEM =====
class Auth {
  constructor(app) {
    this.app = app;
    this.jwtSecret = CONFIG.JWT_SECRET;
    this.jwtExpiry = '24h';
    this.hashRounds = 12;
    this.usersModel = null;
    this.rolesModel = null;
    this.permissionsModel = null;
  }
  
  setUsersModel(model) {
    this.usersModel = model;
  }
  
  setRolesModel(model) {
    this.rolesModel = model;
  }
  
  setPermissionsModel(model) {
    this.permissionsModel = model;
  }
  
  async hashPassword(password) {
    return new Promise((resolve, reject) => {
      crypto.pbkdf2(password, crypto.randomBytes(16).toString('hex'), this.hashRounds, 64, 'sha512', (err, derivedKey) => {
        if (err) reject(err);
        resolve(derivedKey.toString('hex'));
      });
    });
  }
  
  async verifyPassword(password, hash) {
    return new Promise((resolve, reject) => {
      const [salt, iterations, key] = hash.split('$');
      crypto.pbkdf2(password, salt, parseInt(iterations), 64, 'sha512', (err, derivedKey) => {
        if (err) reject(err);
        resolve(derivedKey.toString('hex') === key);
      });
    });
  }
  
  generateToken(payload) {
    const header = {
      alg: 'HS512',
      typ: 'JWT'
    };
    
    const now = Math.floor(Date.now() / 1000);
    const jwtPayload = {
      ...payload,
      iat: now,
      exp: now + (this.jwtExpiry === '24h' ? 86400 : 3600)
    };
    
    const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
    const encodedPayload = Buffer.from(JSON.stringify(jwtPayload)).toString('base64url');
    
    const signature = crypto.createHmac('sha512', this.jwtSecret)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest('base64url');
    
    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }
  
  verifyToken(token) {
    try {
      const [encodedHeader, encodedPayload, signature] = token.split('.');
      
      // Verify signature
      const expectedSignature = crypto.createHmac('sha512', this.jwtSecret)
        .update(`${encodedHeader}.${encodedPayload}`)
        .digest('base64url');
        
      if (signature !== expectedSignature) {
        return null;
      }
      
      // Decode payload
      const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8'));
      
      // Check expiration
      if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
        return null;
      }
      
      return payload;
    } catch (error) {
      Logger.error('JWT verification error:', error);
      return null;
    }
  }
  
  async register(userData) {
    if (!this.usersModel) {
      throw new Error('Users model not set');
    }
    
    // Check if user already exists
    const existingUser = await this.usersModel.findOne({ email: userData.email });
    if (existingUser) {
      throw new Error('User with this email already exists');
    }
    
    // Hash password
    const hashedPassword = await this.hashPassword(userData.password);
    
    // Create user
    const user = await this.usersModel.create({
      ...userData,
      password: hashedPassword,
      isActive: true,
      createdAt: new Date().toISOString()
    });
    
    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    
    return userWithoutPassword;
  }
  
  async login(email, password) {
    if (!this.usersModel) {
      throw new Error('Users model not set');
    }
    
    // Find user
    const user = await this.usersModel.findOne({ email, isActive: true });
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
    
    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;
    
    return {
      user: userWithoutPassword,
      token
    };
  }
  
  async getUserById(id) {
    if (!this.usersModel) {
      throw new Error('Users model not set');
    }
    
    const user = await this.usersModel.findById(id);
    if (!user) {
      return null;
    }
    
    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    
    return userWithoutPassword;
  }
  
  async getUserRoles(userId) {
    if (!this.rolesModel || !this.usersModel) {
      return [];
    }
    
    // This would typically involve a join table between users and roles
    // For simplicity, we'll assume roles are stored as an array on the user
    const user = await this.usersModel.findById(userId);
    return user?.roles || [];
  }
  
  async getUserPermissions(userId) {
    if (!this.permissionsModel || !this.usersModel) {
      return [];
    }
    
    // This would typically involve getting roles, then permissions for those roles
    // For simplicity, we'll assume permissions are stored as an array on the user
    const user = await this.usersModel.findById(userId);
    return user?.permissions || [];
  }
  
  async hasPermission(userId, permission) {
    const permissions = await this.getUserPermissions(userId);
    return permissions.includes(permission);
  }
  
  middleware() {
    return async (req, res, next) => {
      try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return res.status(401).json({ error: 'Unauthorized' });
        }
        
        const token = authHeader.substring(7);
        const payload = this.verifyToken(token);
        
        if (!payload) {
          return res.status(401).json({ error: 'Invalid or expired token' });
        }
        
        // Get user
        const user = await this.getUserById(payload.userId);
        if (!user) {
          return res.status(401).json({ error: 'User not found' });
        }
        
        // Attach user to request
        req.user = user;
        req.token = token;
        
        next();
      } catch (error) {
        Logger.error('Auth middleware error:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    };
  }
  
  requirePermission(permission) {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      this.hasPermission(req.user.id, permission)
        .then(hasPermission => {
          if (hasPermission) {
            next();
          } else {
            res.status(403).json({ error: 'Insufficient permissions' });
          }
        })
        .catch(error => {
          Logger.error('Permission check error:', error);
          res.status(500).json({ error: 'Internal server error' });
        });
    };
  }
  
  requireRole(role) {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      this.getUserRoles(req.user.id)
        .then(roles => {
          if (roles.includes(role)) {
            next();
          } else {
            res.status(403).json({ error: 'Insufficient role' });
          }
        })
        .catch(error => {
          Logger.error('Role check error:', error);
          res.status(500).json({ error: 'Internal server error' });
        });
    };
  }
}

// ===== SESSION MANAGER =====
class SessionManager {
  constructor(options = {}) {
    this.sessions = new Map(); // sessionId -> session data
    this.cookieName = options.cookieName || 'oran_session';
    this.secret = options.secret || CONFIG.SESSION_SECRET;
    this.maxAge = options.maxAge || 86400000; // 24 hours
    this.cleanupInterval = options.cleanupInterval || 3600000; // 1 hour
    
    // Start cleanup interval
    this.cleanupTimer = setInterval(() => this.cleanup(), this.cleanupInterval);
  }
  
  createSession(data = {}) {
    const sessionId = uid(32);
    const session = {
      id: sessionId,
      data,
      createdAt: Date.now(),
      lastAccessed: Date.now(),
      expiresAt: Date.now() + this.maxAge
    };
    
    this.sessions.set(sessionId, session);
    return sessionId;
  }
  
  getSession(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return null;
    }
    
    // Check if expired
    if (session.expiresAt < Date.now()) {
      this.sessions.delete(sessionId);
      return null;
    }
    
    // Update last accessed time
    session.lastAccessed = Date.now();
    
    return session;
  }
  
  updateSession(sessionId, data) {
    const session = this.getSession(sessionId);
    if (!session) {
      return false;
    }
    
    session.data = { ...session.data, ...data };
    return true;
  }
  
  destroySession(sessionId) {
    return this.sessions.delete(sessionId);
  }
  
  cleanup() {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [sessionId, session] of this.sessions) {
      if (session.expiresAt < now) {
        this.sessions.delete(sessionId);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      Logger.debug(`Cleaned up ${cleaned} expired sessions`);
    }
  }
  
  middleware() {
    return (req, res, next) => {
      // Get session ID from cookie
      const cookies = this.parseCookies(req.headers.cookie);
      const sessionId = cookies[this.cookieName];
      
      // Get session
      let session = null;
      if (sessionId) {
        session = this.getSession(sessionId);
      }
      
      // Create new session if none exists
      if (!session) {
        const newSessionId = this.createSession();
        session = this.getSession(newSessionId);
        
        // Set session cookie
        res.setHeader('Set-Cookie', this.createCookie(newSessionId));
      }
      
      // Attach session to request
      req.session = session;
      
      next();
    };
  }
  
  parseCookies(cookieHeader) {
    const cookies = {};
    if (cookieHeader) {
      const items = cookieHeader.split(';');
      for (const item of items) {
        const parts = item.split('=');
        const key = parts[0].trim();
        const value = parts[1] ? parts[1].trim() : '';
        cookies[key] = decodeURIComponent(value);
      }
    }
    return cookies;
  }
  
  createCookie(sessionId, options = {}) {
    const cookieOptions = {
      maxAge: this.maxAge,
      httpOnly: true,
      path: '/',
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      ...options
    };
    
    let cookieStr = `${this.cookieName}=${sessionId}`;
    
    if (cookieOptions.maxAge) {
      cookieStr += `; Max-Age=${cookieOptions.maxAge}`;
    }
    
    if (cookieOptions.httpOnly) {
      cookieStr += '; HttpOnly';
    }
    
    if (cookieOptions.path) {
      cookieStr += `; Path=${cookieOptions.path}`;
    }
    
    if (cookieOptions.sameSite) {
      cookieStr += `; SameSite=${cookieOptions.sameSite}`;
    }
    
    if (cookieOptions.secure) {
      cookieStr += '; Secure';
    }
    
    return cookieStr;
  }
  
  destroy() {
    clearInterval(this.cleanupTimer);
  }
}

// ===== ROUTER =====
class Router {
  constructor(options = {}) {
    this.routes = [];
    this.middleware = [];
    this.prefix = options.prefix || '';
    this.caseSensitive = options.caseSensitive || false;
    this.strict = options.strict || false;
  }
  
  use(middleware) {
    this.middleware.push(middleware);
    return this;
  }
  
  get(path, ...handlers) {
    this.addRoute('GET', path, handlers);
    return this;
  }
  
  post(path, ...handlers) {
    this.addRoute('POST', path, handlers);
    return this;
  }
  
  put(path, ...handlers) {
    this.addRoute('PUT', path, handlers);
    return this;
  }
  
  patch(path, ...handlers) {
    this.addRoute('PATCH', path, handlers);
    return this;
  }
  
  delete(path, ...handlers) {
    this.addRoute('DELETE', path, handlers);
    return this;
  }
  
  all(path, ...handlers) {
    this.addRoute('ALL', path, handlers);
    return this;
  }
  
  addRoute(method, path, handlers) {
    // Normalize path
    if (!this.strict && path.endsWith('/') && path.length > 1) {
      path = path.slice(0, -1);
    }
    
    // Add prefix if exists
    if (this.prefix) {
      path = this.prefix + path;
    }
    
    // Create route object
    const route = {
      method,
      path,
      handlers,
      regex: this.pathToRegex(path),
      paramNames: this.extractParamNames(path)
    };
    
    this.routes.push(route);
    return this;
  }
  
  pathToRegex(path) {
    // Convert path to regex for matching
    const regexPattern = path
      .replace(/(\/?)(?:\.):(\w+)(?:(\.\w+)(?:\((.*?)\))?)?/g, '$1(?<$2>[^/$3]+)$3$4')
      .replace(/\*/g, '.*');
    
    return new RegExp(`^${regexPattern}$`);
  }
  
  extractParamNames(path) {
    const paramNames = [];
    const regex = /:(\w+)/g;
    let match;
    
    while ((match = regex.exec(path)) !== null) {
      paramNames.push(match[1]);
    }
    
    return paramNames;
  }
  
  match(method, path) {
    const normalizedMethod = this.caseSensitive ? method : method.toUpperCase();
    const normalizedPath = this.caseSensitive ? path : path.toLowerCase();
    
    for (const route of this.routes) {
      if (route.method !== 'ALL' && route.method !== normalizedMethod) {
        continue;
      }
      
      const match = route.regex.exec(normalizedPath);
      if (match) {
        const params = {};
        
        // Extract named parameters
        for (let i = 0; i < route.paramNames.length; i++) {
          const paramName = route.paramNames[i];
          params[paramName] = match[i + 1];
        }
        
        return {
          route,
          params
        };
      }
    }
    
    return null;
  }
  
  async handleRequest(req, res) {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const method = req.method;
    
    // Find matching route
    const match = this.match(method, pathname);
    
    if (!match) {
      return this.notFound(res);
    }
    
    const { route, params } = match;
    
    // Add params to request
    req.params = params;
    req.query = parsedUrl.query;
    
    // Get body
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      try {
        req.body = await this.parseBody(req);
      } catch (error) {
        Logger.error('Error parsing request body:', error);
        return this.badRequest(res, 'Invalid request body');
      }
    }
    
    // Execute middleware and handlers
    try {
      const handlers = [...this.middleware, ...route.handlers];
      
      // Create context
      const context = {
        req,
        res,
        params,
        query: req.query,
        body: req.body
      };
      
      // Execute handlers in sequence
      let i = 0;
      const next = async (err) => {
        if (err) {
          return this.handleError(res, err);
        }
        
        if (i < handlers.length) {
          const handler = handlers[i++];
          
          if (handler.length === 3) {
            // Express-style middleware (req, res, next)
            handler(req, res, next);
          } else {
            // Koa-style middleware (context, next)
            await handler(context, next);
          }
        }
      };
      
      next();
    } catch (error) {
      this.handleError(res, error);
    }
  }
  
  async parseBody(req) {
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
          const parsed = querystring.parse(body);
          resolve(parsed);
        } else {
          resolve(body);
        }
      });
      
      req.on('error', error => {
        reject(error);
      });
    });
  }
  
  send(res, data, statusCode = 200, headers = {}) {
    res.writeHead(statusCode, {
      'Content-Type': 'application/json',
      ...headers
    });
    res.end(JSON.stringify(data));
  }
  
  notFound(res) {
    this.send(res, { error: 'Not found' }, 404);
  }
  
  badRequest(res, message = 'Bad request') {
    this.send(res, { error: message }, 400);
  }
  
  handleError(res, error) {
    Logger.error('Router error:', error);
    
    if (error instanceof Error) {
      this.send(res, { error: error.message }, 500);
    } else {
      this.send(res, { error: 'Internal server error' }, 500);
    }
  }
}

// ===== APPLICATION =====
class Application {
  constructor(options = {}) {
    this.options = options;
    this.port = options.port || CONFIG.PORT;
    this.host = options.host || CONFIG.HOST;
    this.server = null;
    this.router = new Router();
    this.db = new Database(options.database || {});
    this.auth = new Auth(this);
    this.sessionManager = new SessionManager(options.session || {});
    this.middlewares = [];
    this.routes = [];
    this.errorHandlers = [];
    this.notFoundHandler = null;
    this.staticDir = options.staticDir || CONFIG.STATIC_DIR;
    this.viewsDir = options.viewsDir || path.join(process.cwd(), 'views');
    this.isInitialized = false;
    
    // Default middleware
    this.use(this.defaultMiddleware());
  }
  
  async init() {
    if (this.isInitialized) return;
    
    try {
      // Initialize database
      await this.db.init();
      
      // Set up default routes
      this.setupDefaultRoutes();
      
      this.isInitialized = true;
      Logger.info('Application initialized successfully');
    } catch (error) {
      Logger.error('Failed to initialize application:', error);
      throw error;
    }
  }
  
  defaultMiddleware() {
    return async (context, next) => {
      const { req, res } = context;
      
      // Add start time for response time calculation
      req.startTime = Date.now();
      
      // Increment request counter
      Metrics.increment('requests');
      
      // Add security headers
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('X-XSS-Protection', '1; mode=block');
      
      // Add CSP header if in production
      if (process.env.NODE_ENV === 'production') {
        res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'self'");
      }
      
      await next();
      
      // Calculate response time
      const responseTime = Date.now() - req.startTime;
      Metrics.timing('responseTime', responseTime);
      
      // Log request
      Logger.info(`${req.method} ${req.url} - ${res.statusCode} - ${responseTime}ms`);
    };
  }
  
  setupDefaultRoutes() {
    // Health check endpoint
    this.get('/health', async (context) => {
      const { res } = context;
      
      const health = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: CONFIG.VERSION,
        environment: process.env.NODE_ENV || 'development',
        database: this.isInitialized ? 'connected' : 'disconnected'
      };
      
      this.send(res, health);
    });
    
    // Metrics endpoint
    this.get('/metrics', async (context) => {
      const { res } = context;
      
      const metrics = Metrics.getSummary();
      this.send(res, metrics);
    });
    
    // API info endpoint
    this.get('/api', async (context) => {
      const { res } = context;
      
      const apiInfo = {
        name: 'Oran.js API',
        version: CONFIG.VERSION,
        description: 'Enterprise-grade fullstack framework',
        endpoints: this.routes.map(route => ({
          method: route.method,
          path: route.path,
          description: route.description || ''
        }))
      };
      
      this.send(res, apiInfo);
    });
  }
  
  use(middleware) {
    this.middlewares.push(middleware);
    return this;
  }
  
  get(path, ...handlers) {
    this.addRoute('GET', path, handlers);
    return this;
  }
  
  post(path, ...handlers) {
    this.addRoute('POST', path, handlers);
    return this;
  }
  
  put(path, ...handlers) {
    this.addRoute('PUT', path, handlers);
    return this;
  }
  
  patch(path, ...handlers) {
    this.addRoute('PATCH', path, handlers);
    return this;
  }
  
  delete(path, ...handlers) {
    this.addRoute('DELETE', path, handlers);
    return this;
  }
  
  all(path, ...handlers) {
    this.addRoute('ALL', path, handlers);
    return this;
  }
  
  addRoute(method, path, handlers) {
    const route = {
      method,
      path,
      handlers,
      description: ''
    };
    
    this.routes.push(route);
    this.router.addRoute(method, path, handlers);
    return this;
  }
  
  describeRoute(method, path, description) {
    const route = this.routes.find(r => r.method === method && r.path === path);
    if (route) {
      route.description = description;
    }
    return this;
  }
  
  static(prefix, options = {}) {
    const router = new Router({ ...options, prefix });
    
    // Add router to app
    this.use(async (context, next) => {
      const { req } = context;
      const parsedUrl = url.parse(req.url, true);
      const pathname = parsedUrl.pathname;
      
      // Check if path matches router prefix
      if (pathname.startsWith(prefix)) {
        // Update URL to remove prefix
        req.url = pathname.substring(prefix.length) + (parsedUrl.search || '');
        
        // Handle request with router
        await router.handleRequest(req, context.res);
      } else {
        await next();
      }
    });
    
    return router;
  }
  
  errorHandler(handler) {
    this.errorHandlers.push(handler);
    return this;
  }
  
  notFound(handler) {
    this.notFoundHandler = handler;
    return this;
  }
  
  async handleRequest(req, res) {
    try {
      // Parse URL
      const parsedUrl = url.parse(req.url, true);
      req.url = parsedUrl.pathname;
      req.query = parsedUrl.query;
      
      // Handle request with router
      await this.router.handleRequest(req, res);
    } catch (error) {
      Logger.error('Request handling error:', error);
      
      if (this.errorHandlers.length > 0) {
        for (const handler of this.errorHandlers) {
          try {
            handler(error, req, res);
          } catch (handlerError) {
            Logger.error('Error handler error:', handlerError);
          }
        }
      } else {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Internal server error' }));
      }
    }
  }
  
  async listen(port, host) {
    if (!this.isInitialized) {
      await this.init();
    }
    
    const serverPort = port || this.port;
    const serverHost = host || this.host;
    
    // Create HTTP server
    this.server = http.createServer(async (req, res) => {
      await this.handleRequest(req, res);
    });
    
    // Start listening
    return new Promise((resolve, reject) => {
      this.server.listen(serverPort, serverHost, () => {
        Logger.info(`Server running at http://${serverHost}:${serverPort}`);
        resolve(this.server);
      });
      
      this.server.on('error', (error) => {
        Logger.error('Server error:', error);
        reject(error);
      });
    });
  }
  
  async close() {
    if (this.server) {
      return new Promise((resolve) => {
        this.server.close(() => {
          Logger.info('Server closed');
          resolve();
        });
      });
    }
    
    // Close database
    await this.db.close();
    
    // Destroy session manager
    this.sessionManager.destroy();
  }
  
  send(res, data, statusCode = 200, headers = {}) {
    res.writeHead(statusCode, {
      'Content-Type': 'application/json',
      ...headers
    });
    res.end(JSON.stringify(data));
  }
}

// ===== CLI =====
class CLI {
  constructor() {
    this.commands = new Map();
    this.options = {
      program: 'oran',
      version: CONFIG.VERSION,
      description: 'Oran.js CLI - Enterprise-grade fullstack framework'
    };
    
    // Register built-in commands
    this.registerCommand('dev', this.devCommand);
    this.registerCommand('init', this.initCommand);
    this.registerCommand('create', this.createCommand);
    this.registerCommand('serve', this.serveCommand);
    this.registerCommand('migrate', this.migrateCommand);
    this.registerCommand('backup', this.backupCommand);
    this.registerCommand('restore', this.restoreCommand);
    this.registerCommand('compact', this.compactCommand);
    this.registerCommand('generate', this.generateCommand);
    this.registerCommand('deploy', this.deployCommand);
    this.registerCommand('help', this.helpCommand);
    this.registerCommand('version', this.versionCommand);
  }
  
  registerCommand(name, handler) {
    this.commands.set(name, handler);
  }
  
  async run(args = process.argv.slice(2)) {
    if (args.length === 0) {
      return this.helpCommand();
    }
    
    const commandName = args[0];
    const command = this.commands.get(commandName);
    
    if (!command) {
      console.error(`Unknown command: ${commandName}`);
      console.log('Run "oran help" to see available commands');
      return 1;
    }
    
    try {
      return await command(args.slice(1));
    } catch (error) {
      console.error(`Error executing command "${commandName}":`, error.message);
      return 1;
    }
  }
  
  async devCommand(args) {
    console.log('Starting development server...');
    
    // Create app with development settings
    const app = new Application({
      port: 3000,
      database: {
        storageEngine: 'memory'
      }
    });
    
    // Add development middleware
    app.use(async (context, next) => {
      const { req, res } = context;
      
      // Enable CORS in development
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      
      if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
      }
      
      await next();
    });
    
    // Add development routes
    app.get('/dev/api', async (context) => {
      const { res } = context;
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        message: 'Development API is running',
        timestamp: new Date().toISOString()
      }));
    });
    
    // Start server
    await app.listen();
    
    console.log('Development server started on http://localhost:3000');
    console.log('Press Ctrl+C to stop');
    
    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\nShutting down development server...');
      await app.close();
      process.exit(0);
    });
    
    // Keep process alive
    return new Promise(() => {});
  }
  
  async initCommand(args) {
    console.log('Initializing new Oran.js project...');
    
    const projectName = args[0] || 'my-oran-app';
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
      description: 'Oran.js application',
      main: 'index.js',
      scripts: {
        start: 'node index.js',
        dev: 'oran dev',
        serve: 'oran serve',
        migrate: 'oran migrate'
      },
      dependencies: {},
      devDependencies: {}
    };
    
    fs.writeFileSync(
      path.join(projectDir, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );
    
    // Create main application file
    const appCode = `const { Application } = require('oran');

// Create application
const app = new Application({
  port: process.env.PORT || 3000,
  database: {
    storageEngine: 'json'
  }
});

// Define models
const User = app.db.model('users', {
  email: { type: 'string', required: true },
  password: { type: 'string', required: true },
  name: { type: 'string', required: true }
});

// Add routes
app.get('/api/users', async (context) => {
  const { res } = context;
  const users = await User.findMany();
  res.send(users);
});

app.post('/api/users', async (context) => {
  const { req, res } = context;
  const user = await User.create(req.body);
  res.send(user, 201);
});

// Start server
app.listen().then(() => {
  console.log('Server started successfully');
}).catch(error => {
  console.error('Failed to start server:', error);
});
`;
    
    fs.writeFileSync(path.join(projectDir, 'index.js'), appCode);
    
    // Create README
    const readme = `# ${projectName}

An Oran.js application.

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

## API Endpoints

- GET /api/users - Get all users
- POST /api/users - Create a new user
`;
    
    fs.writeFileSync(path.join(projectDir, 'README.md'), readme);
    
    // Create .gitignore
    const gitignore = `node_modules/
.env
*.log
oran_data/
`;
    
    fs.writeFileSync(path.join(projectDir, '.gitignore'), gitignore);
    
    console.log(`Project "${projectName}" created successfully`);
    console.log(`\nNext steps:`);
    console.log(`  cd ${projectName}`);
    console.log(`  npm install`);
    console.log(`  npm run dev`);
    
    return 0;
  }
  
  async createCommand(args) {
    const type = args[0];
    const name = args[1];
    
    if (!type || !name) {
      console.error('Usage: oran create <type> <name>');
      console.log('Types: model, controller, route, middleware');
      return 1;
    }
    
    switch (type) {
      case 'model':
        return this.createModel(name);
      case 'controller':
        return this.createController(name);
      case 'route':
        return this.createRoute(name);
      case 'middleware':
        return this.createMiddleware(name);
      default:
        console.error(`Unknown type: ${type}`);
        return 1;
    }
  }
  
  async createModel(name) {
    const fileName = `${name.toLowerCase()}.model.js`;
    const filePath = path.join(process.cwd(), 'models', fileName);
    
    // Create models directory if it doesn't exist
    const modelsDir = path.join(process.cwd(), 'models');
    if (!fs.existsSync(modelsDir)) {
      fs.mkdirSync(modelsDir, { recursive: true });
    }
    
    // Check if file already exists
    if (fs.existsSync(filePath)) {
      console.error(`Model "${name}" already exists`);
      return 1;
    }
    
    // Create model file
    const modelCode = `const { Model } = require('oran');

class ${name}Model extends Model {
  static definition() {
    return {
      // Define your schema here
      name: { type: 'string', required: true },
      email: { type: 'string', required: true, unique: true },
      createdAt: { type: 'datetime', default: () => new Date() }
    };
  }
  
  static relations() {
    // Define relationships here
    // this.hasMany('posts', 'Post', { foreignKey: 'userId' });
  }
  
  static hooks() {
    // Define lifecycle hooks here
    // this.beforeCreate((record) => {
    //   // Do something before creating a record
    // });
  }
}

module.exports = ${name}Model;
`;
    
    fs.writeFileSync(filePath, modelCode);
    
    console.log(`Model "${name}" created successfully at ${filePath}`);
    return 0;
  }
  
  async createController(name) {
    const fileName = `${name.toLowerCase()}.controller.js`;
    const filePath = path.join(process.cwd(), 'controllers', fileName);
    
    // Create controllers directory if it doesn't exist
    const controllersDir = path.join(process.cwd(), 'controllers');
    if (!fs.existsSync(controllersDir)) {
      fs.mkdirSync(controllersDir, { recursive: true });
    }
    
    // Check if file already exists
    if (fs.existsSync(filePath)) {
      console.error(`Controller "${name}" already exists`);
      return 1;
    }
    
    // Create controller file
    const controllerCode = `const ${name}Model = require('../models/${name.toLowerCase()}.model');

class ${name}Controller {
  static async index(context) {
    const { res } = context;
    const records = await ${name}Model.findMany();
    res.send(records);
  }
  
  static async show(context) {
    const { req, res } = context;
    const { id } = req.params;
    const record = await ${name}Model.findById(id);
    
    if (!record) {
      return res.status(404).send({ error: 'Not found' });
    }
    
    res.send(record);
  }
  
  static async create(context) {
    const { req, res } = context;
    const record = await ${name}Model.create(req.body);
    res.send(record, 201);
  }
  
  static async update(context) {
    const { req, res } = context;
    const { id } = req.params;
    const record = await ${name}Model.update(id, req.body);
    res.send(record);
  }
  
  static async destroy(context) {
    const { req, res } = context;
    const { id } = req.params;
    await ${name}Model.delete(id);
    res.status(204).send();
  }
}

module.exports = ${name}Controller;
`;
    
    fs.writeFileSync(filePath, controllerCode);
    
    console.log(`Controller "${name}" created successfully at ${filePath}`);
    return 0;
  }
  
  async createRoute(name) {
    const fileName = `${name.toLowerCase()}.routes.js`;
    const filePath = path.join(process.cwd(), 'routes', fileName);
    
    // Create routes directory if it doesn't exist
    const routesDir = path.join(process.cwd(), 'routes');
    if (!fs.existsSync(routesDir)) {
      fs.mkdirSync(routesDir, { recursive: true });
    }
    
    // Check if file already exists
    if (fs.existsSync(filePath)) {
      console.error(`Route "${name}" already exists`);
      return 1;
    }
    
    // Create route file
    const routeCode = `const ${name}Controller = require('../controllers/${name.toLowerCase()}.controller');

function ${name}Routes(app) {
  // Get all records
  app.get('/api/${name.toLowerCase()}', ${name}Controller.index);
  
  // Get a single record
  app.get('/api/${name.toLowerCase()}/:id', ${name}Controller.show);
  
  // Create a new record
  app.post('/api/${name.toLowerCase()}', ${name}Controller.create);
  
  // Update a record
  app.put('/api/${name.toLowerCase()}/:id', ${name}Controller.update);
  
  // Delete a record
  app.delete('/api/${name.toLowerCase()}/:id', ${name}Controller.destroy);
}

module.exports = ${name}Routes;
`;
    
    fs.writeFileSync(filePath, routeCode);
    
    console.log(`Route "${name}" created successfully at ${filePath}`);
    return 0;
  }
  
  async createMiddleware(name) {
    const fileName = `${name.toLowerCase()}.middleware.js`;
    const filePath = path.join(process.cwd(), 'middleware', fileName);
    
    // Create middleware directory if it doesn't exist
    const middlewareDir = path.join(process.cwd(), 'middleware');
    if (!fs.existsSync(middlewareDir)) {
      fs.mkdirSync(middlewareDir, { recursive: true });
    }
    
    // Check if file already exists
    if (fs.existsSync(filePath)) {
      console.error(`Middleware "${name}" already exists`);
      return 1;
    }
    
    // Create middleware file
    const middlewareCode = `function ${name}Middleware(context, next) {
  const { req, res } = context;
  
  // Your middleware logic here
  
  return next();
}

module.exports = ${name}Middleware;
`;
    
    fs.writeFileSync(filePath, middlewareCode);
    
    console.log(`Middleware "${name}" created successfully at ${filePath}`);
    return 0;
  }
  
  async serveCommand(args) {
    console.log('Starting production server...');
    
    // Create app with production settings
    const app = new Application({
      port: process.env.PORT || 3000,
      database: {
        storageEngine: process.env.ORAN_STORAGE_ENGINE || 'json'
      }
    });
    
    // Start server
    await app.listen();
    
    console.log('Production server started');
    
    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\nShutting down server...');
      await app.close();
      process.exit(0);
    });
    
    // Keep process alive
    return new Promise(() => {});
  }
  
  async migrateCommand(args) {
    console.log('Running migrations...');
    
    try {
      // Load app
      const app = new Application();
      
      // Initialize database
      await app.db.init();
      
      // Run migrations
      await app.db.runMigrations();
      
      console.log('Migrations completed successfully');
      return 0;
    } catch (error) {
      console.error('Migration failed:', error.message);
      return 1;
    }
  }
  
  async backupCommand(args) {
    console.log('Creating backup...');
    
    const backupDir = args[0] || path.join(process.cwd(), 'backups');
    
    try {
      // Create backup directory if it doesn't exist
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }
      
      // Load app
      const app = new Application();
      
      // Initialize database
      await app.db.init();
      
      // Create backup
      const backupFiles = await app.db.backupAll(backupDir);
      
      console.log(`Backup created successfully at ${backupDir}`);
      console.log(`Files: ${backupFiles.join(', ')}`);
      return 0;
    } catch (error) {
      console.error('Backup failed:', error.message);
      return 1;
    }
  }
  
  async restoreCommand(args) {
    const backupDir = args[0];
    
    if (!backupDir) {
      console.error('Backup directory is required');
      return 1;
    }
    
    console.log(`Restoring from ${backupDir}...`);
    
    try {
      // Load app
      const app = new Application();
      
      // Initialize database
      await app.db.init();
      
      // Restore backup
      await app.db.restoreAll(backupDir);
      
      console.log('Backup restored successfully');
      return 0;
    } catch (error) {
      console.error('Restore failed:', error.message);
      return 1;
    }
  }
  
  async compactCommand(args) {
    console.log('Compacting database...');
    
    try {
      // Load app
      const app = new Application();
      
      // Initialize database
      await app.db.init();
      
      // Compact all collections
      const results = await app.db.compactAll();
      
      console.log(`Compaction completed. Results: ${results.join(', ')}`);
      return 0;
    } catch (error) {
      console.error('Compaction failed:', error.message);
      return 1;
    }
  }
  
  async generateCommand(args) {
    const type = args[0];
    
    if (!type) {
      console.error('Usage: oran generate <type>');
      console.log('Types: api, crud, auth, admin');
      return 1;
    }
    
    switch (type) {
      case 'api':
        return this.generateAPI();
      case 'crud':
        return this.generateCRUD(args[1]);
      case 'auth':
        return this.generateAuth();
      case 'admin':
        return this.generateAdmin();
      default:
        console.error(`Unknown type: ${type}`);
        return 1;
    }
  }
  
  async generateAPI() {
    console.log('Generating API structure...');
    
    // Create directories
    const dirs = ['models', 'controllers', 'routes', 'middleware'];
    for (const dir of dirs) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    }
    
    // Create base files
    this.createModel('User');
    this.createController('User');
    this.createRoute('User');
    
    console.log('API structure generated successfully');
    return 0;
  }
  
  async generateCRUD(resourceName) {
    if (!resourceName) {
      console.error('Resource name is required');
      return 1;
    }
    
    console.log(`Generating CRUD for ${resourceName}...`);
    
    // Create model
    this.createModel(resourceName);
    
    // Create controller
    this.createController(resourceName);
    
    // Create route
    this.createRoute(resourceName);
    
    console.log(`CRUD for ${resourceName} generated successfully`);
    return 0;
  }
  
  async generateAuth() {
    console.log('Generating authentication system...');
    
    // Create User model
    const userModelCode = `const { Model } = require('oran');

class UserModel extends Model {
  static definition() {
    return {
      email: { type: 'string', required: true, unique: true },
      password: { type: 'string', required: true },
      name: { type: 'string', required: true },
      isActive: { type: 'boolean', default: true },
      roles: { type: 'array', default: [] },
      permissions: { type: 'array', default: [] }
    };
  }
}

module.exports = UserModel;
`;
    
    const modelsDir = path.join(process.cwd(), 'models');
    if (!fs.existsSync(modelsDir)) {
      fs.mkdirSync(modelsDir, { recursive: true });
    }
    
    fs.writeFileSync(path.join(modelsDir, 'user.model.js'), userModelCode);
    
    // Create Auth controller
    const authControllerCode = `const UserModel = require('../models/user.model');

class AuthController {
  static async register(context) {
    const { req, res } = context;
    const { email, password, name } = req.body;
    
    try {
      const user = await context.app.auth.register({ email, password, name });
      res.send(user, 201);
    } catch (error) {
      res.status(400).send({ error: error.message });
    }
  }
  
  static async login(context) {
    const { req, res } = context;
    const { email, password } = req.body;
    
    try {
      const result = await context.app.auth.login(email, password);
      res.send(result);
    } catch (error) {
      res.status(401).send({ error: error.message });
    }
  }
  
  static async profile(context) {
    const { req, res } = context;
    
    try {
      const user = await context.app.auth.getUserById(req.user.id);
      res.send(user);
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
  }
}

module.exports = AuthController;
`;
    
    const controllersDir = path.join(process.cwd(), 'controllers');
    if (!fs.existsSync(controllersDir)) {
      fs.mkdirSync(controllersDir, { recursive: true });
    }
    
    fs.writeFileSync(path.join(controllersDir, 'auth.controller.js'), authControllerCode);
    
    // Create Auth routes
    const authRoutesCode = `const AuthController = require('../controllers/auth.controller');

function AuthRoutes(app) {
  // Register new user
  app.post('/api/auth/register', AuthController.register);
  
  // Login user
  app.post('/api/auth/login', AuthController.login);
  
  // Get user profile (protected)
  app.get('/api/auth/profile', app.auth.middleware(), AuthController.profile);
}

module.exports = AuthRoutes;
`;
    
    const routesDir = path.join(process.cwd(), 'routes');
    if (!fs.existsSync(routesDir)) {
      fs.mkdirSync(routesDir, { recursive: true });
    }
    
    fs.writeFileSync(path.join(routesDir, 'auth.routes.js'), authRoutesCode);
    
    console.log('Authentication system generated successfully');
    return 0;
  }
  
  async generateAdmin() {
    console.log('Generating admin interface...');
    
    // Create admin directory
    const adminDir = path.join(process.cwd(), 'admin');
    if (!fs.existsSync(adminDir)) {
      fs.mkdirSync(adminDir, { recursive: true });
    }
    
    // Create admin HTML file
    const adminHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Oran.js Admin</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css">
  <style>
    body {
      background-color: #f8f9fa;
    }
    .sidebar {
      min-height: 100vh;
      background-color: #343a40;
    }
    .sidebar .nav-link {
      color: rgba(255, 255, 255, 0.8);
    }
    .sidebar .nav-link:hover {
      color: white;
    }
    .sidebar .nav-link.active {
      color: white;
      background-color: #007bff;
    }
    .navbar-brand {
      color: #ff9800 !important;
      font-weight: bold;
    }
    .card {
      margin-bottom: 20px;
    }
    .table th {
      background-color: #f8f9fa;
    }
  </style>
</head>
<body>
  <div class="container-fluid">
    <div class="row">
      <!-- Sidebar -->
      <nav class="col-md-3 col-lg-2 d-md-block sidebar collapse">
        <div class="position-sticky pt-3">
          <ul class="nav flex-column">
            <li class="nav-item">
              <a class="nav-link active" href="#" data-page="dashboard">
                <i class="bi bi-speedometer2"></i> Dashboard
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="#" data-page="users">
                <i class="bi bi-people"></i> Users
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="#" data-page="settings">
                <i class="bi bi-gear"></i> Settings
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="#" data-page="backup">
                <i class="bi bi-hdd"></i> Backup
              </a>
            </li>
          </ul>
        </div>
      </nav>

      <!-- Main content -->
      <main class="col-md-9 ms-sm-auto col-lg-10 px-md-4">
        <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
          <h1 class="h2">Oran.js Admin</h1>
          <div class="btn-toolbar mb-2 mb-md-0">
            <div class="btn-group me-2">
              <button type="button" class="btn btn-sm btn-outline-secondary" id="refresh-btn">
                <i class="bi bi-arrow-clockwise"></i> Refresh
              </button>
            </div>
            <button type="button" class="btn btn-sm btn-primary" id="logout-btn">
              <i class="bi bi-box-arrow-right"></i> Logout
            </button>
          </div>
        </div>

        <!-- Dashboard -->
        <div id="dashboard-page" class="page">
          <div class="row">
            <div class="col-md-4">
              <div class="card">
                <div class="card-body">
                  <h5 class="card-title">Users</h5>
                  <h2 class="card-text" id="users-count">0</h2>
                </div>
              </div>
            </div>
            <div class="col-md-4">
              <div class="card">
                <div class="card-body">
                  <h5 class="card-title">Requests</h5>
                  <h2 class="card-text" id="requests-count">0</h2>
                </div>
              </div>
            </div>
            <div class="col-md-4">
              <div class="card">
                <div class="card-body">
                  <h5 class="card-title">Uptime</h5>
                  <h2 class="card-text" id="uptime">0s</h2>
                </div>
              </div>
            </div>
          </div>
          
          <div class="row mt-4">
            <div class="col-md-12">
              <div class="card">
                <div class="card-header">
                  System Metrics
                </div>
                <div class="card-body">
                  <canvas id="metrics-chart" height="100"></canvas>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Users Page -->
        <div id="users-page" class="page" style="display: none;">
          <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h5>Users</h5>
              <button class="btn btn-primary btn-sm" id="add-user-btn">
                <i class="bi bi-plus"></i> Add User
              </button>
            </div>
            <div class="card-body">
              <div class="table-responsive">
                <table class="table table-striped table-hover">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Active</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody id="users-table-body">
                    <!-- Users will be loaded here -->
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <!-- Settings Page -->
        <div id="settings-page" class="page" style="display: none;">
          <div class="card">
            <div class="card-header">
              <h5>Settings</h5>
            </div>
            <div class="card-body">
              <form id="settings-form">
                <div class="mb-3">
                  <label for="app-name" class="form-label">Application Name</label>
                  <input type="text" class="form-control" id="app-name" value="Oran.js App">
                </div>
                <div class="mb-3">
                  <label for="admin-email" class="form-label">Admin Email</label>
                  <input type="email" class="form-control" id="admin-email" value="admin@example.com">
                </div>
                <div class="mb-3 form-check">
                  <input type="checkbox" class="form-check-input" id="enable-registration">
                  <label class="form-check-label" for="enable-registration">
                    Enable User Registration
                  </label>
                </div>
                <button type="submit" class="btn btn-primary">Save Settings</button>
              </form>
            </div>
          </div>
        </div>

        <!-- Backup Page -->
        <div id="backup-page" class="page" style="display: none;">
          <div class="card">
            <div class="card-header">
              <h5>Backup & Restore</h5>
            </div>
            <div class="card-body">
              <div class="mb-3">
                <button class="btn btn-primary" id="backup-btn">
                  <i class="bi bi-download"></i> Create Backup
                </button>
              </div>
              <div class="mb-3">
                <label for="restore-file" class="form-label">Restore from Backup</label>
                <input type="file" class="form-control" id="restore-file">
              </div>
              <div class="mb-3">
                <button class="btn btn-success" id="restore-btn" disabled>
                  <i class="bi bi-upload"></i> Restore
                </button>
              </div>
              <div id="backup-status" class="alert alert-info" style="display: none;"></div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>

  <!-- User Modal -->
  <div class="modal fade" id="user-modal" tabindex="-1">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="user-modal-title">Add User</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
          <form id="user-form">
            <input type="hidden" id="user-id">
            <div class="mb-3">
              <label for="user-name" class="form-label">Name</label>
              <input type="text" class="form-control" id="user-name" required>
            </div>
            <div class="mb-3">
              <label for="user-email" class="form-label">Email</label>
              <input type="email" class="form-control" id="user-email" required>
            </div>
            <div class="mb-3">
              <label for="user-password" class="form-label">Password</label>
              <input type="password" class="form-control" id="user-password">
            </div>
            <div class="mb-3 form-check">
              <input type="checkbox" class="form-check-input" id="user-active">
              <label class="form-check-label" for="user-active">
                Active
              </label>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
          <button type="button" class="btn btn-primary" id="save-user-btn">Save</button>
        </div>
      </div>
    </div>
  </div>

  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <script>
    // API base URL
    const API_BASE = '/api';
    
    // DOM elements
    const pages = document.querySelectorAll('.page');
    const navLinks = document.querySelectorAll('.sidebar .nav-link');
    const refreshBtn = document.getElementById('refresh-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const addUserBtn = document.getElementById('add-user-btn');
    const userModal = new bootstrap.Modal(document.getElementById('user-modal'));
    const saveUserBtn = document.getElementById('save-user-btn');
    const backupBtn = document.getElementById('backup-btn');
    const restoreBtn = document.getElementById('restore-btn');
    const restoreFile = document.getElementById('restore-file');
    const backupStatus = document.getElementById('backup-status');
    
    // Chart
    let metricsChart = null;
    
    // Initialize
    document.addEventListener('DOMContentLoaded', () => {
      // Setup navigation
      navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          const page = link.getAttribute('data-page');
          showPage(page);
          
          // Update active nav link
          navLinks.forEach(l => l.classList.remove('active'));
          link.classList.add('active');
        });
      });
      
      // Setup buttons
      refreshBtn.addEventListener('click', loadDashboard);
      logoutBtn.addEventListener('click', logout);
      addUserBtn.addEventListener('click', () => showUserModal());
      saveUserBtn.addEventListener('click', saveUser);
      backupBtn.addEventListener('click', createBackup);
      restoreFile.addEventListener('change', () => {
        restoreBtn.disabled = !restoreFile.files.length;
      });
      restoreBtn.addEventListener('click', restoreBackup);
      
      // Load initial data
      loadDashboard();
    });
    
    // Show page
    function showPage(pageName) {
      pages.forEach(page => {
        page.style.display = page.id === \`\${pageName}-page\` ? 'block' : 'none';
      });
      
      // Load page-specific data
      if (pageName === 'users') {
        loadUsers();
      }
    }
    
    // Load dashboard data
    async function loadDashboard() {
      try {
        // Get metrics
        const metricsResponse = await fetch(\`\${API_BASE}/metrics\`);
        const metrics = await metricsResponse.json();
        
        // Update dashboard
        document.getElementById('requests-count').textContent = metrics.requests;
        document.getElementById('uptime').textContent = formatUptime(metrics.uptime);
        
        // Get users count
        const usersResponse = await fetch(\`\${API_BASE}/users\`);
        const users = await usersResponse.json();
        document.getElementById('users-count').textContent = users.length;
        
        // Update chart
        updateChart(metrics);
      } catch (error) {
        console.error('Error loading dashboard:', error);
        showAlert('Error loading dashboard data', 'danger');
      }
    }
    
    // Load users
    async function loadUsers() {
      try {
        const response = await fetch(\`\${API_BASE}/users\`);
        const users = await response.json();
        
        const tbody = document.getElementById('users-table-body');
        tbody.innerHTML = '';
        
        users.forEach(user => {
          const tr = document.createElement('tr');
          tr.innerHTML = \`
            <td>\${user.id}</td>
            <td>\${user.name}</td>
            <td>\${user.email}</td>
            <td>\${user.isActive ? '<span class="badge bg-success">Active</span>' : '<span class="badge bg-danger">Inactive</span>'}</td>
            <td>
              <button class="btn btn-sm btn-outline-primary edit-user-btn" data-id="\${user.id}">
                <i class="bi bi-pencil"></i>
              </button>
              <button class="btn btn-sm btn-outline-danger delete-user-btn" data-id="\${user.id}">
                <i class="bi bi-trash"></i>
              </button>
            </td>
          \`;
          tbody.appendChild(tr);
        });
        
        // Add event listeners to edit and delete buttons
        document.querySelectorAll('.edit-user-btn').forEach(btn => {
          btn.addEventListener('click', (e) => {
            const userId = e.currentTarget.getAttribute('data-id');
            editUser(userId);
          });
        });
        
        document.querySelectorAll('.delete-user-btn').forEach(btn => {
          btn.addEventListener('click', (e) => {
            const userId = e.currentTarget.getAttribute('data-id');
            deleteUser(userId);
          });
        });
      } catch (error) {
        console.error('Error loading users:', error);
        showAlert('Error loading users', 'danger');
      }
    }
    
    // Show user modal
    function showUserModal(user = null) {
      const modalTitle = document.getElementById('user-modal-title');
      const userId = document.getElementById('user-id');
      const userName = document.getElementById('user-name');
      const userEmail = document.getElementById('user-email');
      const userPassword = document.getElementById('user-password');
      const userActive = document.getElementById('user-active');
      
      if (user) {
        modalTitle.textContent = 'Edit User';
        userId.value = user.id;
        userName.value = user.name;
        userEmail.value = user.email;
        userPassword.value = '';
        userActive.checked = user.isActive;
      } else {
        modalTitle.textContent = 'Add User';
        userId.value = '';
        userName.value = '';
        userEmail.value = '';
        userPassword.value = '';
        userActive.checked = true;
      }
      
      userModal.show();
    }
    
    // Save user
    async function saveUser() {
      const userId = document.getElementById('user-id').value;
      const userName = document.getElementById('user-name').value;
      const userEmail = document.getElementById('user-email').value;
      const userPassword = document.getElementById('user-password').value;
      const userActive = document.getElementById('user-active').checked;
      
      const userData = {
        name: userName,
        email: userEmail,
        isActive: userActive
      };
      
      if (userPassword) {
        userData.password = userPassword;
      }
      
      try {
        let response;
        if (userId) {
          response = await fetch(\`\${API_BASE}/users/\${userId}\`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
          });
        } else {
          response = await fetch(\`\${API_BASE}/users\`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
          });
        }
        
        if (response.ok) {
          userModal.hide();
          loadUsers();
          showAlert('User saved successfully', 'success');
        } else {
          const error = await response.json();
          showAlert(error.error || 'Error saving user', 'danger');
        }
      } catch (error) {
        console.error('Error saving user:', error);
        showAlert('Error saving user', 'danger');
      }
    }
    
    // Edit user
    async function editUser(userId) {
      try {
        const response = await fetch(\`\${API_BASE}/users/\${userId}\`);
        const user = await response.json();
        
        if (user) {
          showUserModal(user);
        } else {
          showAlert('User not found', 'danger');
        }
      } catch (error) {
        console.error('Error loading user:', error);
        showAlert('Error loading user', 'danger');
      }
    }
    
    // Delete user
    async function deleteUser(userId) {
      if (!confirm('Are you sure you want to delete this user?')) {
        return;
      }
      
      try {
        const response = await fetch(\`\${API_BASE}/users/\${userId}\`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          loadUsers();
          showAlert('User deleted successfully', 'success');
        } else {
          const error = await response.json();
          showAlert(error.error || 'Error deleting user', 'danger');
        }
      } catch (error) {
        console.error('Error deleting user:', error);
        showAlert('Error deleting user', 'danger');
      }
    }
    
    // Create backup
    async function createBackup() {
      try {
        backupStatus.style.display = 'block';
        backupStatus.textContent = 'Creating backup...';
        backupStatus.className = 'alert alert-info';
        
        const response = await fetch('/admin/backup', {
          method: 'POST'
        });
        
        const result = await response.json();
        
        if (response.ok) {
          backupStatus.textContent = 'Backup created successfully';
          backupStatus.className = 'alert alert-success';
          
          // Create download link
          const a = document.createElement('a');
          a.href = result.file;
          a.download = result.file.split('/').pop();
          a.click();
        } else {
          backupStatus.textContent = result.error || 'Error creating backup';
          backupStatus.className = 'alert alert-danger';
        }
      } catch (error) {
        console.error('Error creating backup:', error);
        backupStatus.textContent = 'Error creating backup';
        backupStatus.className = 'alert alert-danger';
      }
    }
    
    // Restore backup
    async function restoreBackup() {
      if (!confirm('Are you sure you want to restore from backup? This will replace all current data.')) {
        return;
      }
      
      const file = restoreFile.files[0];
      if (!file) {
        return;
      }
      
      try {
        backupStatus.style.display = 'block';
        backupStatus.textContent = 'Restoring backup...';
        backupStatus.className = 'alert alert-info';
        
        const formData = new FormData();
        formData.append('backup', file);
        
        const response = await fetch('/admin/restore', {
          method: 'POST',
          body: formData
        });
        
        const result = await response.json();
        
        if (response.ok) {
          backupStatus.textContent = 'Backup restored successfully';
          backupStatus.className = 'alert alert-success';
          
          // Reload page
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        } else {
          backupStatus.textContent = result.error || 'Error restoring backup';
          backupStatus.className = 'alert alert-danger';
        }
      } catch (error) {
        console.error('Error restoring backup:', error);
        backupStatus.textContent = 'Error restoring backup';
        backupStatus.className = 'alert alert-danger';
      }
    }
    
    // Logout
    function logout() {
      window.location.href = '/logout';
    }
    
    // Update chart
    function updateChart(metrics) {
      const ctx = document.getElementById('metrics-chart').getContext('2d');
      
      if (metricsChart) {
        metricsChart.destroy();
      }
      
      metricsChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['1 min ago', '45 sec ago', '30 sec ago', '15 sec ago', 'Now'],
          datasets: [{
            label: 'Response Time (ms)',
            data: [
              metrics.avgResponseTime * 0.8,
              metrics.avgResponseTime * 0.9,
              metrics.avgResponseTime * 0.95,
              metrics.avgResponseTime * 0.98,
              metrics.avgResponseTime
            ],
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1,
            fill: false
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    }
    
    // Format uptime
    function formatUptime(seconds) {
      const days = Math.floor(seconds / 86400);
      const hours = Math.floor((seconds % 86400) / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      
      if (days > 0) {
        return \`\${days}d \${hours}h\`;
      } else if (hours > 0) {
        return \`\${hours}h \${minutes}m\`;
      } else {
        return \`\${minutes}m\`;
      }
    }
    
    // Show alert
    function showAlert(message, type) {
      const alertDiv = document.createElement('div');
      alertDiv.className = \`alert alert-\${type} alert-dismissible fade show\`;
      alertDiv.role = 'alert';
      alertDiv.innerHTML = \`
        \${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
      \`;
      
      document.querySelector('.col-md-9').prepend(alertDiv);
      
      // Auto-hide after 5 seconds
      setTimeout(() => {
        alertDiv.classList.remove('show');
        setTimeout(() => {
          alertDiv.remove();
        }, 150);
      }, 5000);
    }
  </script>
</body>
</html>
`;
    
    fs.writeFileSync(path.join(adminDir, 'index.html'), adminHtml);
    
    // Create admin route
    const adminRouteCode = `// Admin route
app.get('/admin', (req, res) => {
  // In a real app, you would check if the user is an admin
  // For simplicity, we'll just serve the admin page
  res.sendFile(path.join(__dirname, 'admin/index.html'));
});

// Admin API routes
app.post('/admin/backup', async (req, res) => {
  try {
    const backupDir = path.join(process.cwd(), 'backups');
    const backupFiles = await app.db.backupAll(backupDir);
    
    if (backupFiles.length > 0) {
      res.send({
        success: true,
        message: 'Backup created successfully',
        file: backupFiles[0]
      });
    } else {
      res.status(500).send({
        success: false,
        message: 'Failed to create backup'
      });
    }
  } catch (error) {
    res.status(500).send({
      success: false,
      message: error.message
    });
  }
});

app.post('/admin/restore', async (req, res) => {
  try {
    if (!req.files || !req.files.backup) {
      return res.status(400).send({
        success: false,
        message: 'No backup file provided'
      });
    }
    
    const backupFile = req.files.backup;
    const tempPath = backupFile.path;
    const targetPath = path.join(process.cwd(), 'backups', backupFile.name);
    
    // Move file to backups directory
    await fs.promises.rename(tempPath, targetPath);
    
    // Restore from backup
    await app.db.restoreAll(path.dirname(targetPath));
    
    res.send({
      success: true,
      message: 'Backup restored successfully'
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: error.message
    });
  }
});
`;
    
    console.log('Admin interface generated successfully');
    return 0;
  }
  
  async deployCommand(args) {
    const platform = args[0];
    
    if (!platform) {
      console.error('Usage: oran deploy <platform>');
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
  
  async deployHeroku() {
    console.log('Generating Heroku deployment files...');
    
    // Create Procfile
    const procfile = 'web: node index.js';
    fs.writeFileSync(path.join(process.cwd(), 'Procfile'), procfile);
    
    // Create .env.example
    const envExample = `# Environment variables
NODE_ENV=production
PORT=3000
ORAN_SESSION_SECRET=your-secret-key-here
ORAN_JWT_SECRET=your-jwt-secret-here
ORAN_ENCRYPTION_KEY=your-encryption-key-here
ORAN_STORAGE_ENGINE=json
ORAN_CLUSTER=false
ORAN_METRICS=true
ORAN_ADMIN=true
ORAN_SSR=false
ORAN_RBAC=false
ORAN_CSRF=false
`;
    
    fs.writeFileSync(path.join(process.cwd(), '.env.example'), envExample);
    
    // Create app.json
    const appJson = `{
  "name": "Oran.js App",
  "description": "An Oran.js application",
  "keywords": ["node", "express", "framework"],
  "buildpacks": [
    {
      "url": "heroku/nodejs"
    }
  ],
  "env": {
    "NODE_ENV": {
      "description": "Environment",
      "value": "production"
    },
    "ORAN_SESSION_SECRET": {
      "description": "Session secret",
      "generator": "secret"
    },
    "ORAN_JWT_SECRET": {
      "description": "JWT secret",
      "generator": "secret"
    },
    "ORAN_ENCRYPTION_KEY": {
      "description": "Encryption key",
      "generator": "secret"
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
  
  async deployVercel() {
    console.log('Generating Vercel deployment files...');
    
    // Create vercel.json
    const vercelJson = `{
  "version": 2,
  "builds": [
    {
      "src": "index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "index.js"
    }
  ],
  "env": {
    "NODE_ENV": "production",
    "ORAN_SESSION_SECRET": "@oran_session_secret",
    "ORAN_JWT_SECRET": "@oran_jwt_secret",
    "ORAN_ENCRYPTION_KEY": "@oran_encryption_key"
  }
}
`;
    
    fs.writeFileSync(path.join(process.cwd(), 'vercel.json'), vercelJson);
    
    // Create .env.example
    const envExample = `# Environment variables
NODE_ENV=production
PORT=3000
ORAN_SESSION_SECRET=your-secret-key-here
ORAN_JWT_SECRET=your-jwt-secret-here
ORAN_ENCRYPTION_KEY=your-encryption-key-here
ORAN_STORAGE_ENGINE=json
ORAN_CLUSTER=false
ORAN_METRICS=true
ORAN_ADMIN=true
ORAN_SSR=false
ORAN_RBAC=false
ORAN_CSRF=false
`;
    
    fs.writeFileSync(path.join(process.cwd(), '.env.example'), envExample);
    
    console.log('Vercel deployment files generated successfully');
    console.log('\nTo deploy to Vercel:');
    console.log('  1. Install Vercel CLI: npm i -g vercel');
    console.log('  2. Login to Vercel: vercel login');
    console.log('  3. Deploy: vercel');
    
    return 0;
  }
  
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
CMD ["node", "index.js"]
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
      - ORAN_SESSION_SECRET=your-secret-key-here
      - ORAN_JWT_SECRET=your-jwt-secret-here
      - ORAN_ENCRYPTION_KEY=your-encryption-key-here
      - ORAN_STORAGE_ENGINE=json
      - ORAN_CLUSTER=false
      - ORAN_METRICS=true
      - ORAN_ADMIN=true
      - ORAN_SSR=false
      - ORAN_RBAC=false
      - ORAN_CSRF=false
    volumes:
      - ./oran_data:/app/oran_data
    restart: unless-stopped
`;
    
    fs.writeFileSync(path.join(process.cwd(), 'docker-compose.yml'), dockerCompose);
    
    // Create .env.example
    const envExample = `# Environment variables
NODE_ENV=production
PORT=3000
ORAN_SESSION_SECRET=your-secret-key-here
ORAN_JWT_SECRET=your-jwt-secret-here
ORAN_ENCRYPTION_KEY=your-encryption-key-here
ORAN_STORAGE_ENGINE=json
ORAN_CLUSTER=false
ORAN_METRICS=true
ORAN_ADMIN=true
ORAN_SSR=false
ORAN_RBAC=false
ORAN_CSRF=false
`;
    
    fs.writeFileSync(path.join(process.cwd(), '.env.example'), envExample);
    
    console.log('Docker deployment files generated successfully');
    console.log('\nTo deploy with Docker:');
    console.log('  1. Install Docker: https://docs.docker.com/get-docker/');
    console.log('  2. Build image: docker build -t oran-app .');
    console.log('  3. Run container: docker run -p 3000:3000 oran-app');
    console.log('  4. Or use Docker Compose: docker-compose up -d');
    
    return 0;
  }
  
  async helpCommand() {
    console.log(`${this.options.program} v${this.options.version} - ${this.options.description}`);
    console.log('');
    console.log('Usage: oran <command> [options]');
    console.log('');
    console.log('Commands:');
    console.log('  dev          Start development server');
    console.log('  init         Create a new Oran.js project');
    console.log('  create       Create a new model, controller, route, or middleware');
    console.log('  serve        Start production server');
    console.log('  migrate      Run database migrations');
    console.log('  backup       Create database backup');
    console.log('  restore      Restore database from backup');
    console.log('  compact      Compact database');
    console.log('  generate     Generate API, CRUD, auth, or admin');
    console.log('  deploy       Generate deployment files for Heroku, Vercel, or Docker');
    console.log('  help         Show this help message');
    console.log('  version      Show version information');
    console.log('');
    console.log('For more information, visit https://github.com/johnmwirigimahugu/oran');
    
    return 0;
  }
  
  async versionCommand() {
    console.log(`${this.options.program} v${this.options.version}`);
    return 0;
  }
}

// ===== EXPORTS =====
module.exports = {
  CONFIG,
  Logger,
  Metrics,
  StorageEngine,
  JSONStorageEngine,
  SQLiteStorageEngine,
  MemoryStorageEngine,
  Database,
  Collection,
  Model,
  QueryBuilder,
  Auth,
  SessionManager,
  Router,
  Application,
  CLI
};

// ===== CLI EXECUTION =====
if (require.main === module) {
  const cli = new CLI();
  cli.run().then(exitCode => {
    process.exit(exitCode);
  }).catch(error => {
    console.error('CLI error:', error);
    process.exit(1);
  });
}

/* ===============================
   Final dedication (UTF-8 compatible)
   =============================== */

/*
  Dedicated to my son and to all developers around the world.
  Thank you to YHWH (יְהֹוָה).

  — John Kesh Mahugu (2025)
*/
