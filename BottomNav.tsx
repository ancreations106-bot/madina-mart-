import React from 'react';
import { useStore } from '../../context/StoreContext';
import { Home, LayoutGrid, ShoppingBag, PackageCheck, User } from 'lucide-react';
import { NavigationTab } from '../../types';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, cartTotalCount, customerOrders, currentUser, setIsAuthModalOpen } = useStore();

  const handleTabClick = (tab: NavigationTab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const activeOrdersCount = customerOrders.filter(
    o => o.status !== 'Delivered' && o.status !== 'Cancelled'
  ).length;

  return (
    <nav
      id="mobile-bottom-nav"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-neutral-200/90 shadow-lg md:hidden"
    >
      <div className="max-w-md mx-auto grid grid-cols-5 h-16 px-1">
        {/* Home */}
        <button
          id="tab-btn-home"
          onClick={() => handleTabClick('home')}
          className={`flex flex-col items-center justify-center gap-1 transition-colors relative ${
            activeTab === 'home' ? 'text-emerald-700 font-bold' : 'text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <Home className={`w-5 h-5 ${activeTab === 'home' ? 'stroke-[2.4px]' : 'stroke-[1.8px]'}`} />
          <span className="text-[10px] tracking-tight">Home</span>
          {activeTab === 'home' && (
            <span className="absolute bottom-1 w-6 h-0.5 bg-emerald-700 rounded-full"></span>
          )}
        </button>

        {/* Categories */}
        <button
          id="tab-btn-categories"
          onClick={() => handleTabClick('categories')}
          className={`flex flex-col items-center justify-center gap-1 transition-colors relative ${
            activeTab === 'categories' ? 'text-emerald-700 font-bold' : 'text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <LayoutGrid className={`w-5 h-5 ${activeTab === 'categories' ? 'stroke-[2.4px]' : 'stroke-[1.8px]'}`} />
          <span className="text-[10px] tracking-tight">Categories</span>
          {activeTab === 'categories' && (
            <span className="absolute bottom-1 w-6 h-0.5 bg-emerald-700 rounded-full"></span>
          )}
        </button>

        {/* Cart with badge */}
        <button
          id="tab-btn-cart"
          onClick={() => handleTabClick('cart')}
          className={`flex flex-col items-center justify-center gap-1 transition-colors relative ${
            activeTab === 'cart' ? 'text-emerald-700 font-bold' : 'text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <div className="relative">
            <ShoppingBag className={`w-5 h-5 ${activeTab === 'cart' ? 'stroke-[2.4px]' : 'stroke-[1.8px]'}`} />
            {cartTotalCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-emerald-600 text-white font-extrabold text-[9px] w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                {cartTotalCount}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight">Cart</span>
          {activeTab === 'cart' && (
            <span className="absolute bottom-1 w-6 h-0.5 bg-emerald-700 rounded-full"></span>
          )}
        </button>

        {/* Orders with active orders count */}
        <button
          id="tab-btn-orders"
          onClick={() => handleTabClick('orders')}
          className={`flex flex-col items-center justify-center gap-1 transition-colors relative ${
            activeTab === 'orders' ? 'text-emerald-700 font-bold' : 'text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <div className="relative">
            <PackageCheck className={`w-5 h-5 ${activeTab === 'orders' ? 'stroke-[2.4px]' : 'stroke-[1.8px]'}`} />
            {activeOrdersCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-amber-500 text-white font-extrabold text-[9px] w-4 h-4 rounded-full flex items-center justify-center shadow-xs animate-pulse">
                {activeOrdersCount}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight">Orders</span>
          {activeTab === 'orders' && (
            <span className="absolute bottom-1 w-6 h-0.5 bg-emerald-700 rounded-full"></span>
          )}
        </button>

        {/* Profile */}
        <button
          id="tab-btn-profile"
          onClick={() => handleTabClick('profile')}
          className={`flex flex-col items-center justify-center gap-1 transition-colors relative ${
            activeTab === 'profile' ? 'text-emerald-700 font-bold' : 'text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <User className={`w-5 h-5 ${activeTab === 'profile' ? 'stroke-[2.4px]' : 'stroke-[1.8px]'}`} />
          <span className="text-[10px] tracking-tight">Profile</span>
          {activeTab === 'profile' && (
            <span className="absolute bottom-1 w-6 h-0.5 bg-emerald-700 rounded-full"></span>
          )}
        </button>
      </div>
    </nav>
  );
};
