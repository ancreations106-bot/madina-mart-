import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Heart,
  Package,
  LogOut,
  Shield,
  Plus,
  Trash2,
  Check,
  Edit2,
  HelpCircle,
  Clock,
  Sparkles,
  ShoppingBag
} from 'lucide-react';
import { ProductCard } from '../common/ProductCard';

export const ProfileScreen: React.FC = () => {
  const {
    currentUser,
    logoutCustomer,
    updateCustomerProfile,
    deleteAddress,
    addAddress,
    wishlist,
    isInWishlist,
    products,
    setIsAuthModalOpen,
    setAuthIntent,
    setActiveTab,
    setIsAdminOpen,
    customerOrders,
    settings,
    customerLocation,
    showToast
  } = useStore();

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');

  // Add Address Modal state
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addrHouse, setAddrHouse] = useState('');
  const [addrStreet, setAddrStreet] = useState('');
  const [addrCity, setAddrCity] = useState(customerLocation?.locality || '');
  const [addrPincode, setAddrPincode] = useState('');
  const [addrTag, setAddrTag] = useState<'Home' | 'Work' | 'Other'>('Home');

  if (!currentUser) {
    return (
      <div id="profile-screen-unauth" className="max-w-md mx-auto px-4 py-16 pb-28 text-center">
        <div className="bg-white rounded-3xl border border-neutral-200 p-8 shadow-sm space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-emerald-100 flex items-center justify-center text-emerald-800 mx-auto shadow-inner">
            <User className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-neutral-900 font-['Outfit',sans-serif]">
              Customer Account Required
            </h2>
            <p className="text-xs text-neutral-600 mt-1.5 leading-relaxed">
              Sign in or create an account to view your private profile, saved delivery addresses, orders, and personal wishlist.
            </p>
          </div>
          <button
            id="btn-profile-login-trigger"
            onClick={() => {
              setAuthIntent('profile');
              setIsAuthModalOpen(true);
            }}
            className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Log In or Create Account</span>
            <Sparkles className="w-4 h-4 text-amber-300" />
          </button>
        </div>
      </div>
    );
  }

  const savedAddresses = currentUser?.savedAddresses || [];
  const displayName = currentUser?.name || 'Customer';
  const displayMobile = currentUser?.mobile || '';

  const wishlistProducts = products.filter(p => isInWishlist(p.id));

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Name cannot be empty', 'warning');
      return;
    }
    updateCustomerProfile({ name: name.trim(), email: email.trim() || undefined });
    setIsEditingProfile(false);
  };

  const handleCreateAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addrHouse.trim() || !addrStreet.trim() || addrPincode.trim().length !== 6) {
      showToast('Please enter full address and valid 6-digit pincode', 'warning');
      return;
    }

    addAddress({
      name: displayName,
      mobile: displayMobile,
      houseFlat: addrHouse.trim(),
      streetArea: addrStreet.trim(),
      city: addrCity.trim(),
      state: 'Madhya Pradesh',
      pincode: addrPincode.trim(),
      tag: addrTag,
      isDefault: savedAddresses.length === 0
    });

    setShowAddressForm(false);
    setAddrHouse('');
    setAddrStreet('');
  };

  return (
    <div id="profile-screen" className="max-w-4xl mx-auto px-3 sm:px-6 py-4 pb-28 space-y-6">
      {/* Profile Header Card */}
      <div className="bg-gradient-to-r from-emerald-900 to-emerald-800 rounded-3xl p-5 sm:p-6 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/20 text-2xl font-black font-['Outfit',sans-serif]">
              {(displayName.charAt(0) || 'C').toUpperCase()}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold font-['Outfit',sans-serif]">{displayName}</h1>
                <span className="bg-amber-400 text-neutral-900 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                  Verified Customer
                </span>
                <span className="bg-emerald-700/80 text-emerald-100 text-[10px] font-mono px-2 py-0.5 rounded-full border border-emerald-500/30">
                  ID: {currentUser.id}
                </span>
              </div>
              {displayMobile ? (
                <p className="text-xs text-emerald-100 flex items-center gap-1.5 mt-0.5">
                  <Phone className="w-3.5 h-3.5" />
                  <span>+91 {displayMobile}</span>
                </p>
              ) : (
                <p className="text-xs text-emerald-100 flex items-center gap-1.5 mt-0.5">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Cash on Delivery • {settings.operatingCity}</span>
                </p>
              )}
              {currentUser?.email && (
                <p className="text-xs text-emerald-200 flex items-center gap-1.5 mt-0.5">
                  <Mail className="w-3.5 h-3.5" />
                  <span>{currentUser.email}</span>
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setName(displayName);
                setEmail(currentUser?.email || '');
                setIsEditingProfile(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors border border-white/20 flex items-center gap-1.5 cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit Details</span>
            </button>
            {currentUser && (
              <button
                onClick={logoutCustomer}
                className="px-3 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 hover:text-white text-xs font-bold transition-colors border border-rose-400/30 flex items-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-2 mt-5 pt-4 border-t border-white/10 text-center text-xs">
          <div
            onClick={() => setActiveTab('orders')}
            className="cursor-pointer hover:bg-white/5 p-1 rounded-xl transition-colors"
          >
            <div className="text-lg font-black font-['Outfit',sans-serif] text-amber-300">
              {customerOrders.length}
            </div>
            <div className="text-[11px] text-emerald-200">Total Orders</div>
          </div>
          <div className="p-1">
            <div className="text-lg font-black font-['Outfit',sans-serif] text-amber-300">
              {savedAddresses.length}
            </div>
            <div className="text-[11px] text-emerald-200">Saved Addresses</div>
          </div>
          <div className="p-1">
            <div className="text-lg font-black font-['Outfit',sans-serif] text-amber-300">
              {wishlist.length}
            </div>
            <div className="text-[11px] text-emerald-200">Wishlist Items</div>
          </div>
        </div>
      </div>

      {/* Edit Profile Form Modal */}
      {isEditingProfile && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm p-5 shadow-2xl animate-in zoom-in-95">
            <h3 className="font-bold text-base text-neutral-900 mb-3">Update Profile</h3>
            <form onSubmit={handleSaveProfile} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-neutral-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 focus:outline-none focus:border-emerald-600"
                />
              </div>
              <div>
                <label className="block font-bold text-neutral-700 mb-1">Email (Optional)</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 focus:outline-none focus:border-emerald-600"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="flex-1 py-2.5 rounded-xl border border-neutral-300 text-neutral-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-700 text-white font-bold hover:bg-emerald-800"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Saved Addresses Section */}
      <div className="bg-white rounded-3xl p-5 border border-neutral-200 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-emerald-700" />
            <h2 className="text-base font-bold text-neutral-900 font-['Outfit',sans-serif]">
              Saved Delivery Addresses
            </h2>
          </div>
          <button
            onClick={() => setShowAddressForm(true)}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            <span>Add New</span>
          </button>
        </div>

        {/* List */}
        {savedAddresses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {savedAddresses.map(addr => (
              <div
                key={addr.id}
                className="p-3.5 rounded-2xl border border-neutral-200 bg-neutral-50/50 flex flex-col justify-between"
              >
                <div className="text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-neutral-900">{addr.tag}</span>
                    {addr.isDefault && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                        Default
                      </span>
                    )}
                  </div>
                  <div className="text-neutral-700 font-medium">
                    {addr.houseFlat}, {addr.streetArea}
                  </div>
                  <div className="text-neutral-500 font-mono">
                    {addr.city}, {addr.pincode}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 mt-2 border-t border-neutral-200/60">
                  <button
                    onClick={() => deleteAddress(addr.id)}
                    className="text-neutral-400 hover:text-rose-600 p-1 text-xs cursor-pointer"
                    title="Delete address"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 border border-dashed border-neutral-300 rounded-2xl p-4">
            <p className="text-xs text-neutral-500 mb-2">No saved delivery addresses yet.</p>
            <button
              onClick={() => setShowAddressForm(true)}
              className="text-xs font-bold text-emerald-700 hover:underline inline-flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Your Delivery Address</span>
            </button>
          </div>
        )}

        {/* Inline Add Address Modal */}
        {showAddressForm && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-sm p-5 shadow-2xl animate-in zoom-in-95">
              <h3 className="font-bold text-sm text-neutral-900 mb-3">Add New Address</h3>
              <form onSubmit={handleCreateAddress} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">House / Flat / Building</label>
                  <input
                    type="text"
                    required
                    value={addrHouse}
                    onChange={e => setAddrHouse(e.target.value)}
                    placeholder="Flat 101, Blue Sky"
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 focus:outline-none focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Street / Area</label>
                  <input
                    type="text"
                    required
                    value={addrStreet}
                    onChange={e => setAddrStreet(e.target.value)}
                    placeholder="Near Badi Masjid, Station Road"
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 focus:outline-none focus:border-emerald-600"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-neutral-700 mb-1">City</label>
                    <input
                      type="text"
                      required
                      value={addrCity}
                      onChange={e => setAddrCity(e.target.value)}
                      placeholder="e.g. Repalle"
                      className="w-full px-3 py-2 rounded-xl border border-neutral-300 focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-neutral-700 mb-1">Pincode</label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={addrPincode}
                      onChange={e => setAddrPincode(e.target.value.replace(/\D/g, ''))}
                      placeholder="e.g. 522265"
                      className="w-full px-3 py-2 rounded-xl border border-neutral-300 focus:outline-none focus:border-emerald-600 font-mono"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  {(['Home', 'Work', 'Other'] as const).map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setAddrTag(t)}
                      className={`flex-1 py-1.5 rounded-xl font-bold transition-colors ${
                        addrTag === t ? 'bg-emerald-700 text-white' : 'bg-neutral-100 text-neutral-700'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddressForm(false)}
                    className="flex-1 py-2.5 rounded-xl border border-neutral-300 text-neutral-700 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-emerald-700 text-white font-bold hover:bg-emerald-800"
                  >
                    Save Address
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Wishlist Section */}
      <div className="bg-white rounded-3xl p-5 border border-neutral-200 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-500" />
            <h2 className="text-base font-bold text-neutral-900 font-['Outfit',sans-serif]">
              My Wishlist ({wishlist.length})
            </h2>
          </div>
          {wishlist.length > 0 && (
            <button
              onClick={() => setActiveTab('categories')}
              className="text-xs font-bold text-emerald-700 hover:underline"
            >
              Add More
            </button>
          )}
        </div>

        {wishlistProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {wishlistProducts.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-xs text-neutral-400">
            Your wishlist is empty. Tap the heart icon on any product to save it for later.
          </div>
        )}
      </div>

      {/* Store Information & Customer Support */}
      <div className="bg-neutral-50 rounded-3xl p-5 border border-neutral-200 space-y-3 text-xs">
        <div className="flex items-center gap-2 font-bold text-neutral-900">
          <HelpCircle className="w-4 h-4 text-emerald-700" />
          <span>Local Store Support & Contact</span>
        </div>
        <p className="text-neutral-600 leading-relaxed">
          Need help with your grocery delivery or product return? Our local support team is ready to help via WhatsApp or phone call.
        </p>
        <div className="flex flex-wrap gap-4 text-neutral-800 font-semibold pt-1">
          <div>📞 Store Support: <span className="font-mono text-emerald-800">{settings.contactPhone}</span></div>
          <div>💬 WhatsApp: <span className="font-mono text-emerald-800">{settings.contactWhatsapp}</span></div>
          <div>📍 Operating City: <span className="text-neutral-900 font-bold">{settings.operatingCity}</span></div>
        </div>

        <div className="pt-3 border-t border-neutral-200 flex justify-between items-center">
          <span className="text-neutral-400 text-[11px]">Madina Mart v1.0 • Built for Indian Local Shopping</span>
          <button
            onClick={() => setIsAdminOpen(true)}
            className="text-xs font-bold text-neutral-700 hover:text-emerald-800 flex items-center gap-1"
          >
            <Shield className="w-3.5 h-3.5 text-neutral-500" />
            <span>Switch to Admin Panel</span>
          </button>
        </div>
      </div>
    </div>
  );
};
