// src/components/Requests/RequestsPanel.tsx
import { useEffect, useState } from 'react';
import type { ScheduleRequest } from '../../types';
import { format, parse } from 'date-fns';
import { listenRequests, approveRequest, rejectRequest } from '../../services/firestore';
import { Check, X, Users, CalendarDays, Clock } from 'lucide-react';

export default function RequestsPanel() {
  const BRAND = '#672C8E';
  const BRAND_DARK = '#4E1F6A';

  const [requests, setRequests] = useState<ScheduleRequest[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    const unsub = listenRequests(
      setRequests,
      (e) => console.error('Snapshot error (requests):', e.code, e.message)
    );
    return () => unsub();
  }, []);

  const handleApprove = async (req: ScheduleRequest) => {
    try {
      setBusyId(req.id);
      await approveRequest(req);
    } finally {
      setBusyId(null);
    }
  };

  const handleReject = async (id: string) => {
    try {
      setBusyId(id);
      await rejectRequest(id);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
        <h2 className="text-sm font-medium text-gray-700">Solicitações pendentes</h2>
        <span
          className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium"
          style={{ backgroundColor: `${BRAND}1A`, color: BRAND }}
        >
          {requests.length}
        </span>
      </div>

      {/* Corpo */}
      <div className="p-4">
        {requests.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 p-6 text-sm text-gray-600 text-center">
            Nenhuma solicitação no momento.
          </div>
        ) : (
          <ul className="space-y-3">
            {requests.map((req) => {
              const dataFmt = format(parse(req.date, 'yyyy-MM-dd', new Date()), 'dd/MM/yyyy');
              const disabled = busyId === req.id;

              return (
                <li
                  key={req.id}
                  className="p-4 rounded-xl bg-white border border-gray-200/80 hover:border-[#672C8E]/30 hover:shadow-sm transition"
                >
                  <div className="flex flex-col gap-2">
                    {/* Linha 1: Professor / Turma */}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-800">
                      <span className="inline-flex items-center gap-1 font-semibold">
                        <Users size={16} className="opacity-80" />
                        Professor:
                      </span>
                      <span>{req.professor}</span>

                      <span className="inline-flex items-center gap-1 font-semibold ml-2">
                        Turma:
                      </span>
                      <span>{req.turma}</span>
                    </div>

                    {/* Linha 2: Data / Horário */}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-700">
                      <span className="inline-flex items-center gap-1">
                        <CalendarDays size={16} className="opacity-80" />
                        {dataFmt}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock size={16} className="opacity-80" />
                        {req.start} - {req.end}
                      </span>
                    </div>

                    {/* Descrição (opcional) */}
                    {req.description && (
                      <p className="text-sm text-gray-700 mt-1">{req.description}</p>
                    )}

                    {/* Ações */}
                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        onClick={() => handleReject(req.id)}
                        disabled={disabled}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium
                                   border-gray-300 text-gray-700 hover:bg-gray-50
                                   disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                        title="Rejeitar"
                      >
                        <X size={16} />
                        Rejeitar
                      </button>

                      <button
                        onClick={() => handleApprove(req)}
                        disabled={disabled}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-white
                                   shadow-sm hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                        style={{ backgroundColor: BRAND }}
                        onMouseDown={(e) => (e.currentTarget.style.backgroundColor = BRAND_DARK)}
                        onMouseUp={(e) => (e.currentTarget.style.backgroundColor = BRAND)}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = BRAND)}
                        title="Aprovar"
                      >
                        <Check size={16} />
                        Aprovar
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
