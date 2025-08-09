// src/components/Feedback/SuccessModal.tsx
import { useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircle2, X } from 'lucide-react';

interface SuccessModalProps {
  isOpen: boolean;
  title?: string;
  message: string;
  onClose: () => void;
  autoCloseMs?: number; // fecha sozinho após X ms
}

export default function SuccessModal({
  isOpen,
  title = 'Tudo certo!',
  message,
  onClose,
  autoCloseMs,
}: SuccessModalProps) {
  const BRAND = '#672C8E';
  const BRAND_DARK = '#4E1F6A';

  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const [startTs, setStartTs] = useState<number | null>(null);
  const [now, setNow] = useState<number>(Date.now());

  // Timer de fechamento automático + barra de progresso suave
  useEffect(() => {
    if (!isOpen || !autoCloseMs) return;
    setStartTs(Date.now());
    const t = setTimeout(onClose, autoCloseMs);
    const raf = setInterval(() => setNow(Date.now()), 50);
    return () => {
      clearTimeout(t);
      clearInterval(raf);
    };
  }, [isOpen, autoCloseMs, onClose]);

  const progress = useMemo(() => {
    if (!autoCloseMs || !startTs) return 0;
    const elapsed = Math.min(now - startTs, autoCloseMs);
    return (elapsed / autoCloseMs) * 100;
  }, [autoCloseMs, startTs, now]);

  // Acessibilidade: foco e tecla Esc
  useEffect(() => {
    if (!isOpen) return;
    setTimeout(() => closeBtnRef.current?.focus(), 0);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-[2px] px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="success-title"
      aria-describedby="success-message"
    >
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-black/5 animate-[fadeIn_.15s_ease-out]">
        {/* Header */}
        <div className="flex items-start gap-3 px-5 pt-5">
          <div
            className="flex-shrink-0 inline-flex h-10 w-10 items-center justify-center rounded-full"
            style={{ backgroundColor: `${BRAND}1A`, color: BRAND }}
          >
            <CheckCircle2 size={22} />
          </div>

          <div className="flex-1">
            <h3 id="success-title" className="text-lg font-semibold text-[#2b2b2b]">
              {title}
            </h3>
            <p id="success-message" className="mt-1 text-sm text-gray-700">
              {message}
            </p>
          </div>

          <button
            ref={closeBtnRef}
            onClick={onClose}
            aria-label="Fechar"
            className="mt-1 rounded-lg p-2 text-gray-500 hover:bg-gray-100 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Progress bar (aparece só quando autoCloseMs existe) */}
        {autoCloseMs ? (
          <div className="mx-5 mt-4 h-1.5 w-auto rounded-full bg-gray-100 overflow-hidden">
            <div
              className="h-full rounded-full transition-[width] duration-75"
              style={{ width: `${progress}%`, backgroundColor: BRAND }}
            />
          </div>
        ) : null}

        {/* Footer */}
        <div className="flex justify-end px-5 py-5">
          <button
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-lg px-5 py-2 text-sm font-semibold text-white shadow-sm hover:brightness-110 cursor-pointer"
            style={{ backgroundColor: BRAND }}
            onMouseDown={(e) => (e.currentTarget.style.backgroundColor = BRAND_DARK)}
            onMouseUp={(e) => (e.currentTarget.style.backgroundColor = BRAND)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = BRAND)}
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
