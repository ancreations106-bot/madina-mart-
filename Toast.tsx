import React from 'react';
import { useStore } from '../../context/StoreContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useStore();

  if (toasts.length === 0) return null;

  return (
    <div id="toast-container" className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 w-[92%] max-w-sm pointer-events-none">
      {toasts.map(toast => (
        <div
          key={toast.id}
          id={`toast-${toast.id}`}
          className={`pointer-events-auto flex items-center justify-between px-3.5 py-2.5 rounded-xl shadow-lg border text-sm font-medium transition-all duration-300 animate-in fade-in slide-in-from-top-3 ${
            toast.type === 'success'
              ? 'bg-emerald-900/95 text-white border-emerald-700/50'
              : toast.type === 'error'
              ? 'bg-rose-900/95 text-white border-rose-700/50'
              : toast.type === 'warning'
              ? 'bg-amber-900/95 text-white border-amber-700/50'
              : 'bg-neutral-900/95 text-white border-neutral-700/50'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
            {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
            {toast.type === 'warning' && <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />}
            {toast.type === 'info' && <Info className="w-4 h-4 text-sky-400 shrink-0" />}
            <span className="leading-tight">{toast.message}</span>
          </div>
          <button
            id={`btn-close-toast-${toast.id}`}
            onClick={() => removeToast(toast.id)}
            className="text-neutral-400 hover:text-white p-1 ml-2 transition-colors"
            aria-label="Close notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};

export const Toast = ToastContainer;
