import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { CATEGORY_DEFINITIONS } from '../../data/sampleProducts';
import { ProductCard } from '../common/ProductCard';
import {
  Sparkles,
  Zap,
  Truck,
  ShieldCheck,
  RotateCcw,
  ArrowRight,
  TrendingUp,
  Flame,
  Percent,
  ChevronRight,
  ShoppingBasket,
  Smartphone,
  Shirt,
  Search,
  Megaphone
} from 'lucide-react';
import { CategoryType } from '../../types';

export const HomeScreen: React.FC = () => {
  const {
    products,
    setActiveTab,
    setSelectedCategory,
    setSelectedSubCategory,
    setIsSearchOpen,
    settings,
    activeNotices,
    setIsNoticeBoardOpen
  } = useStore();

  const [activeBannerIdx, setActiveBannerIdx] = useState(0);

  const banners = [
    {
      title: 'Local Superfast Delivery',
      subtitle: 'Delivering groceries & home essentials to your doorstep in 2-4 hours',
      highlight: 'Same Day Delivery',
      cta: 'Shop Daily Groceries',
      category: 'grocery' as CategoryType,
      bgGradient: 'from-emerald-900 via-emerald-800 to-teal-900',
      badge: '⚡ Local Express'
    },
    {
      title: 'Free Delivery on Orders Above ₹' + settings.freeDeliveryThreshold,
      subtitle: 'Zero shipping charges on grocery, electronics, fashion, and oils',
      highlight: 'Save ₹40 Delivery Fee',
      cta: 'Explore All Products',
      category: null,
      bgGradient: 'from-teal-950 via-emerald-900 to-emerald-950',
      badge: '🎉 Best Value'
    },
    {
      title: 'Pay with Cash On Delivery (COD)',
      subtitle: 'Inspect your order first, then pay via cash or UPI directly to our delivery partner',
      highlight: '100% Trust & Peace of Mind',
      cta: 'Browse Electronics',
      category: 'electronics' as CategoryType,
      bgGradient: 'from-neutral-900 via-emerald-950 to-neutral-900',
      badge: '💵 Trusted Payment'
    }
  ];

  // Rotate banner automatically
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveBannerIdx(prev => (prev + 1) % banners.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [banners.length]);

  // Product groups
  const featuredProducts = products.filter(p => p.isFeatured).slice(0, 5);
  const bestSellers = products.filter(p => p.isBestSeller).slice(0, 5);
  const newArrivals = products.filter(p => p.isNewArrival || p.discountPercentage >= 45).slice(0, 5);
  const discountDeals = products.filter(p => p.discountPercentage >= 30).slice(0, 5);
  const recommended = [...products].reverse().slice(0, 6);

  const getCatIcon = (id: string) => {
    switch (id) {
      case 'grocery':
        return <ShoppingBasket className="w-6 h-6 text-emerald-600" />;
      case 'electronics':
        return <Smartphone className="w-6 h-6 text-blue-600" />;
      case 'fashion':
        return <Shirt className="w-6 h-6 text-amber-600" />;
      case 'oils-personal-care':
        return <Sparkles className="w-6 h-6 text-teal-600" />;
      default:
        return <ShoppingBasket className="w-6 h-6 text-emerald-600" />;
    }
  };

  return (
    <div id="customer-home-screen" className="pb-24">
      {/* Mobile Search Bar Trigger */}
      <div className="sm:hidden px-3 pt-3">
        <button
          id="home-search-trigger-mobile"
          onClick={() => setIsSearchOpen(true)}
          className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-white border border-neutral-200 text-neutral-400 text-xs shadow-2xs font-medium"
        >
          <span className="flex items-center gap-2">
            <Search className="w-4 h-4 text-emerald-700" />
            <span>Search rice, dal, oils, earphones...</span>
          </span>
          <span className="bg-emerald-700 text-white font-bold text-[10px] px-2 py-0.5 rounded-md">
            Search
          </span>
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 pt-3 sm:pt-5 space-y-6">
        {/* Promotional Hero Carousel Banner */}
        <div className="relative rounded-3xl overflow-hidden shadow-md">
          <div
            className={`p-6 sm:p-9 text-white bg-gradient-to-r ${banners[activeBannerIdx].bgGradient} transition-all duration-500 min-h-[190px] sm:min-h-[220px] flex flex-col justify-between`}
          >
            <div>
              <div className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider text-amber-300 mb-2 border border-white/10">
                <span>{banners[activeBannerIdx].badge}</span>
              </div>
              <h2 className="text-xl sm:text-3xl font-black font-['Outfit',sans-serif] tracking-tight leading-tight max-w-xl">
                {banners[activeBannerIdx].title}
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100/90 mt-1 max-w-md font-medium">
                {banners[activeBannerIdx].subtitle}
              </p>
            </div>

            <div className="flex items-center justify-between pt-4">
              <button
                id="btn-banner-cta"
                onClick={() => {
                  if (banners[activeBannerIdx].category) {
                    setSelectedCategory(banners[activeBannerIdx].category);
                  }
                  setActiveTab('categories');
                }}
                className="px-4 py-2 bg-white text-emerald-900 font-black text-xs sm:text-sm rounded-xl hover:bg-amber-300 transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <span>{banners[activeBannerIdx].cta}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              {/* Dots */}
              <div className="flex items-center gap-1.5">
                {banners.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveBannerIdx(idx)}
                    className={`h-1.5 rounded-full transition-all ${
                      activeBannerIdx === idx ? 'w-6 bg-amber-400' : 'w-2 bg-white/40'
                    }`}
                    aria-label={`Banner ${idx + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Local Store Guarantee Highlights */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3 bg-white p-3 sm:p-4 rounded-2xl border border-neutral-200/80 shadow-2xs">
          <div className="flex items-center gap-2.5 p-1.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
              <Truck className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-neutral-900">2-4 Hr Local Delivery</div>
              <div className="text-[10px] text-neutral-500">Fast doorstep service</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-1.5">
            <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
              <Zap className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-neutral-900">Cash on Delivery</div>
              <div className="text-[10px] text-neutral-500">Pay cash or UPI on delivery</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-1.5">
            <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700 shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-neutral-900">100% Genuine Items</div>
              <div className="text-[10px] text-neutral-500">Local store verification</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-1.5">
            <div className="w-8 h-8 rounded-xl bg-teal-100 flex items-center justify-center text-teal-700 shrink-0">
              <RotateCcw className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-neutral-900">7-Day Easy Returns</div>
              <div className="text-[10px] text-neutral-500">Hassle-free guarantee</div>
            </div>
          </div>
        </div>

        {/* Notice Board Section (Admin-managed notices displayed to customer) */}
        {activeNotices.length > 0 && (
          <div id="customer-notice-board-section" className="rounded-3xl bg-linear-to-r from-emerald-50 via-teal-50/50 to-amber-50/40 p-4 sm:p-5 border border-emerald-200/80 shadow-2xs">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                  <Megaphone className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm sm:text-base font-black text-neutral-900 font-['Outfit',sans-serif]">
                      Store Notice Board
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      Live Updates
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-500">Official announcements & notices from Madina Mart</p>
                </div>
              </div>
              <button
                id="btn-view-all-notices"
                onClick={() => setIsNoticeBoardOpen(true)}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 hover:underline cursor-pointer"
              >
                <span>View All ({activeNotices.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Notice Cards - Latest active notices first */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {activeNotices.slice(0, 2).map((notice, idx) => (
                <div
                  key={notice.id}
                  onClick={() => setIsNoticeBoardOpen(true)}
                  className="bg-white rounded-2xl p-3.5 border border-emerald-100/90 shadow-2xs hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer flex flex-col sm:flex-row gap-3 items-start"
                >
                  {notice.imageUrl && (
                    <div className="w-full sm:w-28 h-28 shrink-0 rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200 flex items-center justify-center">
                      <img
                        src={notice.imageUrl}
                        alt={notice.title}
                        className="w-full h-full object-cover rounded-xl"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {idx === 0 && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-amber-100 text-amber-900">
                          NEW
                        </span>
                      )}
                      <span className="text-[10px] text-neutral-400 font-medium">
                        {notice.dateTime ? new Date(notice.dateTime).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-neutral-900 font-['Outfit',sans-serif] line-clamp-1">
                      {notice.title}
                    </h4>
                    <p className="text-xs text-neutral-600 line-clamp-2 mt-1 leading-relaxed">
                      {notice.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Categories Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-base sm:text-lg font-black text-neutral-900 font-['Outfit',sans-serif]">
                Shop by Categories
              </h3>
              <p className="text-xs text-neutral-500">Handpicked collections for your everyday needs</p>
            </div>
            <button
              onClick={() => {
                setSelectedCategory(null);
                setActiveTab('categories');
              }}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
            >
              <span>See All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {CATEGORY_DEFINITIONS.map(cat => (
              <div
                key={cat.id}
                id={`cat-card-${cat.id}`}
                onClick={() => {
                  setSelectedCategory(cat.id as CategoryType);
                  setSelectedSubCategory('All');
                  setActiveTab('categories');
                }}
                className="group relative bg-white rounded-2xl p-3 border border-neutral-200/80 hover:border-emerald-600 shadow-2xs hover:shadow-md transition-all cursor-pointer overflow-hidden flex flex-col justify-between"
              >
                <div className="relative aspect-video rounded-xl overflow-hidden mb-2.5 bg-neutral-100">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/70 to-transparent"></div>
                  <div className="absolute bottom-2 left-2 flex items-center gap-1.5 text-white">
                    <span className="p-1 rounded-md bg-white/20 backdrop-blur-xs">
                      {getCatIcon(cat.id)}
                    </span>
                    <span className="font-bold text-xs">{cat.name}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-neutral-500 font-medium">
                  <span className="truncate">{cat.subCategories.length - 1} Categories</span>
                  <span className="text-emerald-700 font-bold group-hover:translate-x-0.5 transition-transform">
                    →
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Featured Products Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-neutral-900 font-['Outfit',sans-serif]">
                  Featured Products
                </h3>
                <p className="text-xs text-neutral-500">Popular items verified by local shoppers</p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('categories')}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
            {featuredProducts.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>

        {/* Best Sellers Section */}
        <div className="bg-amber-50/50 -mx-3 sm:-mx-6 px-3 sm:px-6 py-6 border-y border-amber-200/60">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-200 flex items-center justify-center text-amber-800">
                  <Flame className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-neutral-900 font-['Outfit',sans-serif]">
                    Best Sellers
                  </h3>
                  <p className="text-xs text-amber-900/80">Most frequently ordered daily essentials</p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('categories')}
                className="text-xs font-bold text-amber-900 hover:underline flex items-center gap-1"
              >
                <span>Browse More</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
              {bestSellers.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </div>

        {/* Big Discounts Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-rose-100 flex items-center justify-center text-rose-700">
                <Percent className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-neutral-900 font-['Outfit',sans-serif]">
                  Discount Deals & Savings
                </h3>
                <p className="text-xs text-neutral-500">Save up to 60% with genuine reseller discounts</p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('categories')}
              className="text-xs font-bold text-rose-700 hover:text-rose-800 flex items-center gap-1"
            >
              <span>All Deals</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
            {discountDeals.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>

        {/* New Arrivals */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-teal-100 flex items-center justify-center text-teal-700">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-neutral-900 font-['Outfit',sans-serif]">
                  New Arrivals
                </h3>
                <p className="text-xs text-neutral-500">Fresh stock added this week to Madina Mart</p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('categories')}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              <span>Explore</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
            {newArrivals.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>

        {/* Recommended Products */}
        <div>
          <div className="mb-3">
            <h3 className="text-base sm:text-lg font-black text-neutral-900 font-['Outfit',sans-serif]">
              Recommended for You
            </h3>
            <p className="text-xs text-neutral-500">Curated based on your locality & trends</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4">
            {recommended.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
