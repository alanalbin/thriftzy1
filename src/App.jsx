import React, { useState, useEffect } from 'react';
import ClickSpark from './components/reactbits/ClickSpark';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import ClothesCatalogSection from './components/ClothesCatalogSection';
import WorkflowSection from './components/WorkflowSection';
import BrandShowcase from './components/BrandShowcase';
import FAQAccordion from './components/FAQAccordion';
import Footer from './components/Footer';

// Smooth 3D Outcrowd Popups
import QuickViewModal from './components/popups/QuickViewModal';
import AddClothModal from './components/popups/AddClothModal';
import DatabaseManagerModal from './components/popups/DatabaseManagerModal';
import CartDrawerModal from './components/popups/CartDrawerModal';

// Database API Services
import {
  fetchItems,
  createItem as apiCreateItem,
  deleteItem as apiDeleteItem,
  fetchDbStats,
  getFavorites,
  toggleFavorite as apiToggleFavorite
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
    status: 'Hybrid Database Active'
  });
  const [loading, setLoading] = useState(true);

  // Modal states
  const [quickViewItem, setQuickViewItem] = useState(null);
  const [isAddClothOpen, setIsAddClothOpen] = useState(false);
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Cart state
  const [cart, setCart] = useState([]);

  // Load clothes and favorites on mount
  useEffect(() => {
    async function loadData() {
      try {
        const [fetchedClothes, stats] = await Promise.all([
          fetchItems(),
          fetchDbStats()
        ]);
        if (Array.isArray(fetchedClothes)) {
          setClothes(fetchedClothes);
        }
        if (stats) setDbStats(stats);
      } catch (err) {
        console.error('Error loading clothes:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
    setFavorites(getFavorites());
  }, []);

  const featuredCloth = clothes.length > 0 ? clothes[0] : null;

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

  const handleToggleFavorite = (id) => {
    const next = apiToggleFavorite(id);
    setFavorites(next);
  };

  // Add new cloth directly to database
  const handleClothAdded = async (newClothData) => {
    const saved = await apiCreateItem(newClothData);
    setClothes((prev) => [saved, ...prev.filter((c) => c.id !== saved.id)]);
    fetchDbStats().then(setDbStats).catch(() => {});
  };

  // Delete cloth from database
  const handleDeleteCloth = async (id) => {
    await apiDeleteItem(id);
    setClothes((prev) => prev.filter((it) => it.id !== id));
    fetchDbStats().then(setDbStats).catch(() => {});
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
      {/* Navigation (Outcrowd Pill Style with Currency & Favorites) */}
      <Navbar
        cartCount={cart.length}
        favoritesCount={favorites.length}
        currentCurrency={currentCurrency}
        onCurrencyChange={(curr) => setCurrentCurrency(curr)}
        dbItemCount={clothes.length}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAddModal={() => setIsAddClothOpen(true)}
        onOpenDbModal={() => setIsDbModalOpen(true)}
        onToggleFavoritesFilter={() => setShowFavoritesOnly(!showFavoritesOnly)}
        showFavoritesOnly={showFavoritesOnly}
      />

      {/* Main Content */}
      <main>
        {/* Outcrowd 3D Hero Section */}
        <HeroSection
          featuredCloth={featuredCloth}
          totalItemsCount={clothes.length}
          onOpenAddModal={() => setIsAddClothOpen(true)}
          onOpenDbModal={() => setIsDbModalOpen(true)}
          onOpenQuickView={(item) => setQuickViewItem(item)}
        />

        {/* Outcrowd 3D Clothes Catalog Section */}
        <ClothesCatalogSection
          clothes={clothes}
          favorites={favorites}
          onToggleFavorite={handleToggleFavorite}
          currentCurrency={currentCurrency}
          showFavoritesOnly={showFavoritesOnly}
          onResetFavoritesFilter={() => setShowFavoritesOnly(false)}
          onOpenQuickView={(item) => setQuickViewItem(item)}
          onAddToCart={handleAddToCart}
          onOpenAddModal={() => setIsAddClothOpen(true)}
        />

        {/* How It Works: Snap, List, Sell */}
        <WorkflowSection onOpenAddModal={() => setIsAddClothOpen(true)} />

        {/* Brand Showcase with Thriftzy Poster */}
        <BrandShowcase onOpenAddModal={() => setIsAddClothOpen(true)} />

        {/* FAQ Accordions */}
        <FAQAccordion />
      </main>

      {/* Footer */}
      <Footer
        onOpenAddModal={() => setIsAddClothOpen(true)}
        onOpenDbModal={() => setIsDbModalOpen(true)}
      />

      {/* Smooth 3D Outcrowd Popups */}
      {/* 1. Quick View Modal with 3D folding animation & WhatsApp contact */}
      <QuickViewModal
        item={quickViewItem}
        isOpen={!!quickViewItem}
        onClose={() => setQuickViewItem(null)}
        onAddToCart={handleAddToCart}
      />

      {/* 2. List a Cloth Modal with local file upload & live 3D card preview */}
      <AddClothModal
        isOpen={isAddClothOpen}
        onClose={() => setIsAddClothOpen(false)}
        onClothAdded={handleClothAdded}
      />

      {/* 3. Database Manager Modal with 1-Click JSON Backup & Restore */}
      <DatabaseManagerModal
        isOpen={isDbModalOpen}
        onClose={() => setIsDbModalOpen(false)}
        items={clothes}
        dbStats={dbStats}
        onDeleteItem={handleDeleteCloth}
        onOpenAddModal={() => setIsAddClothOpen(true)}
        onDatabaseReload={handleDatabaseReload}
      />

      {/* 4. Cart Drawer Modal with WhatsApp Direct Checkout */}
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
