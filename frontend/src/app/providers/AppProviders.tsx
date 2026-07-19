import { useState, type ReactNode } from 'react';
import { ToastContext, type Toast } from '../../hooks/useToast';
import { SettingsProvider } from './SettingsContext';

export function AppProviders({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = (message: string, type: Toast['type'] = 'success') => {
    setToasts((items) => [...items, { message, type }]);
    setTimeout(() => setToasts((items) => items.slice(1)), 2800);
  };

  return (
    <SettingsProvider>
      <ToastContext.Provider value={{ push }}>
        {children}
        <div className="fixed right-5 top-5 z-100 space-y-2">
          {toasts.map((toast, index) => (
            <div
              key={`${toast.message}-${index}`}
              className={`rounded-xl px-4 py-3 text-sm font-medium text-white shadow-xl ${
                toast.type === 'success' ? 'bg-slate-900' : 'bg-rose-600'
              }`}
            >
              {toast.message}
            </div>
          ))}
        </div>
      </ToastContext.Provider>
    </SettingsProvider>
  );
}
