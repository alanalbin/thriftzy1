const API_BASE = '/api';
const LOCAL_STORAGE_KEY = 'thriftzy_user_clothes_v3';
const FAVORITES_KEY = 'thriftzy_favorites_v3';
const ADMIN_SESSION_KEY = 'thriftzy_admin_session_v4';
const ADMIN_ACCOUNTS_KEY = 'thriftzy_admin_accounts_v4';
const CUSTOMER_SESSION_KEY = 'thriftzy_customer_profile_v4';
const CUSTOMER_ORDERS_KEY = 'thriftzy_customer_orders_v4';

// Zero static demo clothes - 100% clean live database
const STARTER_CLOTHES = [];

// Master Admin account: albineditz1@gmail.com / batman
const DEFAULT_LOCAL_ADMINS = [
  {
    id: 'admin_albin_master',
    email: 'albineditz1@gmail.com',
    password: 'batman',
    name: 'Albin',
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
    const list = JSON.parse(raw);
    // Ensure albineditz1@gmail.com is present with password batman
    const found = list.find((a) => a.email.toLowerCase() === 'albineditz1@gmail.com');
    if (!found) {
      const updated = [...list.filter((a) => a.email.toLowerCase() !== 'admin@thriftzy.store'), DEFAULT_LOCAL_ADMINS[0]];
      localStorage.setItem(ADMIN_ACCOUNTS_KEY, JSON.stringify(updated));
      return updated;
    }
    // Update password to batman if different
    if (found.password !== 'batman') {
      found.password = 'batman';
      localStorage.setItem(ADMIN_ACCOUNTS_KEY, JSON.stringify(list));
    }
    return list;
  } catch (e) {
    return DEFAULT_LOCAL_ADMINS;
  }
}

function saveLocalAdmins(admins) {
  try {
    localStorage.setItem(ADMIN_ACCOUNTS_KEY, JSON.stringify(admins));
  } catch (e) {}
}

// Helper to get local fallback clothes (cleans out old demo clothes)
function getLocalClothes() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const items = JSON.parse(raw);
    // Filter out old static placeholder items
    const cleanItems = Array.isArray(items) ? items.filter((x) => !x.id?.startsWith('cloth_og_')) : [];
    return cleanItems;
  } catch (e) {
    return [];
  }
}

function saveLocalClothes(items) {
  try {
    const cleanItems = Array.isArray(items) ? items.filter((x) => !x.id?.startsWith('cloth_og_')) : [];
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cleanItems));
  } catch (e) {
    console.warn('Storage quota error:', e);
  }
}

