'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/layout/Header';
import api from '@/lib/api';
import { listTypeLabels, formatDate } from '@/lib/utils';
import {
  ListChecks, Plus, Search, Users, Calendar,
  Loader2, ChevronRight, Eye,
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

const typeColors: Record<string, string> = {
  VIP:      'bg-amber-50 text-amber-700 border-amber-100',
  STANDARD: 'bg-blue-50 text-blue-700 border-blue-100',
  STAFF:    'bg-violet-50 text-violet-700 border-violet-100',
  PRESS:    'bg-rose-50 text-rose-700 border-rose-100',
};

export default function ListsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const { data } = await api.get('/events');
      // Load each event's lists
      const withLists = await Promise.all(
        data.map(async (ev: any) => {
          try {
            const r = await api.get(`/events/${ev.id}`);
            return { ...ev, lists: r.data.lists || [] };
          } catch {
            return { ...ev, lists: [] };
          }
        })
      );
      setEvents(withLists.filter((e) => e.lists.length > 0));
    } catch { toast.error('Erro ao carregar listas'); }
    finally { setLoading(false); }
  }

  const filtered = events.filter((ev) =>
    ev.name.toLowerCase().includes(search.toLowerCase()) ||
    ev.lists.some((l: any) => l.name.toLowerCase().includes(search.toLowerCase()))
  );

  const totalLists = events.reduce((sum, ev) => sum + ev.lists.length, 0);
  const totalGuests = events.reduce(
    (sum, ev) => sum + ev.lists.reduce((s: number, l: any) => s + (l._count?.guests || 0), 0), 0
  );

  return (
    <div>
      <Header
        title="Listas"
        subtitle={`${totalLists} lista(s) · ${totalGuests} convidado(s) total`}
        action={
          <Link
            href="/dashboard/lists/new"
            className="flex items-center gap-1.5 h-8 px-3 bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            <Plus size={14} /> Nova Lista
          </Link>
        }
      />

      <div className="p-6 space-y-5">
        {/* Search */}
        <div className="relative max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar lista ou evento..."
            className="w-full pl-9 pr-4 h-9 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-400/50 focus:border-violet-400 transition"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-violet-600" size={28} />
          </div>
        ) : !filtered.length ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
              <ListChecks size={28} className="text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium">Nenhuma lista encontrada</p>
            <p className="text-gray-400 text-sm mt-1">Crie uma lista vinculada a um evento</p>
            <Link href="/dashboard/lists/new" className="mt-4 flex items-center gap-1.5 h-9 px-4 bg-violet-600 text-white text-sm font-medium rounded-lg hover:bg-violet-700 transition">
              <Plus size={15} /> Nova lista
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((ev) => (
              <div key={ev.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Event header */}
                <div className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-50 bg-gray-50/50">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center flex-shrink-0">
                    <Calendar size={14} className="text-violet-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{ev.name}</p>
                    <p className="text-xs text-gray-400">{formatDate(ev.date)} · {ev.location}</p>
                  </div>
                  <Link
                    href={`/dashboard/events/${ev.id}`}
                    className="text-xs text-violet-600 hover:text-violet-700 font-medium flex items-center gap-0.5"
                  >
                    Ver evento <ChevronRight size={12} />
                  </Link>
                </div>

                {/* Lists */}
                <div className="divide-y divide-gray-50">
                  {ev.lists.map((list: any) => (
                    <div key={list.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50/50 transition-colors">
                      <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center flex-shrink-0">
                        <ListChecks size={14} className="text-violet-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{list.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${typeColors[list.type] || 'bg-gray-50 text-gray-500 border-gray-100'}`}>
                            {listTypeLabels[list.type] || list.type}
                          </span>
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Users size={11} /> {list._count?.guests || 0} convidado(s)
                            {list.maxGuests ? ` / ${list.maxGuests}` : ''}
                          </span>
                          {list.promoter?.user && (
                            <span className="text-xs text-gray-400">· {list.promoter.user.name}</span>
                          )}
                        </div>
                      </div>
                      <Link
                        href={`/dashboard/lists/${list.id}`}
                        className="flex items-center gap-1.5 h-8 px-3 bg-violet-50 hover:bg-violet-100 text-violet-700 text-xs font-medium rounded-lg transition-colors"
                      >
                        <Eye size={13} /> Abrir
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
