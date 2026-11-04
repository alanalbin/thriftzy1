import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  getAllClothes,
  getClothById,
  createCloth,
  updateCloth,
  deleteCloth,
  createInquiry,
  getAllInquiries,
  getStats,
  clearDatabase,
  findAdminByEmail,
  findAdminById,
  getAllAdmins,
  createAdminAccount,
  updateAdminCredentials,
  deleteAdminAccount,
  createSession,
  verifySession,
  deleteSession,
  verifyPassword
} from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());

// 50mb body limit for high-res photo uploads from users
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve built frontend assets in production
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));

// Helper to extract authenticated admin
function getAdminFromReq(req) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : req.query.token;
  if (!token) return null;
  return verifySession(token);
}

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', serverTime: new Date().toISOString() });
});

app.get('/api/stats', (req, res) => {
  try {
    const stats = getStats();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Dynamic Authentication Routes
app.post('/api/admin/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const admin = findAdminByEmail(email);
    if (!admin) {
      return res.status(401).json({ error: 'No admin found with this email ID.' });
    }

    const matches = verifyPassword(password, admin.password_hash);
    if (!matches) {
      return res.status(401).json({ error: 'Incorrect password for this email ID.' });
    }

    const session = createSession(admin.id);
    res.json({
      success: true,
      token: session.token,
      expiresAt: session.expiresAt,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
        created_at: admin.created_at
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/register', (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }
    if (!email.includes('@') || !email.includes('.')) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    const newAdmin = createAdminAccount({
      email,
      password,
      name: name || 'Admin',
      role: 'admin'
    });

    const session = createSession(newAdmin.id);
    res.status(201).json({
      success: true,
      token: session.token,
      expiresAt: session.expiresAt,
      admin: newAdmin
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/admin/me', (req, res) => {
  const admin = getAdminFromReq(req);
  if (!admin) {
    return res.status(401).json({ error: 'Not authenticated as admin.' });
  }
  res.json({ success: true, admin });
});

app.post('/api/admin/logout', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : req.body.token;
  if (token) deleteSession(token);
  res.json({ success: true, message: 'Logged out successfully.' });
});

app.get('/api/admin/list', (req, res) => {
  try {
    const admins = getAllAdmins();
    res.json(admins);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/admin/credentials', (req, res) => {
  try {
    const admin = getAdminFromReq(req);
    if (!admin) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    const { email, password, name, currentPassword } = req.body;
    if (currentPassword) {
      const fullAdmin = findAdminByEmail(admin.email);
      if (!fullAdmin || !verifyPassword(currentPassword, fullAdmin.password_hash)) {
        return res.status(400).json({ error: 'Current password is incorrect.' });
      }
    }

    const updated = updateAdminCredentials(admin.id, { email, password, name });
    res.json({ success: true, admin: updated });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/admin/:id', (req, res) => {
  try {
    const admin = getAdminFromReq(req);
    if (!admin) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }
    deleteAdminAccount(req.params.id);
    res.json({ success: true, deletedId: req.params.id });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/admin/inquiries', (req, res) => {
  try {
    const list = getAllInquiries();
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Clothes CRUD (supports both /api/clothes and /api/items)
const getClothesHandler = (req, res) => {
  try {
    const clothes = getAllClothes();
    res.json(clothes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const createClothHandler = (req, res) => {
  try {
    const { name, price, image } = req.body;
    if (!name || price === undefined || !image) {
      return res.status(400).json({ error: 'Cloth name, price, and photo are required.' });
    }
    const newCloth = createCloth(req.body);
    res.status(201).json(newCloth);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

app.get('/api/clothes', getClothesHandler);
app.get('/api/items', getClothesHandler);

app.post('/api/clothes', createClothHandler);
app.post('/api/items', createClothHandler);

app.get('/api/clothes/:id', (req, res) => {
  try {
    const cloth = getClothById(req.params.id);
    if (!cloth) return res.status(404).json({ error: 'Cloth not found' });
    res.json(cloth);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/clothes/:id', (req, res) => {
  try {
    const updated = updateCloth(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Cloth not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/clothes/:id', (req, res) => {
  try {
    const success = deleteCloth(req.params.id);
    if (!success) return res.status(404).json({ error: 'Cloth not found' });
    res.json({ success: true, deletedId: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/items/:id', (req, res) => {
  try {
    const success = deleteCloth(req.params.id);
    if (!success) return res.status(404).json({ error: 'Cloth not found' });
    res.json({ success: true, deletedId: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/inquiries', (req, res) => {
  try {
    const { clothId, buyerName, buyerContact, message } = req.body;
    createInquiry(clothId, buyerName, buyerContact, message);
    res.status(201).json({ success: true, message: 'Inquiry saved successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/clear', (req, res) => {
  try {
    clearDatabase();
    res.json({ success: true, count: 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fallback to index.html in production
app.use((req, res, next) => {
  if (req.url.startsWith('/api')) return next();
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) res.status(404).send('Not Found');
  });
});

app.listen(PORT, () => {
  console.log(`[Thriftzy Store Server] Live on http://localhost:${PORT}`);
});
