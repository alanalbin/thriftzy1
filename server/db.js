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

  CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY,
    google_id TEXT,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    avatar TEXT,
    phone TEXT,
    address TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    customer_email TEXT NOT NULL,
    customer_name TEXT,
    customer_phone TEXT,
    delivery_address TEXT,
    items TEXT NOT NULL,
    total_amount REAL NOT NULL,
    currency TEXT DEFAULT 'INR',
    status TEXT DEFAULT 'Confirmed',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS customer_carts (
    id TEXT PRIMARY KEY,
    customer_email TEXT NOT NULL,
    cloth_id TEXT NOT NULL,
    item_json TEXT NOT NULL,
    added_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Ensure customer schema has Firebase and login tracking columns
try { db.exec(`ALTER TABLE customers ADD COLUMN firebase_uid TEXT;`); } catch (e) {}
try { db.exec(`ALTER TABLE customers ADD COLUMN auth_provider TEXT DEFAULT 'google';`); } catch (e) {}
try { db.exec(`ALTER TABLE customers ADD COLUMN last_login_at DATETIME;`); } catch (e) {}
try { db.exec(`ALTER TABLE customers ADD COLUMN updated_at DATETIME;`); } catch (e) {}

console.log('[SQLite DB] Initialized database with customers, orders, and dynamic admin schema.');

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

// Master Admin configuration: albineditz1@gmail.com / batman
const MASTER_ADMIN_EMAIL = 'albineditz1@gmail.com';
const MASTER_ADMIN_PASS = 'batman';
const masterHash = hashPassword(MASTER_ADMIN_PASS);

// Remove old demo admin accounts
db.prepare("DELETE FROM admins WHERE LOWER(email) = 'admin@thriftzy.store'").run();

// Ensure master admin exists with correct password
const existingMaster = db.prepare('SELECT * FROM admins WHERE LOWER(email) = LOWER(?)').get(MASTER_ADMIN_EMAIL);
if (!existingMaster) {
  db.prepare(`
    INSERT INTO admins (id, email, password_hash, name, role)
    VALUES (?, ?, ?, ?, ?)
  `).run('admin_albin_master', MASTER_ADMIN_EMAIL, masterHash, 'Albin (Owner)', 'superadmin');
  console.log(`[SQLite DB] Master admin initialized: ${MASTER_ADMIN_EMAIL}`);
} else {
  db.prepare('UPDATE admins SET password_hash = ? WHERE LOWER(email) = LOWER(?)').run(masterHash, MASTER_ADMIN_EMAIL);
}

// Clean out any old static placeholder clothes
db.prepare("DELETE FROM clothes WHERE id IN ('cloth_og_01', 'cloth_og_02', 'cloth_og_03')").run();

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

// Update admin credentials
export function updateAdminCredentials(id, { email, password, name }) {
  const admin = db.prepare('SELECT * FROM admins WHERE id = ?').get(id);
  if (!admin) throw new Error('Admin not found.');

  const fields = [];
  const values = [];

  if (email && email.trim()) {
    const cleanEmail = email.toLowerCase().trim();
    const checkOther = db.prepare('SELECT id FROM admins WHERE LOWER(email) = LOWER(?) AND id != ?').get(cleanEmail, id);
    if (checkOther) throw new Error('This email is already in use.');
    fields.push('email = ?');
    values.push(cleanEmail);
  }

  if (password && password.trim()) {
    if (password.length < 5) throw new Error('Password must be at least 5 characters.');
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
    data.condition || 'Like New (Mint)',
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

// Customer Profile Management (Stores Google Sign-In & Firebase User Data)
export function saveCustomerProfile({ email, name, avatar, phone, address, google_id, firebase_uid, auth_provider }) {
  if (!email) throw new Error('Email is required');
  const cleanEmail = email.toLowerCase().trim();
  const existing = db.prepare('SELECT * FROM customers WHERE LOWER(email) = ?').get(cleanEmail);
  const id = existing ? existing.id : 'cust_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6);
  const now = new Date().toISOString();

  if (existing) {
    db.prepare(`
      UPDATE customers 
      SET name = COALESCE(?, name),
          avatar = COALESCE(?, avatar),
          phone = COALESCE(?, phone),
          address = COALESCE(?, address),
          google_id = COALESCE(?, google_id),
          firebase_uid = COALESCE(?, firebase_uid),
          auth_provider = COALESCE(?, auth_provider),
          last_login_at = ?,
          updated_at = ?
      WHERE id = ?
    `).run(
      name || null,
      avatar || null,
      phone || null,
      address || null,
      google_id || null,
      firebase_uid || null,
      auth_provider || null,
      now,
      now,
      id
    );
  } else {
    db.prepare(`
      INSERT INTO customers (id, google_id, firebase_uid, auth_provider, email, name, avatar, phone, address, last_login_at, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      google_id || '',
      firebase_uid || '',
      auth_provider || 'firebase_google',
      cleanEmail,
      name || 'Customer',
      avatar || '',
      phone || '',
      address || '',
      now,
      now,
      now
    );
  }

  return db.prepare('SELECT * FROM customers WHERE id = ?').get(id);
}

export function getAllCustomers() {
  return db.prepare('SELECT id, email, name, avatar, phone, address, auth_provider, firebase_uid, last_login_at, created_at FROM customers ORDER BY created_at DESC').all();
}

export function getCustomerProfile(email) {
  if (!email) return null;
  return db.prepare('SELECT * FROM customers WHERE LOWER(email) = ?').get(email.toLowerCase().trim());
}

// Customer Orders Management
export function createOrder({ customerEmail, customerName, customerPhone, deliveryAddress, items, totalAmount }) {
  if (!customerEmail) throw new Error('Customer email is required.');
  const id = 'ORD-' + Math.floor(100000 + Math.random() * 900000);
  const itemsJson = typeof items === 'string' ? items : JSON.stringify(items || []);

  db.prepare(`
    INSERT INTO orders (id, customer_email, customer_name, customer_phone, delivery_address, items, total_amount, currency, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'INR', 'Confirmed')
  `).run(
    id,
    customerEmail.toLowerCase().trim(),
    customerName || 'Customer',
    customerPhone || '',
    deliveryAddress || '',
    itemsJson,
    Number(totalAmount) || 0
  );

  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
  return {
    ...order,
    items: JSON.parse(order.items || '[]')
  };
}

export function getCustomerOrders(email) {
  if (!email) return [];
  const rows = db.prepare('SELECT * FROM orders WHERE LOWER(customer_email) = ? ORDER BY created_at DESC').all(email.toLowerCase().trim());
  return rows.map((r) => ({
    ...r,
    items: JSON.parse(r.items || '[]')
  }));
}

export function getAllOrders() {
  const rows = db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all();
  return rows.map((r) => ({
    ...r,
    items: JSON.parse(r.items || '[]')
  }));
}

// Customer Cart Management (Database Stored Carts)
export function getCustomerCart(email) {
  if (!email) return [];
  const cleanEmail = email.toLowerCase().trim();
  const rows = db.prepare('SELECT * FROM customer_carts WHERE LOWER(customer_email) = ? ORDER BY added_at DESC').all(cleanEmail);
  return rows.map((r) => {
    try {
      return {
        ...JSON.parse(r.item_json || '{}'),
        cartItemId: r.id
      };
    } catch (e) {
      return null;
    }
  }).filter(Boolean);
}

export function addToCustomerCart(email, item) {
  if (!email || !item) return [];
  const cleanEmail = email.toLowerCase().trim();
  const cartItemId = 'cart_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6);
  const itemJson = JSON.stringify(item);

  db.prepare(`
    INSERT INTO customer_carts (id, customer_email, cloth_id, item_json)
    VALUES (?, ?, ?, ?)
  `).run(cartItemId, cleanEmail, item.id || '', itemJson);

  return getCustomerCart(cleanEmail);
}

export function removeFromCustomerCart(email, clothId) {
  if (!email) return [];
  const cleanEmail = email.toLowerCase().trim();
  if (clothId) {
    db.prepare('DELETE FROM customer_carts WHERE LOWER(customer_email) = ? AND (cloth_id = ? OR id = ?)').run(cleanEmail, clothId, clothId);
  }
  return getCustomerCart(cleanEmail);
}

export function clearCustomerCart(email) {
  if (!email) return [];
  const cleanEmail = email.toLowerCase().trim();
  db.prepare('DELETE FROM customer_carts WHERE LOWER(customer_email) = ?').run(cleanEmail);
  return [];
}

export function getStats() {
  const count = db.prepare('SELECT COUNT(*) as count FROM clothes').get().count;
  const valuation = db.prepare('SELECT SUM(price) as total FROM clothes').get().total || 0;
  const availableCount = db.prepare("SELECT COUNT(*) as count FROM clothes WHERE status = 'Available'").get().count;
  const soldCount = db.prepare("SELECT COUNT(*) as count FROM clothes WHERE status = 'Sold'").get().count;
  const orderCount = db.prepare('SELECT COUNT(*) as count FROM orders').get().count;

  return {
    totalClothes: count,
    totalValuation: Math.round(valuation),
    availableCount,
    soldCount,
    orderCount,
    dbPath,
    status: 'SQLite Database Connected & Dynamic Auth Active'
  };
}

export function clearDatabase() {
  db.exec('DELETE FROM inquiries; DELETE FROM clothes;');
  return [];
}
