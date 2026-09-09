import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Lock, KeyRound, CheckCircle2, AlertCircle, Eye, EyeOff, ShieldCheck, Loader2 } from 'lucide-react';

export const AdminPasswordChange: React.FC = () => {
  const { changeAdminPassword, showToast } = useStore();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!currentPassword.trim()) {
      setErrorMessage('Please enter your current password.');
      return;
    }

    if (!newPassword.trim()) {
      setErrorMessage('Please enter a new password.');
      return;
    }

    if (newPassword.trim().length < 4) {
      setErrorMessage('New password must be at least 4 characters long.');
      return;
    }

    if (!confirmPassword.trim()) {
      setErrorMessage('Please confirm your new password.');
      return;
    }

    if (newPassword.trim() !== confirmPassword.trim()) {
      setErrorMessage('New password and confirmation must match.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await changeAdminPassword(currentPassword.trim(), newPassword.trim());
      if (result.success) {
        setSuccessMessage('Admin password changed successfully.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setErrorMessage(result.message || 'Failed to update admin password.');
      }
    } catch {
      setErrorMessage('An unexpected error occurred while updating the password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      id="admin-password-change-section"
      className="bg-neutral-950 p-5 rounded-2xl border border-neutral-800 space-y-4 text-xs"
    >
      <div className="flex items-center gap-2.5 pb-2 border-b border-neutral-800">
        <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
          <KeyRound className="w-4 h-4" />
        </div>
        <div>
          <h3 className="font-bold text-white text-sm">Change Admin Password</h3>
          <p className="text-[11px] text-neutral-400">
            Secure administrative console credentials. Passwords are cryptographically hashed using SHA-256.
          </p>
        </div>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div
          id="admin-pwd-success-alert"
          className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs font-medium flex items-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Error Notification */}
      {errorMessage && (
        <div
          id="admin-pwd-error-alert"
          className="p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs font-medium flex items-center gap-2"
        >
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5">
        {/* Current Password */}
        <div>
          <label className="block font-bold text-neutral-300 mb-1">
            Current Admin Password <span className="text-rose-400">*</span>
          </label>
          <div className="flex items-center rounded-xl bg-neutral-900 border border-neutral-700 px-3 py-2 focus-within:border-emerald-500">
            <Lock className="w-3.5 h-3.5 text-neutral-500 mr-2 shrink-0" />
            <input
              id="admin-current-password-input"
              type={showCurrent ? 'text' : 'password'}
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              className="w-full bg-transparent text-white placeholder-neutral-600 focus:outline-none text-xs"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="text-neutral-500 hover:text-neutral-300 p-1 focus:outline-none cursor-pointer"
              title={showCurrent ? 'Hide password' : 'Show password'}
            >
              {showCurrent ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* New Password & Confirm Password */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-bold text-neutral-300 mb-1">
              New Admin Password <span className="text-rose-400">*</span>
            </label>
            <div className="flex items-center rounded-xl bg-neutral-900 border border-neutral-700 px-3 py-2 focus-within:border-emerald-500">
              <Lock className="w-3.5 h-3.5 text-neutral-500 mr-2 shrink-0" />
              <input
                id="admin-new-password-input"
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full bg-transparent text-white placeholder-neutral-600 focus:outline-none text-xs"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="text-neutral-500 hover:text-neutral-300 p-1 focus:outline-none cursor-pointer"
                title={showNew ? 'Hide password' : 'Show password'}
              >
                {showNew ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block font-bold text-neutral-300 mb-1">
              Confirm New Password <span className="text-rose-400">*</span>
            </label>
            <div className="flex items-center rounded-xl bg-neutral-900 border border-neutral-700 px-3 py-2 focus-within:border-emerald-500">
              <Lock className="w-3.5 h-3.5 text-neutral-500 mr-2 shrink-0" />
              <input
                id="admin-confirm-password-input"
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full bg-transparent text-white placeholder-neutral-600 focus:outline-none text-xs"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="text-neutral-500 hover:text-neutral-300 p-1 focus:outline-none cursor-pointer"
                title={showConfirm ? 'Hide password' : 'Show password'}
              >
                {showConfirm ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-1.5 text-[10px] text-neutral-500 font-mono">
            <ShieldCheck className="w-3 h-3 text-emerald-500" />
            <span>Encrypted with SHA-256</span>
          </div>

          <button
            id="btn-submit-change-admin-password"
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {isLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5" />
            )}
            <span>{isLoading ? 'Updating...' : 'Update Password'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
