import React, { useState, useEffect } from 'react';
import ClickSpark from './components/reactbits/ClickSpark';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import ClothesCatalogSection from './components/ClothesCatalogSection';
import WorkflowSection from './components/WorkflowSection';
import BrandShowcase from './components/BrandShowcase';
import FAQAccordion from './components/FAQAccordion';
import Footer from './components/Footer';

// Dedicated Admin Page
import AdminPage from './components/admin/AdminPage';

// Smooth 3D Popups
import QuickViewModal from './components/popups/QuickViewModal';
import AddClothModal from './components/popups/AddClothModal';
import CartDrawerModal from './components/popups/CartDrawerModal';

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
  // Page Routing: 'store' (default homepage) | 'admin' (dedicated admin page)
  const [currentPage, setCurrentPage] = useState(() => {
    if (typeof window !== 'undefined') {
      const p = window.location.pathname.toLowerCase();
      const h = window.location.hash.toLowerCase();
      if (p === '/admin' || p === '/admin/' || h === '#admin') return 'admin';
    }
    return 'store';
  });

  // Clothes state stored in persistent SQLite database
  const [clothes, setClothes] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [currentCurrency, setCurrentCurrency] = useState('USD');
  const [dbStats, setDbStats] = useState({
    totalClothes: 0,
    totalValuation: 0,
    status: 'SQLite Database Active'
  });
  const [loading, setLoading] = useState(true);

  // Dynamic Admin Authentication State
  const [admin, setAdmin] = useState(null);

  // Modal states for 3D Popups
  const [quickViewItem, setQuickViewItem] = useState(null);
  const [isAddClothOpen, setIsAddClothOpen] = useState(false);
  const [editingCloth, setEditingCloth] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Cart state
  const [cart, setCart] = useState([]);

  // URL routing synchronization (supports back/forward buttons and /admin route)
  useEffect(() => {
    const handleRouteChange = () => {
      const p = window.location.pathname.toLowerCase();
      const h = window.location.hash.toLowerCase();
      if (p === '/admin' || p === '/admin/' || h === '#admin') {
        setCurrentPage('admin');
      } else {
        setCurrentPage('store');
      }
    };

    window.addEventListener('popstate', handleRouteChange);
    window.addEventListener('hashchange', handleRouteChange);
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
      window.removeEventListener('hashchange', handleRouteChange);
    };
  }, []);

  const navigateTo = (page) => {
    setCurrentPage(page);
    if (page === 'admin') {
      window.history.pushState({}, '', '/admin');
    } else {
      window.history.pushState({}, '', '/');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
  };

  const handleAdminLogout = async () => {
    await apiAdminLogout();
    setAdmin(null);
  };

  // Cloth Management (Direct SQLite Database Operations)
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
      {/* =========================================================================
          VIEW 1: DEDICATED ADMIN PAGE (when at /admin)
          ========================================================================= */}
      {currentPage === 'admin' ? (
        <AdminPage
          admin={admin}
          onAdminLoginSuccess={handleAdminLoginSuccess}
          onAdminLogout={handleAdminLogout}
          onNavigateHome={() => navigateTo('store')}
          clothes={clothes}
          dbStats={dbStats}
          onClothAdded={handleClothAdded}
          onClothUpdated={handleClothUpdated}
          onDeleteItem={handleDeleteCloth}
          onOpenQuickView={(item) => setQuickViewItem(item)}
          onDatabaseReload={handleDatabaseReload}
        />
      ) : (
        /* =========================================================================
           VIEW 2: STORE HOMEPAGE (Customers & Shoppers View with Product Add/Delete)
           ========================================================================= */
        <>
          {/* Navigation with clean logo & direct link to Admin Page */}
          <Navbar
            admin={admin}
            onNavigateAdmin={() => navigateTo('admin')}
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

          {/* Main Storefront Content */}
          <main>
            {/* Outcrowd 3D Hero Section */}
            <HeroSection
              admin={admin}
              onNavigateAdmin={() => navigateTo('admin')}
              onOpenAddModal={() => {
                setEditingCloth(null);
                setIsAddClothOpen(true);
              }}
              featuredCloth={featuredCloth}
              totalItemsCount={clothes.length}
              onOpenQuickView={(item) => setQuickViewItem(item)}
            />

            {/* 3D Clothes Catalog Section: View, Add, and Delete directly on Homepage! */}
            <ClothesCatalogSection
              clothes={clothes}
              favorites={favorites}
              onToggleFavorite={handleToggleFavorite}
              currentCurrency={currentCurrency}
              showFavoritesOnly={showFavoritesOnly}
              onResetFavoritesFilter={() => setShowFavoritesOnly(false)}
              onOpenQuickView={(item) => setQuickViewItem(item)}
              onAddToCart={handleAddToCart}
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

            {/* Brand Showcase */}
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
            onNavigateAdmin={() => navigateTo('admin')}
            onOpenAddModal={() => {
              setEditingCloth(null);
              setIsAddClothOpen(true);
            }}
          />
        </>
      )}

      {/* =========================================================================
          BUTTERY SMOOTH 3D POPUPS
          ========================================================================= */}
      {/* 1. 3D Quick View Modal */}
      <QuickViewModal
        item={quickViewItem}
        isOpen={!!quickViewItem}
        onClose={() => setQuickViewItem(null)}
        onAddToCart={handleAddToCart}
      />

      {/* 2. 3D Add & Edit Cloth Modal */}
      <AddClothModal
        isOpen={isAddClothOpen}
        initialCloth={editingCloth}
        onClose={handleCloseAddModal}
        onClothAdded={handleClothAdded}
        onClothUpdated={handleClothUpdated}
      />

      {/* 3. 3D Cart Drawer with WhatsApp Direct Checkout */}
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
