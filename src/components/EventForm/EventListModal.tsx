// src/components/EventForm/EventListModal.tsx
import { useEffect, useMemo, useRef } from 'react';
import type { CalendarEvent } from '../../types';
import { format, parseISO, compareAsc, isValid as isValidDate } from 'date-fns';
import { Pencil, Trash2, CalendarDays, Clock, X } from 'lucide-react';
import { prettyTimeRangeLabel } from '../../utils/periods';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  events: CalendarEvent[];
  date: Date;
  onDelete?: (id: string) => void;
  onEdit?: (event: CalendarEvent) => void;
  isClientView?: boolean;
}

function safeParseISO(s?: string) {
  if (!s || typeof s !== 'string') return null;
  const d = parseISO(s);
  return isValidDate(d) ? d : null;
}

function safeFormat(d: Date | null, pattern: string) {
  if (!d || !isValidDate(d)) return '--:--';
  try {
    return format(d, pattern);
  } catch {
    return '--:--';
  }
}

export default function EventListModal({
  isOpen,
  onClose,
  events,
  date,
  onDelete,
  onEdit,
  isClientView = false,
}: Props) {
  const BRAND = '#672C8E';
  const BRAND_DARK = '#4E1F6A';

  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    setTimeout(() => closeBtnRef.current?.focus(), 0);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  const safeDate = isValidDate(date) ? date : new Date();

  const sameDayISO = (d: Date) => format(d, 'yyyy-MM-dd');

  const dayEvents = useMemo(() => {
    const target = sameDayISO(safeDate);
    return events.filter((ev) => {
      const d = safeParseISO(ev.start);
      return d && sameDayISO(d) === target;
    });
  }, [events, safeDate]);

  const dayEventsSorted = useMemo(() => {
    return [...dayEvents].sort((a, b) => {
      const da = safeParseISO(a.start);
      const db = safeParseISO(b.start);
      if (!da && !db) return 0;
      if (!da) return 1;
      if (!db) return -1;
      return compareAsc(da, db);
    });
  }, [dayEvents]);

  const formattedDate = format(safeDate, 'dd/MM/yyyy');

  const titleText = isClientView
    ? dayEventsSorted.length === 0
      ? `Nenhum agendamento encontrado para ${formattedDate}.`
      : `Há ${dayEventsSorted.length} agendamento${dayEventsSorted.length > 1 ? 's' : ''} neste dia.`
    : dayEventsSorted.length === 0
      ? `Você não tem nenhum agendamento no dia ${formattedDate}`
      : `Você tem ${dayEventsSorted.length} agendamento${dayEventsSorted.length > 1 ? 's' : ''} no dia ${formattedDate}`;

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/30 backdrop-blur-[2px] flex items-center justify-center z-50 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="eventlist-title"
    >
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl ring-1 ring-black/5 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div
              className="inline-flex h-8 w-8 items-center justify-center rounded-full"
              style={{ backgroundColor: `${BRAND}1A`, color: BRAND }}
            >
              <CalendarDays size={18} />
            </div>
            <h2 id="eventlist-title" className="text-lg font-semibold text-[#2b2b2b]">
              {titleText}
            </h2>
          </div>
          <button
            ref={closeBtnRef}
            onClick={onClose}
            aria-label="Fechar"
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4">
          {dayEventsSorted.length > 0 ? (
            <ul className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {dayEventsSorted.map((event) => {
                const startD = safeParseISO(event.start);
                const endD = safeParseISO(event.end);
                const startStr = safeFormat(startD, 'HH:mm');
                const endStr = safeFormat(endD, 'HH:mm');

                return (
                  <li
                    key={event.id}
                    className="p-4 rounded-xl bg-white border border-gray-200/80 hover:border-[#672C8E]/30 hover:shadow-sm transition group cursor-pointer"
                  >
                    <div className="flex justify-between items-start gap-3">
                      <div>
                        {/* Ícone + título */}
                        <div className="flex items-center gap-2 mb-1">
                          <CalendarDays size={18} className="text-[#672C8E]" />
                          <h3 className="text-base font-semibold text-[#672C8E]">
                            {event.title}
                          </h3>
                        </div>

                        {/* Horário (com rótulo de aula/intervalo) */}
                        <p className="mt-0.5 text-sm text-gray-600 inline-flex items-center gap-1">
                          <Clock size={16} className="opacity-80" />
                          {prettyTimeRangeLabel(startStr, endStr)}
                        </p>

                        {/* Descrição */}
                        {event.description && (
                          <p className="text-sm mt-1 text-gray-800">{event.description}</p>
                        )}
                      </div>

                      {!isClientView && (
                        <div className="flex gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition">
                          {onEdit && (
                            <button
                              onClick={() => onEdit(event)}
                              className="inline-flex p-2 rounded-md text-[#672C8E] hover:bg-[#672C8E]/10 cursor-pointer"
                              title="Editar"
                            >
                              <Pencil size={16} />
                            </button>
                          )}
                          {onDelete && (
                            <button
                              onClick={() => onDelete(event.id)}
                              className="inline-flex p-2 rounded-md text-red-600 hover:bg-red-50 cursor-pointer"
                              title="Excluir"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="rounded-xl border border-dashed border-gray-200 p-6 text-sm text-gray-600 text-center">
              Selecione outra data no calendário.
            </div>
          )}

          <div className="flex justify-end mt-6">
            <button
              onClick={onClose}
              className="px-5 py-2 text-sm font-semibold rounded-lg text-white shadow-sm hover:brightness-110 cursor-pointer"
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
    </div>
  );
}
