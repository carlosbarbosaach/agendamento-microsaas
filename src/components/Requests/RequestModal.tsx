// src/components/Requests/RequestModal.tsx
import { useEffect, useMemo, useRef, useState } from 'react';
import { format } from 'date-fns';
import type { ScheduleRequest } from '../../types';
import { X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date;
  onSubmit: (req: ScheduleRequest) => void;
}

export default function RequestModal({ isOpen, onClose, selectedDate, onSubmit }: Props) {
  const BRAND = '#672C8E';
  const BRAND_DARK = '#4E1F6A';

  const [dateStr, setDateStr] = useState(format(selectedDate, 'yyyy-MM-dd'));
  const [start, setStart] = useState('09:00');
  const [end, setEnd] = useState('10:00');
  const [professor, setProfessor] = useState('');
  const [turma, setTurma] = useState('');
  const [description, setDescription] = useState('');
  const [touched, setTouched] = useState(false);

  const cancelBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      setDateStr(format(selectedDate, 'yyyy-MM-dd'));
      setStart('09:00');
      setEnd('10:00');
      setProfessor('');
      setTurma('');
      setDescription('');
      setTouched(false);
      setTimeout(() => cancelBtnRef.current?.focus(), 0);
    }
  }, [isOpen, selectedDate]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Enter') {
        if (!isInvalid) handleSubmit();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]); // eslint-disable-line

  const isTimeInvalid = useMemo(() => end <= start, [start, end]);

  const missingRequired = useMemo(() => {
    return (
      !dateStr.trim() ||
      !start.trim() ||
      !end.trim() ||
      !professor.trim() ||
      !turma.trim() ||
      !description.trim()
    );
  }, [dateStr, start, end, professor, turma, description]);

  const isInvalid = isTimeInvalid || missingRequired;

  const handleSubmit = () => {
    setTouched(true);
    if (isInvalid) return;

    const req: ScheduleRequest = {
      id: Date.now().toString(),
      date: dateStr,
      start,
      end,
      professor: professor.trim(),
      turma: turma.trim(),
      description: description.trim(),
      createdAt: new Date().toISOString(),
    };
    onSubmit(req);
    onClose();
  };

  if (!isOpen) return null;

  const fieldBase =
    'w-full border rounded-lg px-3 py-2 text-sm bg-white/90 outline-none transition shadow-sm focus:ring-2 ring-[rgba(103,44,142,0.35)]';

  const LabelRequired = ({ children }: { children: string }) => (
    <label className="block text-sm mb-1">
      {children} <span className="text-red-500">*</span>
    </label>
  );

  return (
    <div
      className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="req-title"
    >
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl ring-1 ring-black/5 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 id="req-title" className="text-lg font-semibold text-[#3b3b3b]">
            Solicitar agendamento
          </h2>
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
            <LabelRequired>Data</LabelRequired>
            <input
              type="date"
              className={fieldBase}
              value={dateStr}
              onChange={(e) => setDateStr(e.target.value)}
            />
            {touched && !dateStr.trim() && (
              <p className="text-xs text-red-600 mt-1">Informe a data.</p>
            )}
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <LabelRequired>Início</LabelRequired>
              <input
                type="time"
                className={fieldBase}
                value={start}
                onChange={(e) => setStart(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <LabelRequired>Fim</LabelRequired>
              <input
                type="time"
                className={fieldBase}
                value={end}
                onChange={(e) => setEnd(e.target.value)}
              />
            </div>
          </div>
          {touched && isTimeInvalid && (
            <p className="text-xs text-red-600">
              O horário de término deve ser maior que o de início.
            </p>
          )}

          <div>
            <LabelRequired>Nome do Professor</LabelRequired>
            <input
              type="text"
              className={fieldBase}
              value={professor}
              onChange={(e) => setProfessor(e.target.value)}
              placeholder="Ex: Prof. João"
            />
            {touched && !professor.trim() && (
              <p className="text-xs text-red-600 mt-1">Informe o nome do professor.</p>
            )}
          </div>

          <div>
            <LabelRequired>Turma</LabelRequired>
            <input
              type="text"
              className={fieldBase}
              value={turma}
              onChange={(e) => setTurma(e.target.value)}
              placeholder="Ex: 3ºA / 8ºB / INF-01"
            />
            {touched && !turma.trim() && (
              <p className="text-xs text-red-600 mt-1">Informe a turma.</p>
            )}
          </div>

          <div>
            <LabelRequired>Descrição</LabelRequired>
            <textarea
              className={fieldBase}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalhes do agendamento"
              rows={3}
            />
            {touched && !description.trim() && (
              <p className="text-xs text-red-600 mt-1">Informe a descrição do agendamento.</p>
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
            Enviar solicitação
          </button>
        </div>
      </div>
    </div>
  );
}
