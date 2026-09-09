import React, { useState, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { Product, OrderStatus, CategoryType, Order } from '../../types';
import { CATEGORY_DEFINITIONS } from '../../data/sampleProducts';
import {
  TrendingUp,
  Package,
  ShoppingBag,
  Users,
  AlertTriangle,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  Truck,
  ArrowUpRight,
  DollarSign,
  Shield,
  Search,
  Filter,
  LogOut,
  X,
  ExternalLink,
  ChevronDown,
  Layers,
  Settings,
  Eye,
  Navigation,
  Megaphone
} from 'lucide-react';
import { AdminNoticeBoard } from './AdminNoticeBoard';
import { AdminPasswordChange } from './AdminPasswordChange';

export const AdminDashboard: React.FC = () => {
  const {
    adminUser,
    logoutAdmin,
    setIsAdminOpen,
    products,
    allOrders,
    customers,
    notices,
    adminStats,
    updateOrderStatus,
    addProduct,
    updateProduct,
    deleteProduct,
    settings,
    updateSettings,
    showToast
  } = useStore();

  const [activeAdminTab, setActiveAdminTab] = useState<'overview' | 'products' | 'orders' | 'inventory' | 'customers' | 'notices' | 'settings'>('overview');

  // Product Management Modal States
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  // Form Fields for Add / Edit Product
  const [prodName, setProdName] = useState('');
  const [prodCategory, setProdCategory] = useState<CategoryType>('grocery');
  const [prodSubCategory, setProdSubCategory] = useState('');
  const [prodBrand, setProdBrand] = useState('');
  const [prodCostPrice, setProdCostPrice] = useState<number>(100);
  const [prodOriginalPrice, setProdOriginalPrice] = useState<number>(160);
  const [prodSellingPrice, setProdSellingPrice] = useState<number>(140);
  const [prodStock, setProdStock] = useState<number>(25);
  const [prodImage, setProdImage] = useState('');
  const [prodDescription, setProdDescription] = useState('');
  const [prodIsFeatured, setProdIsFeatured] = useState(false);
  const [prodIsBestSeller, setProdIsBestSeller] = useState(false);

  // Orders Tab Filter
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<Order | null>(null);

  // Products Search
  const [productSearch, setProductSearch] = useState('');

  // Open modal for adding
  const handleOpenAddProduct = () => {
    setEditingProductId(null);
    setProdName('');
    setProdCategory('grocery');
    setProdSubCategory('Daily Essentials');
    setProdBrand('');
    setProdCostPrice(100);
    setProdOriginalPrice(150);
    setProdSellingPrice(130);
    setProdStock(20);
    setProdImage('https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=80');
    setProdDescription('');
    setProdIsFeatured(false);
    setProdIsBestSeller(false);
    setIsProductModalOpen(true);
  };

  // Open modal for editing
  const handleOpenEditProduct = (prod: Product) => {
    setEditingProductId(prod.id);
    setProdName(prod.name);
    setProdCategory(prod.category);
    setProdSubCategory(prod.subCategory);
    setProdBrand(prod.brand);
    setProdCostPrice(prod.costPrice);
    setProdOriginalPrice(prod.originalPrice);
    setProdSellingPrice(prod.sellingPrice);
    setProdStock(prod.stockQuantity);
    setProdImage(prod.images[0] || '');
    setProdDescription(prod.description);
    setProdIsFeatured(Boolean(prod.isFeatured));
    setProdIsBestSeller(Boolean(prod.isBestSeller));
    setIsProductModalOpen(true);
  };

  // Save product (Add or Edit)
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName.trim() || !prodBrand.trim()) {
      showToast('Please specify product name and brand', 'warning');
      return;
    }

    if (prodSellingPrice <= prodCostPrice) {
      showToast('Warning: Selling price is lower than or equal to supplier cost price!', 'warning');
    }

    const discountPct = prodOriginalPrice > prodSellingPrice
      ? Math.round(((prodOriginalPrice - prodSellingPrice) / prodOriginalPrice) * 100)
      : 0;

    const payload = {
      name: prodName.trim(),
      category: prodCategory,
      subCategory: prodSubCategory || 'General',
      brand: prodBrand.trim(),
      costPrice: Number(prodCostPrice),
      originalPrice: Number(prodOriginalPrice),
      sellingPrice: Number(prodSellingPrice),
      discountPercentage: discountPct,
      stockQuantity: Number(prodStock),
      status: Number(prodStock) <= 0 ? ('out_of_stock' as const) : ('in_stock' as const),
      images: [prodImage.trim() || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=80'],
      description: prodDescription.trim() || `${prodName} - Quality assured at Madina Mart.`,
      specifications: { Brand: prodBrand, Category: prodCategory },
      isFeatured: prodIsFeatured,
      isBestSeller: prodIsBestSeller,
      tags: [prodCategory, prodBrand.toLowerCase()]
    };

    if (editingProductId) {
      updateProduct(editingProductId, payload);
    } else {
      addProduct({
        ...payload,
        sku: `MM-${prodCategory.slice(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
        rating: 4.8,
        reviewCount: 1,
        isNewArrival: true
      });
    }

    setIsProductModalOpen(false);
  };

  // Filtered products list
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const q = productSearch.toLowerCase().trim();
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q)
      );
    });
  }, [products, productSearch]);

  // Filtered orders list
  const filteredOrders = useMemo(() => {
    return allOrders.filter(o => {
      if (orderStatusFilter === 'all') return true;
      return o.status === orderStatusFilter;
    });
  }, [allOrders, orderStatusFilter]);

  const ORDER_STATUS_OPTIONS: OrderStatus[] = [
    'Order Placed',
    'Order Confirmed',
    'Packed',
    'Shipped',
    'Out for Delivery',
    'Delivered',
    'Cancelled'
  ];

  return (
    <div id="admin-management-console" className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans pb-16">
      {/* Top Admin Navbar */}
      <header className="bg-neutral-900 border-b border-neutral-800 px-4 sm:px-6 py-3 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-500 flex items-center justify-center text-white font-black shadow-md shadow-emerald-950">
              M
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-white font-['Outfit',sans-serif]">
                  Madina Mart
                </span>
                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-md">
                  Admin Console
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 font-mono">
                Operator: <strong className="text-neutral-200">{adminUser?.name || 'Administrator'}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAdminOpen(false)}
              className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Return to customer store view"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">View Customer Store</span>
            </button>
            <button
              onClick={logoutAdmin}
              className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 border border-rose-500/30 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto flex items-center gap-1 mt-3 overflow-x-auto no-scrollbar border-t border-neutral-800/80 pt-2">
          {[
            { id: 'overview', label: 'Executive Overview', icon: TrendingUp },
            { id: 'orders', label: `Orders (${allOrders.length})`, icon: ShoppingBag },
            { id: 'products', label: `Products (${products.length})`, icon: Package },
            { id: 'inventory', label: `Inventory Alerts (${adminStats.lowStockProducts})`, icon: AlertTriangle },
            { id: 'customers', label: `Customers (${customers.length})`, icon: Users },
            { id: 'notices', label: `Notice Board (${notices.length})`, icon: Megaphone },
            { id: 'settings', label: 'Store Config & Security', icon: Settings }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeAdminTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveAdminTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-2 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-emerald-700 text-white shadow-md shadow-emerald-950'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Admin Content */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 flex-1">
        {/* TAB 1: EXECUTIVE OVERVIEW */}
        {activeAdminTab === 'overview' && (
          <div className="space-y-6">
            {/* Top Profit & Revenue KPI Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {/* Total Revenue */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 sm:p-5 shadow-xs">
                <div className="flex items-center justify-between text-neutral-400 text-xs font-bold uppercase tracking-wider mb-2">
                  <span>Total Sales</span>
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-black font-['Outfit',sans-serif] text-white">
                  ₹{adminStats.totalSales.toLocaleString('en-IN')}
                </div>
                <div className="text-[11px] text-neutral-400 mt-1">
                  Across all confirmed customer orders
                </div>
              </div>

              {/* Estimated Profit */}
              <div className="bg-gradient-to-br from-neutral-900 to-emerald-950/60 border border-emerald-700/40 rounded-2xl p-4 sm:p-5 shadow-xs">
                <div className="flex items-center justify-between text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
                  <span>Estimated Profit</span>
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
                    <DollarSign className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-black font-['Outfit',sans-serif] text-emerald-300">
                  ₹{adminStats.estimatedTotalProfit.toLocaleString('en-IN')}
                </div>
                <div className="text-[11px] text-emerald-400/80 mt-1 font-medium">
                  Profit Margin: <strong className="text-white">{adminStats.profitMarginPercentage}%</strong>
                </div>
              </div>

              {/* Orders Fulfillment */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 sm:p-5 shadow-xs">
                <div className="flex items-center justify-between text-neutral-400 text-xs font-bold uppercase tracking-wider mb-2">
                  <span>Orders Ratio</span>
                  <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-black font-['Outfit',sans-serif] text-white">
                  {adminStats.deliveredOrders} / {adminStats.totalOrders}
                </div>
                <div className="text-[11px] text-amber-400 mt-1">
                  {adminStats.pendingOrders} orders active / pending delivery
                </div>
              </div>

              {/* Catalog Status */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 sm:p-5 shadow-xs">
                <div className="flex items-center justify-between text-neutral-400 text-xs font-bold uppercase tracking-wider mb-2">
                  <span>Catalog & Stock</span>
                  <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                    <Package className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-black font-['Outfit',sans-serif] text-white">
                  {adminStats.totalProducts} Items
                </div>
                <div className="text-[11px] text-neutral-400 mt-1 flex items-center gap-1">
                  {adminStats.lowStockProducts > 0 ? (
                    <span className="text-rose-400 font-bold">⚠️ {adminStats.lowStockProducts} items low in stock</span>
                  ) : (
                    <span className="text-emerald-400">✓ All stock healthy</span>
                  )}
                </div>
              </div>
            </div>

            {/* Profit Logic Transparency Box */}
            <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-4 text-xs text-neutral-300">
              <div className="flex items-center gap-2 font-bold text-emerald-400 mb-1">
                <Shield className="w-4 h-4" />
                <span>Transparent Reselling Profit Engine</span>
              </div>
              <p className="text-neutral-400 leading-relaxed">
                Profit per unit is calculated dynamically as: <code className="text-emerald-300 font-mono bg-neutral-950 px-1.5 py-0.5 rounded">Profit = Selling Price - Supplier Price</code>.
                Estimated Total Profit represents net margin earned across orders. Cancelled orders are automatically deducted from the net ledger.
              </p>
            </div>

            {/* Recent Orders in Admin */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  <span>Recent Customer Orders</span>
                </h3>
                <button
                  onClick={() => setActiveAdminTab('orders')}
                  className="text-xs text-emerald-400 hover:underline"
                >
                  Manage All Orders →
                </button>
              </div>

              <div className="divide-y divide-neutral-800">
                {allOrders.slice(0, 5).map(ord => (
                  <div key={ord.id} className="py-3 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-white">#{ord.id}</span>
                        <span className="text-neutral-400">• {ord.customerName} (+91 {ord.customerMobile})</span>
                      </div>
                      <div className="text-[11px] text-neutral-500 mt-0.5">
                        {ord.items.length} items • Ordered on {ord.orderDate}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-bold font-['Outfit',sans-serif] text-white">
                          ₹{ord.totalAmount}
                        </div>
                        <div className="text-[10px] text-emerald-400 font-medium">
                          Profit: +₹{ord.estimatedProfit}
                        </div>
                      </div>

                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          ord.status === 'Delivered'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : ord.status === 'Cancelled'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {ord.status}
                      </span>

                      <button
                        onClick={() => {
                          setSelectedOrderDetails(ord);
                          setActiveAdminTab('orders');
                        }}
                        className="p-1.5 text-neutral-400 hover:text-white bg-neutral-800 rounded-lg"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ORDERS MANAGEMENT */}
        {activeAdminTab === 'orders' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 bg-neutral-900 p-4 rounded-2xl border border-neutral-800">
              <div>
                <h2 className="text-lg font-bold text-white font-['Outfit',sans-serif]">
                  Customer Orders Pipeline
                </h2>
                <p className="text-xs text-neutral-400">
                  Manage shipments, view address details, calculate margins, and update status.
                </p>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                {['all', ...ORDER_STATUS_OPTIONS].map(st => (
                  <button
                    key={st}
                    onClick={() => setOrderStatusFilter(st)}
                    className={`text-xs px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors ${
                      orderStatusFilter === st
                        ? 'bg-emerald-600 text-white'
                        : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-white'
                    }`}
                  >
                    {st === 'all' ? 'All Orders' : st}
                  </button>
                ))}
              </div>
            </div>

            {/* Orders List */}
            <div className="space-y-3">
              {filteredOrders.length > 0 ? (
                filteredOrders.map(order => (
                  <div
                    key={order.id}
                    id={`admin-order-${order.id}`}
                    className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 space-y-3"
                  >
                    {/* Top Order Row */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-800 pb-3 text-xs">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono font-bold text-sm text-emerald-400">
                            #{order.id}
                          </span>
                          <span className="text-neutral-200 font-bold">{order.customerName}</span>
                          <a
                            href={`tel:+91${order.contactNumber || order.customerMobile || order.mobileNumber}`}
                            className="text-emerald-400 hover:text-emerald-300 font-mono font-medium flex items-center gap-1 bg-neutral-950 px-2 py-0.5 rounded-lg border border-neutral-800"
                          >
                            <span>📞 +91 {order.contactNumber || order.customerMobile || order.mobileNumber}</span>
                          </a>
                        </div>
                        <div className="text-[11px] text-neutral-400 mt-0.5">
                          Placed: {order.orderDate} • Delivery Promise: {order.estimatedDelivery}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {/* Status dropdown */}
                        <div className="flex items-center gap-1 bg-neutral-950 border border-neutral-700 px-2.5 py-1.5 rounded-xl text-xs">
                          <span className="text-neutral-400 text-[10px] uppercase font-bold mr-1">Status:</span>
                          <select
                            id={`admin-order-status-select-${order.id}`}
                            value={order.status}
                            onChange={e => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                            className="bg-transparent text-white font-bold focus:outline-none cursor-pointer"
                          >
                            {ORDER_STATUS_OPTIONS.map(opt => (
                              <option key={opt} value={opt} className="bg-neutral-900 text-white">
                                {opt}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Middle: Items & Address Breakdown */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      {/* Products */}
                      <div className="md:col-span-2 space-y-2">
                        <span className="text-[10px] uppercase font-bold text-neutral-500 block">
                          Ordered Items ({order.items.length})
                        </span>
                        <div className="space-y-1.5">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between bg-neutral-950/60 p-2 rounded-xl">
                              <div className="flex items-center gap-2 truncate max-w-[70%]">
                                <img
                                  src={item.productImage}
                                  alt=""
                                  className="w-8 h-8 rounded-lg object-cover border border-neutral-800"
                                />
                                <span className="text-neutral-200 truncate">{item.productName}</span>
                                <span className="text-neutral-400 font-bold">×{item.quantity}</span>
                              </div>
                              <div className="text-right">
                                <div className="text-neutral-200 font-mono font-bold">
                                  ₹{item.price * item.quantity}
                                </div>
                                <div className="text-[10px] text-neutral-500">
                                  Cost: ₹{item.costPrice * item.quantity}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Delivery Address & Live GPS Location */}
                      <div className="bg-neutral-950 p-3.5 rounded-xl border border-neutral-800 flex flex-col justify-between">
                        <div className="space-y-3">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-neutral-400 block mb-1 tracking-wider">
                              Full Delivery Address
                            </span>
                            <p className="text-neutral-200 font-semibold text-xs leading-snug">
                              {order.fullAddress || `${order.deliveryAddress?.houseFlat}, ${order.deliveryAddress?.streetArea}, ${order.deliveryAddress?.city}`}
                            </p>
                            {(order.deliveryAddress?.landmark || order.landmark) && (
                              <p className="text-neutral-300 text-[11px] mt-1">
                                <span className="text-neutral-400 font-bold">Landmark:</span>{' '}
                                <span className="text-amber-300 font-semibold">{order.deliveryAddress?.landmark || order.landmark}</span>
                              </p>
                            )}
                            {(order.locationAddress || order.deliveryAddress?.locationAddress) && (
                              <p className="text-emerald-400 text-[11px] font-medium mt-1">
                                <span className="text-neutral-400 font-bold">Detected Address:</span>{' '}
                                {order.locationAddress || order.deliveryAddress?.locationAddress}
                              </p>
                            )}
                          </div>

                          {/* Real GPS Coordinates & Location Status */}
                          {((order.latitude && order.longitude) || (order.deliveryAddress?.latitude && order.deliveryAddress?.longitude)) ? (
                            (() => {
                              const lat = order.latitude ?? order.deliveryAddress?.latitude ?? 0;
                              const lng = order.longitude ?? order.deliveryAddress?.longitude ?? 0;
                              const acc = order.locationAccuracy ?? order.deliveryAddress?.locationAccuracy;
                              return (
                                <div className="p-3 bg-emerald-950/60 rounded-xl border border-emerald-700/60 text-xs space-y-2">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                                      <span>Live GPS Location Shared</span>
                                    </div>
                                    {acc && (
                                      <span className="text-[10px] font-mono text-emerald-300 bg-emerald-900/60 px-2 py-0.5 rounded-md">
                                        Accuracy: ±{acc}m
                                      </span>
                                    )}
                                  </div>

                                  <div className="font-mono text-neutral-200 text-xs bg-neutral-900/80 p-1.5 rounded-lg border border-neutral-800 space-y-0.5">
                                    <div className="flex justify-between items-center text-[11px]">
                                      <span className="text-neutral-400">Latitude:</span>
                                      <span className="text-emerald-300 font-bold">{lat.toFixed(5)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[11px]">
                                      <span className="text-neutral-400">Longitude:</span>
                                      <span className="text-emerald-300 font-bold">{lng.toFixed(5)}</span>
                                    </div>
                                  </div>

                                  <a
                                    id={`admin-open-customer-location-${order.id}`}
                                    href={`https://www.google.com/maps?q=${lat},${lng}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white font-bold text-xs rounded-lg shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                                  >
                                    <span>📍 Open Customer Location</span>
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                </div>
                              );
                            })()
                          ) : (
                            <div className="p-2.5 bg-neutral-900/90 rounded-xl border border-neutral-800 text-xs text-neutral-400 space-y-1">
                              <div className="font-semibold text-neutral-300 flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-neutral-600"></span>
                                <span>Location Not Shared (Manual Address Only)</span>
                              </div>
                              <p className="text-[11px] text-neutral-500">
                                Deliver using the customer's written delivery address and landmark above.
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="pt-2.5 mt-3 border-t border-neutral-800 space-y-1">
                          <div className="flex justify-between text-neutral-400 text-[11px]">
                            <span>Items Subtotal:</span>
                            <span className="text-neutral-200 font-mono">₹{order.subtotal}</span>
                          </div>
                          <div className="flex justify-between text-neutral-400 text-[11px]">
                            <span>Platform Fee:</span>
                            <span className="text-neutral-200 font-mono">₹{order.platformFee || 0}</span>
                          </div>
                          <div className="flex justify-between text-neutral-400 text-[11px]">
                            <span>Delivery Fee:</span>
                            <span className="text-neutral-200 font-mono">
                              {order.deliveryFee === 0 ? 'FREE' : `₹${order.deliveryFee}`}
                            </span>
                          </div>
                          <div className="flex justify-between text-white font-bold pt-1 border-t border-neutral-800/80">
                            <span>Total (COD):</span>
                            <span className="text-emerald-400 font-mono text-sm">₹{order.totalAmount}</span>
                          </div>
                          <div className="flex justify-between text-emerald-400 font-bold text-[11px] pt-0.5">
                            <span>Estimated Profit:</span>
                            <span>+₹{order.estimatedProfit}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-neutral-900 rounded-2xl border border-neutral-800 p-8 text-center text-neutral-400 text-xs">
                  No orders found matching filter "{orderStatusFilter}".
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: PRODUCTS CATALOG MANAGEMENT */}
        {activeAdminTab === 'products' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 bg-neutral-900 p-4 rounded-2xl border border-neutral-800">
              <div>
                <h2 className="text-lg font-bold text-white font-['Outfit',sans-serif]">
                  Product Catalog & Pricing
                </h2>
                <p className="text-xs text-neutral-400">
                  Add new items, update selling prices, modify supplier costs, and manage stock.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={productSearch}
                    onChange={e => setProductSearch(e.target.value)}
                    placeholder="Filter products..."
                    className="pl-9 pr-3 py-1.5 rounded-xl bg-neutral-950 border border-neutral-700 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <button
                  id="btn-admin-add-product"
                  onClick={handleOpenAddProduct}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Product</span>
                </button>
              </div>
            </div>

            {/* Products Table */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-neutral-800 text-neutral-400 uppercase tracking-wider text-[10px]">
                    <th className="p-3.5">Product</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5">Cost Price</th>
                    <th className="p-3.5">Selling Price</th>
                    <th className="p-3.5">Margin / Unit</th>
                    <th className="p-3.5">Stock</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800">
                  {filteredProducts.map(prod => {
                    const margin = prod.sellingPrice - prod.costPrice;
                    const marginPct = Math.round((margin / prod.sellingPrice) * 100);
                    const isLowStock = prod.stockQuantity <= settings.lowStockThreshold;

                    return (
                      <tr key={prod.id} className="hover:bg-neutral-800/40">
                        <td className="p-3.5">
                          <div className="flex items-center gap-3">
                            <img
                              src={prod.images[0]}
                              alt=""
                              className="w-10 h-10 rounded-lg object-cover border border-neutral-700 shrink-0"
                            />
                            <div>
                              <div className="font-bold text-white text-xs">{prod.name}</div>
                              <div className="text-neutral-500 text-[10px]">
                                {prod.brand} • SKU: {prod.sku}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded-md bg-neutral-800 text-neutral-300 text-[10px] font-bold uppercase">
                            {prod.category}
                          </span>
                        </td>
                        <td className="p-3.5 font-mono text-neutral-400">
                          ₹{prod.costPrice}
                        </td>
                        <td className="p-3.5 font-mono font-bold text-white">
                          ₹{prod.sellingPrice}
                        </td>
                        <td className="p-3.5 font-mono font-bold text-emerald-400">
                          +₹{margin} ({marginPct}%)
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isLowStock
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            }`}
                          >
                            {prod.stockQuantity} units
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              id={`btn-edit-prod-${prod.id}`}
                              onClick={() => handleOpenEditProduct(prod)}
                              className="p-1.5 text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-lg"
                              title="Edit product"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              id={`btn-del-prod-${prod.id}`}
                              onClick={() => {
                                if (confirm(`Delete ${prod.name}?`)) {
                                  deleteProduct(prod.id);
                                }
                              }}
                              className="p-1.5 text-rose-400 hover:text-rose-300 bg-neutral-800 hover:bg-rose-950/60 rounded-lg"
                              title="Delete product"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: INVENTORY ALERTS */}
        {activeAdminTab === 'inventory' && (
          <div className="space-y-4">
            <div className="bg-neutral-900 p-4 rounded-2xl border border-neutral-800">
              <div className="flex items-center gap-2 font-bold text-amber-400 text-sm mb-1">
                <AlertTriangle className="w-4 h-4" />
                <span>Inventory & Low Stock Warning Dashboard</span>
              </div>
              <p className="text-xs text-neutral-400">
                Products with stock quantities at or below threshold ({settings.lowStockThreshold} units). Quick-restock items to avoid cart failures.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {products
                .filter(p => p.stockQuantity <= settings.lowStockThreshold)
                .map(prod => (
                  <div key={prod.id} className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl flex flex-col justify-between space-y-3">
                    <div className="flex items-start gap-3">
                      <img src={prod.images[0]} alt="" className="w-12 h-12 rounded-xl object-cover shrink-0" />
                      <div>
                        <h4 className="font-bold text-xs text-white line-clamp-2">{prod.name}</h4>
                        <div className="text-[11px] text-rose-400 font-bold mt-1">
                          Current Stock: {prod.stockQuantity} units
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-neutral-800">
                      <button
                        onClick={() => updateProduct(prod.id, { stockQuantity: prod.stockQuantity + 20, status: 'in_stock' })}
                        className="flex-1 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold transition-colors"
                      >
                        + Restock +20
                      </button>
                      <button
                        onClick={() => handleOpenEditProduct(prod)}
                        className="p-1.5 bg-neutral-800 text-neutral-300 hover:text-white rounded-lg"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* TAB 5: REGISTERED CUSTOMERS */}
        {activeAdminTab === 'customers' && (
          <div className="space-y-4">
            <div className="bg-neutral-900 p-4 rounded-2xl border border-neutral-800">
              <h2 className="text-base font-bold text-white font-['Outfit',sans-serif]">
                Registered Customer Directory ({customers.length})
              </h2>
              <p className="text-xs text-neutral-400">
                Customer accounts registered via Mobile Number OTP. Customer privacy is preserved; credentials and tokens are protected.
              </p>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
              <div className="divide-y divide-neutral-800">
                {customers.map(cust => (
                  <div key={cust.id} className="p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-900/60 text-emerald-300 flex items-center justify-center font-bold text-base">
                        {cust.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-white text-sm">{cust.name}</div>
                        <div className="text-neutral-400 flex items-center gap-2 mt-0.5">
                          <span>📱 +91 {cust.mobile}</span>
                          {cust.email && <span>✉️ {cust.email}</span>}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-right">
                      <div>
                        <span className="text-[10px] text-neutral-500 uppercase block font-bold">Saved Addresses</span>
                        <span className="text-neutral-300 font-bold">{cust.savedAddresses.length}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-neutral-500 uppercase block font-bold">Member Since</span>
                        <span className="text-neutral-400">{cust.createdAt}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: NOTICE BOARD MANAGEMENT */}
        {activeAdminTab === 'notices' && <AdminNoticeBoard />}

        {/* TAB 7: STORE SETTINGS & SECURITY */}
        {activeAdminTab === 'settings' && (
          <div className="max-w-2xl space-y-6">
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 space-y-5 text-xs">
              <div>
                <h2 className="text-base font-bold text-white font-['Outfit',sans-serif]">
                  Madina Mart Store Operations Configuration
                </h2>
                <p className="text-neutral-400 mt-1">
                  Configure delivery fee structure, free shipping threshold, and store helpline.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block font-bold text-neutral-300 mb-1">Operating City</label>
                  <input
                    type="text"
                    value={settings.operatingCity}
                    onChange={e => updateSettings({ operatingCity: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Fee Settings Section */}
                <div className="bg-neutral-950 p-4 rounded-2xl border border-emerald-500/30 space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                      ₹
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-sm">Platform & Delivery Fee Settings</h3>
                      <p className="text-[11px] text-neutral-400">Controls the billing breakdown shown to customers at checkout</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block font-bold text-neutral-300 mb-1">
                        Platform Fee (₹)
                        <span className="text-[10px] font-normal text-neutral-500 block">Applied per order (0 or higher)</span>
                      </label>
                      <input
                        id="admin-setting-platform-fee"
                        type="number"
                        min="0"
                        value={settings.platformFee ?? 3}
                        onChange={e => updateSettings({ platformFee: Math.max(0, Number(e.target.value) || 0) })}
                        className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-white focus:outline-none focus:border-emerald-500 font-mono text-sm"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-neutral-300 mb-1">
                        Standard Delivery Fee (₹)
                        <span className="text-[10px] font-normal text-neutral-500 block">Charged if order below threshold</span>
                      </label>
                      <input
                        id="admin-setting-delivery-fee"
                        type="number"
                        min="0"
                        value={settings.deliveryFee}
                        onChange={e => updateSettings({ deliveryFee: Math.max(0, Number(e.target.value) || 0) })}
                        className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-white focus:outline-none focus:border-emerald-500 font-mono text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-neutral-300 mb-1">
                      Free Delivery Threshold (₹)
                      <span className="text-[10px] font-normal text-neutral-500 block">Orders at or above this amount get free delivery</span>
                    </label>
                    <input
                      id="admin-setting-free-threshold"
                      type="number"
                      min="0"
                      value={settings.freeDeliveryThreshold}
                      onChange={e => updateSettings({ freeDeliveryThreshold: Math.max(0, Number(e.target.value) || 0) })}
                      className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-white focus:outline-none focus:border-emerald-500 font-mono text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-neutral-300 mb-1">Customer Helpline Phone</label>
                    <input
                      type="text"
                      value={settings.contactPhone}
                      onChange={e => updateSettings({ contactPhone: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-neutral-300 mb-1">Customer WhatsApp</label>
                    <input
                      type="text"
                      value={settings.contactWhatsapp}
                      onChange={e => updateSettings({ contactWhatsapp: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="p-3 bg-neutral-950 rounded-2xl border border-neutral-800 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white block">Cash On Delivery (COD) Enabled</span>
                    <span className="text-[11px] text-neutral-400">Strictly enforced for Version 1</span>
                  </div>
                  <input type="checkbox" checked readOnly className="accent-emerald-600 w-4 h-4 cursor-not-allowed" />
                </div>

                <div className="pt-2 text-right">
                  <button
                    type="button"
                    onClick={() => showToast('Store settings updated successfully', 'success')}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl cursor-pointer"
                  >
                    Save Store Configurations
                  </button>
                </div>
              </div>
            </div>

            {/* Admin Password Change Section */}
            <AdminPasswordChange />
          </div>
        )}
      </main>

      {/* Product Add / Edit Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl w-full max-w-lg p-5 sm:p-6 shadow-2xl animate-in zoom-in-95 text-xs text-neutral-200 flex flex-col max-h-[92vh]">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800 mb-4">
              <h3 className="font-bold text-base text-white font-['Outfit',sans-serif]">
                {editingProductId ? 'Edit Product Details' : 'Add New Catalog Product'}
              </h3>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 overflow-y-auto flex-1 pr-1">
              <div>
                <label className="block font-bold text-neutral-300 mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  value={prodName}
                  onChange={e => setProdName(e.target.value)}
                  placeholder="e.g. Fortune Pure Mustard Oil 1L"
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-300 mb-1">Category *</label>
                  <select
                    value={prodCategory}
                    onChange={e => setProdCategory(e.target.value as CategoryType)}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="grocery">Grocery</option>
                    <option value="electronics">Electronics</option>
                    <option value="fashion">Fashion</option>
                    <option value="oils-personal-care">Oils & Personal Care</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-neutral-300 mb-1">Subcategory</label>
                  <input
                    type="text"
                    value={prodSubCategory}
                    onChange={e => setProdSubCategory(e.target.value)}
                    placeholder="e.g. Cooking Oils"
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-neutral-300 mb-1">Brand Name *</label>
                <input
                  type="text"
                  required
                  value={prodBrand}
                  onChange={e => setProdBrand(e.target.value)}
                  placeholder="e.g. Fortune / boAt / Madina"
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Pricing & Margins Grid */}
              <div className="p-3 bg-neutral-950 rounded-2xl border border-neutral-800 space-y-2.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 block">
                  Reseller Profit & Pricing Structure
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] text-neutral-400 mb-1">Supplier Cost (₹)</label>
                    <input
                      type="number"
                      required
                      value={prodCostPrice}
                      onChange={e => setProdCostPrice(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-neutral-900 border border-neutral-700 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-neutral-400 mb-1">Selling Price (₹)</label>
                    <input
                      type="number"
                      required
                      value={prodSellingPrice}
                      onChange={e => setProdSellingPrice(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-neutral-900 border border-neutral-700 text-white font-mono font-bold text-emerald-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-neutral-400 mb-1">MRP Price (₹)</label>
                    <input
                      type="number"
                      required
                      value={prodOriginalPrice}
                      onChange={e => setProdOriginalPrice(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-neutral-900 border border-neutral-700 text-white font-mono"
                    />
                  </div>
                </div>
                <div className="text-[11px] text-neutral-400 pt-1 flex justify-between">
                  <span>Unit Profit: <strong className="text-emerald-400">+₹{prodSellingPrice - prodCostPrice}</strong></span>
                  <span>Discount to Customer: <strong className="text-amber-400">{prodOriginalPrice > prodSellingPrice ? Math.round(((prodOriginalPrice - prodSellingPrice) / prodOriginalPrice) * 100) : 0}% OFF</strong></span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-300 mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    required
                    value={prodStock}
                    onChange={e => setProdStock(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-300 mb-1">Image URL</label>
                  <input
                    type="url"
                    value={prodImage}
                    onChange={e => setProdImage(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-neutral-300 mb-1">Product Description</label>
                <textarea
                  rows={2}
                  value={prodDescription}
                  onChange={e => setProdDescription(e.target.value)}
                  placeholder="Details, ingredients, or features..."
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={prodIsFeatured}
                    onChange={e => setProdIsFeatured(e.target.checked)}
                    className="accent-emerald-500"
                  />
                  <span>Mark as Featured</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={prodIsBestSeller}
                    onChange={e => setProdIsBestSeller(e.target.checked)}
                    className="accent-emerald-500"
                  />
                  <span>Mark as Best Seller</span>
                </label>
              </div>

              <div className="flex gap-2 pt-2 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-neutral-700 text-neutral-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  id="btn-save-product-submit"
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-colors"
                >
                  {editingProductId ? 'Update Product' : 'Add to Catalog'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
