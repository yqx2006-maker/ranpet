import { useEffect } from 'react';
import { Flame, X } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

export function Toast() {
  const toast = useAppStore((state) => state.toast);
  const dismiss = useAppStore((state) => state.dismissToast);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => dismiss(), 4200);
    return () => window.clearTimeout(timer);
  }, [toast, dismiss]);

  if (!toast) return null;

  return (
    <div className="toast" role="status">
      <div className="toast-icon">
        <Flame size={20} />
      </div>
      <div className="toast-copy">
        <strong>{toast.title}</strong>
        {toast.message ? <p>{toast.message}</p> : null}
      </div>
      <button className="toast-close" type="button" onClick={dismiss} aria-label="关闭提示">
        <X size={16} />
      </button>
    </div>
  );
}
