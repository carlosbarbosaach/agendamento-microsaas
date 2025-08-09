// src/types/index.ts
export interface CalendarEvent {
  id: string;
  title: string;       // Vamos montar como "Professor - Turma"
  start: string;       // ISO ex: 2025-08-04T10:00
  end: string;         // ISO
  description?: string;
}

export interface ScheduleRequest {
  id: string;
  date: string;        // 'yyyy-MM-dd'
  start: string;       // 'HH:mm'
  end: string;         // 'HH:mm'
  professor: string;   // 👈 novo
  turma: string;       // 👈 novo
  description?: string;
  createdAt: string;   // ISO
}
