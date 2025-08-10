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
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const prettyMonth = format(currentMonth, 'MMMM yyyy', { locale: ptBR })
    .replace(/^./, (s) => s.toUpperCase());

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    onDateClick?.(date);
  };

  const renderHeader = () => (
    <div className="flex items-center justify-between mb-3 sm:mb-4">
      {/* Mês */}
      <div className="inline-flex items-center gap-2 rounded-lg sm:rounded-xl bg-white shadow-sm ring-1 ring-black/5 px-2.5 py-1.5 sm:px-3 sm:py-2">
        <div
          className="inline-flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full"
          style={{ backgroundColor: `${BRAND}1A`, color: BRAND }}
        >
          <CalendarIcon size={16} className="sm:hidden" />
          <CalendarIcon size={18} className="hidden sm:block" />
        </div>
        <h2 className="text-base sm:text-lg font-semibold text-[#2b2b2b]">{prettyMonth}</h2>
      </div>

      {/* Navegação */}
      <div className="inline-flex items-center gap-1.5 sm:gap-2">
        <button
          aria-label="Mês anterior"
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="inline-flex items-center gap-1 rounded-md sm:rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
        >
          <ChevronLeft size={16} />
          <span className="hidden sm:inline">Anterior</span>
        </button>
        <button
          aria-label="Próximo mês"
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="inline-flex items-center gap-1 rounded-md sm:rounded-lg text-white px-2 py-1.5 text-sm shadow-sm hover:brightness-110 cursor-pointer"
          style={{ backgroundColor: BRAND }}
          onMouseDown={(e) => (e.currentTarget.style.backgroundColor = BRAND_DARK)}
          onMouseUp={(e) => (e.currentTarget.style.backgroundColor = BRAND)}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = BRAND)}
        >
          <span className="hidden sm:inline">Próximo</span>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );

  const renderDaysOfWeek = () => {
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    return (
      <div
        className="grid grid-cols-7 text-center text-[12px] sm:text-[13px] font-medium text-gray-700 rounded-t-xl sm:rounded-t-2xl overflow-hidden"
        style={{ border: '1px solid #672C8E' }}
      >
        {days.map((day) => (
          <div key={day} className="py-1.5 sm:py-2 bg-gradient-to-b from-white to-[#faf7ff]">
            {day}
          </div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    theMonth: {
    }
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

    const rows: React.ReactNode[] = [];
    let days: React.ReactNode[] = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = day;
        const isToday = isSameDay(day, new Date());
        const isCurrentMonth = isSameMonth(day, monthStart);
        const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;

        // eventos do dia (safe)
        const eventsForDay = events.filter((e) => {
          const d = safeParseISO(e.start);
          return d ? isSameDay(d, day) : false;
        });

        // ordenação segura
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
            onClick={() => handleDateClick(cloneDay)}
            className={[
              // dimensões responsivas
              'p-1.5 sm:p-2 h-20 sm:h-28 text-xs sm:text-sm cursor-pointer rounded-md sm:rounded-lg transition-all',
              // fundo e borda (seleção = roxo sólido)
              isCurrentMonth
                ? (isSelected ? 'bg-[#672C8E] text-white' : 'bg-[#f9f8fc] hover:bg-[#672C8E]/8')
                : 'bg-gray-100 text-gray-400',
              'border border-[#c6b8d8]',
              'flex flex-col items-start overflow-hidden'
            ].join(' ')}
            whileHover={{ scale: 1.02 }}
          >
            {/* número do dia:
                - se for HOJE e NÃO estiver selecionado: borda roxa na bolinha
                - se estiver selecionado: sem bolinha especial (fundo já é roxo) */}
            <span className="ml-0.5 sm:ml-1">
              <span
                className={[
                  'inline-flex items-center justify-center rounded-full font-semibold',
                  'h-6 w-6 sm:h-7 sm:w-7',
                  isToday && !isSelected
                    ? 'border-2 border-[#672C8E] text-[#672C8E] bg-white'
                    : (isSelected ? 'text-white' : 'text-gray-800')
                ].join(' ')}
              >
                {format(day, 'd')}
              </span>
            </span>

            {/* chips de eventos (2 no mobile, 3 no desktop) com contraste no selecionado */}
            {eventsForDaySorted.slice(0, 2).map((event) => (
              <div
                key={event.id}
                className={`mt-1 text-[10px] sm:text-[11px] leading-4 rounded px-1.5 sm:px-2 py-0.5 sm:py-1 truncate max-w-full shadow-sm ${isSelected ? 'bg-white text-[#672C8E]' : 'bg-[#672C8E] text-white'
                  }`}
                title={event.title}
              >
                {event.title}
              </div>
            ))}
            {eventsForDaySorted[2] && (
              <div
                key={`${eventsForDaySorted[2].id}-third`}
                className={`hidden sm:block mt-1 text-[11px] leading-4 rounded px-2 py-1 truncate max-w-full shadow-sm ${isSelected ? 'bg-white text-[#672C8E]' : 'bg-[#672C8E] text-white'
                  }`}
                title={eventsForDaySorted[2].title}
              >
                {eventsForDaySorted[2].title}
              </div>
            )}

            {/* contador extra */}
            {eventsForDaySorted.length > 3 && (
              <div
                className={`mt-auto text-xl sm:text-2xl font-bold mx-auto leading-tight ${isSelected ? 'text-white' : 'text-[#672C8E]'
                  }`}
              >
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
        className="rounded-b-xl sm:rounded-b-2xl p-2 bg-white"
        style={{
          border: '1px solid #c6b8d8',
          borderTop: 'none',
        }}
      >
        {rows}
      </div>
    );
  };

  return (
    <div className="w-full bg-white rounded-xl sm:rounded-2xl shadow-sm ring-1 ring-black/5 p-3 sm:p-4">
      {renderHeader()}
      {renderDaysOfWeek()}
      <AnimatePresence mode="wait">{renderCells()}</AnimatePresence>
    </div>
  );
}
