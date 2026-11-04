import React, { useState, useEffect } from 'react';
import ClickSpark from './components/reactbits/ClickSpark';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import ClothesCatalogSection from './components/ClothesCatalogSection';
import WorkflowSection from './components/WorkflowSection';
import BrandShowcase from './components/BrandShowcase';
import FAQAccordion from './components/FAQAccordion';
import Footer from './components/Footer';

// Smooth 3D Popups
import QuickViewModal from './components/popups/QuickViewModal';
import AddClothModal from './components/popups/AddClothModal';
import CartDrawerModal from './components/popups/CartDrawerModal';
import AdminLoginModal from './components/admin/AdminLoginModal';
import AdminDashboardModal from './components/admin/AdminDashboardModal';

// Database & Admin API Services
import {
  fetchItems,
  createItem as apiCreateItem,
  updateItem as apiUpdateItem,
  deleteItem as apiDeleteItem,
  fetchDbStats,
  getFavorites,
  toggleFavorite as apiToggleFavorite,
  adminVerifySession,
  adminLogout as apiAdminLogout
} from './services/api';

export default function App() {
  // Real database clothes state
  const [clothes, setClothes] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [currentCurrency, setCurrentCurrency] = useState('USD');
  const [dbStats, setDbStats] = useState({
    totalClothes: 0,
    totalValuation: 0,
    status: 'Database Active'
  });
  const [loading, setLoading] = useState(true);

  // Dynamic Admin Authentication State
  const [admin, setAdmin] = useState(null);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false);

  // Modal states
  const [quickViewItem, setQuickViewItem] = useState(null);
  const [isAddClothOpen, setIsAddClothOpen] = useState(false);
  const [editingCloth, setEditingCloth] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Cart state
  const [cart, setCart] = useState([]);

  // Load clothes, favorites, and admin session on mount
  useEffect(() => {
    async function loadData() {
      try {
        const [fetchedClothes, stats, currentAdminSession] = await Promise.all([
          fetchItems(),
          fetchDbStats(),
          adminVerifySession()
        ]);
        if (Array.isArray(fetchedClothes)) {
          setClothes(fetchedClothes);
        }
        if (stats) setDbStats(stats);
        if (currentAdminSession) setAdmin(currentAdminSession);
      } catch (err) {
        console.error('Error initializing app data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
    setFavorites(getFavorites());
  }, []);

  const featuredCloth = clothes.length > 0 ? clothes[0] : null;

  // Cart Handlers
  const handleAddToCart = (item) => {
    setCart((prev) => [...prev, item]);
    setIsCartOpen(true);
  };

  const handleRemoveFromCart = (index) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // Favorites Handler
  const handleToggleFavorite = (id) => {
    const next = apiToggleFavorite(id);
    setFavorites(next);
  };

  // Admin Auth Handlers
  const handleAdminLoginSuccess = (adminUser) => {
    setAdmin(adminUser);
    setIsAdminDashboardOpen(true);
  };

  const handleAdminLogout = async () => {
    await apiAdminLogout();
    setAdmin(null);
  };

  // Cloth Management (Admin controlled)
  const handleClothAdded = async (newClothData) => {
    const saved = await apiCreateItem(newClothData);
    setClothes((prev) => [saved, ...prev.filter((c) => c.id !== saved.id)]);
    fetchDbStats().then(setDbStats).catch(() => {});
  };

  const handleClothUpdated = async (id, updatedData) => {
    const updated = await apiUpdateItem(id, updatedData);
    setClothes((prev) => prev.map((item) => (item.id === id ? { ...item, ...updated } : item)));
    fetchDbStats().then(setDbStats).catch(() => {});
  };

  const handleDeleteCloth = async (id) => {
    await apiDeleteItem(id);
    setClothes((prev) => prev.filter((it) => it.id !== id));
    fetchDbStats().then(setDbStats).catch(() => {});
  };

  const handleOpenEditModal = (cloth) => {
    setEditingCloth(cloth);
    setIsAddClothOpen(true);
  };

  const handleCloseAddModal = () => {
    setIsAddClothOpen(false);
    setEditingCloth(null);
  };

  const handleDatabaseReload = (newItems) => {
    setClothes(newItems);
    fetchDbStats().then(setDbStats).catch(() => {});
  };

  return (
    <ClickSpark
      sparkColor="#E50914"
      sparkSize={8}
      sparkRadius={26}
      sparkCount={12}
      duration={440}
      extraColors={['#E50914', '#FF2E4D', '#FFFFFF', '#FFAAA6']}
      className="min-h-screen bg-[#FAFAFC] text-neutral-900 selection:bg-red-600 selection:text-white"
    >
      {/* Navigation with Admin Portal Access */}
      <Navbar
        admin={admin}
        onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
        onOpenAdminDashboard={() => setIsAdminDashboardOpen(true)}
        onOpenAddModal={() => {
          setEditingCloth(null);
          setIsAddClothOpen(true);
        }}
        onAdminLogout={handleAdminLogout}
        cartCount={cart.length}
        favoritesCount={favorites.length}
        currentCurrency={currentCurrency}
        onCurrencyChange={(curr) => setCurrentCurrency(curr)}
        dbItemCount={clothes.length}
        onOpenCart={() => setIsCartOpen(true)}
        onToggleFavoritesFilter={() => setShowFavoritesOnly(!showFavoritesOnly)}
        showFavoritesOnly={showFavoritesOnly}
      />

      {/* Main Content */}
      <main>
        {/* Outcrowd 3D Hero Section */}
        <HeroSection
          admin={admin}
          onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
          onOpenAdminDashboard={() => setIsAdminDashboardOpen(true)}
          onOpenAddModal={() => {
            setEditingCloth(null);
            setIsAddClothOpen(true);
          }}
          featuredCloth={featuredCloth}
          totalItemsCount={clothes.length}
          onOpenQuickView={(item) => setQuickViewItem(item)}
        />

        {/* 3D Clothes Catalog Section */}
        <ClothesCatalogSection
          clothes={clothes}
          favorites={favorites}
          onToggleFavorite={handleToggleFavorite}
          currentCurrency={currentCurrency}
          showFavoritesOnly={showFavoritesOnly}
          onResetFavoritesFilter={() => setShowFavoritesOnly(false)}
          onOpenQuickView={(item) => setQuickViewItem(item)}
          onAddToCart={handleAddToCart}
          admin={admin}
          onOpenAddModal={() => {
            setEditingCloth(null);
            setIsAddClothOpen(true);
          }}
          onOpenEditModal={handleOpenEditModal}
          onDeleteItem={handleDeleteCloth}
        />

        {/* How It Works */}
        <WorkflowSection
          admin={admin}
          onOpenAddModal={() => {
            setEditingCloth(null);
            setIsAddClothOpen(true);
          }}
        />

        {/* Brand Showcase with Thriftzy Poster */}
        <BrandShowcase
          admin={admin}
          onOpenAddModal={() => {
            setEditingCloth(null);
            setIsAddClothOpen(true);
          }}
        />

        {/* FAQ Accordions */}
        <FAQAccordion />
      </main>

      {/* Footer */}
      <Footer
        admin={admin}
        onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
        onOpenAdminDashboard={() => setIsAdminDashboardOpen(true)}
        onOpenAddModal={() => {
          setEditingCloth(null);
          setIsAddClothOpen(true);
        }}
      />

      {/* Popups & Modals */}
      {/* 1. Quick View Modal with 3D folding animation */}
      <QuickViewModal
        item={quickViewItem}
        isOpen={!!quickViewItem}
        onClose={() => setQuickViewItem(null)}
        onAddToCart={handleAddToCart}
      />

      {/* 2. Admin Add & Edit Cloth Modal */}
      <AddClothModal
        isOpen={isAddClothOpen}
        initialCloth={editingCloth}
        onClose={handleCloseAddModal}
        onClothAdded={handleClothAdded}
        onClothUpdated={handleClothUpdated}
      />

      {/* 3. Dynamic Admin Login & Registration Modal */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onLoginSuccess={handleAdminLoginSuccess}
      />

      {/* 4. Complete Admin Dashboard & Inventory Command Center */}
      <AdminDashboardModal
        isOpen={isAdminDashboardOpen}
        onClose={() => setIsAdminDashboardOpen(false)}
        admin={admin}
        onAdminLogout={handleAdminLogout}
        items={clothes}
        dbStats={dbStats}
        onDeleteItem={handleDeleteCloth}
        onUpdateItem={handleClothUpdated}
        onOpenAddModal={() => {
          setEditingCloth(null);
          setIsAddClothOpen(true);
        }}
        onOpenEditModal={handleOpenEditModal}
        onDatabaseReload={handleDatabaseReload}
      />

      {/* 5. Cart Drawer Modal with WhatsApp Direct Checkout */}
      <CartDrawerModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        currentCurrency={currentCurrency}
        onRemoveFromCart={handleRemoveFromCart}
        onClearCart={handleClearCart}
      />
    </ClickSpark>
  );
}
