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
  getStats,
  clearDatabase
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
