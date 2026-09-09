import React, { useState } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { SplashScreen } from './components/common/SplashScreen';
import { Navbar } from './components/common/Navbar';
import { BottomNav } from './components/common/BottomNav';
import { Toast } from './components/common/Toast';
import { HomeScreen } from './components/customer/HomeScreen';
import { CategoryScreen } from './components/customer/CategoryScreen';
import { CartScreen } from './components/customer/CartScreen';
import { OrdersScreen } from './components/customer/OrdersScreen';
import { ProfileScreen } from './components/customer/ProfileScreen';
import { SearchScreen } from './components/customer/SearchScreen';
import { ProductDetailModal } from './components/customer/ProductDetailModal';
import { CheckoutScreen } from './components/customer/CheckoutScreen';
import { OrderConfirmationScreen } from './components/customer/OrderConfirmationScreen';
import { OrderTrackingModal } from './components/customer/OrderTrackingModal';
import { CustomerAuthModal } from './components/auth/CustomerAuthModal';
import { AdminAuthModal } from './components/auth/AdminAuthModal';
import { NoticeBoardModal } from './components/customer/NoticeBoardModal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { Shield, Phone, MessageCircle } from 'lucide-react';
import { CategoryType } from './types';

function AppContent() {
  const {
    activeTab,
    setActiveTab,
    setSelectedCategory,
    isAdminOpen,
    setIsAdminOpen,
    adminUser,
    settings
  } = useStore();

  // App starts directly on the Splash screen as requested
  const [showSplash, setShowSplash] = useState<boolean>(true);

  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  // If in admin mode and authenticated, display the dedicated full-page Admin Dashboard
  if (isAdminOpen && adminUser) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans">
        <AdminDashboard />
        <Toast />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* 1. First-Time Brand Splash Screen */}
      {showSplash && <SplashScreen onFinish={handleSplashFinish} onComplete={handleSplashFinish} />}

      {/* 2. Customer Navigation Header */}
      <Navbar />

      {/* 3. Primary Content Routed by activeTab */}
      <main className="flex-1 w-full">
        {activeTab === 'home' && <HomeScreen />}
        {activeTab === 'categories' && <CategoryScreen />}
        {activeTab === 'cart' && <CartScreen />}
        {activeTab === 'orders' && <OrdersScreen />}
        {activeTab === 'profile' && <ProfileScreen />}
      </main>

      {/* 4. Desktop / Tablet Footer */}
      <footer className="bg-white border-t border-neutral-200 mt-auto pb-20 sm:pb-8 pt-10 text-xs text-neutral-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand column */}
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-700 to-teal-800 flex items-center justify-center text-white font-black shadow-sm font-['Outfit',sans-serif]">
                  M
                </div>
                <div>
                  <span className="font-black text-lg tracking-tight text-neutral-950 font-['Outfit',sans-serif]">
                    Madina Mart
                  </span>
                  <div className="text-[10px] text-emerald-800 font-bold -mt-0.5 tracking-wider uppercase">
                    Your Local Shopping Store
                  </div>
                </div>
              </div>
              <p className="text-neutral-500 leading-relaxed text-xs">
                Madina Mart connects local Indian households with quality Grocery, Electronics, Fashion, and Personal Care. 100% verified authentic goods with Cash on Delivery peace of mind.
              </p>
              <div className="flex items-center gap-3 pt-1 text-emerald-800 font-bold text-xs">
                <span>📍 {settings.operatingCity}</span>
                <span>•</span>
                <span>⚡ 2-4 Hr Delivery</span>
              </div>
            </div>

            {/* Quick Departments */}
            <div>
              <h4 className="font-bold text-neutral-900 uppercase tracking-wider text-[11px] mb-3">
                Shop Categories
              </h4>
              <ul className="space-y-2">
                {(
                  [
                    { id: 'grocery', name: 'Grocery & Staples' },
                    { id: 'electronics', name: 'Mobile & Electronics' },
                    { id: 'fashion', name: 'Fashion & Wearables' },
                    { id: 'oils-personal-care', name: 'Oils & Personal Care' }
                  ] as const
                ).map(cat => (
                  <li key={cat.id}>
                    <button
                      onClick={() => {
                        setSelectedCategory(cat.id as CategoryType);
                        setActiveTab('categories');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="hover:text-emerald-700 transition-colors text-left"
                    >
                      {cat.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Customer Assurance */}
            <div>
              <h4 className="font-bold text-neutral-900 uppercase tracking-wider text-[11px] mb-3">
                Customer Guarantee
              </h4>
              <ul className="space-y-2 text-neutral-500">
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                  <span>Cash on Delivery (COD) Available</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                  <span>Inspect Goods Before Paying</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                  <span>{settings.returnWindowDays}-Day Hassle-Free Returns</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                  <span>Free Delivery on Orders &gt; ₹{settings.freeDeliveryThreshold}</span>
                </li>
              </ul>
            </div>

            {/* Helpline & Admin Entrance */}
            <div className="space-y-3">
              <h4 className="font-bold text-neutral-900 uppercase tracking-wider text-[11px]">
                Helpline & Store Support
              </h4>
              <p className="text-neutral-500">
                Direct phone support for order delivery inquiries and updates:
              </p>
              <div className="space-y-1.5 font-semibold text-neutral-800">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{settings.contactPhone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-700" />
                  <span>WhatsApp: {settings.contactWhatsapp}</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  id="footer-admin-portal-link"
                  onClick={() => setIsAdminOpen(true)}
                  className="inline-flex items-center gap-1.5 text-[11px] font-bold text-neutral-500 hover:text-emerald-800 bg-neutral-100 hover:bg-neutral-200 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
                >
                  <Shield className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Store Staff / Admin Portal</span>
                </button>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-neutral-500">
            <div>
              © {new Date().getFullYear()} <strong>Madina Mart</strong>. All rights reserved. Built for Indian local e-commerce reselling.
            </div>
            <div className="flex items-center gap-4">
              <span>Privacy Policy</span>
              <span>•</span>
              <span>Terms of Service</span>
              <span>•</span>
              <span>Return Policy</span>
            </div>
          </div>
        </div>
      </footer>

      {/* 5. Mobile Bottom Navigation */}
      <BottomNav />

      {/* 6. Overlays & Modals */}
      <SearchScreen />
      <ProductDetailModal />
      <CheckoutScreen />
      <OrderConfirmationScreen />
      <OrderTrackingModal />
      <CustomerAuthModal />
      <AdminAuthModal />
      <NoticeBoardModal />
      <Toast />
    </div>
  );
}

export function App() {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
}

export default App;
