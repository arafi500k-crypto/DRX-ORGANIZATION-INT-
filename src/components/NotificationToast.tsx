import React, { useEffect, useRef } from "react";
import { AlertCircle, CheckCircle2, X } from "lucide-react";

export interface ToastMessage {
  id: string;
  text: string;
  type: "success" | "error" | "info";
  duration?: number;
}

interface NotificationToastProps {
  toasts: ToastMessage[];
  onRemove: (id: string) => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({ toasts, onRemove }) => {
  return (
    <div className="fixed top-4 right-4 left-4 md:left-auto md:w-96 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onRemove: (id: string) => void }> = ({ toast, onRemove }) => {
  const onRemoveRef = useRef(onRemove);
  onRemoveRef.current = onRemove;

  useEffect(() => {
    const timer = setTimeout(() => {
      onRemoveRef.current(toast.id);
    }, toast.duration || 10000); // Default to exactly 10 seconds (10000 ms) as specified by the user

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration]);

  return (
    <div
      className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-xl transition-all duration-300 transform translate-y-0 opacity-100 bg-[#1f2937] text-white ${
        toast.type === "success"
          ? "border-emerald-500/30 shadow-emerald-500/10"
          : toast.type === "error"
          ? "border-red-500/30 shadow-red-500/10"
          : "border-blue-500/30 shadow-blue-500/10"
      }`}
    >
      <div className="mt-0.5">
        {toast.type === "success" ? (
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
        ) : toast.type === "error" ? (
          <AlertCircle className="w-5 h-5 text-red-400" />
        ) : (
          <AlertCircle className="w-5 h-5 text-sky-400" />
        )}
      </div>

      <div className="flex-1 text-sm font-medium leading-relaxed font-sans text-gray-100">
        {toast.text}
      </div>

      <button
        onClick={() => onRemove(toast.id)}
        className="text-gray-400 hover:text-white transition-colors p-0.5 rounded-lg hover:bg-gray-800"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
