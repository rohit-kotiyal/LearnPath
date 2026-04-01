import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import ToastContainer from '../ui/ToastContainer';
import { ToastProps } from '../ui/Toast';
 
type ToastType = Omit<ToastProps, 'id' | 'onClose'>;
 
interface ToastContextType {
  showToast: (toast: ToastType) => void;
}
 
const ToastContext = createContext<ToastContextType | undefined>(undefined);
 
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastProps[]>([]);
 
  const showToast = useCallback((toast: ToastType) => {
    const id = uuidv4();
    setToasts((prev) => [...prev, { ...toast, id, onClose: removeToast }]);
  }, []);
 
  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);
 
  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </ToastContext.Provider>
  );
}
 
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}