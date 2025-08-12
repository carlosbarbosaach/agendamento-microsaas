// src/components/Calendar/CustomCalendar.tsx
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  addDays, addMonths, subMonths,
  isSameMonth, isSameDay, format,
  parseISO, compareAsc, isValid as isValidDate
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useMemo, useState } from 'react';
import type { CalendarEvent } from '../../types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  onDateClick?: (date: Date) => void;
  events?: CalendarEvent[];
}

const BRAND = '#672C8E';      // roxo do colégio
const BRAND_DARK = '#4E1F6A';
const SEL_BORDER = '#8FA396'; // verde (sua paleta)
const SEL_BG = '#EAF3EF';     // verde bem claro para seleção

function safeParseISO(s?: string) {
  if (!s || typeof s !== 'string') return null;
  const d = parseISO(s);
  return isValidDate(d) ? d : null;
}

export default function CustomCalendar({ onDateClick, events = [] }: Props) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const prettyMonth = useMemo(
    () =>
      format(currentMonth, 'MMMM yyyy', { locale: ptBR })
        .replace(/^./, (s) => s.toUpperCase()),
    [currentMonth]
  );

  // Agrupa eventos por dia para lookup rápido
  const eventsByDay = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const ev of events) {
      const d = safeParseISO(ev.start);
      if (!d) continue;
      const key = format(d, 'yyyy-MM-dd');
      const arr = map.get(key) ?? [];
      arr.push(ev);
      map.set(key, arr);
    }
    // ordena por horário
    for (const [k, arr] of map) {
      arr.sort((a, b) => {
        const da = safeParseISO(a.start);
        const db = safeParseISO(b.start);
        if (!da && !db) return 0;
        if (!da) return 1;
        if (!db) return -1;
        return compareAsc(da, db);
      });
      map.set(k, arr);
    }
    return map;
  }, [events]);

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    onDateClick?.(date);
  };

  const renderHeader = () => (
    <div className="relative flex items-center justify-between mb-3">
      {/* Navegação à esquerda */}
      <div className="flex items-center gap-2">
        <button
          aria-label="Mês anterior"
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="inline-flex items-center justify-center h-9 w-9 rounded-full text-[#2b2b2b] hover:bg-black/5 cursor-pointer"
        >
          <ChevronLeft size={18} />
        </button>

        {/* Botão Hoje (opcional) */}
        <button
          onClick={() => setCurrentMonth(new Date())}
          className="px-3 py-1.5 rounded-lg text-sm border border-gray-300 hover:bg-gray-50 cursor-pointer"
          aria-label="Ir para o mês atual"
        >
          Hoje
        </button>
      </div>

      {/* Mês atual */}
      <h2 className="text-lg sm:text-xl font-semibold text-[#2b2b2b]">
        {prettyMonth}
      </h2>

      {/* Próximo mês */}
      <button
        aria-label="Próximo mês"
        onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
        className="inline-flex items-center justify-center h-9 w-9 rounded-full text-white hover:brightness-110 cursor-pointer"
        style={{ backgroundColor: BRAND }}
        onMouseDown={(e) => (e.currentTarget.style.backgroundColor = BRAND_DARK)}
        onMouseUp={(e) => (e.currentTarget.style.backgroundColor = BRAND)}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = BRAND)}
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );

  const renderDaysOfWeek = () => {
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    return (
      <div className="grid grid-cols-7 text-center text-[11px] sm:text-[12px] font-medium text-gray-500 mb-1">
        {days.map((d) => (
          <div key={d} className="py-1 uppercase tracking-wide">{d}</div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

    const rows: React.ReactNode[] = [];
    let cells: React.ReactNode[] = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const clone = day;
        const inMonth = isSameMonth(day, monthStart);
        const isToday = isSameDay(day, new Date());
        const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;

        const key = format(day, 'yyyy-MM-dd');
        const count = eventsByDay.get(key)?.length ?? 0;
        const hasEvents = count > 0;

        // Estilos do "botão do dia"
        const circleClass = [
          'relative flex items-center justify-center rounded-full text-sm font-semibold h-9 w-9 sm:h-10 sm:w-10 transition',
          inMonth ? 'cursor-pointer' : 'cursor-default',
          !inMonth
            ? 'text-gray-300'
            : isSelected
              // SELEÇÃO ➜ verde suave (não roxo)
              ? `bg-[${SEL_BG}] text-[#2b2b2b] border-2`
              : isToday
                // HOJE ➜ borda roxa e texto roxo
                ? `border-2 text-[${BRAND}]`
                : 'text-gray-800 hover:bg-black/5'
        ].join(' ');

        // Borda manual para casos com var() dinâmica
        const circleStyle: React.CSSProperties = {};
        if (isSelected) {
          circleStyle.borderColor = SEL_BORDER;
          circleStyle.backgroundColor = SEL_BG;
        } else if (isToday && inMonth && !isSelected) {
          circleStyle.borderColor = BRAND;
          circleStyle.backgroundColor = '#ffffff';
        }

        cells.push(
          <div key={day.toISOString()} className="flex flex-col items-center justify-center h-12 sm:h-14">
            <button
              role="gridcell"
              aria-current={isToday ? 'date' : undefined}
              aria-label={
                `${format(day, "d 'de' MMMM 'de' yyyy", { locale: ptBR })}` +
                (hasEvents ? ` — ${count} agendamento${count > 1 ? 's' : ''}` : '')
              }
              onClick={() => inMonth && handleDateClick(clone)}
              disabled={!inMonth}
              className={circleClass}
              style={circleStyle}
              title={
                hasEvents
                  ? `${count} agendamento${count > 1 ? 's' : ''}`
                  : undefined
              }
            >
              {format(day, 'd')}
            </button>

            {/* Indicador sutil: ponto roxo para HOJE (sempre visível) */}
            {isToday && (
              <div
                className="mt-0.5 h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: BRAND }}
                aria-hidden="true"
              />
            )}

            {/* Indicador de eventos: ponto cinza (quando não é hoje) */}
            {!isToday && hasEvents && (
              <div
                className="mt-0.5 h-1.5 w-1.5 rounded-full bg-gray-300"
                aria-hidden="true"
              />
            )}
          </div>
        );

        day = addDays(day, 1);
      }

      rows.push(
        <div key={day.toISOString()} className="grid grid-cols-7">
          {cells}
        </div>
      );
      cells = [];
    }

    return <div role="grid">{rows}</div>;
  };

  return (
    <div className="w-full bg-white rounded-2xl shadow-sm ring-1 ring-black/5 p-4">
      {renderHeader()}
      {renderDaysOfWeek()}
      {renderCells()}
    </div>
  );
}
