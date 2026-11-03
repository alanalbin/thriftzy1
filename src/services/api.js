const API_BASE = '/api';
const LOCAL_STORAGE_KEY = 'thriftzy_user_clothes_v2';
const FAVORITES_KEY = 'thriftzy_favorites_v2';

// Clean initial starter piece so the store looks rich immediately, but user can delete or add their own anytime!
const STARTER_CLOTHES = [
  {
    id: 'cloth_og_01',
    name: 'Vintage 1996 Leather Moto Racer Jacket',
    category: 'Jackets & Outerwear',
    brand: 'Thriftzy Archive',
    price: 180,
    originalPrice: 380,
    size: 'L',
    condition: 'Like New (Mint)',
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1000&q=85',
    gallery: [
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=1000&q=85'
    ],
    description: 'Heavyweight cowhide moto racer with authentic distressed shoulder piping and RiRi brass zippers.',
    contactNumber: '+1 555-0199',
    status: 'Available',
    viewsCount: 142,
    rating: 5.0,
    reviewsCount: 8,
    created_at: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: 'cloth_og_02',
    name: 'Supreme Red Box Edition Heavyweight Tee',
    category: 'T-Shirts',
    brand: 'Supreme',
    price: 95,
    originalPrice: 190,
    size: 'XL',
    condition: 'Brand New with Tags',
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=85',
    gallery: [
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=85'
    ],
    description: '100% heavyweight combed cotton jersey with classic red box graphic. Preserved in UV garment bag.',
    contactNumber: '+1 555-0199',
    status: 'Available',
    viewsCount: 289,
    rating: 4.9,
    reviewsCount: 12,
    created_at: new Date(Date.now() - 86400000 * 4).toISOString()
  },
  {
    id: 'cloth_og_03',
    name: 'Washed Crimson Loopback Fleece Hoodie',
    category: 'Hoodies & Sweaters',
    brand: 'Thriftzy Atelier',
    price: 85,
    originalPrice: 140,
    size: 'M',
    condition: 'Like New (Mint)',
    image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1000&q=85',
    gallery: [
      'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1000&q=85'
    ],
    description: '500 GSM loopback French terry, custom sun-faded wash with triple-needle flatlock seams.',
    contactNumber: '+1 555-0199',
    status: 'Available',
    viewsCount: 198,
    rating: 4.8,
    reviewsCount: 6,
    created_at: new Date(Date.now() - 86400000 * 6).toISOString()
  }
];

// Helper to get local fallback clothes
function getLocalClothes() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(STARTER_CLOTHES));
      return STARTER_CLOTHES;
    }
    return JSON.parse(raw);
  } catch (e) {
    return STARTER_CLOTHES;
  }
}

function saveLocalClothes(items) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.warn('Storage quota error:', e);
  }
}

// Fetch all clothes (Backend SQLite first, browser storage fallback for Vercel)
export async function fetchItems() {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(`${API_BASE}/clothes`, { signal: controller.signal });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        saveLocalClothes(data);
        return data;
      }
    }
  } catch (err) {
    // Vercel or offline fallback
  }
  return getLocalClothes();
}

// Create new cloth in database
export async function createItem(clothData) {
  const newCloth = {
    ...clothData,
    id: clothData.id || 'cloth_' + Date.now().toString(36),
    rating: 5.0,
    reviewsCount: 1,
    viewsCount: 1,
    created_at: new Date().toISOString(),
  };

  try {
    const res = await fetch(`${API_BASE}/clothes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCloth),
    });
    if (res.ok) {
      const saved = await res.json();
      const current = getLocalClothes();
      saveLocalClothes([saved, ...current.filter((x) => x.id !== saved.id)]);
      return saved;
    }
  } catch (err) {
    // Vercel serverless fallback
  }

  // Save to browser persistent database
  const current = getLocalClothes();
  saveLocalClothes([newCloth, ...current]);
  return newCloth;
}

// Delete cloth from database
export async function deleteItem(id) {
  try {
    await fetch(`${API_BASE}/clothes/${id}`, { method: 'DELETE' });
  } catch (err) {
    // Vercel fallback
  }
  const current = getLocalClothes();
  saveLocalClothes(current.filter((item) => item.id !== id));
  return { success: true, deletedId: id };
}

// Update cloth
export async function updateItem(id, clothData) {
  try {
    const res = await fetch(`${API_BASE}/clothes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(clothData),
    });
    if (res.ok) {
      const updated = await res.json();
      const current = getLocalClothes();
      saveLocalClothes(current.map((it) => (it.id === id ? updated : it)));
      return updated;
    }
  } catch (err) {
    // Vercel fallback
  }
  const current = getLocalClothes();
  const updated = current.map((item) => (item.id === id ? { ...item, ...clothData } : item));
  saveLocalClothes(updated);
  return { id, ...clothData };
}

// Database Stats
export async function fetchDbStats() {
  const clothes = getLocalClothes();
  const totalVal = clothes.reduce((sum, c) => sum + (Number(c.price) || 0), 0);
  return {
    totalClothes: clothes.length,
    totalValuation: Math.round(totalVal),
    status: 'Hybrid SQLite & Browser Database Active'
  };
}

// Favorites / Wishlist System
export function getFavorites() {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function toggleFavorite(id) {
  const favs = getFavorites();
  const next = favs.includes(id) ? favs.filter((x) => x !== id) : [...favs, id];
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
  } catch (e) {}
  return next;
}

// Export database as JSON backup file
export function exportDatabaseJSON() {
  const data = getLocalClothes();
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `thriftzy_vault_backup_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// Import database from JSON backup file
export function importDatabaseJSON(jsonArray) {
  if (!Array.isArray(jsonArray)) throw new Error('Invalid JSON format. Expected an array of clothes.');
  saveLocalClothes(jsonArray);
  return jsonArray;
}
