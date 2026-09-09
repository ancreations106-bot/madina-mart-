import React, { useState, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { CATEGORY_DEFINITIONS } from '../../data/sampleProducts';
import { CategoryType } from '../../types';
import { ProductCard } from '../common/ProductCard';
import {
  Filter,
  SlidersHorizontal,
  ArrowUpDown,
  ShoppingBasket,
  Smartphone,
  Shirt,
  Sparkles,
  ChevronRight,
  Check
} from 'lucide-react';

export const CategoryScreen: React.FC = () => {
  const {
    products,
    selectedCategory,
    setSelectedCategory,
    selectedSubCategory,
    setSelectedSubCategory
  } = useStore();

  // Active Category (default to 'grocery' if none chosen)
  const currentCategory = selectedCategory || 'grocery';
  const categoryDef = CATEGORY_DEFINITIONS.find(c => c.id === currentCategory) || CATEGORY_DEFINITIONS[0];

  // Filtering & Sorting State
  const [activeSubCat, setActiveSubCat] = useState<string>(selectedSubCategory || 'All');
  const [sortBy, setSortBy] = useState<'popularity' | 'price-asc' | 'price-desc' | 'newest' | 'discount'>('popularity');
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [minRating, setMinRating] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(2500);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // Sync subcategory if changed from context
  React.useEffect(() => {
    if (selectedSubCategory) {
      setActiveSubCat(selectedSubCategory);
    }
  }, [selectedSubCategory]);

  const filteredProducts = useMemo(() => {
    return products
      .filter(p => {
        // Category check
        if (p.category !== currentCategory) return false;

        // Subcategory check
        if (activeSubCat !== 'All' && p.subCategory.toLowerCase() !== activeSubCat.toLowerCase()) {
          // Check partial match for subcategory
          if (!p.subCategory.toLowerCase().includes(activeSubCat.toLowerCase()) && !p.tags.some(t => t.toLowerCase().includes(activeSubCat.toLowerCase()))) {
            return false;
          }
        }

        // Availability check
        if (inStockOnly && p.status === 'out_of_stock') return false;

        // Rating check
        if (minRating > 0 && p.rating < minRating) return false;

        // Price check
        if (p.sellingPrice > maxPrice) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.sellingPrice - b.sellingPrice;
        if (sortBy === 'price-desc') return b.sellingPrice - a.sellingPrice;
        if (sortBy === 'discount') return b.discountPercentage - a.discountPercentage;
        if (sortBy === 'newest') return (b.isNewArrival ? 1 : 0) - (a.isNewArrival ? 1 : 0);
        return b.rating * b.reviewCount - a.rating * a.reviewCount; // Popularity default
      });
  }, [products, currentCategory, activeSubCat, inStockOnly, minRating, maxPrice, sortBy]);

  const getCategoryIcon = (id: string) => {
    switch (id) {
      case 'grocery':
        return <ShoppingBasket className="w-5 h-5" />;
      case 'electronics':
        return <Smartphone className="w-5 h-5" />;
      case 'fashion':
        return <Shirt className="w-5 h-5" />;
      case 'oils-personal-care':
        return <Sparkles className="w-5 h-5" />;
      default:
        return <ShoppingBasket className="w-5 h-5" />;
    }
  };

  return (
    <div id="categories-screen" className="max-w-7xl mx-auto px-3 sm:px-6 py-4 pb-24">
      {/* Top 4 Main Category Cards Navigation */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 mb-6">
        {CATEGORY_DEFINITIONS.map(cat => {
          const isSelected = cat.id === currentCategory;
          return (
            <button
              key={cat.id}
              id={`cat-nav-btn-${cat.id}`}
              onClick={() => {
                setSelectedCategory(cat.id as CategoryType);
                setSelectedSubCategory('All');
                setActiveSubCat('All');
              }}
              className={`p-3 rounded-2xl border text-left transition-all duration-200 flex items-center gap-3 cursor-pointer ${
                isSelected
                  ? 'bg-emerald-900 text-white border-emerald-900 shadow-md ring-2 ring-emerald-600/30'
                  : 'bg-white hover:bg-neutral-50 text-neutral-800 border-neutral-200 shadow-2xs'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  isSelected ? 'bg-emerald-700 text-white' : 'bg-neutral-100 text-neutral-600'
                }`}
              >
                {getCategoryIcon(cat.id)}
              </div>
              <div className="truncate">
                <div className="font-bold text-xs sm:text-sm truncate font-['Outfit',sans-serif]">
                  {cat.name}
                </div>
                <div className={`text-[10px] truncate ${isSelected ? 'text-emerald-200' : 'text-neutral-400'}`}>
                  {cat.subCategories.length - 1} subcategories
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Category Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 text-white p-5 sm:p-7 mb-5 shadow-sm">
        <div className="relative z-10 max-w-lg">
          <div className="inline-flex items-center gap-1.5 bg-emerald-700/80 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase mb-2 text-emerald-100">
            <span>{categoryDef.name} Department</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black font-['Outfit',sans-serif] tracking-tight">
            {categoryDef.name}
          </h2>
          <p className="text-xs sm:text-sm text-emerald-200 mt-1 max-w-md">
            {categoryDef.tagline}
          </p>
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-20 bg-cover bg-center pointer-events-none" style={{ backgroundImage: `url(${categoryDef.image})` }} />
      </div>

      {/* Subcategory Pills Carousel */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 mb-4">
        {categoryDef.subCategories.map(sub => (
          <button
            key={sub}
            onClick={() => setActiveSubCat(sub)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeSubCat === sub
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-white hover:bg-neutral-100 text-neutral-600 border border-neutral-200'
            }`}
          >
            {sub}
          </button>
        ))}
      </div>

      {/* Controls Bar: Count, Sort dropdown, and Filter Button */}
      <div className="bg-white rounded-2xl p-3 border border-neutral-200 mb-5 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
        <div className="text-xs font-bold text-neutral-700">
          Showing <span className="text-emerald-700 font-extrabold">{filteredProducts.length}</span> products
        </div>

        <div className="flex items-center gap-2">
          {/* Sort selector */}
          <div className="flex items-center gap-1 bg-neutral-50 px-2.5 py-1.5 rounded-xl border border-neutral-200 text-xs text-neutral-700">
            <ArrowUpDown className="w-3.5 h-3.5 text-neutral-400" />
            <select
              id="select-sort-products"
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="bg-transparent font-semibold focus:outline-none cursor-pointer"
            >
              <option value="popularity">Popularity</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="discount">Highest Discount</option>
              <option value="newest">New Arrivals</option>
            </select>
          </div>

          {/* Filter trigger */}
          <button
            id="btn-open-filters"
            onClick={() => setIsFilterDrawerOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 text-white rounded-xl text-xs font-bold hover:bg-neutral-800 transition-colors shadow-xs cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters</span>
            {(inStockOnly || minRating > 0 || maxPrice < 2500) && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            )}
          </button>
        </div>
      </div>

      {/* Product Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-neutral-200 p-12 text-center max-w-md mx-auto my-8">
          <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400 mx-auto mb-3">
            <Filter className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-neutral-900 text-base mb-1">No products match your filters</h4>
          <p className="text-xs text-neutral-500 mb-4">
            Try resetting your price filter or selecting another subcategory.
          </p>
          <button
            onClick={() => {
              setActiveSubCat('All');
              setInStockOnly(false);
              setMinRating(0);
              setMaxPrice(2500);
            }}
            className="px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-bold hover:bg-emerald-800 transition-colors"
          >
            Reset All Filters
          </button>
        </div>
      )}

      {/* Filter Modal / Drawer */}
      {isFilterDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm p-5 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200 mb-4">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-emerald-700" />
                <h3 className="font-bold text-sm text-neutral-900">Filter Products</h3>
              </div>
              <button
                onClick={() => setIsFilterDrawerOpen(false)}
                className="text-neutral-400 hover:text-neutral-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-5">
              {/* Max Price Range */}
              <div>
                <div className="flex justify-between items-center text-xs font-bold text-neutral-700 mb-2">
                  <span>Maximum Price</span>
                  <span className="text-emerald-700 font-extrabold text-sm font-['Outfit',sans-serif]">
                    ₹{maxPrice}
                  </span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="2500"
                  step="50"
                  value={maxPrice}
                  onChange={e => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-emerald-700 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-neutral-400 mt-1">
                  <span>₹50</span>
                  <span>₹1200</span>
                  <span>₹2500</span>
                </div>
              </div>

              {/* Minimum Customer Rating */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-2">
                  Minimum Rating
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[0, 4.0, 4.5, 4.7].map(rate => (
                    <button
                      key={rate}
                      type="button"
                      onClick={() => setMinRating(rate)}
                      className={`py-2 rounded-xl text-xs font-bold transition-colors ${
                        minRating === rate
                          ? 'bg-emerald-700 text-white'
                          : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                      }`}
                    >
                      {rate === 0 ? 'Any' : `${rate}★+`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Availability Toggle */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-neutral-50 border border-neutral-200">
                <span className="text-xs font-bold text-neutral-800">In-Stock Items Only</span>
                <input
                  type="checkbox"
                  id="checkbox-in-stock-only"
                  checked={inStockOnly}
                  onChange={e => setInStockOnly(e.target.checked)}
                  className="w-4 h-4 accent-emerald-700 rounded cursor-pointer"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setInStockOnly(false);
                    setMinRating(0);
                    setMaxPrice(2500);
                  }}
                  className="flex-1 py-2.5 rounded-xl border border-neutral-300 text-neutral-700 font-bold text-xs hover:bg-neutral-50"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={() => setIsFilterDrawerOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-700 text-white font-bold text-xs hover:bg-emerald-800 shadow-sm"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
