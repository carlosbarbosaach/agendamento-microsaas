// src/components/ConfirmModal.tsx
import { useEffect, useRef } from 'react';
import { AlertTriangle } from 'lucide-react';

type Variant = 'primary' | 'danger';

interface ConfirmModalProps {
  isOpen: boolean;
  title?: string;
  message?: string;
  onCancel: () => void;
  onConfirm: () => void;
  /** rótulos opcionais */
  cancelLabel?: string;
  confirmLabel?: string;
  /** define o estilo do CTA principal */
  variant?: Variant;
  /** se true, fecha ao clicar fora do card */
  closeOnBackdropClick?: boolean;
}

export default function ConfirmModal({
  isOpen,
  title = 'Confirmar ação',
  message = 'Tem certeza que deseja continuar?',
  onCancel,
  onConfirm,
  cancelLabel = 'Cancelar',
  confirmLabel = 'Confirmar',
  variant = 'primary',
  closeOnBackdropClick = true,
}: ConfirmModalProps) {
  const BRAND = '#672C8E';     // roxo Campeche
  const BRAND_DARK = '#4E1F6A';

  const cancelRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    // foco inicial no "Cancelar"
    cancelRef.current?.focus();

    // teclado: Esc fecha, Enter confirma
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
      if (e.key === 'Enter') onConfirm();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onCancel, onConfirm]);

  if (!isOpen) return null;

  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!closeOnBackdropClick) return;
    if (e.target === e.currentTarget) onCancel();
  };

  const isDanger = variant === 'danger';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-[2px] px-4"
      onMouseDown={handleBackdrop}
      aria-modal="true"
      role="dialog"
      aria-labelledby="confirm-title"
      aria-describedby="confirm-message"
    >
      <div
        ref={dialogRef}
        className="w-full max-w-sm rounded-2xl bg-white shadow-xl ring-1 ring-black/5 animate-[fadeIn_.15s_ease-out]"
      >
        {/* Cabeçalho */}
        <div className="flex items-center gap-3 border-b border-gray-100 px-5 py-4">
          {isDanger && (
            <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-red-50 text-red-600">
              <AlertTriangle size={18} />
            </div>
          )}
          <h3 id="confirm-title" className="text-base font-semibold text-gray-800">
            {title}
          </h3>
        </div>

        {/* Corpo */}
        <div className="px-5 py-4">
          <p id="confirm-message" className="text-sm text-gray-600">
            {message}
          </p>
        </div>

        {/* Ações */}
        <div className="flex justify-end gap-2 px-5 pb-5">
          <button
            ref={cancelRef}
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 cursor-pointer"
          >
            {cancelLabel}
          </button>

          <button
            onClick={onConfirm}
            className={[
              'px-4 py-2 text-sm font-semibold rounded-lg text-white focus:outline-none focus:ring-2 cursor-pointer',
              isDanger
                ? 'bg-red-600 hover:bg-red-700 focus:ring-red-300'
                : 'hover:brightness-110',
            ].join(' ')}
            style={isDanger ? undefined : { backgroundColor: BRAND }}
            onMouseDown={(e) => {
              if (!isDanger) e.currentTarget.style.backgroundColor = BRAND_DARK;
            }}
            onMouseUp={(e) => {
              if (!isDanger) e.currentTarget.style.backgroundColor = BRAND;
            }}
            onMouseLeave={(e) => {
              if (!isDanger) e.currentTarget.style.backgroundColor = BRAND;
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
