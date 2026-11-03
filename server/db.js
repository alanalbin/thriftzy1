import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'thriftzy.sqlite');
const db = new Database(dbPath);

// WAL mode for high performance
db.pragma('journal_mode = WAL');

// Initialize schema (No static/fake dummy data)
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
`);

console.log('[SQLite DB] Initialized clean database without static dummy data.');

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
  const id = data.id || 'cloth_' + Date.now().toString(36);
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
      values.push(key === 'price' || key === 'originalPrice' ? Number(val) : val);
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

export function getStats() {
  const count = db.prepare('SELECT COUNT(*) as count FROM clothes').get().count;
  const valuation = db.prepare('SELECT SUM(price) as total FROM clothes').get().total || 0;
  const availableCount = db.prepare("SELECT COUNT(*) as count FROM clothes WHERE status = 'Available'").get().count;
  const soldCount = db.prepare("SELECT COUNT(*) as count FROM clothes WHERE status = 'Sold'").get().count;

  return {
    totalClothes: count,
    totalValuation: Math.round(valuation),
    availableCount,
    soldCount,
    dbPath,
    status: 'SQLite Database Connected & Active'
  };
}

export function clearDatabase() {
  db.exec('DELETE FROM inquiries; DELETE FROM clothes;');
  return [];
}
