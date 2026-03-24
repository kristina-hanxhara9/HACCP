import { Modal } from './Modal';
import { AlertTriangle } from 'lucide-react';
import { useState } from 'react';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning';
  requireTyping?: string;
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Konfirmo',
  cancelLabel = 'Anulo',
  variant = 'danger',
  requireTyping,
}: ConfirmDialogProps) {
  const [typed, setTyped] = useState('');

  const canConfirm = !requireTyping || typed === requireTyping;

  return (
    <Modal open={open} onClose={onClose} size="sm" preventBackdropClose>
      <div className="text-center">
        <div className={`w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center ${variant === 'danger' ? 'bg-[#fef2f2] text-[#dc2626]' : 'bg-[#fffbeb] text-[#d97706]'}`}>
          <AlertTriangle size={24} />
        </div>
        <h3 className="text-lg font-semibold text-[#0f172a] mb-2">{title}</h3>
        <p className="text-sm text-[#64748b] mb-6">{message}</p>
        {requireTyping && (
          <div className="mb-6">
            <p className="text-sm text-[#64748b] mb-2">Shkruaj <span className="font-mono font-bold text-[#dc2626]">{requireTyping}</span> per te konfirmuar:</p>
            <input
              type="text"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              className="w-full px-3 py-2 border border-[#e2e8f0] rounded-lg text-center font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#dc2626] focus:border-transparent"
            />
          </div>
        )}
        <div className="flex gap-3 justify-center">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-[#64748b] bg-[#f1f5f9] rounded-lg hover:bg-[#e2e8f0] transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={() => { onConfirm(); setTyped(''); }}
            disabled={!canConfirm}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variant === 'danger' ? 'bg-[#dc2626] hover:bg-[#b91c1c]' : 'bg-[#d97706] hover:bg-[#b45309]'}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
