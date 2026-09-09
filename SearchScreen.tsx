import React, { useState, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { Search, X, TrendingUp, Sparkles, Filter, AlertCircle } from 'lucide-react';
import { ProductCard } from '../common/ProductCard';

export const SearchScreen: React.FC = () => {
  const { isSearchOpen, setIsSearchOpen, products, setSelectedCategory, setActiveTab } = useStore();
  const [query, setQuery] = useState('');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');

  const popularKeywords = ['Basmati Rice', 'Toor Dal', 'Hair Oil', 'boAt Cable', 'Timex Watch', 'T-Shirt', 'Charger'];

  const filteredResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q && activeCategoryFilter === 'all') return [];

    return products.filter(p => {
      const matchCategory = activeCategoryFilter === 'all' || p.category === activeCategoryFilter;
      if (!matchCategory) return false;

      if (!q) return true;

      const inName = p.name.toLowerCase().includes(q);
      const inBrand = p.brand.toLowerCase().includes(q);
      const inCategory = p.category.toLowerCase().includes(q);
      const inSubCategory = p.subCategory.toLowerCase().includes(q);
      const inTags = p.tags?.some(tag => tag.toLowerCase().includes(q));
      const inDescription = p.description.toLowerCase().includes(q);

      return inName || inBrand || inCategory || inSubCategory || inTags || inDescription;
    });
  }, [query, activeCategoryFilter, products]);

  if (!isSearchOpen) return null;

  return (
    <div
      id="search-overlay"
      className="fixed inset-0 z-50 bg-neutral-100 flex flex-col animate-in fade-in duration-200"
    >
      {/* Search Header */}
      <div className="bg-white border-b border-neutral-200 px-4 py-3 shadow-xs">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <div className="flex-1 flex items-center bg-neutral-100 rounded-2xl px-3.5 py-2 border border-neutral-200 focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-500/20">
            <Search className="w-5 h-5 text-emerald-700 mr-2 shrink-0" />
            <input
              id="search-input-field"
              type="text"
              autoFocus
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search rice, dal, oils, electronics, shirts..."
              className="w-full bg-transparent text-sm sm:text-base font-semibold text-neutral-900 focus:outline-none placeholder-neutral-400"
            />
            {query && (
              <button
                id="btn-clear-search"
                onClick={() => setQuery('')}
                className="p-1 text-neutral-400 hover:text-neutral-700 rounded-full"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            id="btn-close-search"
            onClick={() => {
              setIsSearchOpen(false);
              setQuery('');
            }}
            className="text-xs sm:text-sm font-bold text-neutral-700 hover:text-neutral-900 px-2 py-1"
          >
            Cancel
          </button>
        </div>

        {/* Category Pills inside Search */}
        <div className="max-w-4xl mx-auto flex items-center gap-2 mt-3 overflow-x-auto no-scrollbar pb-1">
          {[
            { id: 'all', label: 'All Categories' },
            { id: 'grocery', label: 'Grocery' },
            { id: 'electronics', label: 'Electronics' },
            { id: 'fashion', label: 'Fashion' },
            { id: 'oils-personal-care', label: 'Oils & Personal Care' }
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategoryFilter(cat.id)}
              className={`text-xs px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors ${
                activeCategoryFilter === cat.id
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search Content */}
      <div className="flex-1 overflow-y-auto p-4 max-w-4xl mx-auto w-full">
        {/* If no query entered yet, show popular suggestions */}
        {!query && activeCategoryFilter === 'all' && (
          <div className="py-4">
            <div className="flex items-center gap-2 text-xs font-bold text-neutral-500 uppercase tracking-wider mb-3">
              <TrendingUp className="w-4 h-4 text-emerald-700" />
              <span>Trending Searches in Your Area</span>
            </div>
            <div className="flex flex-wrap gap-2 mb-6">
              {popularKeywords.map(term => (
                <button
                  key={term}
                  onClick={() => setQuery(term)}
                  className="px-3.5 py-2 rounded-xl bg-white border border-neutral-200 text-neutral-800 text-xs font-semibold hover:border-emerald-600 hover:text-emerald-700 shadow-2xs transition-colors flex items-center gap-1.5"
                >
                  <Search className="w-3 h-3 text-neutral-400" />
                  <span>{term}</span>
                </button>
              ))}
            </div>

            <div className="bg-gradient-to-r from-emerald-800 to-teal-700 rounded-2xl p-4 text-white shadow-sm flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm font-['Outfit',sans-serif]">Need groceries urgently?</h4>
                <p className="text-xs text-emerald-100 mt-0.5">Explore our daily essentials delivered in 2 to 4 hours.</p>
              </div>
              <button
                onClick={() => {
                  setSelectedCategory('grocery');
                  setActiveTab('categories');
                  setIsSearchOpen(false);
                }}
                className="px-3 py-1.5 bg-white text-emerald-800 rounded-xl text-xs font-bold hover:bg-emerald-50 transition-colors shrink-0 shadow-xs"
              >
                Browse Grocery
              </button>
            </div>
          </div>
        )}

        {/* Search Results Display */}
        {(query || activeCategoryFilter !== 'all') && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-neutral-700">
                {filteredResults.length} {filteredResults.length === 1 ? 'Product' : 'Products'} found
                {query ? ` for "${query}"` : ''}
              </h3>
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="text-xs text-emerald-700 font-bold hover:underline"
                >
                  Clear search
                </button>
              )}
            </div>

            {filteredResults.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 pb-12">
                {filteredResults.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              /* No Results Empty State */
              <div className="bg-white rounded-3xl border border-neutral-200 p-8 text-center max-w-md mx-auto my-8 shadow-xs">
                <div className="w-14 h-14 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400 mx-auto mb-4">
                  <AlertCircle className="w-7 h-7" />
                </div>
                <h4 className="font-bold text-base text-neutral-900 mb-1">No products match your search</h4>
                <p className="text-xs text-neutral-500 mb-5 leading-relaxed">
                  We couldn't find any products matching "{query}". Check for spelling errors or try searching for general terms like "oil", "rice", or "cable".
                </p>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => setQuery('')}
                    className="w-full py-2.5 bg-emerald-700 text-white rounded-xl text-xs font-bold hover:bg-emerald-800"
                  >
                    Clear Search
                  </button>
                  <button
                    onClick={() => {
                      setIsSearchOpen(false);
                      setActiveTab('categories');
                    }}
                    className="w-full py-2.5 bg-neutral-100 text-neutral-700 rounded-xl text-xs font-bold hover:bg-neutral-200"
                  >
                    Browse All Categories
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
