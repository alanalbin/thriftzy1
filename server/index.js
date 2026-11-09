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
  updateAdminCredentials,
  createSession,
  verifySession,
  deleteSession,
  verifyPassword,
  saveCustomerProfile,
  getCustomerProfile,
  createOrder,
  getCustomerOrders,
  getAllOrders,
  getCustomerCart,
  addToCustomerCart,
  removeFromCustomerCart,
  clearCustomerCart,
  getAllCustomers
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

// Admin Authentication (albineditz1@gmail.com / batman)
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

// Disabled registration per user request
app.post('/api/admin/register', (req, res) => {
  res.status(403).json({ error: 'Admin account creation is disabled. Please contact the store administrator.' });
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

// Customer Authentication & Profile Routes (Google Login & Firebase Database)
app.post('/api/customer/google-auth', (req, res) => {
  try {
    const { email, name, avatar, phone, address, google_id, firebase_uid, auth_provider } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Google account email is required.' });
    }

    const customer = saveCustomerProfile({
      email,
      name: name || 'Google Customer',
      avatar: avatar || '',
      phone: phone || '',
      address: address || '',
      google_id: google_id || '',
      firebase_uid: firebase_uid || '',
      auth_provider: auth_provider || 'firebase_google'
    });

    res.json({ success: true, customer });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/customers', (req, res) => {
  try {
    const customers = getAllCustomers();
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/customer/profile', (req, res) => {
  try {
    const email = req.query.email;
    if (!email) return res.status(400).json({ error: 'Email parameter required.' });
    const customer = getCustomerProfile(email);
    res.json({ success: true, customer });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/customer/profile', (req, res) => {
  try {
    const { email, name, phone, address, avatar } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required.' });
    const updated = saveCustomerProfile({ email, name, phone, address, avatar });
    res.json({ success: true, customer: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Orders Routes
app.post('/api/orders', (req, res) => {
  try {
    const { customerEmail, customerName, customerPhone, deliveryAddress, items, totalAmount } = req.body;
    if (!customerEmail || !items || !items.length) {
      return res.status(400).json({ error: 'Customer email and items are required to place an order.' });
    }

    const order = createOrder({
      customerEmail,
      customerName,
      customerPhone,
      deliveryAddress,
      items,
      totalAmount
    });

    res.status(201).json({ success: true, order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/customer/orders', (req, res) => {
  try {
    const email = req.query.email;
    if (!email) return res.status(400).json({ error: 'Email is required.' });
    const orders = getCustomerOrders(email);
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/orders', (req, res) => {
  try {
    const orders = getAllOrders();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Customer Database Cart Routes
app.get('/api/customer/cart', (req, res) => {
  try {
    const email = req.query.email;
    if (!email) return res.status(400).json({ error: 'Email parameter is required.' });
    const cart = getCustomerCart(email);
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/customer/cart', (req, res) => {
  try {
    const { email, item } = req.body;
    if (!email || !item) return res.status(400).json({ error: 'Email and item are required.' });
    const updated = addToCustomerCart(email, item);
    res.json({ success: true, cart: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/customer/cart', (req, res) => {
  try {
    const email = req.query.email || req.body?.email;
    const clothId = req.query.clothId || req.body?.clothId;
    if (!email) return res.status(400).json({ error: 'Email parameter is required.' });
    const updated = removeFromCustomerCart(email, clothId);
    res.json({ success: true, cart: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/customer/cart/clear', (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required.' });
    const updated = clearCustomerCart(email);
    res.json({ success: true, cart: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Clothes CRUD
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
      return res.status(400).json({ error: 'Cloth name, price in Rupees (₹), and photo are required.' });
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
