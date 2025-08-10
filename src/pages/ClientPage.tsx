// src/pages/ClientPage.tsx
import { useState, useEffect } from 'react';
import CustomCalendar from '../components/Calendar/CustomCalendar';
import type { CalendarEvent, ScheduleRequest } from '../types';
import { isSameDay, parseISO, format, compareAsc } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import RequestModal from '../components/Requests/RequestModal';
import SuccessModal from '../components/Feedback/SuccessModal';
import { listenEvents, addRequest } from '../services/firestore';

export default function ClientPage() {
  const BRAND = '#672C8E';

  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isRequestOpen, setIsRequestOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);

  useEffect(() => {
    const unsub = listenEvents(
      setEvents,
      (e) => console.error('Snapshot error (client):', e.code, e.message)
    );
    return () => unsub();
  }, []);

  const handleClickDate = (date: Date) => setSelectedDate(date);

  const dayEvents = events.filter((e) => isSameDay(parseISO(e.start), selectedDate));
  const dayEventsSorted = [...dayEvents].sort((a, b) =>
    compareAsc(parseISO(a.start), parseISO(b.start))
  );

  const formattedDate = format(selectedDate, 'dd/MM/yyyy', { locale: ptBR });

  const handleSubmitRequest = async (req: ScheduleRequest) => {
    await addRequest({
      date: req.date,
      start: req.start,
      end: req.end,
      professor: req.professor,
      turma: req.turma,
      description: req.description,
    });
    setSuccessOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#faf7ff] to-[#f4effa]">
      {/* Faixa de título com a cor da marca */}
      <div className="bg-gradient-to-r from-[#672C8E] to-[#4E1F6A]">
        <div className="w-full max-w-6xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-semibold text-white">
            Consulta de Agendamentos
          </h1>
          <p className="text-white/80 text-sm">
            Selecione um dia no calendário para ver os horários disponíveis.
          </p>
        </div>
      </div>

      <div className="w-full max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Calendário em card */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
              <div className="border-b border-gray-100 px-4 py-3">
                <h2 className="text-sm font-medium text-gray-700">Calendário</h2>
              </div>
              <div className="p-3 md:p-4">
                <CustomCalendar events={events} onDateClick={handleClickDate} />
              </div>
            </div>
          </div>

          {/* Painel do dia selecionado */}
          <aside className="lg:col-span-5">
            <div className="sticky top-6 rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
              <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                <div>
                  <h2 className="text-sm font-medium text-gray-700">
                    Agendamentos em <span className="text-[#672C8E]">{formattedDate}</span>
                  </h2>
                  <p className="text-xs text-gray-500">
                    {dayEventsSorted.length === 0
                      ? 'Nenhum agendamento para este dia.'
                      : `Você tem ${dayEventsSorted.length} agendamento${dayEventsSorted.length > 1 ? 's' : ''} neste dia.`}
                  </p>
                </div>

                <button
                  onClick={() => setIsRequestOpen(true)}
                  className="hidden md:inline-flex items-center gap-2 text-white text-sm font-medium px-4 py-2 rounded-lg shadow-sm hover:brightness-110 cursor-pointer"
                  style={{ backgroundColor: BRAND }}
                >
                  Solicitar agendamento
                </button>
              </div>

              {/* Lista / estado vazio */}
              <div className="p-4">
                {dayEventsSorted.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-gray-200 p-6 text-sm text-gray-600 text-center">
                    Selecione uma data no calendário ou clique em “Solicitar agendamento”.
                  </div>
                ) : (
                  <ul className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                    {dayEventsSorted.map((event) => (
                      <li
                        key={event.id}
                        className="p-4 rounded-xl bg-white border border-gray-200/80 hover:border-[#672C8E]/30 hover:shadow-sm transition"
                      >
                        <h3 className="text-base font-semibold text-[#672C8E]">
                          📌 {event.title}
                        </h3>
                        <p className="text-sm text-gray-600">
                          🕒 {format(parseISO(event.start), 'HH:mm')} - {format(parseISO(event.end), 'HH:mm')}
                        </p>
                        {event.description && (
                          <p className="text-sm mt-1 text-gray-800">{event.description}</p>
                        )}
                      </li>
                    ))}
                  </ul>
                )}

                {/* CTA mobile */}
                <div className="md:hidden mt-4">
                  <button
                    onClick={() => setIsRequestOpen(true)}
                    className="w-full text-white font-medium px-5 py-2.5 rounded-lg shadow-sm hover:brightness-110 transition cursor-pointer"
                    style={{ backgroundColor: BRAND }}
                  >
                    Solicitar agendamento
                  </button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <RequestModal
        isOpen={isRequestOpen}
        onClose={() => setIsRequestOpen(false)}
        selectedDate={selectedDate}
        onSubmit={handleSubmitRequest}
      />

      <SuccessModal
        isOpen={successOpen}
        onClose={() => setSuccessOpen(false)}
        title="Solicitação enviada!"
        message="Aguarde a confirmação do administrador."
        autoCloseMs={3000}
      />
    </div>
  );
}
