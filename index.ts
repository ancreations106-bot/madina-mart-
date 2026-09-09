export type CategoryType = 'grocery' | 'electronics' | 'fashion' | 'oils-personal-care';

export interface CustomerLiveLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
  locality: string;
  formattedAddress: string;
  timestamp: string;
}

export interface Address {
  id: string;
  name: string;
  mobile: string;
  houseFlat: string;
  streetArea: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
  tag: 'Home' | 'Work' | 'Other';
  isDefault: boolean;
  latitude?: number | null;
  longitude?: number | null;
  locationAccuracy?: number | null;
  locationShared?: boolean;
  locationAddress?: string;
}

export interface User {
  id: string;
  name: string;
  mobile: string;
  email?: string;
  password?: string;
  savedAddresses: Address[];
  role: 'customer';
  createdAt: string;
}

export interface AdminUser {
  id: string;
  username: string;
  role: 'admin';
  name: string;
}

export interface Notice {
  id: string;
  title: string;
  message: string;
  imageUrl?: string;
  dateTime: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  category: CategoryType;
  subCategory: string;
  brand: string;
  description: string;
  specifications: Record<string, string>;
  costPrice: number; // ADMIN ONLY: never expose to customer
  sellingPrice: number;
  originalPrice: number;
  discountPercentage: number;
  stockQuantity: number;
  sku: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  isFeatured?: boolean;
  isBestSeller?: boolean;
  isNewArrival?: boolean;
  rating: number;
  reviewCount: number;
  images: string[];
  tags: string[];
}

export interface CartItem {
  productId: string;
  quantity: number;
  savedForLater?: boolean;
}

export interface WishlistItem {
  productId: string;
  addedAt: string;
}

export type OrderStatus =
  | 'Order Placed'
  | 'Order Confirmed'
  | 'Packed'
  | 'Shipped'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Cancelled';

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  costPrice: number; // Internal record for profit calculation
  quantity: number;
}

export interface OrderTimelineEvent {
  status: OrderStatus;
  timestamp: string;
  note?: string;
}

export interface Order {
  id: string;
  customerId: string;
  userId: string;
  customerName: string;
  contactNumber: string;
  mobileNumber: string;
  customerMobile: string;
  fullAddress: string;
  landmark?: string;
  latitude?: number | null;
  longitude?: number | null;
  locationAccuracy?: number | null;
  locationShared: boolean;
  locationAddress?: string;
  platformFee: number;
  deliveryFee: number;
  deliveryCharge: number;
  subtotal: number;
  discount?: number;
  finalTotal: number;
  totalAmount: number;
  finalPayableAmount: number;
  orderDate: string;
  orderStatus: OrderStatus;
  status: OrderStatus;
  items: OrderItem[];
  totalCost: number; // ADMIN ONLY calculation
  estimatedProfit?: number;
  paymentMethod: 'Cash on Delivery';
  deliveryAddress: Address;
  timeline: OrderTimelineEvent[];
  createdAt: string;
  estimatedDelivery: string;
  cancelReason?: string;
  locationSharingStatus?: string;
}

export interface StoreSettings {
  platformFee: number;
  deliveryFee: number;
  deliveryCharge: number;
  freeDeliveryThreshold: number;
  estimatedDeliveryTime: string;
  returnWindowDays: number;
  supportPhone: string;
  supportWhatsApp: string;
  supportEmail: string;
  contactPhone?: string;
  contactWhatsapp?: string;
  operatingCity?: string;
  lowStockThreshold?: number;
  bannerTexts: string[];
}

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

export type NavigationTab = 'home' | 'categories' | 'cart' | 'orders' | 'profile';