// -------------------------------------------------------------
// ADMIN AUTHENTICATION
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
    const timeout = setTimeout(() => controller.abort(), 2000);

    const res = await fetch(`${API_BASE}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: cleanEmail, password: cleanPass }),
      signal: controller.signal
    });
    clearTimeout(timeout);

    const isJson = res.headers.get('content-type')?.includes('application/json');
    if (!isJson) {
      throw new Error('Offline fallback: non-json response');
    }

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
    if (
      err.name !== 'AbortError' &&
      !err.message.includes('fetch') &&
      !err.message.includes('Offline fallback') &&
      !err.message.includes('Unexpected token')
    ) {
      throw err;
    }

    // Local / Offline fallback (for Vercel static environment)
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

// Admin Registration Disabled
export async function adminRegister() {
  throw new Error('Admin registration is disabled. Only authorized administrators may log in.');
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
    const timeout = setTimeout(() => controller.abort(), 1500);
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

  return session.admin || null;
}

// Update Admin Credentials
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

    const localAdmins = getLocalAdmins();
    const currentAdminId = session?.admin?.id;
    const target = localAdmins.find((a) => a.id === currentAdminId);

    if (!target) throw new Error('Admin account not found in local storage.');
    if (currentPassword && target.password !== currentPassword) {
      throw new Error('Current password is incorrect.');
    }

    if (email && email.trim()) target.email = email.trim().toLowerCase();
    if (password && password.trim()) {
      if (password.length < 5) throw new Error('Password must be at least 5 characters.');
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

// -------------------------------------------------------------
// CUSTOMER GOOGLE AUTHENTICATION & PROFILE
// -------------------------------------------------------------

export function getCustomerProfile() {
  try {
    const raw = localStorage.getItem(CUSTOMER_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export function saveCustomerProfile(profile) {
  try {
    localStorage.setItem(CUSTOMER_SESSION_KEY, JSON.stringify(profile));
  } catch (e) {}
}

export function customerLogout() {
  try {
    localStorage.removeItem(CUSTOMER_SESSION_KEY);
  } catch (e) {}
}

export async function customerGoogleLogin({ email, name, avatar, phone, address, google_id }) {
  const cleanEmail = (email || '').trim().toLowerCase();
  if (!cleanEmail) throw new Error('Email is required for Google Sign-in.');

  const existing = getCustomerProfile();
  const isSame = existing?.email?.toLowerCase() === cleanEmail;

  const customerData = {
    id: (isSame && existing?.id) ? existing.id : 'cust_' + Date.now().toString(36),
    google_id: google_id || (isSame ? existing?.google_id : '') || 'goog_' + Date.now().toString(36),
    email: cleanEmail,
    name: name || (isSame ? existing?.name : '') || cleanEmail.split('@')[0],
    avatar: avatar || (isSame ? existing?.avatar : '') || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name || cleanEmail)}`,
    phone: phone || (isSame ? existing?.phone : '') || '',
    address: address || (isSame ? existing?.address : '') || '',
    created_at: (isSame && existing?.created_at) ? existing.created_at : new Date().toISOString()
  };

  try {
    const res = await fetch(`${API_BASE}/customer/google-auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(customerData)
    });
    if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
      const data = await res.json();
      if (data.customer) {
        saveCustomerProfile(data.customer);
        return data.customer;
      }
    }
  } catch (e) {}

  // Fallback to client persistent storage
  saveCustomerProfile(customerData);
  return customerData;
}

export async function updateCustomerProfile(updates) {
  const current = getCustomerProfile() || {};
  const merged = { ...current, ...updates };

  try {
    const res = await fetch(`${API_BASE}/customer/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(merged)
    });
    if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
      const data = await res.json();
      if (data.customer) {
        saveCustomerProfile(data.customer);
        return data.customer;
      }
    }
  } catch (e) {}

  saveCustomerProfile(merged);
  return merged;
}

// -------------------------------------------------------------
// CUSTOMER DATABASE CART MANAGEMENT
// -------------------------------------------------------------

const CUSTOMER_SAVED_CARTS_KEY = 'thriftzy_customer_db_carts_v2';

function getLocalCustomerCart(email) {
  try {
    const raw = localStorage.getItem(CUSTOMER_SAVED_CARTS_KEY);
    const store = raw ? JSON.parse(raw) : {};
    return store[email.toLowerCase()] || [];
  } catch (e) {
    return [];
  }
}

function saveLocalCustomerCart(email, cart) {
  try {
    const raw = localStorage.getItem(CUSTOMER_SAVED_CARTS_KEY);
    const store = raw ? JSON.parse(raw) : {};
    store[email.toLowerCase()] = cart;
    localStorage.setItem(CUSTOMER_SAVED_CARTS_KEY, JSON.stringify(store));
  } catch (e) {}
}

export async function fetchCustomerCart(email) {
  if (!email) return [];
  try {
    const res = await fetch(`${API_BASE}/customer/cart?email=${encodeURIComponent(email)}`);
    if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
      const data = await res.json();
      if (Array.isArray(data)) {
        saveLocalCustomerCart(email, data);
        return data;
      }
    }
  } catch (e) {}
  return getLocalCustomerCart(email);
}

export async function addClothToCustomerCart(email, item) {
  if (!email || !item) return [];
  try {
    const res = await fetch(`${API_BASE}/customer/cart`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, item })
    });
    if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
      const data = await res.json();
      if (Array.isArray(data.cart)) {
        saveLocalCustomerCart(email, data.cart);
        return data.cart;
      }
    }
  } catch (e) {}

  const current = getLocalCustomerCart(email);
  const updated = [...current, { ...item, cartItemId: 'cart_' + Date.now().toString(36) }];
  saveLocalCustomerCart(email, updated);
  return updated;
}

export async function removeClothFromCustomerCart(email, clothId) {
  if (!email) return [];
  try {
    const res = await fetch(`${API_BASE}/customer/cart`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, clothId })
    });
    if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
      const data = await res.json();
      if (Array.isArray(data.cart)) {
        saveLocalCustomerCart(email, data.cart);
        return data.cart;
      }
    }
  } catch (e) {}

  const current = getLocalCustomerCart(email);
  const updated = current.filter((it, idx) => (it.cartItemId ? it.cartItemId !== clothId : it.id !== clothId && idx.toString() !== clothId));
  saveLocalCustomerCart(email, updated);
  return updated;
}

