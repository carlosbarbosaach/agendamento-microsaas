// src/components/Reports/DashboardStats.tsx
import { useMemo } from 'react';
import type { CalendarEvent } from '../../types';
import {
  parseISO,
  isValid as isValidDate,
  startOfMonth,
  endOfMonth,
  isWithinInterval,
  format,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarCheck2, CalendarRange, Clock8 } from 'lucide-react';

type Props = { events: CalendarEvent[] };

const BRAND = '#672C8E';
const GRADIENT = 'linear-gradient(135deg, #F6F1FB 0%, #EFE7F7 100%)';

function safe(d?: string) {
  if (!d) return null;
  const x = parseISO(d);
  return isValidDate(x) ? x : null;
}

export default function DashboardStats({ events }: Props) {
  const { totalAll, totalMonth, topSlot, monthLabel } = useMemo(() => {
    const now = new Date();
    const mStart = startOfMonth(now);
    const mEnd = endOfMonth(now);

    const valids = events.filter((e) => safe(e.start) && safe(e.end));
    const totalAll = valids.length;

    const monthEvents = valids.filter((e) => {
      const s = safe(e.start)!;
      return isWithinInterval(s, { start: mStart, end: mEnd });
    });
    const totalMonth = monthEvents.length;

    // agrupa por faixa de horário HH:mm–HH:mm
    const count = new Map<string, number>();
    for (const e of valids) {
      const s = safe(e.start)!;
      const f = safe(e.end)!;
      const key = `${format(s, 'HH:mm')}–${format(f, 'HH:mm')}`;
      count.set(key, (count.get(key) ?? 0) + 1);
    }

    let topSlot = '—';
    let max = -1;
    for (const [k, v] of count) {
      if (v > max) {
        max = v;
        topSlot = k;
      }
    }

    return {
      totalAll,
      totalMonth,
      topSlot,
      monthLabel: format(mStart, 'MMMM yyyy', { locale: ptBR }).replace(/^./, (s) => s.toUpperCase()),
    };
  }, [events]);

  return (
    <section className="rounded-2xl p-4 md:p-5" style={{ background: GRADIENT }}>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
        <Kpi icon={<CalendarCheck2 size={20} />} label="Agendamentos (total)" value={totalAll} />
        <Kpi icon={<CalendarRange size={20} />} label={`No mês de ${monthLabel}`} value={totalMonth} />
        <Kpi icon={<Clock8 size={20} />} label="Horário mais agendado" value={topSlot} />
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between text-xs text-gray-600">
        <span>Atualizado em {format(new Date(), 'dd/MM/yyyy')}</span>
        <span className="hidden sm:inline">Dica: clique nos dias com ponto para ver os detalhes.</span>
      </div>
    </section>
  );
}

function Kpi({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-xl bg-white/70 backdrop-blur-sm shadow-sm px-4 py-3 flex items-center gap-3">
      <div
        className="h-10 w-10 rounded-xl flex items-center justify-center"
        style={{ backgroundColor: 'rgba(103,44,142,0.10)', color: BRAND }}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-600">{label}</p>
        <div className="flex items-baseline gap-2">
          <p
            className="font-semibold text-[#2b2b2b] truncate"
            style={{ fontSize: '14px' }}
          >
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}
