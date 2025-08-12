// src/components/EventForm/EventModal.tsx
import { useEffect, useMemo, useRef, useState } from 'react';
import type { CalendarEvent } from '../../types';
import { format } from 'date-fns';
import { X, CalendarClock } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: CalendarEvent) => void;
  selectedDate: Date;
  event?: CalendarEvent | null;
}

export default function EventModal({ isOpen, onClose, onSave, selectedDate, event }: Props) {
  const BRAND = '#672C8E';
  const BRAND_DARK = '#4E1F6A';

  const [eventDate, setEventDate] = useState(format(selectedDate, 'yyyy-MM-dd'));
  const [professor, setProfessor] = useState('');
  const [turma, setTurma] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [touched, setTouched] = useState(false);

  const cancelBtnRef = useRef<HTMLButtonElement>(null);

  // Preenche campos ao abrir/editar
  useEffect(() => {
    if (!isOpen) return;
    if (event) {
      setEventDate(event.start.split('T')[0]);
      setStartTime(event.start.split('T')[1]?.slice(0, 5) || '09:00');
      setEndTime(event.end.split('T')[1]?.slice(0, 5) || '10:00');
      const [p, t] = event.title.split(' - ');
      setProfessor(p || '');
      setTurma(t || '');
      setDescription(event.description || '');
    } else {
      setEventDate(format(selectedDate, 'yyyy-MM-dd'));
      setStartTime('09:00');
      setEndTime('10:00');
      setProfessor('');
      setTurma('');
      setDescription('');
    }
    setTouched(false);
    setTimeout(() => cancelBtnRef.current?.focus(), 0);
  }, [isOpen, event, selectedDate]);

  // Teclado: Esc fecha, Enter salva se válido
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Enter' && !isInvalid) handleSubmit();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, startTime, endTime, professor, turma, description]);

  const timeInvalid = useMemo(() => endTime <= startTime, [startTime, endTime]);
  const missingRequired = useMemo(
    () => !professor.trim() || !turma.trim() || !description.trim(),
    [professor, turma, description]
  );
  const isInvalid = timeInvalid || missingRequired;

  const handleSubmit = () => {
    setTouched(true);
    if (isInvalid) return;

    const title = `${professor.trim()} - ${turma.trim()}`;
    const newEvent: CalendarEvent = {
      id: event?.id || Date.now().toString(),
      title,
      description: description.trim(),
      start: `${eventDate}T${startTime}`,
      end: `${eventDate}T${endTime}`,
    };
    onSave(newEvent);
    onClose();
  };

  if (!isOpen) return null;

  const fieldBase =
    'w-full border rounded-lg px-3 py-2 text-sm bg-white/90 outline-none transition shadow-sm focus:ring-2 ring-[rgba(103,44,142,0.35)]';
  const fieldError = 'border-red-400 focus:ring-red-200';

  return (
    <div
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="event-title"
    >
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl ring-1 ring-black/5 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div
              className="inline-flex h-8 w-8 items-center justify-center rounded-full"
              style={{ backgroundColor: `${BRAND}1A`, color: BRAND }}
            >
              <CalendarClock size={18} />
            </div>
            <h2 id="event-title" className="text-lg font-semibold text-[#2b2b2b]">
              {event ? 'Editar Agendamento' : 'Novo Agendamento'}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-3">
          <div>
            <label className="block text-sm mb-1">
              Data <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              className={fieldBase}
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              required
            />
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-sm mb-1">
                Início <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                className={[fieldBase, touched && timeInvalid ? fieldError : ''].join(' ')}
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm mb-1">
                Fim <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                className={[fieldBase, touched && timeInvalid ? fieldError : ''].join(' ')}
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />
            </div>
          </div>
          {touched && timeInvalid && (
            <p className="text-xs text-red-600">O horário de término deve ser maior que o de início.</p>
          )}

          <div>
            <label className="block text-sm mb-1">
              Nome do Professor <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className={[fieldBase, touched && !professor.trim() ? fieldError : ''].join(' ')}
              value={professor}
              onChange={(e) => setProfessor(e.target.value)}
              placeholder="Ex: Prof. João"
              required
            />
            {touched && !professor.trim() && (
              <p className="text-xs text-red-600 mt-1">Informe o nome do professor.</p>
            )}
          </div>

          <div>
            <label className="block text-sm mb-1">
              Turma <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className={[fieldBase, touched && !turma.trim() ? fieldError : ''].join(' ')}
              value={turma}
              onChange={(e) => setTurma(e.target.value)}
              placeholder="Ex: 3ºA / 8ºB / INF-01"
              required
            />
            {touched && !turma.trim() && (
              <p className="text-xs text-red-600 mt-1">Informe a turma.</p>
            )}
          </div>

          <div>
            <label className="block text-sm mb-1">
              Descrição <span className="text-red-500">*</span>
            </label>
            <textarea
              className={[fieldBase, touched && !description.trim() ? fieldError : ''].join(' ')}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalhes do agendamento"
              rows={3}
              required
            />
            {touched && !description.trim() && (
              <p className="text-xs text-red-600 mt-1">Informe a descrição.</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-5 pb-5">
          <button
            ref={cancelBtnRef}
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 cursor-pointer"
          >
            Cancelar
          </button>

          <button
            onClick={() => {
              setTouched(true);
              handleSubmit();
            }}
            disabled={isInvalid}
            className="px-4 py-2 text-sm font-semibold rounded-lg text-white shadow-sm hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            style={{ backgroundColor: BRAND }}
            onMouseDown={(e) => (e.currentTarget.style.backgroundColor = BRAND_DARK)}
            onMouseUp={(e) => (e.currentTarget.style.backgroundColor = BRAND)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = BRAND)}
          >
            {event ? 'Salvar alterações' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  );
}
