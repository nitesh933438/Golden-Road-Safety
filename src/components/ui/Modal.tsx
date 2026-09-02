import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import { X } from "lucide-react";
import { cn } from "../../lib/utils";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  position?: 'centered' | 'top-right';
}

export function Modal({ isOpen, onClose, title, children, position = 'centered' }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      const handleEsc = (e: KeyboardEvent) => {
        if (e.key === "Escape") onClose();
      };
      window.addEventListener("keydown", handleEsc);
      return () => {
        document.body.style.overflow = "";
        window.removeEventListener("keydown", handleEsc);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className={cn(
      "fixed inset-0 z-[9999] flex p-0 animate-in fade-in duration-200",
      position === 'centered' ? "items-center justify-center sm:p-4" : "items-start justify-end sm:pt-20 sm:pr-4"
    )}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className={cn(
        "relative w-full h-[100dvh] sm:h-auto sm:max-h-[80vh] sm:max-w-md bg-white dark:bg-surface-950 sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200",
        position === 'top-right' && "sm:min-w-[320px] sm:w-auto"
      )}>
        <div className="flex-none flex items-center justify-between p-4 border-b border-surface-200 dark:border-surface-800">
          <h2 className="text-lg font-bold text-surface-950 dark:text-white">{title}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors">
            <X className="w-6 h-6 text-surface-500" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