export async function clearCustomerCart(email) {
  if (!email) return [];
  try {
    await fetch(`${API_BASE}/customer/cart/clear`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
  } catch (e) {}
  saveLocalCustomerCart(email, []);
  return [];
}

// -------------------------------------------------------------
// ORDERS MANAGEMENT
// -------------------------------------------------------------

function getLocalOrders() {
  try {
    const raw = localStorage.getItem(CUSTOMER_ORDERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveLocalOrders(orders) {
  try {
    localStorage.setItem(CUSTOMER_ORDERS_KEY, JSON.stringify(orders));
  } catch (e) {}
}

export async function createCustomerOrder(orderData) {
  const newOrder = {
    id: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
    customerEmail: orderData.customerEmail,
    customerName: orderData.customerName || 'Customer',
    customerPhone: orderData.customerPhone || '',
    deliveryAddress: orderData.deliveryAddress || '',
    items: orderData.items || [],
    totalAmount: Number(orderData.totalAmount) || 0,
    currency: 'INR',
    status: 'Confirmed',
    created_at: new Date().toISOString()
  };

  try {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newOrder)
    });
    if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
      const data = await res.json();
      if (data.order) {
        const local = getLocalOrders();
        saveLocalOrders([data.order, ...local]);
        return data.order;
      }
    }
  } catch (e) {}

  const local = getLocalOrders();
  saveLocalOrders([newOrder, ...local]);
  return newOrder;
}

export async function getCustomerOrders(email) {
  try {
    const res = await fetch(`${API_BASE}/customer/orders?email=${encodeURIComponent(email)}`);
    if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
      const data = await res.json();
      if (Array.isArray(data)) return data;
    }
  } catch (e) {}

  const local = getLocalOrders();
  return local.filter((o) => (o.customerEmail || o.customer_email || '').toLowerCase() === email.toLowerCase());
}

export async function getAllOrders() {
  try {
    const res = await fetch(`${API_BASE}/admin/orders`);
    if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
      const data = await res.json();
      if (Array.isArray(data)) return data;
    }
  } catch (e) {}

  return getLocalOrders();
}

// -------------------------------------------------------------
// CLOTHES & INVENTORY MANAGEMENT
// -------------------------------------------------------------

export async function fetchItems() {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(`${API_BASE}/clothes`, { signal: controller.signal });
    clearTimeout(timeout);

    if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
      const data = await res.json();
      if (Array.isArray(data)) {
        // Filter out old static placeholder items
        const cleanData = data.filter((x) => !x.id?.startsWith('cloth_og_'));
        saveLocalClothes(cleanData);
        return cleanData;
      }
    }
  } catch (err) {}
  return getLocalClothes();
}

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
    if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
      const saved = await res.json();
      const current = getLocalClothes();
      saveLocalClothes([saved, ...current.filter((x) => x.id !== saved.id)]);
      return saved;
    }
  } catch (err) {}

  const current = getLocalClothes();
  saveLocalClothes([newCloth, ...current]);
  return newCloth;
}

export async function deleteItem(id) {
  try {
    await fetch(`${API_BASE}/clothes/${id}`, { method: 'DELETE' });
  } catch (err) {}
  const current = getLocalClothes();
  saveLocalClothes(current.filter((item) => item.id !== id));
  return { success: true, deletedId: id };
}

export async function updateItem(id, clothData) {
  try {
    const res = await fetch(`${API_BASE}/clothes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(clothData),
    });
    if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
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

export async function fetchDbStats() {
  try {
    const res = await fetch(`${API_BASE}/stats`);
    if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
      return await res.json();
    }
  } catch (e) {}

  const clothes = getLocalClothes();
  const totalVal = clothes.reduce((sum, c) => sum + (Number(c.price) || 0), 0);
  const availableCount = clothes.filter((c) => c.status !== 'Sold').length;
  const soldCount = clothes.filter((c) => c.status === 'Sold').length;
  const orders = getLocalOrders();

  return {
    totalClothes: clothes.length,
    totalValuation: Math.round(totalVal),
    availableCount,
    soldCount,
    orderCount: orders.length,
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

export function importDatabaseJSON(jsonArray) {
  if (!Array.isArray(jsonArray)) throw new Error('Invalid JSON format. Expected an array of clothes.');
  const cleanItems = jsonArray.filter((x) => !x.id?.startsWith('cloth_og_'));
  saveLocalClothes(cleanItems);
  return cleanItems;
}
