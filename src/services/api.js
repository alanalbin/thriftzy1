const API_BASE = '/api';
const LOCAL_STORAGE_KEY = 'thriftzy_user_clothes_v2';
const FAVORITES_KEY = 'thriftzy_favorites_v2';
const ADMIN_SESSION_KEY = 'thriftzy_admin_session_v3';
const ADMIN_ACCOUNTS_KEY = 'thriftzy_admin_accounts_v3';

// Starter clothes for storefront
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

// Fallback initial admin accounts
const DEFAULT_LOCAL_ADMINS = [
  {
    id: 'admin_init_1',
    email: 'admin@thriftzy.store',
    password: 'adminpassword123',
    name: 'Store Owner',
    role: 'superadmin',
    created_at: new Date().toISOString()
  }
];

function getLocalAdmins() {
  try {
    const raw = localStorage.getItem(ADMIN_ACCOUNTS_KEY);
    if (!raw) {
      localStorage.setItem(ADMIN_ACCOUNTS_KEY, JSON.stringify(DEFAULT_LOCAL_ADMINS));
      return DEFAULT_LOCAL_ADMINS;
    }
    return JSON.parse(raw);
  } catch (e) {
    return DEFAULT_LOCAL_ADMINS;
  }
}

function saveLocalAdmins(admins) {
  try {
    localStorage.setItem(ADMIN_ACCOUNTS_KEY, JSON.stringify(admins));
  } catch (e) {}
}

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

// -------------------------------------------------------------
// DYNAMIC ADMIN AUTHENTICATION
// -------------------------------------------------------------

export function getAdminSession() {
  try {
    const raw = localStorage.getItem(ADMIN_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export function saveAdminSession(sessionData) {
  try {
    localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(sessionData));
  } catch (e) {}
}

export function clearAdminSession() {
  try {
    localStorage.removeItem(ADMIN_SESSION_KEY);
  } catch (e) {}
}

// Admin Login
export async function adminLogin(email, password) {
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanPass = password || '';

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);

    const res = await fetch(`${API_BASE}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: cleanEmail, password: cleanPass }),
      signal: controller.signal
    });
    clearTimeout(timeout);

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to login as admin');
    }

    const session = {
      token: data.token,
      admin: data.admin,
      expiresAt: data.expiresAt
    };
    saveAdminSession(session);
    return session;
  } catch (err) {
    // If server sent an explicit error message (e.g. 401 Incorrect password), re-throw it
    if (err.name !== 'AbortError' && !err.message.includes('fetch')) {
      throw err;
    }

    // Offline / Local fallback: check local admins
    const localAdmins = getLocalAdmins();
    const found = localAdmins.find((a) => a.email.toLowerCase() === cleanEmail);
    if (!found) {
      throw new Error('No admin account found with this email ID.');
    }
    if (found.password !== cleanPass) {
      throw new Error('Incorrect password for this email ID.');
    }

    const session = {
      token: 'tok_local_' + Date.now().toString(36),
      admin: {
        id: found.id,
        email: found.email,
        name: found.name,
        role: found.role,
        created_at: found.created_at
      },
      expiresAt: new Date(Date.now() + 7 * 86400000).toISOString()
    };
    saveAdminSession(session);
    return session;
  }
}

// Admin Register (Dynamic email & password)
export async function adminRegister(email, password, name = 'Admin') {
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanPass = password || '';

  if (!cleanEmail || !cleanPass) {
    throw new Error('Email ID and password are required.');
  }
  if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
    throw new Error('Please enter a valid email address.');
  }
  if (cleanPass.length < 6) {
    throw new Error('Password must be at least 6 characters.');
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);

    const res = await fetch(`${API_BASE}/admin/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: cleanEmail, password: cleanPass, name: name.trim() }),
      signal: controller.signal
    });
    clearTimeout(timeout);

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to register admin account');
    }

    const session = {
      token: data.token,
      admin: data.admin,
      expiresAt: data.expiresAt
    };
    saveAdminSession(session);

    // Also mirror to local list
    const localAdmins = getLocalAdmins();
    if (!localAdmins.some((a) => a.email.toLowerCase() === cleanEmail)) {
      saveLocalAdmins([...localAdmins, { ...data.admin, password: cleanPass }]);
    }

    return session;
  } catch (err) {
    if (err.name !== 'AbortError' && !err.message.includes('fetch')) {
      throw err;
    }

    // Local registration fallback
    const localAdmins = getLocalAdmins();
    if (localAdmins.some((a) => a.email.toLowerCase() === cleanEmail)) {
      throw new Error('An admin account with this email already exists.');
    }

    const newAdmin = {
      id: 'admin_local_' + Date.now().toString(36),
      email: cleanEmail,
      password: cleanPass,
      name: name.trim() || 'Admin',
      role: 'admin',
      created_at: new Date().toISOString()
    };

    saveLocalAdmins([...localAdmins, newAdmin]);

    const session = {
      token: 'tok_local_' + Date.now().toString(36),
      admin: {
        id: newAdmin.id,
        email: newAdmin.email,
        name: newAdmin.name,
        role: newAdmin.role,
        created_at: newAdmin.created_at
      },
      expiresAt: new Date(Date.now() + 7 * 86400000).toISOString()
    };
    saveAdminSession(session);
    return session;
  }
}

