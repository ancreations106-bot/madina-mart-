import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Address } from '../../types';
import {
  X,
  MapPin,
  Plus,
  Check,
  Truck,
  ShieldCheck,
  Banknote,
  ArrowRight,
  Clock,
  Phone,
  User,
  Home,
  Briefcase,
  Navigation,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  RotateCw
} from 'lucide-react';

export const CheckoutScreen: React.FC = () => {
  const {
    isCheckoutOpen,
    setIsCheckoutOpen,
    currentUser,
    setIsAuthModalOpen,
    setAuthIntent,
    cart,
    products,
    cartSubtotal,
    cartTotalDiscount,
    cartPlatformFee,
    cartDeliveryFee,
    cartFinalTotal,
    addAddress,
    placeOrder,
    settings,
    showToast,
    customerLocation,
    isLocating,
    locationStatus: storeLocationStatus,
    locationError: storeLocationError,
    requestCustomerLiveLocation,
    clearCustomerLocation,
    selectedDeliveryPincode
  } = useStore();

  const savedAddresses = currentUser?.savedAddresses || [];
  const defaultAddr = savedAddresses.find(a => a.isDefault) || savedAddresses[0];

  const [selectedAddressId, setSelectedAddressId] = useState<string>(defaultAddr?.id || 'manual');
  const [showNewAddressForm, setShowNewAddressForm] = useState(savedAddresses.length === 0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Customer & Delivery Address Form State
  const [customerName, setCustomerName] = useState(defaultAddr?.name || currentUser?.name || '');
  const [customerMobile, setCustomerMobile] = useState(defaultAddr?.mobile || currentUser?.mobile || '');
  const [houseFlat, setHouseFlat] = useState(defaultAddr?.houseFlat || '');
  const [streetArea, setStreetArea] = useState(defaultAddr?.streetArea || '');
  const [city, setCity] = useState(defaultAddr?.city || customerLocation?.locality || '');
  const [state, setState] = useState(defaultAddr?.state || '');
  const [pincode, setPincode] = useState(defaultAddr?.pincode || selectedDeliveryPincode || '');
  const [landmark, setLandmark] = useState(defaultAddr?.landmark || '');
  const [tag, setTag] = useState<'Home' | 'Work' | 'Other'>((defaultAddr?.tag as any) || 'Home');

  // Keep customer name & mobile in sync with logged in user
  React.useEffect(() => {
    if (currentUser) {
      if (!customerName) setCustomerName(currentUser.name);
      if (!customerMobile) setCustomerMobile(currentUser.mobile);
    }
  }, [currentUser]);

  // Live Location State (Real Geolocation API)
  const [latitude, setLatitude] = useState<number | null>(
    defaultAddr?.latitude ?? customerLocation?.latitude ?? null
  );
  const [longitude, setLongitude] = useState<number | null>(
    defaultAddr?.longitude ?? customerLocation?.longitude ?? null
  );
  const [locationAccuracy, setLocationAccuracy] = useState<number | null>(
    defaultAddr?.locationAccuracy ?? customerLocation?.accuracy ?? null
  );
  const [locationAddress, setLocationAddress] = useState<string>(
    defaultAddr?.locationAddress ?? customerLocation?.locality ?? customerLocation?.formattedAddress ?? ''
  );
  const [localLocationStatus, setLocalLocationStatus] = useState<'idle' | 'requesting' | 'captured' | 'denied' | 'unavailable'>(
    (defaultAddr?.latitude && defaultAddr?.longitude) || (customerLocation?.latitude && customerLocation?.longitude) ? 'captured' : 'idle'
  );
  const [locationError, setLocationError] = useState<string>('');

  // Sync if customerLocation changes in StoreContext
  React.useEffect(() => {
    if (customerLocation && !latitude && !longitude) {
      setLatitude(customerLocation.latitude);
      setLongitude(customerLocation.longitude);
      setLocationAccuracy(customerLocation.accuracy);
      setLocationAddress(customerLocation.locality || customerLocation.formattedAddress);
      setLocalLocationStatus('captured');
      if (!city && customerLocation.locality) {
        setCity(customerLocation.locality);
      }
    }
  }, [customerLocation]);

  if (!isCheckoutOpen) return null;

  const activeCartItems = cart.filter(i => !i.savedForLater);

  // Real Geolocation API trigger
  const handleShareLiveLocation = async () => {
    setLocalLocationStatus('requesting');
    setLocationError('');

    const res = await requestCustomerLiveLocation();
    if (res.success && res.location) {
      setLatitude(res.location.latitude);
      setLongitude(res.location.longitude);
      setLocationAccuracy(res.location.accuracy);
      const addr = res.location.locality || res.location.formattedAddress;
      setLocationAddress(addr);
      setLocalLocationStatus('captured');

      if (!city && res.location.locality) {
        setCity(res.location.locality);
      }
      if (!streetArea && res.location.formattedAddress) {
        setStreetArea(res.location.formattedAddress);
      }
    } else {
      const errMessage = res.error || 'Failed to detect device location';
      setLocationError(errMessage);
      setLocalLocationStatus(errMessage.toLowerCase().includes('denied') ? 'denied' : 'unavailable');
    }
  };

  const handleClearLocation = () => {
    setLatitude(null);
    setLongitude(null);
    setLocationAccuracy(null);
    setLocationAddress('');
    setLocalLocationStatus('idle');
    setLocationError('');
    clearCustomerLocation();
  };

  const handleSelectSavedAddress = (addr: Address) => {
    setSelectedAddressId(addr.id);
    setShowNewAddressForm(false);
    setCustomerName(addr.name);
    setCustomerMobile(addr.mobile);
    setHouseFlat(addr.houseFlat);
    setStreetArea(addr.streetArea);
    setCity(addr.city);
    setState(addr.state);
    setPincode(addr.pincode);
    setLandmark(addr.landmark || '');
    setTag(addr.tag);
    if (addr.latitude && addr.longitude) {
      setLatitude(addr.latitude);
      setLongitude(addr.longitude);
      setLocationAccuracy(addr.locationAccuracy || null);
      setLocationAddress(addr.locationAddress || '');
      setLocalLocationStatus('captured');
    }
  };

  const handlePlaceOrder = async () => {
    if (!currentUser) {
      showToast('Please log in or create an account to place your order', 'warning');
      setAuthIntent('checkout');
      setIsAuthModalOpen(true);
      return;
    }

    // Validate recipient details
    if (!customerName.trim()) {
      showToast('Please enter customer name', 'warning');
      return;
    }
    const cleanMobile = customerMobile.replace(/\D/g, '');
    if (!/^[6-9]\d{9}$/.test(cleanMobile)) {
      showToast('Please enter a valid 10-digit Indian contact number (starting with 6-9)', 'warning');
      return;
    }
    if (!houseFlat.trim() || !streetArea.trim() || !city.trim() || pincode.trim().length !== 6) {
      showToast('Please complete your full delivery address (House/Flat, Street/Colony, City, and 6-digit Pincode)', 'warning');
      return;
    }
    if (!landmark.trim()) {
      showToast('Please enter a nearby landmark for easy delivery', 'warning');
      return;
    }

    const addressToUse: Address = {
      id: selectedAddressId !== 'manual' ? selectedAddressId : 'addr-' + Date.now(),
      name: customerName.trim(),
      mobile: cleanMobile,
      houseFlat: houseFlat.trim(),
      streetArea: streetArea.trim(),
      city: city.trim(),
      state: state.trim() || 'Local Area',
      pincode: pincode.trim(),
      landmark: landmark.trim(),
      tag,
      isDefault: true,
      latitude: latitude ?? undefined,
      longitude: longitude ?? undefined,
      locationAccuracy: locationAccuracy ?? undefined,
      locationShared: !!(latitude && longitude),
      locationAddress: locationAddress || undefined
    };

    setIsSubmitting(true);
    try {
      // Save address locally so returning customers don't need to re-type
      addAddress(addressToUse);
      await placeOrder(addressToUse);
      setIsCheckoutOpen(false);
    } catch (err: any) {
      showToast(err.message || 'Could not place order', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center sm:p-4 overflow-y-auto">
      <div
        id="checkout-modal"
        className="bg-white w-full h-full sm:h-auto sm:max-h-[92vh] sm:max-w-xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="sticky top-0 z-20 bg-white border-b border-neutral-200 px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-neutral-900 font-['Outfit',sans-serif]">
                Quick Delivery Checkout
              </h2>
              <p className="text-[11px] text-neutral-500 font-medium">
                {currentUser
                  ? `Cash On Delivery • Logged in as ${currentUser.name}`
                  : 'Customer Account Required'}
              </p>
            </div>
          </div>
          <button
            id="btn-close-checkout"
            onClick={() => setIsCheckoutOpen(false)}
            className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-600 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        {!currentUser ? (
          <div className="flex-1 p-6 sm:p-10 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 flex items-center justify-center text-emerald-800 shadow-inner">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div className="max-w-md space-y-1.5">
              <h3 className="text-lg font-bold text-neutral-900 font-['Outfit',sans-serif]">
                Customer Account Required
              </h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Madina Mart requires every customer to create an account or sign in before placing an order.
                This ensures your orders, delivery addresses, and live GPS location remain completely confidential and isolated to you.
              </p>
            </div>

            <div className="w-full max-w-sm pt-2 space-y-2.5">
              <button
                id="btn-checkout-login-trigger"
                type="button"
                onClick={() => {
                  setAuthIntent('checkout');
                  setIsAuthModalOpen(true);
                }}
                className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm rounded-2xl shadow-md shadow-emerald-700/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>Log In or Create Account</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <p className="text-[11px] text-neutral-400">
                Registration requires only your name, mobile number, and password.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* 1. Recipient Contact Details */}
          <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-200/90">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-700 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-emerald-700" />
                <span>Recipient Contact Information</span>
              </h3>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                Required for Delivery
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                  Customer Name <span className="text-rose-500">*</span>
                </label>
                <input
                  id="checkout-customer-name"
                  type="text"
                  required
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  placeholder="Enter full name"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-neutral-300 focus:outline-none focus:border-emerald-600 font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                  Contact Number <span className="text-rose-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-xs font-bold text-neutral-500">+91</span>
                  <input
                    id="checkout-customer-mobile"
                    type="tel"
                    required
                    maxLength={10}
                    value={customerMobile}
                    onChange={e => setCustomerMobile(e.target.value.replace(/\D/g, ''))}
                    placeholder="10-digit mobile number"
                    className="w-full pl-11 pr-3 py-2 text-xs rounded-xl bg-white border border-neutral-300 focus:outline-none focus:border-emerald-600 font-mono font-medium"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 2. Live GPS Location (Real Geolocation API) */}
          <div className="bg-gradient-to-br from-emerald-50/90 to-teal-50/50 rounded-2xl p-4 border border-emerald-200 shadow-xs">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-700 text-white flex items-center justify-center">
                  <Navigation className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-neutral-900">Share Live Location (GPS)</h4>
                  <p className="text-[11px] text-neutral-500">Helps delivery riders locate your exact doorstep</p>
                </div>
              </div>

              {localLocationStatus === 'captured' && latitude && longitude ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Live GPS Attached
                </span>
              ) : (
                <span className="text-[10px] font-bold text-neutral-500 bg-white px-2 py-0.5 rounded-full border border-neutral-200">
                  Optional
                </span>
              )}
            </div>

            <p className="text-[11px] text-neutral-600 leading-relaxed mb-3">
              Device GPS helps our delivery partner find your address instantly without phone calls.
            </p>

            {localLocationStatus === 'captured' && latitude && longitude ? (
              <div className="bg-white p-3.5 rounded-xl border border-emerald-300 space-y-2.5 shadow-xs">
                {/* Detected Locality */}
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">
                      Deliver to (Detected Locality)
                    </div>
                    <div className="text-xs font-bold text-neutral-900">
                      {locationAddress || `${latitude.toFixed(4)}°N, ${longitude.toFixed(4)}°E`}
                    </div>
                  </div>
                </div>

                {/* Coordinates & Accuracy */}
                <div className="p-2 bg-neutral-50 rounded-lg text-xs font-mono flex items-center justify-between text-neutral-700">
                  <div className="flex items-center gap-1.5 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>
                      {latitude.toFixed(5)}, {longitude.toFixed(5)}
                    </span>
                  </div>
                  {locationAccuracy && (
                    <span className="text-[11px] text-neutral-500 font-sans">
                      Accuracy: ±{locationAccuracy}m
                    </span>
                  )}
                </div>

                {/* Actions: Maps Link, Recalibrate, Clear */}
                <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-neutral-100">
                  <a
                    href={`https://www.google.com/maps?q=${latitude},${longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>Open on Google Maps</span>
                  </a>
                  <button
                    type="button"
                    onClick={handleShareLiveLocation}
                    disabled={localLocationStatus === 'requesting' || isLocating}
                    className="text-[11px] font-semibold text-neutral-700 hover:text-neutral-900 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-neutral-100 cursor-pointer"
                  >
                    <RotateCw className={`w-3 h-3 ${localLocationStatus === 'requesting' || isLocating ? 'animate-spin' : ''}`} />
                    <span>Update Location</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleClearLocation}
                    className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 ml-auto px-2 py-1 rounded-lg hover:bg-rose-50 cursor-pointer"
                  >
                    Remove GPS
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2 mb-2 p-2 bg-amber-50/80 border border-amber-200/80 rounded-xl">
                  <MapPin className="w-4 h-4 text-amber-600 shrink-0" />
                  <span className="text-xs font-semibold text-amber-900">
                    📍 Location not shared
                  </span>
                </div>

                <button
                  id="btn-share-live-location"
                  type="button"
                  onClick={handleShareLiveLocation}
                  disabled={localLocationStatus === 'requesting' || isLocating}
                  className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 active:scale-[0.99] text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  {localLocationStatus === 'requesting' || isLocating ? (
                    <>
                      <RotateCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Requesting Device GPS Permission...</span>
                    </>
                  ) : (
                    <>
                      <span>📍 Share Live Location</span>
                    </>
                  )}
                </button>

                {localLocationStatus === 'denied' && (
                  <div className="mt-2 p-2.5 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-800 flex items-start gap-1.5 leading-relaxed">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>Location access was denied on your browser. Live location not shared. Please enter your manual delivery address below.</span>
                  </div>
                )}
                {localLocationStatus === 'unavailable' && (
                  <div className="mt-2 p-2.5 bg-neutral-100 rounded-lg text-xs text-neutral-600 flex items-start gap-1.5 leading-relaxed">
                    <AlertCircle className="w-4 h-4 text-neutral-500 shrink-0 mt-0.5" />
                    <span>{locationError || 'Live location not shared. Please enter your complete address below.'}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 3. Delivery Address Form */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-700 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                <span>Full Delivery Address</span>
              </h3>
              {savedAddresses.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowNewAddressForm(!showNewAddressForm)}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                >
                  {showNewAddressForm ? 'Select Saved Address' : '+ New Address'}
                </button>
              )}
            </div>

            {/* Saved addresses selector if available and not in new form */}
            {!showNewAddressForm && savedAddresses.length > 0 && (
              <div className="space-y-2 mb-3">
                {savedAddresses.map(addr => {
                  const isSelected = selectedAddressId === addr.id;
                  return (
                    <div
                      key={addr.id}
                      onClick={() => handleSelectSavedAddress(addr)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                        isSelected
                          ? 'bg-emerald-50/70 border-emerald-600 ring-1 ring-emerald-600/30'
                          : 'bg-white hover:bg-neutral-50 border-neutral-200'
                      }`}
                    >
                      <input
                        type="radio"
                        name="saved-delivery-addr"
                        checked={isSelected}
                        onChange={() => handleSelectSavedAddress(addr)}
                        className="mt-1 accent-emerald-700 w-4 h-4 cursor-pointer"
                      />
                      <div className="flex-1 text-xs">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-bold text-neutral-900">{addr.name}</span>
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-neutral-100 text-neutral-600">
                            {addr.tag}
                          </span>
                        </div>
                        <p className="text-neutral-600 font-medium">
                          {addr.houseFlat}, {addr.streetArea}
                          {addr.landmark ? `, Landmark: ${addr.landmark}` : ''}
                        </p>
                        <p className="text-neutral-500 font-semibold">
                          {addr.city}, {addr.state} - {addr.pincode}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Address Input Fields */}
            {(showNewAddressForm || savedAddresses.length === 0) && (
              <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200 space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                    House / Flat / Building / Floor <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="checkout-addr-house"
                    type="text"
                    required
                    value={houseFlat}
                    onChange={e => setHouseFlat(e.target.value)}
                    placeholder="e.g. Flat 402, Al-Madina Residency"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-neutral-300 focus:outline-none focus:border-emerald-600 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                    Street / Colony / Area <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="checkout-addr-street"
                    type="text"
                    required
                    value={streetArea}
                    onChange={e => setStreetArea(e.target.value)}
                    placeholder="e.g. Near Jama Masjid, Civil Lines"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-neutral-300 focus:outline-none focus:border-emerald-600 font-medium"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                      Pincode <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="checkout-addr-pincode"
                      type="text"
                      required
                      maxLength={6}
                      value={pincode}
                      onChange={e => setPincode(e.target.value.replace(/\D/g, ''))}
                      placeholder="e.g. 522265"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-neutral-300 focus:outline-none focus:border-emerald-600 font-mono font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                      City <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="checkout-addr-city"
                      type="text"
                      required
                      value={city}
                      onChange={e => setCity(e.target.value)}
                      placeholder="e.g. Repalle"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-neutral-300 focus:outline-none focus:border-emerald-600 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-700 mb-1">State</label>
                    <input
                      id="checkout-addr-state"
                      type="text"
                      required
                      value={state}
                      onChange={e => setState(e.target.value)}
                      placeholder="e.g. Andhra Pradesh"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-neutral-300 focus:outline-none focus:border-emerald-600 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                    Landmark <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="checkout-addr-landmark"
                    type="text"
                    required
                    value={landmark}
                    onChange={e => setLandmark(e.target.value)}
                    placeholder="e.g. Opposite City Hospital / Near Water Tank"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-neutral-300 focus:outline-none focus:border-emerald-600 font-medium"
                  />
                </div>

                {/* Address Tag */}
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[11px] font-bold text-neutral-700">Tag:</span>
                  {(['Home', 'Work', 'Other'] as const).map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTag(t)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                        tag === t ? 'bg-emerald-700 text-white' : 'bg-white text-neutral-600 border border-neutral-300'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 4. Payment Method: Strictly Cash On Delivery */}
          <div className="bg-emerald-50/70 rounded-2xl p-4 border border-emerald-300">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-2">
                <Banknote className="w-4 h-4 text-emerald-700" />
                <span>Payment Method</span>
              </h3>
              <span className="bg-emerald-200 text-emerald-900 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                COD Guaranteed
              </span>
            </div>

            <div className="flex items-start gap-3 bg-white p-3 rounded-xl border border-emerald-200">
              <input type="radio" checked readOnly className="mt-1 accent-emerald-700 w-4 h-4 cursor-pointer" />
              <div className="text-xs">
                <div className="font-bold text-neutral-900">Cash On Delivery (COD)</div>
                <p className="text-neutral-500 mt-0.5 leading-relaxed">
                  Pay securely with cash or scan the delivery rider's UPI QR code (GPay, PhonePe, Paytm) upon arrival.
                </p>
              </div>
            </div>
          </div>

          {/* 5. Order Fee Breakdown */}
          <div className="border border-neutral-200 rounded-2xl p-4 bg-white">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2.5">
              Order Bill Details ({activeCartItems.length} items)
            </h3>

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-neutral-600">
                <span>Product Subtotal</span>
                <span className="font-semibold text-neutral-900">₹{cartSubtotal}</span>
              </div>

              <div className="flex justify-between text-neutral-600">
                <span>Platform Fee</span>
                <span className="font-semibold text-neutral-900">₹{cartPlatformFee}</span>
              </div>

              <div className="flex justify-between text-neutral-600">
                <span>Delivery Fee</span>
                <span>
                  {cartDeliveryFee === 0 ? (
                    <span className="text-emerald-700 font-bold uppercase text-[11px]">FREE</span>
                  ) : (
                    `₹${cartDeliveryFee}`
                  )}
                </span>
              </div>

              {cartTotalDiscount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Total Discount</span>
                  <span>- ₹{cartTotalDiscount}</span>
                </div>
              )}

              <div className="pt-2.5 mt-1 border-t border-neutral-200 flex justify-between items-baseline font-bold text-neutral-900">
                <span>Final Payable Amount</span>
                <span className="text-base font-black font-['Outfit',sans-serif] text-emerald-900">
                  ₹{cartFinalTotal}
                </span>
              </div>
            </div>
          </div>
        </div>
        )}

        {/* Action Button */}
        {currentUser && (
          <div className="sticky bottom-0 z-20 bg-white border-t border-neutral-200 p-4 flex items-center justify-between gap-4">
            <div>
              <span className="text-[10px] text-neutral-400 block uppercase font-bold">Final Payable</span>
              <span className="text-xl font-black text-neutral-950 font-['Outfit',sans-serif]">
                ₹{cartFinalTotal}
              </span>
            </div>

            <button
              id="btn-confirm-order-cod"
              onClick={handlePlaceOrder}
              disabled={isSubmitting || activeCartItems.length === 0}
              className="flex-1 max-w-xs py-3.5 bg-emerald-700 hover:bg-emerald-800 active:scale-[0.99] text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-lg shadow-emerald-700/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Placing Order...</span>
              ) : (
                <>
                  <span>Place Order (COD)</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
