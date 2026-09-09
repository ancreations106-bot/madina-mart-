import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  User,
  AdminUser,
  Product,
  CartItem,
  WishlistItem,
  Order,
  OrderStatus,
  Address,
  StoreSettings,
  ToastMessage,
  NavigationTab,
  CategoryType,
  OrderItem,
  OrderTimelineEvent,
  CustomerLiveLocation,
  Notice
} from '../types';
import { INITIAL_PRODUCTS, DEFAULT_STORE_SETTINGS } from '../data/sampleProducts';
import { reverseGeocodeCoords } from '../utils/location';
import {
  hashPassword,
  DEFAULT_ADMIN_PASSWORD_HASH,
  ADMIN_HASH_STORAGE_KEY
} from '../utils/security';

interface StoreContextType {
  // User Authentication
  currentUser: User | null;
  registerCustomer: (
    name: string,
    mobile: string,
    password: string,
    email?: string
  ) => Promise<{ success: boolean; error?: string }>;
  loginCustomer: (
    mobile: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  authIntent: 'checkout' | 'orders' | 'profile' | 'cart' | null;
  setAuthIntent: (intent: 'checkout' | 'orders' | 'profile' | 'cart' | null) => void;
  sendOtp: (mobile: string) => Promise<{ success: boolean }>;
  verifyOtpAndLogin: (
    mobile: string,
    otp: string,
    profile?: { name: string; email?: string }
  ) => Promise<{ success: boolean; isNewUser?: boolean; error?: string }>;
  logoutUser: () => void;
  logoutCustomer: () => void;
  updateProfile: (name: string, email?: string) => void;
  updateCustomerProfile: (data: { name: string; email?: string }) => void;
  addAddress: (address: Omit<Address, 'id'>) => Address;
  updateAddress: (address: Address) => void;
  deleteAddress: (addressId: string) => void;
  setDefaultAddress: (addressId: string) => void;

  // Real Customer Live Location (Device GPS)
  customerLocation: CustomerLiveLocation | null;
  isLocating: boolean;
  locationStatus: 'idle' | 'requesting' | 'captured' | 'denied' | 'unavailable' | 'unsupported';
  locationError: string;
  requestCustomerLiveLocation: () => Promise<{ success: boolean; location?: CustomerLiveLocation; error?: string }>;
  clearCustomerLocation: () => void;

  // Admin Authentication
  adminUser: AdminUser | null;
  loginAdmin: (username: string, pin: string) => Promise<boolean>;
  logoutAdmin: () => void;
  changeAdminPassword: (
    currentPassword: string,
    newPassword: string
  ) => Promise<{ success: boolean; message: string }>;
  allOrders: Order[];
  customers: User[];
  adminStats: {
    totalSales: number;
    totalOrders: number;
    deliveredOrders: number;
    pendingOrders: number;
    estimatedTotalProfit: number;
    profitMarginPercentage: number;
    totalProducts: number;
    lowStockProducts: number;
    totalCustomers: number;
  };

  // Products
  products: Product[];
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (productOrId: Product | string, updates?: Partial<Product>) => void;
  deleteProduct: (productId: string) => void;
  toggleStockStatus: (productId: string) => void;

  // Cart
  cart: CartItem[];
  addToCart: (productId: string, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  saveForLater: (productId: string) => void;
  moveToCart: (productId: string) => void;
  cartTotalCount: number;
  cartSubtotal: number;
  cartTotalDiscount: number;
  cartPlatformFee: number;
  cartDeliveryFee: number;
  cartFinalTotal: number;

  // Wishlist
  wishlist: WishlistItem[];
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;

  // Orders
  orders: Order[]; // All orders (Admin)
  customerOrders: Order[]; // Authenticated customer only
  placeOrder: (deliveryAddress: Address) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: OrderStatus, note?: string) => void;
  cancelOrder: (orderId: string, reason: string) => void;
  reorderItems: (order: Order) => void;

  // Store Settings
  settings: StoreSettings;
  updateSettings: (newSettings: Partial<StoreSettings>) => void;

  // Navigation & Modals
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  selectedCategory: CategoryType | null;
  setSelectedCategory: (cat: CategoryType | null) => void;
  selectedSubCategory: string | null;
  setSelectedSubCategory: (sub: string | null) => void;
  selectedProduct: Product | null;
  setSelectedProduct: (prod: Product | null) => void;
  trackingOrderId: string | null;
  setTrackingOrderId: (id: string | null) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  isAdminOpen: boolean;
  setIsAdminOpen: (open: boolean) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  recentPlacedOrder: Order | null;
  setRecentPlacedOrder: (order: Order | null) => void;
  selectedDeliveryPincode: string;
  setSelectedDeliveryPincode: (pincode: string) => void;
  supportModalOpen: boolean;
  setSupportModalOpen: (open: boolean) => void;
  legalModalType: 'privacy' | 'terms' | 'shipping' | 'cancellation' | null;
  setLegalModalType: (type: 'privacy' | 'terms' | 'shipping' | 'cancellation' | null) => void;

  // Notice Board (Admin & Customer)
  notices: Notice[];
  activeNotices: Notice[];
  isNoticeBoardOpen: boolean;
  setIsNoticeBoardOpen: (open: boolean) => void;
  selectedNoticeForView: Notice | null;
  setSelectedNoticeForView: (notice: Notice | null) => void;
  addNotice: (notice: Omit<Notice, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateNotice: (id: string, updates: Partial<Notice>) => void;
  deleteNotice: (id: string) => void;
  toggleNoticeActive: (id: string) => void;

  // Toasts
  toasts: ToastMessage[];
  showToast: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  removeToast: (id: string) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Customer User State - Unauthenticated by default
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('mm_current_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.id === 'usr-demo-001') {
          localStorage.removeItem('mm_current_user');
          return null;
        }
        return parsed;
      }
      return null;
    } catch {
      return null;
    }
  });

  const [allUsers, setAllUsers] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem('mm_customers_db') || localStorage.getItem('mm_all_users');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((u: User) => u.id !== 'usr-demo-001');
        }
      }
      return [];
    } catch {
      return [];
    }
  });

  // 2. Admin User State
  const [adminUser, setAdminUser] = useState<AdminUser | null>(() => {
    try {
      const saved = localStorage.getItem('mm_admin_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // 3. Products Catalog
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('mm_products');
      if (saved) return JSON.parse(saved);
      return INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  // 4. Store Settings
  const [settings, setSettings] = useState<StoreSettings>(() => {
    try {
      const saved = localStorage.getItem('mm_settings');
      if (saved) return JSON.parse(saved);
      return DEFAULT_STORE_SETTINGS;
    } catch {
      return DEFAULT_STORE_SETTINGS;
    }
  });

  // 5. Customer Cart (strictly isolated per user ID)
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const savedUser = localStorage.getItem('mm_current_user');
      const userId = savedUser ? JSON.parse(savedUser).id : 'guest';
      const saved = localStorage.getItem(`mm_cart_${userId}`);
      if (saved) return JSON.parse(saved);
      return [];
    } catch {
      return [];
    }
  });

  // 6. Customer Wishlist (strictly isolated per user ID)
  const [wishlist, setWishlist] = useState<WishlistItem[]>(() => {
    try {
      const savedUser = localStorage.getItem('mm_current_user');
      const userId = savedUser ? JSON.parse(savedUser).id : 'guest';
      const saved = localStorage.getItem(`mm_wishlist_${userId}`);
      if (saved) return JSON.parse(saved);
      return [];
    } catch {
      return [];
    }
  });

  // 7. Orders (Persisted)
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('mm_orders');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.map((o: any) => ({
            ...o,
            contactNumber: o.contactNumber || o.customerMobile || o.mobileNumber || ''
          }));
        }
      }
      // Seed sample archived orders for admin analytics
      const sampleOrders: Order[] = [
        {
          id: 'MM-2026-84910',
          customerId: 'archive-store-seed-01',
          userId: 'archive-store-seed-01',
          customerName: 'Aamir Khan',
          contactNumber: '9876543210',
          mobileNumber: '9876543210',
          customerMobile: '9876543210',
          fullAddress: 'Flat 402, Al-Madina Residency, Main Road, Repalle, Andhra Pradesh - 522265',
          landmark: 'Opposite City Hospital',
          latitude: 16.0234,
          longitude: 80.8521,
          locationAccuracy: 12,
          locationShared: true,
          locationAddress: 'Repalle, Andhra Pradesh',
          items: [
            {
              productId: 'prod-groc-01',
              productName: 'Daawat Rozana Super Basmati Rice (5 kg)',
              productImage: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&auto=format&fit=crop&q=80',
              price: 385,
              costPrice: 290,
              quantity: 1
            },
            {
              productId: 'prod-groc-04',
              productName: 'Fortune Sunlite Refined Sunflower Oil (1 L Pouch)',
              productImage: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800&auto=format&fit=crop&q=80',
              price: 142,
              costPrice: 110,
              quantity: 2
            }
          ],
          subtotal: 669,
          deliveryCharge: 0,
          platformFee: 3,
          deliveryFee: 0,
          discount: 30,
          totalAmount: 642,
          finalTotal: 642,
          finalPayableAmount: 642,
          totalCost: 510,
          paymentMethod: 'Cash on Delivery',
          deliveryAddress: {
            id: 'addr-seed-01',
            name: 'Aamir Khan',
            mobile: '9876543210',
            houseFlat: 'Flat 402, Al-Madina Residency',
            streetArea: 'Main Road',
            city: 'Repalle',
            state: 'Andhra Pradesh',
            pincode: '522265',
            landmark: 'Opposite City Hospital',
            tag: 'Home',
            isDefault: true,
            latitude: 16.0234,
            longitude: 80.8521,
            locationAccuracy: 12,
            locationShared: true,
            locationAddress: 'Repalle, Andhra Pradesh'
          },
          status: 'Out for Delivery',
          orderStatus: 'Out for Delivery',
          locationSharingStatus: 'Live GPS Location Shared',
          orderDate: '08 Sep 2026, 09:15 AM',
          timeline: [
            { status: 'Order Placed', timestamp: 'Today, 09:15 AM', note: 'Order received and verified' },
            { status: 'Order Confirmed', timestamp: 'Today, 09:20 AM', note: 'Confirmed by local store' },
            { status: 'Packed', timestamp: 'Today, 10:05 AM', note: 'Carefully packed with safety seal' },
            { status: 'Shipped', timestamp: 'Today, 10:30 AM', note: 'Handed over to local delivery partner' },
            { status: 'Out for Delivery', timestamp: 'Today, 10:45 AM', note: 'Driver Imran Khan is on the way (+91 98260 11223)' }
          ],
          createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
          estimatedDelivery: 'Today within 45 mins'
        },
        {
          id: 'MM-2026-77241',
          customerId: 'archive-store-seed-02',
          userId: 'archive-store-seed-02',
          customerName: 'Zubair Qureshi',
          contactNumber: '9826199881',
          mobileNumber: '9826199881',
          customerMobile: '9826199881',
          fullAddress: 'Plot 15, Lake View Road, Repalle, Andhra Pradesh - 522265',
          landmark: 'Near Water Tank',
          latitude: null,
          longitude: null,
          locationAccuracy: null,
          locationShared: false,
          locationAddress: '',
          items: [
            {
              productId: 'prod-elec-03',
              productName: 'Boult Audio BassBuds In-Ear Wired Earphones with HD Mic',
              productImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
              price: 349,
              costPrice: 170,
              quantity: 1
            }
          ],
          subtotal: 349,
          deliveryCharge: 40,
          platformFee: 3,
          deliveryFee: 40,
          discount: 0,
          totalAmount: 392,
          finalTotal: 392,
          finalPayableAmount: 392,
          totalCost: 210,
          paymentMethod: 'Cash on Delivery',
          deliveryAddress: {
            id: 'addr-seed-02',
            name: 'Zubair Qureshi',
            mobile: '9826199881',
            houseFlat: 'Plot 15',
            streetArea: 'Lake View Road',
            city: 'Repalle',
            state: 'Andhra Pradesh',
            pincode: '522265',
            landmark: 'Near Water Tank',
            tag: 'Home',
            isDefault: true,
            locationShared: false
          },
          status: 'Delivered',
          orderStatus: 'Delivered',
          locationSharingStatus: 'Manual Address Only',
          orderDate: '07 Sep 2026, 02:10 PM',
          timeline: [
            { status: 'Order Placed', timestamp: 'Yesterday, 02:10 PM' },
            { status: 'Order Confirmed', timestamp: 'Yesterday, 02:15 PM' },
            { status: 'Packed', timestamp: 'Yesterday, 02:45 PM' },
            { status: 'Shipped', timestamp: 'Yesterday, 03:20 PM' },
            { status: 'Out for Delivery', timestamp: 'Yesterday, 03:50 PM' },
            { status: 'Delivered', timestamp: 'Yesterday, 04:30 PM', note: 'Delivered and cash collected successfully' }
          ],
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          estimatedDelivery: 'Delivered'
        }
      ];
      return sampleOrders;
    } catch {
      return [];
    }
  });

  // 8. Navigation & UI state
  const [activeTab, setActiveTab] = useState<NavigationTab>('home');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [trackingOrderId, setTrackingOrderId] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authIntent, setAuthIntent] = useState<'checkout' | 'orders' | 'profile' | 'cart' | null>(null);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [recentPlacedOrder, setRecentPlacedOrder] = useState<Order | null>(null);
  const [selectedDeliveryPincode, setSelectedDeliveryPincode] = useState<string>('');
  const [supportModalOpen, setSupportModalOpen] = useState<boolean>(false);
  const [legalModalType, setLegalModalType] = useState<'privacy' | 'terms' | 'shipping' | 'cancellation' | null>(null);

  // Notice Board state & persistence (Admin and Customer)
  const [notices, setNotices] = useState<Notice[]>(() => {
    try {
      const stored = localStorage.getItem('mm_store_notices');
      if (stored) {
        return JSON.parse(stored);
      }
      return [];
    } catch {
      return [];
    }
  });
  const [isNoticeBoardOpen, setIsNoticeBoardOpen] = useState<boolean>(false);
  const [selectedNoticeForView, setSelectedNoticeForView] = useState<Notice | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('mm_store_notices', JSON.stringify(notices));
    } catch (e) {
      console.error('Failed to store notices:', e);
    }
  }, [notices]);

  // Active notices sorted with latest first
  const activeNotices = useMemo(() => {
    return notices
      .filter(n => n.isActive)
      .sort((a, b) => {
        const timeA = new Date(a.dateTime || a.createdAt).getTime();
        const timeB = new Date(b.dateTime || b.createdAt).getTime();
        return timeB - timeA;
      });
  }, [notices]);

  // Real Customer Live Delivery Location State (Device GPS)
  const [customerLocation, setCustomerLocation] = useState<CustomerLiveLocation | null>(() => {
    try {
      const savedUserStr = localStorage.getItem('mm_current_user');
      const savedUser = savedUserStr ? JSON.parse(savedUserStr) : null;
      const key = savedUser ? `mm_location_${savedUser.id}` : 'mm_location_guest';
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationStatus, setLocationStatus] = useState<
    'idle' | 'requesting' | 'captured' | 'denied' | 'unavailable' | 'unsupported'
  >('idle');
  const [locationError, setLocationError] = useState<string>('');

  // 9. Toast Notification System
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    const id = 'toast-' + Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev.slice(-3), { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 3200);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Sync to localStorage
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem('mm_current_user', JSON.stringify(currentUser));
      } else {
        localStorage.removeItem('mm_current_user');
      }
    } catch {
      // ignore
    }
  }, [currentUser]);

  useEffect(() => {
    try {
      localStorage.setItem('mm_all_users', JSON.stringify(allUsers));
    } catch {
      // ignore
    }
  }, [allUsers]);

  useEffect(() => {
    try {
      if (adminUser) {
        localStorage.setItem('mm_admin_session', JSON.stringify(adminUser));
      } else {
        localStorage.removeItem('mm_admin_session');
      }
    } catch {
      // ignore
    }
  }, [adminUser]);

  useEffect(() => {
    try {
      localStorage.setItem('mm_products', JSON.stringify(products));
    } catch {
      // ignore
    }
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem('mm_settings', JSON.stringify(settings));
    } catch {
      // ignore
    }
  }, [settings]);

  useEffect(() => {
    try {
      const userId = currentUser?.id || 'guest';
      localStorage.setItem(`mm_cart_${userId}`, JSON.stringify(cart));
    } catch {
      // ignore
    }
  }, [cart, currentUser]);

  useEffect(() => {
    try {
      const userId = currentUser?.id || 'guest';
      localStorage.setItem(`mm_wishlist_${userId}`, JSON.stringify(wishlist));
    } catch {
      // ignore
    }
  }, [wishlist, currentUser]);

  useEffect(() => {
    try {
      localStorage.setItem('mm_orders', JSON.stringify(orders));
    } catch {
      // ignore
    }
  }, [orders]);

  // Handle switching cart/wishlist when current user changes
  useEffect(() => {
    const userId = currentUser?.id || 'guest';
    try {
      const userCart = localStorage.getItem(`mm_cart_${userId}`);
      if (userCart) {
        setCart(JSON.parse(userCart));
      } else {
        setCart([]);
      }

      const userWishlist = localStorage.getItem(`mm_wishlist_${userId}`);
      if (userWishlist) {
        setWishlist(JSON.parse(userWishlist));
      } else {
        setWishlist([]);
      }
    } catch {
      // fallback
    }
  }, [currentUser?.id]);

  // Customer Auth Methods
  const registerCustomer = async (
    name: string,
    mobile: string,
    password: string,
    email?: string
  ): Promise<{ success: boolean; error?: string }> => {
    const cleanName = name.trim();
    const cleanMobile = mobile.replace(/\D/g, '').slice(-10);
    const cleanPassword = password.trim();

    if (!cleanName) {
      return { success: false, error: 'Please enter your full name' };
    }
    if (cleanMobile.length !== 10) {
      return { success: false, error: 'Please enter a valid 10-digit mobile number' };
    }
    if (cleanPassword.length < 4) {
      return { success: false, error: 'Password must be at least 4 characters long' };
    }

    const existing = allUsers.find(u => u.mobile === cleanMobile);
    if (existing) {
      return { success: false, error: 'An account with this mobile number already exists. Please log in.' };
    }

    const newUserId = `cust-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newUser: User = {
      id: newUserId,
      name: cleanName,
      mobile: cleanMobile,
      email: email?.trim() || undefined,
      password: cleanPassword,
      role: 'customer',
      createdAt: new Date().toISOString(),
      savedAddresses: []
    };

    const updatedUsers = [...allUsers, newUser];
    setAllUsers(updatedUsers);
    try {
      localStorage.setItem('mm_customers_db', JSON.stringify(updatedUsers));
    } catch {
      // ignore
    }

    // Transfer guest cart if present
    const guestCartStr = localStorage.getItem('mm_cart_guest');
    if (guestCartStr) {
      try {
        const guestCart = JSON.parse(guestCartStr);
        if (Array.isArray(guestCart) && guestCart.length > 0) {
          setCart(guestCart);
          localStorage.setItem(`mm_cart_${newUserId}`, guestCartStr);
          localStorage.removeItem('mm_cart_guest');
        }
      } catch {
        // ignore
      }
    }

    setCurrentUser(newUser);
    try {
      localStorage.setItem('mm_current_user', JSON.stringify(newUser));
    } catch {
      // ignore
    }
    showToast(`Welcome to Madina Mart, ${newUser.name}!`, 'success');
    return { success: true };
  };

  const loginCustomer = async (
    mobile: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    const cleanMobile = mobile.replace(/\D/g, '').slice(-10);
    const cleanPassword = password.trim();

    if (cleanMobile.length !== 10) {
      return { success: false, error: 'Please enter a valid 10-digit mobile number' };
    }
    if (!cleanPassword) {
      return { success: false, error: 'Please enter your password' };
    }

    const user = allUsers.find(u => u.mobile === cleanMobile);
    if (!user) {
      return { success: false, error: 'No account found with this mobile number. Please register.' };
    }

    if (user.password && user.password !== cleanPassword) {
      return { success: false, error: 'Incorrect mobile number or password. Please try again.' };
    }

    // Load or transfer cart
    try {
      const userCartStr = localStorage.getItem(`mm_cart_${user.id}`);
      const userCart = userCartStr ? JSON.parse(userCartStr) : [];
      const guestCartStr = localStorage.getItem('mm_cart_guest');
      const guestCart = guestCartStr ? JSON.parse(guestCartStr) : [];

      if (userCart.length === 0 && guestCart.length > 0) {
        setCart(guestCart);
        localStorage.setItem(`mm_cart_${user.id}`, JSON.stringify(guestCart));
        localStorage.removeItem('mm_cart_guest');
      } else if (userCart.length > 0) {
        setCart(userCart);
      }
    } catch {
      // ignore
    }

    setCurrentUser(user);
    try {
      localStorage.setItem('mm_current_user', JSON.stringify(user));
      const savedLoc = localStorage.getItem(`mm_location_${user.id}`);
      if (savedLoc) {
        setCustomerLocation(JSON.parse(savedLoc));
        setLocationStatus('captured');
      }
    } catch {
      // ignore
    }
    showToast(`Welcome back, ${user.name}!`, 'success');
    return { success: true };
  };

  const logoutUser = () => {
    if (currentUser) {
      try {
        localStorage.setItem(`mm_cart_${currentUser.id}`, JSON.stringify(cart));
        localStorage.setItem(`mm_wishlist_${currentUser.id}`, JSON.stringify(wishlist));
      } catch {
        // ignore
      }
    }
    setCurrentUser(null);
    localStorage.removeItem('mm_current_user');
    setCart([]);
    setWishlist([]);
    setCustomerLocation(null);
    setLocationStatus('idle');
    setLocationError('');
    localStorage.removeItem('mm_cart_guest');
    localStorage.removeItem('mm_wishlist_guest');
    localStorage.removeItem('mm_location_guest');
    setIsCheckoutOpen(false);
    if (activeTab === 'orders' || activeTab === 'profile') {
      setActiveTab('home');
    }
    showToast('Logged out successfully', 'info');
  };

  // Real device GPS location request handler
  const requestCustomerLiveLocation = async (): Promise<{
    success: boolean;
    location?: CustomerLiveLocation;
    error?: string;
  }> => {
    if (typeof window === 'undefined' || !('geolocation' in navigator) || !navigator.geolocation) {
      const err = 'Geolocation is not supported by your browser or device.';
      setLocationStatus('unsupported');
      setLocationError(err);
      showToast(err, 'error');
      return { success: false, error: err };
    }

    setIsLocating(true);
    setLocationStatus('requesting');
    setLocationError('');

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            const accuracy = Math.round(position.coords.accuracy || 10);

            // Reverse geocode coords to human readable locality
            const geo = await reverseGeocodeCoords(lat, lon);

            const liveLoc: CustomerLiveLocation = {
              latitude: lat,
              longitude: lon,
              accuracy,
              locality: geo.locality,
              formattedAddress: geo.formattedAddress,
              timestamp: new Date().toISOString()
            };

            setCustomerLocation(liveLoc);
            setIsLocating(false);
            setLocationStatus('captured');
            setLocationError('');

            if (geo.pincode) {
              setSelectedDeliveryPincode(geo.pincode);
            }

            try {
              const key = currentUser ? `mm_location_${currentUser.id}` : 'mm_location_guest';
              localStorage.setItem(key, JSON.stringify(liveLoc));
            } catch {
              // ignore
            }

            showToast(`Location detected: ${liveLoc.locality}`, 'success');
            resolve({ success: true, location: liveLoc });
          } catch (e: any) {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            const fallbackLoc: CustomerLiveLocation = {
              latitude: lat,
              longitude: lon,
              accuracy: Math.round(position.coords.accuracy || 15),
              locality: `${lat.toFixed(4)}°N, ${lon.toFixed(4)}°E`,
              formattedAddress: `GPS Location (${lat.toFixed(5)}, ${lon.toFixed(5)})`,
              timestamp: new Date().toISOString()
            };
            setCustomerLocation(fallbackLoc);
            setIsLocating(false);
            setLocationStatus('captured');
            showToast('Current GPS location detected', 'success');
            resolve({ success: true, location: fallbackLoc });
          }
        },
        (error) => {
          setIsLocating(false);
          let errorMsg = 'Failed to retrieve location.';
          if (error.code === error.PERMISSION_DENIED) {
            setLocationStatus('denied');
            errorMsg = 'Location permission was denied. You can enter your delivery address manually.';
            showToast('Location permission denied. Please allow GPS or enter address manually.', 'info');
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            setLocationStatus('unavailable');
            errorMsg = 'GPS location is unavailable on your device.';
            showToast('GPS location unavailable. Please enter address manually.', 'warning');
          } else if (error.code === error.TIMEOUT) {
            setLocationStatus('unavailable');
            errorMsg = 'GPS location request timed out. Please try again.';
            showToast('Location request timed out. Please try again.', 'warning');
          } else {
            setLocationStatus('unavailable');
            errorMsg = error.message || 'Unable to retrieve location';
            showToast(errorMsg, 'error');
          }
          setLocationError(errorMsg);
          resolve({ success: false, error: errorMsg });
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 5000
        }
      );
    });
  };

  const clearCustomerLocation = () => {
    setCustomerLocation(null);
    setLocationStatus('idle');
    setLocationError('');
    try {
      if (currentUser) {
        localStorage.removeItem(`mm_location_${currentUser.id}`);
      }
      localStorage.removeItem('mm_location_guest');
    } catch {
      // ignore
    }
    showToast('Delivery location reset', 'info');
  };

  const logoutCustomer = logoutUser;

  // Legacy compatibility helper
  const sendOtp = async (mobile: string): Promise<{ success: boolean }> => {
    return { success: true };
  };

  const verifyOtpAndLogin = async (
    mobile: string,
    otp: string,
    profile?: { name: string; email?: string }
  ): Promise<{ success: boolean; isNewUser?: boolean; error?: string }> => {
    const cleanMobile = mobile.replace(/\D/g, '').slice(-10);
    const existing = allUsers.find(u => u.mobile === cleanMobile);
    if (existing) {
      setCurrentUser(existing);
      showToast(`Welcome back, ${existing.name}!`);
      return { success: true, isNewUser: false };
    }
    if (!profile?.name) {
      return { success: true, isNewUser: true };
    }
    return registerCustomer(profile.name, cleanMobile, '', profile.email);
  };

  const updateProfile = (name: string, email?: string) => {
    if (!currentUser) return;
    const updated: User = {
      ...currentUser,
      name,
      email: email?.trim() || undefined
    };
    setCurrentUser(updated);
    setAllUsers(prev => prev.map(u => (u.id === updated.id ? updated : u)));
    showToast('Profile updated successfully');
  };

  const addAddress = (addr: Omit<Address, 'id'>): Address => {
    if (!currentUser) {
      throw new Error('Please log in to save a delivery address');
    }
    const newAddr: Address = {
      ...addr,
      id: 'addr-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5)
    };
    let updatedAddrs = [...currentUser.savedAddresses];
    if (newAddr.isDefault || updatedAddrs.length === 0) {
      newAddr.isDefault = true;
      updatedAddrs = updatedAddrs.map(a => ({ ...a, isDefault: false }));
    }
    updatedAddrs.push(newAddr);

    const updatedUser = { ...currentUser, savedAddresses: updatedAddrs };
    setCurrentUser(updatedUser);
    setAllUsers(prev => prev.map(u => (u.id === updatedUser.id ? updatedUser : u)));
    localStorage.setItem('mm_current_user', JSON.stringify(updatedUser));
    showToast('Delivery address saved');
    return newAddr;
  };

  const updateAddress = (address: Address) => {
    if (!currentUser) return;
    let updatedAddrs = currentUser.savedAddresses.map(a =>
      a.id === address.id ? address : address.isDefault ? { ...a, isDefault: false } : a
    );
    const updatedUser = { ...currentUser, savedAddresses: updatedAddrs };
    setCurrentUser(updatedUser);
    setAllUsers(prev => prev.map(u => (u.id === updatedUser.id ? updatedUser : u)));
    showToast('Address updated');
  };

  const deleteAddress = (addressId: string) => {
    if (!currentUser) return;
    const updatedAddrs = currentUser.savedAddresses.filter(a => a.id !== addressId);
    if (updatedAddrs.length > 0 && !updatedAddrs.some(a => a.isDefault)) {
      updatedAddrs[0].isDefault = true;
    }
    const updatedUser = { ...currentUser, savedAddresses: updatedAddrs };
    setCurrentUser(updatedUser);
    setAllUsers(prev => prev.map(u => (u.id === updatedUser.id ? updatedUser : u)));
    showToast('Address removed', 'info');
  };

  const setDefaultAddress = (addressId: string) => {
    if (!currentUser) return;
    const updatedAddrs = currentUser.savedAddresses.map(a => ({
      ...a,
      isDefault: a.id === addressId
    }));
    const updatedUser = { ...currentUser, savedAddresses: updatedAddrs };
    setCurrentUser(updatedUser);
    setAllUsers(prev => prev.map(u => (u.id === updatedUser.id ? updatedUser : u)));
    showToast('Default delivery address changed');
  };

  // Admin Auth Methods
  // Admin credentials are validated via SHA-256 hash comparison; not exposed in plaintext or to customers
  const loginAdmin = async (username: string, pin: string): Promise<boolean> => {
    if (username.trim().toLowerCase() !== 'admin') {
      return false;
    }
    const inputHash = await hashPassword(pin.trim());
    const storedHash = localStorage.getItem(ADMIN_HASH_STORAGE_KEY) || DEFAULT_ADMIN_PASSWORD_HASH;

    if (inputHash === storedHash) {
      const admin: AdminUser = {
        id: 'adm-001',
        username: 'admin',
        role: 'admin',
        name: 'Madina Mart Store Manager'
      };
      setAdminUser(admin);
      showToast('Admin logged in successfully', 'success');
      return true;
    }
    return false;
  };

  const logoutAdmin = () => {
    setAdminUser(null);
    setIsAdminOpen(false);
    showToast('Admin logged out', 'info');
  };

  const changeAdminPassword = async (
    currentPassword: string,
    newPassword: string
  ): Promise<{ success: boolean; message: string }> => {
    if (!currentPassword) {
      return { success: false, message: 'Please enter your current password.' };
    }
    if (!newPassword || !newPassword.trim()) {
      return { success: false, message: 'New password cannot be empty.' };
    }

    const currentHash = await hashPassword(currentPassword.trim());
    const storedHash = localStorage.getItem(ADMIN_HASH_STORAGE_KEY) || DEFAULT_ADMIN_PASSWORD_HASH;

    if (currentHash !== storedHash) {
      return { success: false, message: 'Current password does not match.' };
    }

    const newHash = await hashPassword(newPassword.trim());
    try {
      localStorage.setItem(ADMIN_HASH_STORAGE_KEY, newHash);
    } catch (e) {
      return { success: false, message: 'Failed to save updated password hash to storage.' };
    }

    showToast('Admin password changed successfully.', 'success');
    return { success: true, message: 'Admin password changed successfully.' };
  };

  // Notice Board CRUD Management
  const addNotice = (noticeData: Omit<Notice, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newNotice: Notice = {
      ...noticeData,
      id: 'notice-' + Date.now(),
      createdAt: now,
      updatedAt: now
    };
    setNotices(prev => [newNotice, ...prev]);
    showToast('Notice created successfully', 'success');
  };

  const updateNotice = (id: string, updates: Partial<Notice>) => {
    const now = new Date().toISOString();
    setNotices(prev =>
      prev.map(n => (n.id === id ? { ...n, ...updates, updatedAt: now } : n))
    );
    showToast('Notice updated successfully', 'success');
  };

  const deleteNotice = (id: string) => {
    setNotices(prev => prev.filter(n => n.id !== id));
    showToast('Notice deleted successfully', 'info');
  };

  const toggleNoticeActive = (id: string) => {
    const now = new Date().toISOString();
    setNotices(prev =>
      prev.map(n => {
        if (n.id === id) {
          const nextState = !n.isActive;
          showToast(nextState ? 'Notice enabled' : 'Notice disabled', 'info');
          return { ...n, isActive: nextState, updatedAt: now };
        }
        return n;
      })
    );
  };

  // Products Management
  const addProduct = (prod: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...prod,
      id: 'prod-' + Date.now()
    };
    setProducts(prev => [newProduct, ...prev]);
    showToast(`Added product "${newProduct.name.slice(0, 25)}..."`);
  };

  const updateProduct = (productOrId: Product | string, updates?: Partial<Product>) => {
    if (typeof productOrId === 'string') {
      setProducts(prev =>
        prev.map(p => (p.id === productOrId ? { ...p, ...updates } : p))
      );
    } else {
      setProducts(prev => prev.map(p => (p.id === productOrId.id ? productOrId : p)));
    }
    showToast('Product updated successfully');
  };

  const deleteProduct = (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
    showToast('Product removed from catalog', 'info');
  };

  const toggleStockStatus = (productId: string) => {
    setProducts(prev =>
      prev.map(p => {
        if (p.id !== productId) return p;
        const newStatus = p.status === 'out_of_stock' ? 'in_stock' : 'out_of_stock';
        return {
          ...p,
          status: newStatus,
          stockQuantity: newStatus === 'out_of_stock' ? 0 : 25
        };
      })
    );
    showToast('Stock status toggled');
  };

  // Cart Methods
  const addToCart = (productId: string, quantity = 1) => {
    const product = products.find(p => p.id === productId);
    if (!product || product.status === 'out_of_stock') {
      showToast('Item is currently out of stock', 'warning');
      return;
    }

    setCart(prev => {
      const existing = prev.find(item => item.productId === productId && !item.savedForLater);
      if (existing) {
        return prev.map(item =>
          item.productId === productId && !item.savedForLater
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [...prev, { productId, quantity, savedForLater: false }];
      }
    });

    showToast(`Added to cart: ${product.name.slice(0, 24)}...`);
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(i => i.productId !== productId));
    showToast('Removed from cart', 'info');
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    const product = products.find(p => p.id === productId);
    if (product && quantity > product.stockQuantity) {
      showToast(`Only ${product.stockQuantity} units available in stock`, 'warning');
      return;
    }
    setCart(prev =>
      prev.map(item => (item.productId === productId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const saveForLater = (productId: string) => {
    setCart(prev =>
      prev.map(item => (item.productId === productId ? { ...item, savedForLater: true } : item))
    );
    showToast('Saved for later', 'info');
  };

  const moveToCart = (productId: string) => {
    setCart(prev =>
      prev.map(item => (item.productId === productId ? { ...item, savedForLater: false } : item))
    );
    showToast('Moved back to cart', 'success');
  };

  // Cart Calculations
  const activeCartItems = cart.filter(c => !c.savedForLater);
  const cartTotalCount = activeCartItems.reduce((acc, curr) => acc + curr.quantity, 0);

  const cartSubtotal = activeCartItems.reduce((acc, curr) => {
    const product = products.find(p => p.id === curr.productId);
    return acc + (product ? product.sellingPrice * curr.quantity : 0);
  }, 0);

  const cartTotalDiscount = activeCartItems.reduce((acc, curr) => {
    const product = products.find(p => p.id === curr.productId);
    if (!product) return acc;
    const diff = (product.originalPrice - product.sellingPrice) * curr.quantity;
    return acc + Math.max(0, diff);
  }, 0);

  const cartPlatformFee = activeCartItems.length > 0 ? (settings.platformFee ?? 5) : 0;
  const standardDelivery = settings.deliveryFee ?? settings.deliveryCharge ?? 30;
  const cartDeliveryFee =
    cartSubtotal >= settings.freeDeliveryThreshold || activeCartItems.length === 0 ? 0 : standardDelivery;

  const cartFinalTotal = activeCartItems.length > 0 ? cartSubtotal + cartPlatformFee + cartDeliveryFee : 0;

  // Wishlist Methods
  const toggleWishlist = (productId: string) => {
    const exists = wishlist.some(w => w.productId === productId);
    if (exists) {
      setWishlist(prev => prev.filter(w => w.productId !== productId));
      showToast('Removed from wishlist', 'info');
    } else {
      setWishlist(prev => [...prev, { productId, addedAt: new Date().toISOString() }]);
      showToast('Added to wishlist', 'success');
    }
  };

  const isInWishlist = (productId: string) => {
    return wishlist.some(w => w.productId === productId);
  };

  // Orders Management
  // Customer can ONLY see orders that belong to their unique customer ID
  const customerOrders = useMemo(() => {
    if (!currentUser) return [];
    return orders
      .filter(o => o.userId === currentUser.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [orders, currentUser]);

  const placeOrder = async (deliveryAddress: Address): Promise<Order> => {
    if (!currentUser) {
      throw new Error('Customer login is required before placing an order.');
    }

    const orderItems: OrderItem[] = [];
    let orderCostTotal = 0;

    for (const item of activeCartItems) {
      const product = products.find(p => p.id === item.productId);
      if (product) {
        orderItems.push({
          productId: product.id,
          productName: product.name,
          productImage: product.images[0] || '',
          price: product.sellingPrice,
          costPrice: product.costPrice,
          quantity: item.quantity
        });
        orderCostTotal += product.costPrice * item.quantity;
      }
    }

    if (orderItems.length === 0) {
      throw new Error('Your cart is empty');
    }

    // Deduct stocks
    setProducts(prev =>
      prev.map(p => {
        const ordered = orderItems.find(o => o.productId === p.id);
        if (ordered) {
          const newQty = Math.max(0, p.stockQuantity - ordered.quantity);
          return {
            ...p,
            stockQuantity: newQty,
            status: newQty === 0 ? 'out_of_stock' : newQty <= 5 ? 'low_stock' : p.status
          };
        }
        return p;
      })
    );

    const randomNum = Math.floor(10000 + Math.random() * 90000);
    const orderId = `MM-2026-${randomNum}`;
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    const customerName = (deliveryAddress.name?.trim() || currentUser.name?.trim() || '').trim();
    if (!customerName) {
      throw new Error('Customer name is required before placing an order.');
    }

    const contactNumber = (deliveryAddress.mobile?.trim() || currentUser.mobile?.trim() || '').replace(/\D/g, '');
    if (!/^[6-9]\d{9}$/.test(contactNumber)) {
      throw new Error('A valid 10-digit Indian contact number is required before placing an order.');
    }
    const customerMobile = contactNumber;
    const userId = currentUser.id;

    const orderPlatformFee = settings.platformFee ?? 5;
    const orderDeliveryFee = cartDeliveryFee;
    const finalPayable = cartSubtotal + orderPlatformFee + orderDeliveryFee;
    const estimatedProfit = finalPayable - orderCostTotal;

    const orderLat =
      deliveryAddress.latitude !== undefined && deliveryAddress.latitude !== null
        ? deliveryAddress.latitude
        : (customerLocation?.latitude ?? null);
    const orderLng =
      deliveryAddress.longitude !== undefined && deliveryAddress.longitude !== null
        ? deliveryAddress.longitude
        : (customerLocation?.longitude ?? null);
    const orderAccuracy = deliveryAddress.locationAccuracy ?? customerLocation?.accuracy ?? null;
    const isLocationShared = !!(orderLat !== null && orderLng !== null);
    const orderLocationAddress =
      deliveryAddress.locationAddress ||
      customerLocation?.locality ||
      customerLocation?.formattedAddress ||
      '';

    const fullDeliveryAddress = deliveryAddress.houseFlat
      ? `${deliveryAddress.houseFlat}, ${deliveryAddress.streetArea}, ${deliveryAddress.city}, ${deliveryAddress.state || ''} - ${deliveryAddress.pincode}`
      : (deliveryAddress.streetArea || orderLocationAddress || 'Customer Delivery Address');

    const newOrder: Order = {
      id: orderId,
      customerId: currentUser.id,
      userId: currentUser.id,
      customerName,
      contactNumber,
      mobileNumber: contactNumber,
      customerMobile: contactNumber,
      fullAddress: fullDeliveryAddress,
      landmark: deliveryAddress.landmark || '',
      latitude: orderLat,
      longitude: orderLng,
      locationAccuracy: orderAccuracy,
      locationShared: isLocationShared,
      locationAddress: orderLocationAddress,
      items: orderItems,
      subtotal: cartSubtotal,
      deliveryCharge: orderDeliveryFee,
      deliveryFee: orderDeliveryFee,
      platformFee: orderPlatformFee,
      discount: cartTotalDiscount,
      totalAmount: finalPayable,
      finalTotal: finalPayable,
      finalPayableAmount: finalPayable,
      totalCost: orderCostTotal,
      estimatedProfit,
      paymentMethod: 'Cash on Delivery',
      deliveryAddress: {
        ...deliveryAddress,
        latitude: orderLat,
        longitude: orderLng,
        locationAccuracy: orderAccuracy,
        locationShared: isLocationShared,
        locationAddress: orderLocationAddress
      },
      orderDate: `${now.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}, ${timeString}`,
      orderStatus: 'Order Placed',
      status: 'Order Placed',
      locationSharingStatus: isLocationShared ? 'Live GPS Location Shared' : 'Manual Address Only',
      timeline: [
        {
          status: 'Order Placed',
          timestamp: `Today, ${timeString}`,
          note: isLocationShared
            ? `Cash On Delivery order confirmed with Live GPS coordinates (${orderLat?.toFixed(5)}, ${orderLng?.toFixed(5)})`
            : 'Cash On Delivery order confirmed by Madina Mart'
        }
      ],
      createdAt: now.toISOString(),
      estimatedDelivery: 'Today within 2-4 Hours'
    };

    setOrders(prev => [newOrder, ...prev]);
    clearCart();
    setRecentPlacedOrder(newOrder);
    showToast('Order placed successfully!', 'success');
    return newOrder;
  };

  const updateOrderStatus = (orderId: string, newStatus: OrderStatus, note?: string) => {
    const timeString = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    setOrders(prev =>
      prev.map(order => {
        if (order.id !== orderId) return order;
        const newEvent: OrderTimelineEvent = {
          status: newStatus,
          timestamp: `Today, ${timeString}`,
          note: note || `Status updated to ${newStatus}`
        };
        return {
          ...order,
          status: newStatus,
          timeline: [...order.timeline, newEvent]
        };
      })
    );
    showToast(`Order ${orderId} updated to ${newStatus}`);
  };

  const cancelOrder = (orderId: string, reason: string) => {
    const timeString = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    setOrders(prev =>
      prev.map(order => {
        if (order.id !== orderId) return order;
        return {
          ...order,
          status: 'Cancelled',
          cancelReason: reason,
          timeline: [
            ...order.timeline,
            {
              status: 'Cancelled',
              timestamp: `Today, ${timeString}`,
              note: `Cancelled: ${reason}`
            }
          ]
        };
      })
    );
    showToast(`Order ${orderId} has been cancelled`, 'info');
  };

  const reorderItems = (order: Order) => {
    order.items.forEach(item => {
      addToCart(item.productId, item.quantity);
    });
    setActiveTab('cart');
    showToast('Items added to cart from previous order');
  };

  const updateCustomerProfile = (data: { name: string; email?: string }) => {
    updateProfile(data.name, data.email);
  };

  const adminStats = React.useMemo(() => {
    const validOrders = orders.filter(o => o.status !== 'Cancelled');
    const deliveredOrders = orders.filter(o => o.status === 'Delivered').length;
    const pendingOrders = orders.filter(o => !['Delivered', 'Cancelled'].includes(o.status)).length;
    const totalSales = validOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const estimatedTotalProfit = validOrders.reduce((sum, o) => sum + (o.estimatedProfit || 0), 0);
    const profitMarginPercentage = totalSales > 0 ? Math.round((estimatedTotalProfit / totalSales) * 100) : 28;
    const lowStockProducts = products.filter(p => p.stockQuantity <= settings.lowStockThreshold).length;

    return {
      totalSales,
      totalOrders: orders.length,
      deliveredOrders,
      pendingOrders,
      estimatedTotalProfit,
      profitMarginPercentage,
      totalProducts: products.length,
      lowStockProducts,
      totalCustomers: allUsers.length
    };
  }, [orders, products, settings.lowStockThreshold, allUsers]);

  const updateSettings = (newSettings: Partial<StoreSettings>) => {
    // Validate inputs so fees cannot be negative or invalid numbers
    const validated = { ...newSettings };
    if (validated.platformFee !== undefined) {
      validated.platformFee = Math.max(0, isNaN(Number(validated.platformFee)) ? 0 : Number(validated.platformFee));
    }
    if (validated.deliveryFee !== undefined) {
      validated.deliveryFee = Math.max(0, isNaN(Number(validated.deliveryFee)) ? 0 : Number(validated.deliveryFee));
      validated.deliveryCharge = validated.deliveryFee;
    }
    if (validated.deliveryCharge !== undefined && validated.deliveryFee === undefined) {
      validated.deliveryCharge = Math.max(0, isNaN(Number(validated.deliveryCharge)) ? 0 : Number(validated.deliveryCharge));
      validated.deliveryFee = validated.deliveryCharge;
    }
    if (validated.freeDeliveryThreshold !== undefined) {
      validated.freeDeliveryThreshold = Math.max(0, isNaN(Number(validated.freeDeliveryThreshold)) ? 0 : Number(validated.freeDeliveryThreshold));
    }

    setSettings(prev => {
      const updated = { ...prev, ...validated };
      localStorage.setItem('mm_settings', JSON.stringify(updated));
      return updated;
    });
    showToast('Store settings saved', 'success');
  };

  return (
    <StoreContext.Provider
      value={{
        currentUser,
        registerCustomer,
        loginCustomer,
        authIntent,
        setAuthIntent,
        sendOtp,
        verifyOtpAndLogin,
        logoutUser,
        logoutCustomer,
        updateProfile,
        updateCustomerProfile,
        addAddress,
        updateAddress,
        deleteAddress,
        setDefaultAddress,
        adminUser,
        loginAdmin,
        logoutAdmin,
        changeAdminPassword,
        allOrders: orders,
        customers: allUsers,
        adminStats,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        toggleStockStatus,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        saveForLater,
        moveToCart,
        cartTotalCount,
        cartSubtotal,
        cartTotalDiscount,
        cartPlatformFee,
        cartDeliveryFee,
        cartFinalTotal,
        wishlist,
        toggleWishlist,
        isInWishlist,
        orders,
        customerOrders,
        placeOrder,
        updateOrderStatus,
        cancelOrder,
        reorderItems,
        settings,
        updateSettings,
        activeTab,
        setActiveTab,
        selectedCategory,
        setSelectedCategory,
        selectedSubCategory,
        setSelectedSubCategory,
        selectedProduct,
        setSelectedProduct,
        trackingOrderId,
        setTrackingOrderId,
        isAuthModalOpen,
        setIsAuthModalOpen,
        isAdminOpen,
        setIsAdminOpen,
        isSearchOpen,
        setIsSearchOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
        recentPlacedOrder,
        setRecentPlacedOrder,
        selectedDeliveryPincode,
        setSelectedDeliveryPincode,
        customerLocation,
        isLocating,
        locationStatus,
        locationError,
        requestCustomerLiveLocation,
        clearCustomerLocation,
        supportModalOpen,
        setSupportModalOpen,
        legalModalType,
        setLegalModalType,
        notices,
        activeNotices,
        isNoticeBoardOpen,
        setIsNoticeBoardOpen,
        selectedNoticeForView,
        setSelectedNoticeForView,
        addNotice,
        updateNotice,
        deleteNotice,
        toggleNoticeActive,
        toasts,
        showToast,
        removeToast
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
