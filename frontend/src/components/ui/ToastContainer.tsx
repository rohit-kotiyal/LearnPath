import Toast, { ToastProps } from './Toast';
 
interface ToastContainerProps {
  toasts: ToastProps[];
  onClose: (id: string) => void;
}
 
export default function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onClose={onClose} />
      ))}
    </div>
  );
}