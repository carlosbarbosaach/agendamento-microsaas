// src/pages/AdminPage.tsx
import { useEffect, useState } from 'react';
import AdminHeader from '../components/Header/AdminHeader';
import CustomCalendar from '../components/Calendar/CustomCalendar';
import EventModal from '../components/EventForm/EventModal';
import EventListModal from '../components/EventForm/EventListModal';
import ConfirmModal from '../components/ConfirmModal';
import RequestsPanel from '../components/Requests/RequestsPanel';
import type { CalendarEvent } from '../types';
import { parseISO } from 'date-fns';
import { listenEvents, addEvent, updateEvent, deleteEvent } from '../services/firestore';

export default function AdminPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [eventToEdit, setEventToEdit] = useState<CalendarEvent | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Firestore: escuta eventos em tempo real
  useEffect(() => {
    const unsub = listenEvents(
      setEvents,
      (e) => console.error('Snapshot error (admin):', e.code, e.message)
    );
    return () => unsub();
  }, []);

  // Adicionar ou atualizar no Firestore
  const handleAddOrUpdateEvent = async (ev: CalendarEvent) => {
    const payload = {
      title: ev.title,
      description: ev.description || '',
      start: ev.start,
      end: ev.end,
    };

    if (ev.id && events.some((e) => e.id === ev.id)) {
      await updateEvent(ev.id, payload);
    } else {
      await addEvent(payload);
    }
    setEventToEdit(null);
  };

  // Exclusão (confirmação em modal)
  const handleDelete = (id: string) => setDeleteId(id);
  const confirmDelete = async () => {
    if (deleteId) await deleteEvent(deleteId);
    setDeleteId(null);
  };

  // Editar evento existente
  const handleEdit = (event: CalendarEvent) => {
    setSelectedDate(parseISO(event.start));
    setEventToEdit(event);
    setIsCreateModalOpen(true);
    setIsViewModalOpen(false);
  };

  // Clicar em um dia no calendário
  const handleClickDay = (date: Date) => {
    setSelectedDate(date);
    setIsViewModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#faf7ff] to-[#f4effa] text-gray-800">
      {/* Faixa de destaque com a cor da marca atrás do header */}
      <div className="bg-gradient-to-r from-[#672C8E] to-[#4E1F6A]">
        <div className="mx-auto w-full max-w-6xl px-4 py-4">
          <AdminHeader
            onCreate={(date) => {
              setEventToEdit(null);
              setSelectedDate(date instanceof Date ? date : new Date());
              setIsCreateModalOpen(true);
            }}
          />
        </div>
      </div>

      {/* Conteúdo */}
      <div className="mx-auto w-full max-w-6xl px-4">
        {/* Breadcrumb / título da seção */}
        <div className="mt-6 mb-2 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-[#3b3b3b]">
            Painel de Agendamentos
          </h1>
          <span className="inline-flex items-center rounded-full bg-[#672C8E]/10 px-3 py-1 text-xs font-medium text-[#672C8E]">
            Colégio do Campeche
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Calendário em card */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
              <div className="border-b border-gray-100 px-4 py-3">
                <h2 className="text-sm font-medium text-gray-700">Calendário</h2>
              </div>
              <div className="p-3 md:p-4">
                <CustomCalendar events={events} onDateClick={handleClickDay} />
              </div>
            </div>
          </div>

          {/* Sidebar: solicitações em card sticky */}
          <div className="lg:col-span-5">
            <div className="sticky top-6 rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
              <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                <h2 className="text-sm font-medium text-gray-700">Solicitações</h2>
                <span className="text-xs text-gray-500">
                  {new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium' }).format(new Date())}
                </span>
              </div>
              <div className="p-3 md:p-4">
                <RequestsPanel />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modais */}
      <EventModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEventToEdit(null);
        }}
        onSave={handleAddOrUpdateEvent}
        selectedDate={selectedDate}
        event={eventToEdit}
      />

      <EventListModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        events={events}
        date={selectedDate}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <ConfirmModal
        isOpen={!!deleteId}
        title="Excluir agendamento"
        message="Tem certeza que deseja excluir este agendamento?"
        onCancel={() => setDeleteId(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
