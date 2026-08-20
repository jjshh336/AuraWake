import { useEffect } from 'react';
import { ToastMessage } from '../types';
import { CheckCircle2, Info, AlertCircle, X } from 'lucide-react';

interface ToastProps {
  toast: ToastMessage | null;
  onClose: () => void;
}

export function Toast({ toast, onClose }: ToastProps) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, 3200);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
    info: <Info className="w-5 h-5 text-indigo-600 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />,
  };

  const bgStyles = {
    success: 'bg-emerald-50 border-emerald-200 text-emerald-950',
    info: 'bg-indigo-50 border-indigo-200 text-indigo-950',
    error: 'bg-rose-50 border-rose-200 text-rose-950',
  };

  return (
    <div
      id="toast-notification"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-5"
    >
      <div className={`flex items-center gap-3 px-1 ${bgStyles[toast.type]}`}>
        {icons[toast.type]}
        <p className="text-sm font-medium pr-2">{toast.message}</p>
        <button
          id="toast-close-button"
          onClick={onClose}
          className="text-stone-400 hover:text-stone-700 p-1 rounded-md transition-colors"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
