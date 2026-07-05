import React from "react";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Ya, Lanjutkan",
  cancelText = "Batal",
  isDanger = false,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 border border-border">
        <div className={`p-4 border-b border-border flex items-center justify-between ${isDanger ? 'bg-maroon-50' : 'bg-surface-sunken'}`}>
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDanger ? 'bg-maroon-100 text-maroon-500' : 'bg-navy-100 text-navy-500'}`}>
              <AlertTriangle size={18} />
            </div>
            <h3 className="font-display font-bold text-slate-800 text-sm">
              {title}
            </h3>
          </div>
          <button onClick={onCancel} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={18} />
          </button>
        </div>
        
        <div className="p-5">
          <p className="text-sm text-slate-600 leading-relaxed">
            {message}
          </p>
        </div>
        
        <div className="p-4 bg-surface-sunken border-t border-border flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-xl text-xs font-bold text-white shadow-sm transition-colors ${
              isDanger ? 'bg-maroon-500 hover:bg-maroon-600' : 'bg-navy-500 hover:bg-navy-600'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
