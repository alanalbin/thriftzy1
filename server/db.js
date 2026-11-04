import Database from 'better-sqlite3';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'thriftzy.sqlite');
const db = new Database(dbPath);

// WAL mode for high performance
db.pragma('journal_mode = WAL');

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS clothes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    brand TEXT DEFAULT 'Thriftzy',
    price REAL NOT NULL,
    originalPrice REAL,
    size TEXT NOT NULL,
    condition TEXT NOT NULL,
    image TEXT NOT NULL,
    gallery TEXT,
    description TEXT,
    contactNumber TEXT,
    status TEXT DEFAULT 'Available',
    viewsCount INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS inquiries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    clothId TEXT,
    buyerName TEXT,
    buyerContact TEXT,
    message TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (clothId) REFERENCES clothes (id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS admins (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT DEFAULT 'Admin',
    role TEXT DEFAULT 'admin',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS admin_sessions (
    token TEXT PRIMARY KEY,
    admin_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME NOT NULL,
    FOREIGN KEY (admin_id) REFERENCES admins (id) ON DELETE CASCADE
  );
`);

console.log('[SQLite DB] Initialized clean database with Dynamic Admin Authentication schema.');

// Password Hashing & Verification using Node PBKDF2
export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password, storedHash) {
  if (!storedHash || !storedHash.includes(':')) return false;
  const [salt, originalHash] = storedHash.split(':');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return hash === originalHash;
}

// Ensure at least one dynamic admin exists if table is empty
const adminCount = db.prepare('SELECT COUNT(*) as count FROM admins').get().count;
if (adminCount === 0) {
  const initialEmail = 'admin@thriftzy.store';
  const initialPassword = 'adminpassword123';
  const initialHash = hashPassword(initialPassword);
  db.prepare(`
    INSERT INTO admins (id, email, password_hash, name, role)
    VALUES (?, ?, ?, ?, ?)
  `).run('admin_init_1', initialEmail, initialHash, 'Store Owner', 'superadmin');
  console.log(`[SQLite DB] Initial dynamic admin created: ${initialEmail} (can be changed anytime)`);
}

// Admin Operations
export function findAdminByEmail(email) {
  if (!email) return null;
  return db.prepare('SELECT * FROM admins WHERE LOWER(email) = LOWER(?)').get(email.trim());
}

export function findAdminById(id) {
  if (!id) return null;
  return db.prepare('SELECT id, email, name, role, created_at FROM admins WHERE id = ?').get(id);
}

export function getAllAdmins() {
  return db.prepare('SELECT id, email, name, role, created_at FROM admins ORDER BY created_at ASC').all();
}

export function createAdminAccount({ email, password, name = 'Admin', role = 'admin' }) {
  const cleanEmail = email.toLowerCase().trim();
  const existing = findAdminByEmail(cleanEmail);
  if (existing) {
    throw new Error('An admin account with this email already exists.');
  }

  const id = 'admin_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6);
  const passwordHash = hashPassword(password);

  db.prepare(`
    INSERT INTO admins (id, email, password_hash, name, role)
    VALUES (?, ?, ?, ?, ?)
  `).run(id, cleanEmail, passwordHash, name.trim(), role);

  return findAdminById(id);
}

export function updateAdminCredentials(id, { email, password, name }) {
  const admin = db.prepare('SELECT * FROM admins WHERE id = ?').get(id);
  if (!admin) throw new Error('Admin not found.');

  const fields = [];
  const values = [];

  if (email && email.trim()) {
    const cleanEmail = email.toLowerCase().trim();
    // Check if new email is taken by another admin
    const checkOther = db.prepare('SELECT id FROM admins WHERE LOWER(email) = LOWER(?) AND id != ?').get(cleanEmail, id);
    if (checkOther) throw new Error('This email is already in use by another admin.');
    fields.push('email = ?');
    values.push(cleanEmail);
  }

  if (password && password.trim()) {
    if (password.length < 6) throw new Error('Password must be at least 6 characters.');
    fields.push('password_hash = ?');
    values.push(hashPassword(password));
  }

  if (name && name.trim()) {
    fields.push('name = ?');
    values.push(name.trim());
  }

  if (fields.length > 0) {
    values.push(id);
    db.prepare(`UPDATE admins SET ${fields.join(', ')} WHERE id = ?`).run(...values);
  }

  return findAdminById(id);
}

export function deleteAdminAccount(id) {
  const count = db.prepare('SELECT COUNT(*) as count FROM admins').get().count;
  if (count <= 1) {
    throw new Error('Cannot delete the only remaining admin account.');
  }
  const result = db.prepare('DELETE FROM admins WHERE id = ?').run(id);
  return result.changes > 0;
}

// Session Token Management
export function createSession(adminId) {
  const token = 'tok_' + crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days

  db.prepare(`
    INSERT INTO admin_sessions (token, admin_id, expires_at)
    VALUES (?, ?, ?)
  `).run(token, adminId, expiresAt);

  return { token, expiresAt };
}

export function verifySession(token) {
  if (!token) return null;

  const session = db.prepare(`
    SELECT s.token, s.expires_at, a.id, a.email, a.name, a.role, a.created_at
    FROM admin_sessions s
    JOIN admins a ON s.admin_id = a.id
    WHERE s.token = ?
  `).get(token);

  if (!session) return null;

  // Check expiration
  if (new Date(session.expires_at) < new Date()) {
    deleteSession(token);
    return null;
  }

  return {
    id: session.id,
    email: session.email,
    name: session.name,
    role: session.role,
    created_at: session.created_at,
    token: session.token
  };
}

export function deleteSession(token) {
  if (!token) return;
  db.prepare('DELETE FROM admin_sessions WHERE token = ?').run(token);
}

// Clothes CRUD
export function getAllClothes() {
  const rows = db.prepare('SELECT * FROM clothes ORDER BY created_at DESC').all();
  return rows.map((item) => ({
    ...item,
    gallery: item.gallery ? JSON.parse(item.gallery) : [item.image],
  }));
}

export function getClothById(id) {
  const item = db.prepare('SELECT * FROM clothes WHERE id = ?').get(id);
  if (!item) return null;
  return {
    ...item,
    gallery: item.gallery ? JSON.parse(item.gallery) : [item.image],
  };
}

export function createCloth(data) {
  const id = data.id || 'cloth_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6);
  const gallery = JSON.stringify(
    Array.isArray(data.gallery) && data.gallery.length > 0 ? data.gallery : [data.image]
  );

  const stmt = db.prepare(`
    INSERT INTO clothes (
      id, name, category, brand, price, originalPrice, size, condition, image, gallery, description, contactNumber, status, viewsCount
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
    )
  `);

  stmt.run(
    id,
    data.name,
    data.category || 'T-Shirts',
    data.brand || 'Thriftzy',
    Number(data.price) || 0,
    data.originalPrice ? Number(data.originalPrice) : null,
    data.size || 'M',
    data.condition || 'Like New',
    data.image,
    gallery,
    data.description || '',
    data.contactNumber || '',
    data.status || 'Available',
    0
  );

  return getClothById(id);
}

export function updateCloth(id, data) {
  const existing = getClothById(id);
  if (!existing) return null;

  const fields = [];
  const values = [];

  const allowedKeys = [
    'name',
    'category',
    'brand',
    'price',
    'originalPrice',
    'size',
    'condition',
    'image',
    'description',
    'contactNumber',
    'status'
  ];

  for (const [key, val] of Object.entries(data)) {
    if (allowedKeys.includes(key)) {
      fields.push(`${key} = ?`);
      values.push(key === 'price' || key === 'originalPrice' ? (val ? Number(val) : null) : val);
    }
  }

  if (fields.length > 0) {
    values.push(id);
    const sql = `UPDATE clothes SET ${fields.join(', ')} WHERE id = ?`;
    db.prepare(sql).run(...values);
  }

  return getClothById(id);
}

export function deleteCloth(id) {
  const stmt = db.prepare('DELETE FROM clothes WHERE id = ?');
  const result = stmt.run(id);
  return result.changes > 0;
}

export function createInquiry(clothId, buyerName, buyerContact, message) {
  const stmt = db.prepare(`
    INSERT INTO inquiries (clothId, buyerName, buyerContact, message)
    VALUES (?, ?, ?, ?)
  `);
  stmt.run(clothId, buyerName, buyerContact, message || '');
  return { success: true };
}

export function getAllInquiries() {
  return db.prepare(`
    SELECT i.*, c.name as clothName, c.price as clothPrice
    FROM inquiries i
    LEFT JOIN clothes c ON i.clothId = c.id
    ORDER BY i.created_at DESC
  `).all();
}

export function getStats() {
  const count = db.prepare('SELECT COUNT(*) as count FROM clothes').get().count;
  const valuation = db.prepare('SELECT SUM(price) as total FROM clothes').get().total || 0;
  const availableCount = db.prepare("SELECT COUNT(*) as count FROM clothes WHERE status = 'Available'").get().count;
  const soldCount = db.prepare("SELECT COUNT(*) as count FROM clothes WHERE status = 'Sold'").get().count;
  const adminTotal = db.prepare('SELECT COUNT(*) as count FROM admins').get().count;

  return {
    totalClothes: count,
    totalValuation: Math.round(valuation),
    availableCount,
    soldCount,
    adminTotal,
    dbPath,
    status: 'SQLite Database Connected & Dynamic Auth Active'
  };
}

export function clearDatabase() {
  db.exec('DELETE FROM inquiries; DELETE FROM clothes;');
  return [];
}
