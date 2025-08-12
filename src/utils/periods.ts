// src/utils/periods.ts
export type Slot = {
  label: string;      // "1ª aula", "Intervalo"...
  start: string;      // "HH:mm"
  end: string;        // "HH:mm"
  kind: 'class' | 'break';
};

export const SLOTS: Slot[] = [
  // MANHÃ
  { label: '1ª aula', start: '07:25', end: '08:15', kind: 'class' },
  { label: '2ª aula', start: '08:15', end: '09:05', kind: 'class' },
  { label: '3ª aula', start: '09:05', end: '09:55', kind: 'class' },
  { label: 'Intervalo', start: '09:55', end: '10:25', kind: 'break' }, // 30 min
  { label: '4ª aula', start: '10:25', end: '11:15', kind: 'class' },
  { label: '5ª aula', start: '11:15', end: '12:05', kind: 'class' },
  { label: '6ª aula', start: '12:05', end: '12:55', kind: 'class' },

  // TARDE
  { label: '1ª aula', start: '13:30', end: '14:15', kind: 'class' },
  { label: '2ª aula', start: '14:15', end: '15:00', kind: 'class' },
  { label: '3ª aula', start: '15:00', end: '15:45', kind: 'class' },
  { label: 'Intervalo', start: '15:45', end: '16:15', kind: 'break' }, // 30 min
  { label: '4ª aula', start: '16:15', end: '17:00', kind: 'class' },
  { label: '5ª aula', start: '17:00', end: '17:45', kind: 'class' },
  { label: '6ª aula', start: '17:45', end: '18:30', kind: 'class' },
];

// Mapa rápido de início -> índice
const startIndex = new Map<string, number>();
SLOTS.forEach((s, i) => startIndex.set(s.start, i));

/**
 * Tenta mapear um intervalo (HH:mm – HH:mm) para um ou mais slots contínuos.
 * Retorna a lista de rótulos (ex.: ["1ª aula"] ou ["1ª aula","2ª aula"]) ou null se não casar.
 */
export function resolveSlotsRange(startHHmm: string, endHHmm: string): Slot[] | null {
  const i0 = startIndex.get(startHHmm);
  if (i0 == null) return null;

  const acc: Slot[] = [];
  let i = i0;
  while (i < SLOTS.length) {
    const slot = SLOTS[i];
    acc.push(slot);
    if (slot.end === endHHmm) return acc; // fechou exatamente
    // se o próximo começa exatamente quando este termina, seguimos
    const next = SLOTS[i + 1];
    if (!next || next.start !== slot.end) return null;
    i++;
  }
  return null;
}

/** Gera um rótulo amigável do(s) slot(s), com compressão (1ª–2ª aulas) quando fizer sentido. */
export function slotsFriendlyLabel(slots: Slot[]): string {
  if (slots.length === 0) return '';

  // se for um único slot
  if (slots.length === 1) return slots[0].label;

  // se todos são aulas (sem intervalo no meio), formatar "1ª–2ª aulas"
  const allClass = slots.every(s => s.kind === 'class');
  if (allClass) {
    const first = slots[0].label.replace(' aula', '');
    const last = slots[slots.length - 1].label;
    // "6ª aula" -> "6ª"
    const lastNum = last.replace(' aula', '');
    return `${first}–${lastNum} aulas`;
  }

  // mix com Intervalo: junta por " + "
  return slots.map(s => s.label).join(' + ');
}

/** Retorna algo como "1ª aula — 07:25 – 08:15" ou só times se não casar. */
export function prettyTimeRangeLabel(startHHmm: string, endHHmm: string): string {
  const match = resolveSlotsRange(startHHmm, endHHmm);
  if (!match) return `${startHHmm} – ${endHHmm}`;
  return `${slotsFriendlyLabel(match)} — ${startHHmm} – ${endHHmm}`;
}
