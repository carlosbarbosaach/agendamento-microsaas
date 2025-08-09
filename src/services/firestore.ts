// src/services/firestore.ts
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy,
  writeBatch,
  FirestoreError,
} from 'firebase/firestore';
import { db } from './firebase';
import type { CalendarEvent, ScheduleRequest } from '../types';

const EVENTS_COL = 'agendamentos';
const REQUESTS_COL = 'solicitacoes';

/** ============ EVENTOS ============ **/
export function listenEvents(
  onChange: (events: CalendarEvent[]) => void,
  onError?: (e: FirestoreError) => void
) {
  const q = query(collection(db, EVENTS_COL), orderBy('start')); // start é string ISO
  return onSnapshot(
    q,
    (snap) => {
      const list: CalendarEvent[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<CalendarEvent, 'id'>),
      }));
      onChange(list);
    },
    onError
  );
}

export async function addEvent(event: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>) {
  // event.start e event.end devem vir como string ISO (ex.: "2025-08-09T14:00")
  await addDoc(collection(db, EVENTS_COL), {
    ...event,
    createdAt: serverTimestamp(),
  });
}

export async function updateEvent(id: string, event: Partial<Omit<CalendarEvent, 'id'>>) {
  await updateDoc(doc(db, EVENTS_COL, id), {
    ...event,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteEvent(id: string) {
  await deleteDoc(doc(db, EVENTS_COL, id));
}

/** ============ SOLICITAÇÕES ============ **/
export function listenRequests(
  onChange: (reqs: ScheduleRequest[]) => void,
  onError?: (e: FirestoreError) => void
) {
  const q = query(collection(db, REQUESTS_COL), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snap) => {
      const list: ScheduleRequest[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<ScheduleRequest, 'id'>),
      }));
      onChange(list);
    },
    onError
  );
}

export async function addRequest(req: Omit<ScheduleRequest, 'id' | 'createdAt'>) {
  await addDoc(collection(db, REQUESTS_COL), {
    ...req,
    createdAt: serverTimestamp(),
  });
}

export async function rejectRequest(id: string) {
  await deleteDoc(doc(db, REQUESTS_COL, id));
}

/** Aprovação atômica: cria evento (string ISO) e remove solicitação */
export async function approveRequest(req: ScheduleRequest) {
  const batch = writeBatch(db);

  const startISO = `${req.date}T${req.start}`;
  const endISO = `${req.date}T${req.end}`;

  const eventRef = doc(collection(db, EVENTS_COL));
  batch.set(eventRef, {
    title: `${req.professor} - ${req.turma}`,
    description: req.description || '',
    start: startISO,
    end: endISO,
    createdAt: serverTimestamp(),
  });

  const reqRef = doc(db, REQUESTS_COL, req.id);
  batch.delete(reqRef);

  await batch.commit();
}