// Admin Logout
export async function adminLogout() {
  const session = getAdminSession();
  try {
    if (session?.token) {
      await fetch(`${API_BASE}/admin/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.token}`
        },
        body: JSON.stringify({ token: session.token })
      });
    }
  } catch (e) {}
  clearAdminSession();
  return { success: true };
}

// Verify current session
export async function adminVerifySession() {
  const session = getAdminSession();
  if (!session || !session.token) return null;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(`${API_BASE}/admin/me`, {
      headers: { Authorization: `Bearer ${session.token}` },
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      const updated = { ...session, admin: data.admin };
      saveAdminSession(updated);
      return updated.admin;
    }
  } catch (e) {}

  // If local token or server unreachable, rely on stored session
  return session.admin || null;
}

// Update Admin Credentials (Dynamic Email & Password Change)
export async function adminUpdateCredentials({ email, password, name, currentPassword }) {
  const session = getAdminSession();
  const token = session?.token;

  try {
    const res = await fetch(`${API_BASE}/admin/credentials`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : ''
      },
      body: JSON.stringify({ email, password, name, currentPassword })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update credentials.');

    const updatedAdmin = data.admin;
    saveAdminSession({ ...session, admin: updatedAdmin });
    return updatedAdmin;
  } catch (err) {
    if (!err.message.includes('fetch')) throw err;

    // Local fallback update
    const localAdmins = getLocalAdmins();
    const currentAdminId = session?.admin?.id;
    const target = localAdmins.find((a) => a.id === currentAdminId);

    if (!target) throw new Error('Admin account not found in local storage.');
    if (currentPassword && target.password !== currentPassword) {
      throw new Error('Current password is incorrect.');
    }

    if (email && email.trim()) target.email = email.trim().toLowerCase();
    if (password && password.trim()) {
      if (password.length < 6) throw new Error('Password must be at least 6 characters.');
      target.password = password;
    }
    if (name && name.trim()) target.name = name.trim();

    saveLocalAdmins(localAdmins);
    const updatedAdmin = {
      id: target.id,
      email: target.email,
      name: target.name,
      role: target.role,
      created_at: target.created_at
    };
    saveAdminSession({ ...session, admin: updatedAdmin });
    return updatedAdmin;
  }
}

// Get Admins List
export async function adminGetList() {
  const session = getAdminSession();
  try {
    const res = await fetch(`${API_BASE}/admin/list`, {
      headers: { Authorization: session?.token ? `Bearer ${session.token}` : '' }
    });
    if (res.ok) return await res.json();
  } catch (e) {}

  const local = getLocalAdmins();
  return local.map((a) => ({
    id: a.id,
    email: a.email,
    name: a.name,
    role: a.role,
    created_at: a.created_at
  }));
}

// Delete Admin
export async function adminDeleteAccount(id) {
  const session = getAdminSession();
  try {
    const res = await fetch(`${API_BASE}/admin/${id}`, {
      method: 'DELETE',
      headers: { Authorization: session?.token ? `Bearer ${session.token}` : '' }
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to delete admin.');
    }
    return true;
  } catch (e) {
    if (!e.message.includes('fetch')) throw e;
    const local = getLocalAdmins();
    if (local.length <= 1) throw new Error('Cannot delete the last admin account.');
    saveLocalAdmins(local.filter((a) => a.id !== id));
    return true;
  }
}

// -------------------------------------------------------------
// CLOTHES & INVENTORY MANAGEMENT
// -------------------------------------------------------------

// Fetch all clothes
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
  } catch (err) {}
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
  } catch (err) {}

  // Save to browser persistent database
  const current = getLocalClothes();
  saveLocalClothes([newCloth, ...current]);
  return newCloth;
}

// Delete cloth from database
export async function deleteItem(id) {
  try {
    await fetch(`${API_BASE}/clothes/${id}`, { method: 'DELETE' });
  } catch (err) {}
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
  } catch (err) {}
  const current = getLocalClothes();
  const updated = current.map((item) => (item.id === id ? { ...item, ...clothData } : item));
  saveLocalClothes(updated);
  return { id, ...clothData };
}

// Database Stats
export async function fetchDbStats() {
  try {
    const res = await fetch(`${API_BASE}/stats`);
    if (res.ok) return await res.json();
  } catch (e) {}

  const clothes = getLocalClothes();
  const totalVal = clothes.reduce((sum, c) => sum + (Number(c.price) || 0), 0);
  const availableCount = clothes.filter((c) => c.status !== 'Sold').length;
  const soldCount = clothes.filter((c) => c.status === 'Sold').length;

  return {
    totalClothes: clothes.length,
    totalValuation: Math.round(totalVal),
    availableCount,
    soldCount,
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
