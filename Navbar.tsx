import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  MapPin,
  Search,
  Heart,
  ShoppingBag,
  ShieldCheck,
  User as UserIcon,
  ChevronDown,
  Store,
  Sparkles,
  Navigation,
  Loader2,
  CheckCircle2,
  Megaphone
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    currentUser,
    cartTotalCount,
    wishlist,
    setActiveTab,
    setIsSearchOpen,
    setIsAuthModalOpen,
    setAuthIntent,
    setIsAdminOpen,
    selectedDeliveryPincode,
    setSelectedDeliveryPincode,
    settings,
    customerLocation,
    isLocating,
    locationStatus,
    locationError,
    requestCustomerLiveLocation,
    clearCustomerLocation,
    activeNotices,
    setIsNoticeBoardOpen
  } = useStore();

  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [tempPincode, setTempPincode] = useState(selectedDeliveryPincode);

  const defaultAddr = currentUser?.savedAddresses.find(a => a.isDefault) || currentUser?.savedAddresses[0];

  const handlePincodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempPincode.trim().length === 6) {
      setSelectedDeliveryPincode(tempPincode.trim());
      setIsLocationModalOpen(false);
    }
  };

  const handleLiveLocationClick = async () => {
    await requestCustomerLiveLocation();
  };

  const displayLocationText = customerLocation
    ? customerLocation.locality || customerLocation.formattedAddress
    : defaultAddr
    ? `${defaultAddr.streetArea ? defaultAddr.streetArea + ', ' : ''}${defaultAddr.city} - ${defaultAddr.pincode}`
    : selectedDeliveryPincode
    ? `Pincode: ${selectedDeliveryPincode}`
    : null;

  return (
    <>
      <header id="main-header" className="sticky top-0 z-40 bg-white border-b border-neutral-200 shadow-xs">
        {/* Top Trust & Announcement Bar */}
        <div className="bg-emerald-900 text-white text-[11px] font-medium py-1 px-4 flex items-center justify-between tracking-wide">
          <div className="flex items-center gap-1.5 overflow-hidden whitespace-nowrap text-emerald-100">
            <Sparkles className="w-3 h-3 text-amber-400 shrink-0 animate-pulse" />
            <span className="truncate">⚡ Fast Local Delivery • Free above ₹{settings.freeDeliveryThreshold} • Cash On Delivery</span>
          </div>
          <div className="flex items-center gap-3 shrink-0 ml-2">
            <button
              id="btn-notice-board-top-link"
              onClick={() => setIsNoticeBoardOpen(true)}
              className="flex items-center gap-1 text-amber-300 hover:text-amber-200 transition-colors font-semibold cursor-pointer text-[11px]"
              title="Store Announcements & Notices"
            >
              <Megaphone className="w-3.5 h-3.5" />
              <span>Notice Board</span>
              {activeNotices.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-neutral-950 text-[10px] font-black">
                  {activeNotices.length}
                </span>
              )}
            </button>
            <span className="text-emerald-700">|</span>
            <button
              id="btn-admin-portal-link"
              onClick={() => setIsAdminOpen(true)}
              className="flex items-center gap-1 text-emerald-200 hover:text-white transition-colors underline decoration-emerald-500/60 shrink-0 font-semibold cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Admin Portal</span>
            </button>
          </div>
        </div>

        {/* Main Branding Bar */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-3">
          {/* Brand Identity */}
          <div
            id="brand-logo-container"
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-2.5 cursor-pointer select-none group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-800 to-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-700/20 group-hover:scale-105 transition-transform duration-200">
              <Store className="w-5 h-5 text-emerald-50" />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="font-extrabold text-xl tracking-tight text-neutral-900 font-['Outfit',sans-serif]">
                  MADINA<span className="text-emerald-600">MART</span>
                </span>
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              </div>
              <p className="text-[10px] uppercase font-bold tracking-widest text-emerald-700 -mt-0.5">
                Your Local Shopping Store
              </p>
            </div>
          </div>

          {/* Delivery Location Selector */}
          <div
            id="delivery-location-btn"
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-50 border border-neutral-200/80 max-w-xs"
          >
            {customerLocation ? (
              <div
                onClick={() => setIsLocationModalOpen(true)}
                className="flex items-center gap-2 cursor-pointer text-left text-xs leading-tight truncate hover:opacity-90"
              >
                <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                <div className="truncate">
                  <div className="text-neutral-500 text-[10px] font-medium">Deliver to</div>
                  <div className="font-bold text-neutral-800 flex items-center gap-1 truncate" title={customerLocation.formattedAddress}>
                    <span className="truncate">{customerLocation.locality || customerLocation.formattedAddress}</span>
                    <ChevronDown className="w-3 h-3 text-neutral-400 shrink-0" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-500 shrink-0" />
                <div className="text-left text-xs leading-tight">
                  <div className="text-amber-800 font-bold text-[11px]">📍 Location not shared</div>
                </div>
                <button
                  id="btn-desktop-share-location"
                  onClick={handleLiveLocationClick}
                  disabled={isLocating}
                  className="ml-1 px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-md text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-xs shrink-0"
                >
                  {isLocating ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Navigation className="w-3 h-3" />
                  )}
                  <span>{isLocating ? 'Locating...' : 'Share Live Location'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Desktop Search Trigger */}
          <div className="hidden sm:flex flex-1 max-w-md mx-2">
            <button
              id="desktop-search-trigger"
              onClick={() => setIsSearchOpen(true)}
              className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-neutral-100/90 hover:bg-neutral-100 border border-neutral-200 text-neutral-500 text-xs transition-all shadow-inner"
            >
              <span className="flex items-center gap-2">
                <Search className="w-4 h-4 text-emerald-600" />
                <span>Search groceries, electronics, fashion, hair oils...</span>
              </span>
              <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-white rounded border border-neutral-200 text-neutral-400">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Mobile Search Button */}
            <button
              id="mobile-search-btn"
              onClick={() => setIsSearchOpen(true)}
              className="sm:hidden p-2 text-neutral-700 hover:text-emerald-700 hover:bg-neutral-100 rounded-lg transition-colors"
              aria-label="Search items"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Wishlist Button */}
            <button
              id="nav-wishlist-btn"
              onClick={() => setActiveTab('profile')}
              className="relative p-2 text-neutral-700 hover:text-emerald-700 hover:bg-neutral-100 rounded-lg transition-colors"
              aria-label="Wishlist"
              title="Saved Items"
            >
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Cart Button */}
            <button
              id="nav-cart-btn"
              onClick={() => setActiveTab('cart')}
              className="relative flex items-center gap-1.5 px-2.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl font-bold text-xs border border-emerald-200/80 transition-colors"
              aria-label="View Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5 text-emerald-700" />
              <span className="hidden sm:inline">Cart</span>
              {cartTotalCount > 0 && (
                <span className="bg-emerald-700 text-white px-1.5 py-0.5 rounded-full text-[11px] font-bold min-w-[18px] text-center leading-none">
                  {cartTotalCount}
                </span>
              )}
            </button>

            {/* User Account / Login Button */}
            {currentUser ? (
              <button
                id="nav-profile-btn"
                onClick={() => setActiveTab('profile')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl text-xs font-semibold transition-colors shadow-xs cursor-pointer border border-neutral-200"
                aria-label="My Account"
              >
                <UserIcon className="w-3.5 h-3.5 text-emerald-700" />
                <span className="hidden sm:inline">{currentUser.name.split(' ')[0]}</span>
              </button>
            ) : (
              <button
                id="nav-login-btn"
                onClick={() => {
                  setAuthIntent(null);
                  setIsAuthModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                aria-label="Customer Login"
              >
                <UserIcon className="w-3.5 h-3.5 text-emerald-200" />
                <span>Log In</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Location Sub-bar */}
        <div
          id="mobile-location-subbar"
          className="md:hidden flex items-center justify-between px-3 py-1.5 bg-emerald-50/70 border-t border-emerald-100 text-xs text-neutral-700"
        >
          {customerLocation ? (
            <div
              onClick={() => setIsLocationModalOpen(true)}
              className="flex items-center justify-between w-full cursor-pointer"
            >
              <div className="flex items-center gap-1.5 truncate mr-2">
                <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span className="text-neutral-500 shrink-0">Deliver to:</span>
                <span className="font-semibold text-neutral-900 truncate">
                  {customerLocation.locality || customerLocation.formattedAddress}
                </span>
              </div>
              <span className="text-emerald-700 font-bold text-[11px] underline shrink-0">Change Location</span>
            </div>
          ) : (
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-1.5 truncate">
                <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span className="font-semibold text-neutral-800 truncate">📍 Location not shared</span>
              </div>
              <button
                id="btn-mobile-share-location"
                onClick={handleLiveLocationClick}
                disabled={isLocating}
                className="px-2.5 py-1 bg-emerald-700 text-white rounded-lg font-bold text-[11px] shadow-xs flex items-center gap-1 cursor-pointer shrink-0"
              >
                {isLocating ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Navigation className="w-3 h-3" />
                )}
                <span>{isLocating ? 'Locating...' : 'Share Live Location'}</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Customer Location Modal */}
      {isLocationModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-5 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
                  <MapPin className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-neutral-900 text-base">Delivery Location</h3>
              </div>
              <button
                onClick={() => setIsLocationModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Current Real Location Status */}
            {customerLocation ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl mb-4 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>✓ Current location detected</span>
                </div>
                <p className="text-xs text-neutral-800 font-semibold leading-relaxed">
                  {customerLocation.locality || customerLocation.formattedAddress}
                </p>
                <div className="text-[11px] text-neutral-500 font-mono flex items-center justify-between pt-1 border-t border-emerald-100">
                  <span>GPS: {customerLocation.latitude.toFixed(4)}, {customerLocation.longitude.toFixed(4)}</span>
                  <span>±{customerLocation.accuracy}m</span>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl mb-4">
                <p className="text-xs text-amber-800 font-medium leading-relaxed">
                  📍 Location not shared. Tap below to share real-time device GPS coordinates for doorstep delivery.
                </p>
              </div>
            )}

            {locationError && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 mb-3 leading-relaxed">
                {locationError}
              </div>
            )}

            {/* Live GPS Trigger Button */}
            <button
              type="button"
              onClick={handleLiveLocationClick}
              disabled={isLocating}
              className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer mb-3"
            >
              {isLocating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Navigation className="w-4 h-4 text-emerald-200" />
              )}
              <span>{isLocating ? 'Detecting GPS Location...' : customerLocation ? 'Update Live Location' : '📍 Share Live Location'}</span>
            </button>

            {customerLocation && (
              <button
                type="button"
                onClick={() => {
                  clearCustomerLocation();
                  setIsLocationModalOpen(false);
                }}
                className="w-full py-1.5 text-neutral-500 hover:text-neutral-700 text-xs font-medium underline mb-3 text-center"
              >
                Clear Shared Location
              </button>
            )}

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-neutral-200"></div>
              <span className="flex-shrink mx-2 text-[10px] uppercase font-bold text-neutral-400">or manual pincode</span>
              <div className="flex-grow border-t border-neutral-200"></div>
            </div>

            <form onSubmit={handlePincodeSubmit} className="space-y-3 pt-1">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Postal Pincode</label>
                <input
                  type="text"
                  maxLength={6}
                  value={tempPincode}
                  onChange={e => setTempPincode(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter 6-digit Pincode"
                  className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-semibold tracking-wider text-center"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsLocationModalOpen(false)}
                  className="flex-1 py-2 rounded-xl border border-neutral-300 text-neutral-700 font-semibold text-xs hover:bg-neutral-50 cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-neutral-900 text-white font-semibold text-xs hover:bg-neutral-800 shadow-sm cursor-pointer"
                >
                  Apply
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
