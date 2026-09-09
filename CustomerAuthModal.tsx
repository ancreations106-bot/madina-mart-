import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  X,
  User as UserIcon,
  Phone,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  ShoppingBag,
  Mail,
  RefreshCw
} from 'lucide-react';

export const CustomerAuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    authIntent,
    setAuthIntent,
    setIsCheckoutOpen,
    setActiveTab,
    loginCustomer,
    registerCustomer
  } = useStore();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isAuthModalOpen) return null;

  const handleSuccessRedirect = () => {
    setIsAuthModalOpen(false);
    resetForm();
    if (authIntent === 'checkout') {
      setIsCheckoutOpen(true);
    } else if (authIntent === 'orders') {
      setActiveTab('orders');
    } else if (authIntent === 'profile') {
      setActiveTab('profile');
    }
    setAuthIntent(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanMobile = mobile.replace(/\D/g, '').slice(-10);
    if (cleanMobile.length !== 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number');
      return;
    }
    if (!password) {
      setErrorMsg('Please enter your password');
      return;
    }

    setIsLoading(true);
    try {
      const res = await loginCustomer(cleanMobile, password);
      if (res.success) {
        handleSuccessRedirect();
      } else {
        setErrorMsg(res.error || 'Login failed. Please verify your details.');
      }
    } catch {
      setErrorMsg('An error occurred during login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanName = name.trim();
    const cleanMobile = mobile.replace(/\D/g, '').slice(-10);
    const cleanPassword = password.trim();

    if (!cleanName) {
      setErrorMsg('Please enter your full name');
      return;
    }
    if (cleanMobile.length !== 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number');
      return;
    }
    if (cleanPassword.length < 4) {
      setErrorMsg('Password must be at least 4 characters long');
      return;
    }

    setIsLoading(true);
    try {
      const res = await registerCustomer(cleanName, cleanMobile, cleanPassword, email);
      if (res.success) {
        handleSuccessRedirect();
      } else {
        setErrorMsg(res.error || 'Registration failed. Please try again.');
      }
    } catch {
      setErrorMsg('An error occurred during registration.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setMobile('');
    setPassword('');
    setName('');
    setEmail('');
    setErrorMsg('');
    setShowPassword(false);
  };

  const handleClose = () => {
    setIsAuthModalOpen(false);
    setAuthIntent(null);
    resetForm();
  };

  const switchMode = (newMode: 'login' | 'register') => {
    setMode(newMode);
    setErrorMsg('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        id="customer-auth-modal"
        className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-neutral-200 animate-in zoom-in-95 duration-200"
      >
        {/* Header with Emerald Gradient */}
        <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 px-6 py-5 text-white relative">
          <button
            id="btn-close-customer-auth"
            onClick={handleClose}
            className="absolute top-4 right-4 text-emerald-200 hover:text-white p-1 rounded-full hover:bg-emerald-700/50 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-1.5">
            <span className="bg-amber-400 text-neutral-900 text-[10px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider inline-flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              <span>Customer Account</span>
            </span>
          </div>

          <h2 className="text-xl font-bold font-['Outfit',sans-serif]">
            {mode === 'login' ? 'Customer Login' : 'Create Customer Account'}
          </h2>
          <p className="text-xs text-emerald-100 mt-1">
            {mode === 'login'
              ? 'Enter your mobile number and password to access your cart and orders'
              : 'Sign up to place orders, save delivery addresses, and track shipments'}
          </p>
        </div>

        {/* Intent Context Notice if prompted by Checkout */}
        {authIntent === 'checkout' && (
          <div className="bg-amber-50 border-b border-amber-200/80 px-6 py-2.5 flex items-center gap-2 text-amber-800 text-xs font-semibold">
            <ShoppingBag className="w-4 h-4 shrink-0 text-amber-700" />
            <span>Customer login is required before placing an order.</span>
          </div>
        )}

        {/* Mode Selector Tabs */}
        <div className="px-6 pt-5">
          <div className="grid grid-cols-2 p-1 bg-neutral-100 rounded-2xl">
            <button
              id="tab-customer-login"
              type="button"
              onClick={() => switchMode('login')}
              className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              Sign In
            </button>
            <button
              id="tab-customer-register"
              type="button"
              onClick={() => switchMode('register')}
              className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                mode === 'register'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              New Customer
            </button>
          </div>
        </div>

        {/* Modal Form Body */}
        <div className="p-6">
          {errorMsg && (
            <div
              id="auth-error-message"
              className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2"
            >
              <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0"></span>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* LOGIN FORM */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                  Mobile Number <span className="text-rose-500">*</span>
                </label>
                <div className="flex rounded-2xl border border-neutral-300 focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-500/20 overflow-hidden shadow-2xs">
                  <div className="bg-neutral-100 px-3.5 flex items-center text-sm font-bold text-neutral-700 border-r border-neutral-300 select-none">
                    🇮🇳 +91
                  </div>
                  <input
                    id="input-customer-login-mobile"
                    type="tel"
                    maxLength={10}
                    required
                    value={mobile}
                    onChange={e => setMobile(e.target.value.replace(/\D/g, ''))}
                    placeholder="10-digit mobile number"
                    autoFocus
                    className="flex-1 px-4 py-3 text-sm font-semibold text-neutral-900 focus:outline-none tracking-wider"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                  Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative flex items-center rounded-2xl border border-neutral-300 focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-500/20 overflow-hidden shadow-2xs">
                  <div className="pl-3.5 pr-2 text-neutral-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="input-customer-login-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="flex-1 py-3 pr-10 text-sm font-semibold text-neutral-900 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-neutral-400 hover:text-neutral-700 p-1 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                id="btn-customer-login-submit"
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 active:scale-[0.99] text-white font-bold text-sm rounded-2xl shadow-md shadow-emerald-700/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Log In to Madina Mart</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-2 text-center text-xs text-neutral-500">
                Don't have an account?{' '}
                <button
                  id="btn-switch-to-register"
                  type="button"
                  onClick={() => switchMode('register')}
                  className="text-emerald-700 font-bold hover:underline cursor-pointer"
                >
                  Create one now
                </button>
              </div>
            </form>
          )}

          {/* REGISTER FORM */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center rounded-2xl border border-neutral-300 focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-500/20 px-3.5 py-2.5 shadow-2xs">
                  <UserIcon className="w-4 h-4 text-neutral-400 mr-2 shrink-0" />
                  <input
                    id="input-customer-register-name"
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Mohammad Zubair"
                    autoFocus
                    className="w-full text-sm font-medium text-neutral-900 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                  Mobile Number <span className="text-rose-500">*</span>
                </label>
                <div className="flex rounded-2xl border border-neutral-300 focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-500/20 overflow-hidden shadow-2xs">
                  <div className="bg-neutral-100 px-3.5 flex items-center text-sm font-bold text-neutral-700 border-r border-neutral-300 select-none">
                    🇮🇳 +91
                  </div>
                  <input
                    id="input-customer-register-mobile"
                    type="tel"
                    maxLength={10}
                    required
                    value={mobile}
                    onChange={e => setMobile(e.target.value.replace(/\D/g, ''))}
                    placeholder="10-digit mobile number"
                    className="flex-1 px-4 py-2.5 text-sm font-semibold text-neutral-900 focus:outline-none tracking-wider"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                  Create Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative flex items-center rounded-2xl border border-neutral-300 focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-500/20 overflow-hidden shadow-2xs">
                  <div className="pl-3.5 pr-2 text-neutral-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="input-customer-register-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="At least 4 characters"
                    className="flex-1 py-2.5 pr-10 text-sm font-semibold text-neutral-900 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-neutral-400 hover:text-neutral-700 p-1 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                  Email Address <span className="text-neutral-400 font-normal">(Optional)</span>
                </label>
                <div className="flex items-center rounded-2xl border border-neutral-300 focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-500/20 px-3.5 py-2.5 shadow-2xs">
                  <Mail className="w-4 h-4 text-neutral-400 mr-2 shrink-0" />
                  <input
                    id="input-customer-register-email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="name@example.com (optional)"
                    className="w-full text-sm font-medium text-neutral-900 focus:outline-none"
                  />
                </div>
              </div>

              <button
                id="btn-customer-register-submit"
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 active:scale-[0.99] text-white font-bold text-sm rounded-2xl shadow-md shadow-emerald-700/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Create Account & Continue</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-2 text-center text-xs text-neutral-500">
                Already registered?{' '}
                <button
                  id="btn-switch-to-login"
                  type="button"
                  onClick={() => switchMode('login')}
                  className="text-emerald-700 font-bold hover:underline cursor-pointer"
                >
                  Log in here
                </button>
              </div>
            </form>
          )}

          <div className="mt-5 pt-3 border-t border-neutral-100 text-center text-[11px] text-neutral-400 flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Secure 256-bit encrypted customer privacy</span>
          </div>
        </div>
      </div>
    </div>
  );
};
