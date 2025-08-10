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

const BRAND = '#672C8E';    // roxo do colégio
const BRAND_DARK = '#4E1F6A';

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
      <button
        aria-label="Mês anterior"
        onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
        className="inline-flex items-center justify-center h-9 w-9 rounded-full text-[#2b2b2b] hover:bg-black/5 cursor-pointer"
      >
        <ChevronLeft size={18} />
      </button>

      <h2 className="text-lg sm:text-xl font-semibold text-[#2b2b2b]">
        {prettyMonth}
      </h2>

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
    // nomes em PT-BR (curtos, sem ponto)
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

        const circleClass = [
          'flex items-center justify-center rounded-full text-sm font-semibold h-9 w-9 sm:h-10 sm:w-10 transition',
          inMonth ? 'cursor-pointer' : 'cursor-default',
          !inMonth
            ? 'text-gray-300'
            : isSelected || hasEvents
              ? 'bg-[#672C8E] text-white'
              : isToday
                ? 'border-2 border-[#672C8E] text-[#672C8E] bg-white'
                : 'text-gray-800 hover:bg-black/5'
        ].join(' ');

        cells.push(
          <div key={day.toISOString()} className="flex items-center justify-center h-12 sm:h-14">
            <button
              onClick={() => inMonth && handleDateClick(clone)}
              disabled={!inMonth}
              className={circleClass}
              title={
                hasEvents
                  ? `${count} agendamento${count > 1 ? 's' : ''}`
                  : undefined
              }
            >
              {format(day, 'd')}
            </button>
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

    return <div>{rows}</div>;
  };

  return (
    <div className="w-full bg-white rounded-2xl shadow-sm ring-1 ring-black/5 p-4">
      {renderHeader()}
      {renderDaysOfWeek()}
      {renderCells()}
    </div>
  );
}
