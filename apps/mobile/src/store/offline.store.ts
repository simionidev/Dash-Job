import { create } from 'zustand';
import * as SQLite from 'expo-sqlite';
import api from '../services/api';

interface OfflineCheckIn {
  id: string;
  guestId: string;
  eventId: string;
  method: string;
  checkedInAt: string;
  synced: boolean;
}

interface OfflineState {
  pendingCheckIns: OfflineCheckIn[];
  isOnline: boolean;
  setOnline: (online: boolean) => void;
  queueCheckIn: (data: Omit<OfflineCheckIn, 'synced'>) => void;
  syncPending: () => Promise<void>;
  loadPending: () => Promise<void>;
}

let db: SQLite.SQLiteDatabase;

async function getDb() {
  if (!db) {
    db = await SQLite.openDatabaseAsync('daslist.db');
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS pending_checkins (
        id TEXT PRIMARY KEY,
        guestId TEXT NOT NULL,
        eventId TEXT NOT NULL,
        method TEXT DEFAULT 'MANUAL',
        checkedInAt TEXT NOT NULL,
        synced INTEGER DEFAULT 0
      );
    `);
  }
  return db;
}

export const useOfflineStore = create<OfflineState>((set, get) => ({
  pendingCheckIns: [],
  isOnline: true,

  setOnline: (online) => {
    set({ isOnline: online });
    if (online) get().syncPending();
  },

  queueCheckIn: async (data) => {
    const database = await getDb();
    await database.runAsync(
      'INSERT OR IGNORE INTO pending_checkins (id, guestId, eventId, method, checkedInAt) VALUES (?, ?, ?, ?, ?)',
      [data.id, data.guestId, data.eventId, data.method, data.checkedInAt],
    );
    set((s) => ({ pendingCheckIns: [...s.pendingCheckIns, { ...data, synced: false }] }));
  },

  loadPending: async () => {
    const database = await getDb();
    const rows = await database.getAllAsync<OfflineCheckIn>(
      'SELECT * FROM pending_checkins WHERE synced = 0',
    );
    set({ pendingCheckIns: rows });
  },

  syncPending: async () => {
    const { pendingCheckIns } = get();
    const database = await getDb();

    for (const ci of pendingCheckIns.filter((c) => !c.synced)) {
      try {
        await api.post('/checkin/manual/' + ci.guestId, { eventId: ci.eventId });
        await database.runAsync('UPDATE pending_checkins SET synced = 1 WHERE id = ?', [ci.id]);
        set((s) => ({
          pendingCheckIns: s.pendingCheckIns.map((c) =>
            c.id === ci.id ? { ...c, synced: true } : c,
          ),
        }));
      } catch {}
    }
  },
}));
