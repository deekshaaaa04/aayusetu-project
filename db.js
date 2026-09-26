import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, 'database.json');

const initialSchema = {
  users: [],
  patients: [],
  doctors: [],
  asha_workers: [],
  hospitals: [],
  departments: [],
  facilities: [],
  facility_availability: [],
  appointments: [],
  queues: [],
  consultations: [],
  prescriptions: [],
  referrals: [],
  emergency_requests: [],
  ambulances: [],
  journey_tracking: [],
  diagnostics: [],
  medicines: [],
  medicine_availability: [],
  follow_ups: [],
  notifications: [],
  audit_logs: [],
  ai_configs: []
};

class Database {
  constructor() {
    this.data = { ...initialSchema };
    this.load();
  }

  load() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf8');
        this.data = { ...initialSchema, ...JSON.parse(raw) };
      } else {
        this.save();
      }
    } catch (err) {
      console.error('Error loading DB, resetting to default:', err);
      this.data = { ...initialSchema };
      this.save();
    }
  }

  save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (err) {
      console.error('Error saving DB:', err);
    }
  }

  get(table, filterFn) {
    if (!this.data[table]) return [];
    if (!filterFn) return this.data[table];
    return this.data[table].filter(filterFn);
  }

  find(table, filterFn) {
    if (!this.data[table]) return null;
    return this.data[table].find(filterFn) || null;
  }

  insert(table, item) {
    if (!this.data[table]) this.data[table] = [];
    const newItem = {
      id: item.id || `${table}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      createdAt: item.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...item
    };
    this.data[table].push(newItem);
    this.save();
    return newItem;
  }

  update(table, id, updates) {
    if (!this.data[table]) return null;
    const idx = this.data[table].findIndex(i => i.id === id);
    if (idx === -1) return null;

    this.data[table][idx] = {
      ...this.data[table][idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.save();
    return this.data[table][idx];
  }

  delete(table, id) {
    if (!this.data[table]) return false;
    const initialLen = this.data[table].length;
    this.data[table] = this.data[table].filter(i => i.id !== id);
    if (this.data[table].length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  logAudit(userId, role, action, targetResource, details) {
    this.insert('audit_logs', {
      userId,
      role,
      action,
      targetResource,
      details,
      timestamp: new Date().toISOString()
    });
  }
}

const db = new Database();
export default db;
