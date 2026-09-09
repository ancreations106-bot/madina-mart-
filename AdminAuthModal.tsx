import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Shield, Lock, User as UserIcon, X, CheckCircle2, AlertCircle, Eye, EyeOff, Loader2 } from 'lucide-react';

export const AdminAuthModal: React.FC = () => {
  const { isAdminOpen, setIsAdminOpen, adminUser, loginAdmin } = useStore();

  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isAdminOpen) return null;

  // If already logged in, the AdminDashboard will be displayed inside App.tsx or inside this container
  if (adminUser) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!username.trim() || !pin.trim()) {
      setErrorMsg('Please enter both Admin Username and Password');
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await loginAdmin(username, pin);
      if (!success) {
        setErrorMsg('Invalid administrative credentials. Access denied.');
      }
    } catch {
      setErrorMsg('An error occurred during authentication. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        id="admin-login-modal"
        className="bg-neutral-900 text-neutral-100 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-neutral-800 animate-in zoom-in-95"
      >
        {/* Dark Administrative Header */}
        <div className="bg-gradient-to-r from-neutral-950 via-neutral-900 to-neutral-950 px-6 py-5 border-b border-neutral-800 relative">
          <button
            onClick={() => setIsAdminOpen(false)}
            className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1 rounded-full hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span className="text-[11px] font-mono tracking-widest text-emerald-400 font-bold uppercase">
              Madina Mart Internal Console
            </span>
          </div>
          <h2 className="text-xl font-black font-['Outfit',sans-serif] flex items-center gap-2 text-white">
            <Shield className="w-5 h-5 text-emerald-400" />
            <span>Store Admin Login</span>
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Authorized store staff & catalog managers only. Customer accounts cannot access this portal.
          </p>
        </div>

        <div className="p-6">
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
                Administrator Username
              </label>
              <div className="flex items-center rounded-2xl bg-neutral-950 border border-neutral-700 px-3.5 py-2.5 focus-within:border-emerald-500">
                <UserIcon className="w-4 h-4 text-neutral-500 mr-2 shrink-0" />
                <input
                  id="admin-username-input"
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="Enter username"
                  autoFocus
                  className="w-full bg-transparent text-sm text-white placeholder-neutral-600 focus:outline-none font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
                Admin Password
              </label>
              <div className="flex items-center rounded-2xl bg-neutral-950 border border-neutral-700 px-3.5 py-2.5 focus-within:border-emerald-500">
                <Lock className="w-4 h-4 text-neutral-500 mr-2 shrink-0" />
                <input
                  id="admin-pin-input"
                  type={showPassword ? 'text' : 'password'}
                  value={pin}
                  onChange={e => setPin(e.target.value)}
                  placeholder="Enter password"
                  className="w-full bg-transparent text-sm text-white placeholder-neutral-600 focus:outline-none tracking-normal"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-neutral-500 hover:text-neutral-300 p-1 focus:outline-none cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              id="btn-admin-submit-login"
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm rounded-2xl shadow-lg shadow-emerald-950 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              <span>{isSubmitting ? 'Verifying...' : 'Verify & Access Console'}</span>
            </button>
          </form>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setIsAdminOpen(false)}
              className="text-xs text-neutral-500 hover:text-neutral-300 underline"
            >
              Return to Customer Store
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
