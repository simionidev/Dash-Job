'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/layout/Header';
import api from '@/lib/api';
import { formatDate, eventStatusLabels } from '@/lib/utils';
import {
  Plus, Calendar, MapPin, Users, Copy, XCircle,
  Eye, Loader2, Search, Filter, Zap,
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

const statusConfig: Record<string, { label: string; cls: string; dot: string }> = {
  DRAFT:     { label: 'Rascunho',  cls: 'bg-gray-100 text-gray-500',    dot: 'bg-gray-400' },
  PUBLISHED: { label: 'Ativo',     cls: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500' },
  CANCELLED: { label: 'Cancelado', cls: 'bg-red-50 text-red-600',        dot: 'bg-red-500' },
  COMPLETED: { label: 'Concluído', cls: 'bg-blue-50 text-blue-700',      dot: 'bg-blue-500' },
};

const gradients = [
  'from-violet-600 to-purple-700',
  'from-indigo-600 to-blue-700',
  'from-rose-600 to-pink-700',
  'from-amber-500 to-orange-600',
  'from-teal-600 to-cyan-700',
  'from-fuchsia-600 to-violet-700',
];

export default function EventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => { loadEvents(); }, []);

  async function loadEvents() {
    try {
      const { data } = await api.get('/events');
      setEvents(data);
    } catch { toast.error('Erro ao carregar eventos'); }
    finally { setLoading(false); }
  }

  async function handleDuplicate(id: string, e: React.MouseEvent) {
    e.preventDefault();
    try {
      await api.post(`/events/${id}/duplicate`);
      toast.success('Evento duplicado!');
      loadEvents();
    } catch { toast.error('Erro ao duplicar'); }
  }

  async function handleCancel(id: string, e: React.MouseEvent) {
    e.preventDefault();
    if (!confirm('Cancelar este evento?')) return;
    try {
      await api.patch(`/events/${id}/cancel`);
      toast.success('Evento cancelado');
      loadEvents();
    } catch { toast.error('Erro ao cancelar'); }
  }

  const filtered = events.filter((e) => {
    const matchName = e.name.toLowerCase().includes(filter.toLowerCase());
    const matchStatus = !statusFilter || e.status === statusFilter;
    return matchName && matchStatus;
  });

  return (
    <div>
      <Header
        title="Eventos"
        subtitle={`${events.length} evento(s) cadastrado(s)`}
        action={
          <Link
            href="/dashboard/events/new"
            className="flex items-center gap-1.5 h-8 px-3 bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            <Plus size={14} /> Novo Evento
          </Link>
        }
      />

      <div className="p-6 space-y-5">
        {/* Filters */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Buscar evento..."
              className="w-full pl-9 pr-4 h-9 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-400/50 focus:border-violet-400 transition"
            />
          </div>
          <div className="flex items-center gap-2">
            {['', 'PUBLISHED', 'DRAFT', 'COMPLETED', 'CANCELLED'].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`h-9 px-3 text-xs font-medium rounded-lg border transition-all ${
                  statusFilter === s
                    ? 'bg-violet-600 text-white border-violet-600'
                    : 'bg-white text-gray-500 border-gray-200 hover:border-violet-300'
                }`}
              >
                {s === '' ? 'Todos' : (statusConfig[s]?.label || s)}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-violet-600" size={28} />
          </div>
        ) : !filtered.length ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
              <Calendar size={28} className="text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium">Nenhum evento encontrado</p>
            <p className="text-gray-400 text-sm mt-1">Crie seu primeiro evento para começar</p>
            <Link href="/dashboard/events/new" className="mt-4 flex items-center gap-1.5 h-9 px-4 bg-violet-600 text-white text-sm font-medium rounded-lg hover:bg-violet-700 transition">
              <Plus size={15} /> Criar evento
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((event, idx) => {
              const sc = statusConfig[event.status] || statusConfig.DRAFT;
              const grad = gradients[idx % gradients.length];
              return (
                <Link key={event.id} href={`/dashboard/events/${event.id}`} className="group">
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-violet-200 transition-all overflow-hidden h-full flex flex-col">
                    {/* Banner */}
                    <div className={`relative h-32 bg-gradient-to-br ${grad} overflow-hidden flex-shrink-0`}>
                      <div className="absolute inset-0 opacity-20"
                        style={{
                          backgroundImage: `radial-gradient(circle at 70% 30%, rgba(255,255,255,0.4) 0%, transparent 60%)`,
                        }}
                      />
                      {event.bannerUrl ? (
                        <img src={event.bannerUrl} alt={event.name} className="w-full h-full object-cover mix-blend-overlay opacity-60" />
                      ) : (
                        <div className="absolute bottom-3 left-4">
                          <p className="text-white/60 text-xs font-medium uppercase tracking-widest">Evento</p>
                        </div>
                      )}
                      <div className="absolute top-3 right-3">
                        <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                          {sc.label}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 flex-1 flex flex-col">
                      <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-3 group-hover:text-violet-700 transition-colors line-clamp-2">
                        {event.name}
                      </h3>

                      <div className="space-y-1.5 mb-4 flex-1">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Calendar size={12} className="text-gray-400 flex-shrink-0" />
                          {formatDate(event.date)}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <MapPin size={12} className="text-gray-400 flex-shrink-0" />
                          <span className="truncate">{event.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Users size={12} className="text-gray-400 flex-shrink-0" />
                          {event._count?.checkIns || 0} entradas · {event._count?.lists || 0} lista(s)
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 pt-3 border-t border-gray-50">
                        <span className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium text-violet-600 hover:bg-violet-50 rounded-lg transition-colors">
                          <Eye size={13} /> Ver
                        </span>
                        <button
                          onClick={(e) => handleDuplicate(event.id, e)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          <Copy size={13} /> Copiar
                        </button>
                        {event.status !== 'CANCELLED' && (
                          <button
                            onClick={(e) => handleCancel(event.id, e)}
                            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <XCircle size={13} /> Cancelar
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
