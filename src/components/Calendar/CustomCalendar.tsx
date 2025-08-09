// src/components/Calendar/CustomCalendar.tsx
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  addDays, format, isSameMonth, isSameDay,
  addMonths, subMonths, compareAsc, isValid as isValidDate, parseISO
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { CalendarEvent } from '../../types';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

interface Props {
  onDateClick?: (date: Date) => void;
  events?: CalendarEvent[];
}

function safeParseISO(s?: string) {
  if (!s || typeof s !== 'string') return null;
  const d = parseISO(s);
  return isValidDate(d) ? d : null;
}

export default function CustomCalendar({ onDateClick, events = [] }: Props) {
  const BRAND = '#672C8E';
  const BRAND_DARK = '#4E1F6A';

  const [currentMonth, setCurrentMonth] = useState(new Date());

  const prettyMonth = format(currentMonth, 'MMMM yyyy', { locale: ptBR })
    .replace(/^./, (s) => s.toUpperCase());

  const renderHeader = () => (
    <div className="flex items-center justify-between mb-4">
      <div className="inline-flex items-center gap-2 rounded-xl bg-white shadow-sm ring-1 ring-black/5 px-3 py-2">
        <div
          className="inline-flex h-8 w-8 items-center justify-center rounded-full"
          style={{ backgroundColor: `${BRAND}1A`, color: BRAND }}
        >
          <CalendarIcon size={18} />
        </div>
        <h2 className="text-lg font-semibold text-[#2b2b2b]">{prettyMonth}</h2>
      </div>

      <div className="inline-flex items-center gap-2">
        <button
          aria-label="Mês anterior"
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
        >
          <ChevronLeft size={16} />
          Anterior
        </button>
        <button
          aria-label="Próximo mês"
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="inline-flex items-center gap-1 rounded-lg text-white px-3 py-2 text-sm shadow-sm hover:brightness-110 cursor-pointer"
          style={{ backgroundColor: BRAND }}
          onMouseDown={(e) => (e.currentTarget.style.backgroundColor = BRAND_DARK)}
          onMouseUp={(e) => (e.currentTarget.style.backgroundColor = BRAND)}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = BRAND)}
        >
          Próximo
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );

  const renderDaysOfWeek = () => {
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    return (
      <div
        className="grid grid-cols-7 text-center text-[13px] font-medium text-gray-700 rounded-t-2xl overflow-hidden"
        style={{ border: '1px solid #672C8E' }} // borda roxa no topo
      >
        {days.map((day) => (
          <div
            key={day}
            className="py-2 bg-gradient-to-b from-white to-[#faf7ff]"
          >
            {day}
          </div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

    const rows: JSX.Element[] = [];
    let days: JSX.Element[] = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = day;
        const isToday = isSameDay(day, new Date());
        const isCurrentMonth = isSameMonth(day, monthStart);

        // filtra só eventos com start válido e no mesmo dia
        const eventsForDay = events.filter((e) => {
          const d = safeParseISO(e.start);
          return d ? isSameDay(d, day) : false;
        });

        // ordena de forma segura (inválidos vão pro fim)
        const eventsForDaySorted = [...eventsForDay].sort((a, b) => {
          const da = safeParseISO(a.start);
          const db = safeParseISO(b.start);
          if (!da && !db) return 0;
          if (!da) return 1;
          if (!db) return -1;
          return compareAsc(da, db);
        });

        days.push(
          <motion.div
            key={day.toISOString()}
            onClick={() => onDateClick?.(cloneDay)}
            className={[
              'p-2 h-28 text-sm cursor-pointer rounded-lg transition-all',
              // Fundo e borda MAIS VISÍVEIS
              isCurrentMonth
                ? 'bg-[#f9f8fc] hover:bg-[#672C8E]/8'
                : 'bg-gray-100 text-gray-400',
              'border border-[#c6b8d8]',
              'flex flex-col items-start overflow-hidden'
            ].join(' ')}
            whileHover={{ scale: 1.02 }}
          >
            {/* número do dia com BORDA ROXA (apenas no dia de hoje) */}
            <span className="ml-1">
              <span
                className={[
                  'inline-flex items-center justify-center h-7 w-7 rounded-full font-semibold',
                  isToday
                    ? 'border-2 border-[#672C8E] text-[#672C8E] bg-white'
                    : 'text-gray-800'
                ].join(' ')}
              >
                {format(day, 'd')}
              </span>
            </span>

            {/* chips de eventos */}
            {eventsForDaySorted.slice(0, 3).map((event) => (
              <div
                key={event.id}
                className="mt-1 text-[11px] leading-4 bg-[#672C8E] text-white rounded px-2 py-1 truncate max-w-full shadow-sm"
                title={event.title}
              >
                {event.title}
              </div>
            ))}

            {eventsForDaySorted.length > 3 && (
              <div className="mt-auto text-[#672C8E] text-2xl font-bold mx-auto leading-tight">
                +{eventsForDaySorted.length - 3}
              </div>
            )}
          </motion.div>
        );
        day = addDays(day, 1);
      }

      rows.push(
        <div key={day.toISOString()} className="grid grid-cols-7 gap-1">
          {days}
        </div>
      );
      days = [];
    }

    return (
      <div
        className="rounded-b-2xl p-2 bg-white"
        style={{
          // contorno geral mais visível e alinhado à paleta
          border: '1px solid #c6b8d8',
          borderTop: 'none',
        }}
      >
        {rows}
      </div>
    );
  };

  return (
    <div className="w-full bg-white rounded-2xl shadow-sm ring-1 ring-black/5 p-4">
      {renderHeader()}
      {renderDaysOfWeek()}
      <AnimatePresence mode="wait">{renderCells()}</AnimatePresence>

      {/* legenda opcional */}
      <div className="mt-3 flex items-center gap-3 text-xs text-gray-600">
        <span className="inline-flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded-sm" style={{ backgroundColor: BRAND }} />
          Evento
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded-full border-2" style={{ borderColor: BRAND }} />
          Hoje
        </span>
      </div>
    </div>
  );
}
