'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import api from '@/lib/api';
import { formatDateTime, eventStatusLabels, listTypeLabels } from '@/lib/utils';
import {
  Calendar, MapPin, Users, Plus, ArrowLeft, Loader2,
  QrCode, CheckCircle2, TrendingUp, UserCheck, ListChecks,
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = ['#7c3aed', '#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd'];

const statusConfig: Record<string, { label: string; cls: string }> = {
  PUBLISHED: { label: 'Ativo',     cls: 'bg-emerald-100 text-emerald-700' },
  DRAFT:     { label: 'Rascunho', cls: 'bg-gray-100 text-gray-500' },
  CANCELLED: { label: 'Cancelado', cls: 'bg-red-100 text-red-600' },
  COMPLETED: { label: 'Concluído', cls: 'bg-blue-100 text-blue-700' },
};

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [listDist, setListDist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [eventRes, statsRes, distRes] = await Promise.all([
          api.get(`/events/${id}`),
          api.get(`/events/${id}/stats`),
          api.get(`/dashboard/event/${id}/lists`),
        ]);
        setEvent(eventRes.data);
        setStats(statsRes.data);
        setListDist(distRes.data);
      } catch { toast.error('Erro ao carregar evento'); }
      finally { setLoading(false); }
    }
    load();
  }, [id]);

  async function handleBulkQr(listId: string) {
    try {
      const { data } = await api.post(`/qrcode/bulk/${listId}`);
      toast.success(`${data.generated} QR Codes gerados!`);
    } catch { toast.error('Erro ao gerar QR Codes'); }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
          <Loader2 size={20} className="text-white animate-spin" />
        </div>
        <p className="text-gray-400 text-sm">Carregando evento...</p>
      </div>
    </div>
  );

  if (!event) return (
    <div className="p-6 text-red-500 text-sm">Evento não encontrado</div>
  );

  const sc = statusConfig[event.status] || statusConfig.DRAFT;

  const kpis = [
    { label: 'Convidados',      value: stats?.totalGuests || 0,        icon: Users,       gradient: 'from-violet-500 to-violet-700' },
    { label: 'Confirmados',     value: stats?.confirmed || 0,           icon: UserCheck,   gradient: 'from-indigo-500 to-indigo-700' },
    { label: 'Presentes',       value: stats?.checkedIn || 0,           icon: CheckCircle2, gradient: 'from-emerald-500 to-teal-600' },
    { label: 'Comparecimento',  value: `${stats?.attendanceRate || 0}%`, icon: TrendingUp,  gradient: 'from-amber-500 to-orange-600' },
  ];

  return (
    <div>
      <Header
        title={event.name}
        subtitle={`Criado por ${event.createdBy?.name}`}
        action={
          <Link
            href={`/dashboard/lists/new?eventId=${id}`}
            className="flex items-center gap-1.5 h-8 px-3 bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            <Plus size={14} /> Nova Lista
          </Link>
        }
      />

      <div className="p-6 space-y-5">
        <Link href="/dashboard/events" className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-violet-600 transition-colors">
          <ArrowLeft size={13} /> Todos os eventos
        </Link>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
          {kpis.map((k) => {
            const Icon = k.icon;
            return (
              <div key={k.label} className={`relative rounded-2xl p-4 overflow-hidden bg-gradient-to-br ${k.gradient}`}>
                <div className="absolute top-0 right-0 w-20 h-20 rounded-full bg-white/10 -translate-y-6 translate-x-6" />
                <div className="relative">
                  <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center mb-3">
                    <Icon size={16} className="text-white" />
                  </div>
                  <p className="text-2xl font-bold text-white leading-none">{k.value}</p>
                  <p className="text-white/70 text-xs mt-1">{k.label}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Detail + Chart */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {/* Event info */}
          <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-start justify-between mb-5">
              <h2 className="font-semibold text-gray-900 text-sm">Detalhes do Evento</h2>
              <span className={`text-[11px] px-2.5 py-1 rounded-full font-medium ${sc.cls}`}>{sc.label}</span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center flex-shrink-0">
                  <Calendar size={14} className="text-violet-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Data e hora</p>
                  <p className="font-medium text-gray-800">{formatDateTime(event.date)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                  <MapPin size={14} className="text-indigo-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Local</p>
                  <p className="font-medium text-gray-800">{event.location}</p>
                  {event.address && <p className="text-xs text-gray-400">{event.address}</p>}
                </div>
              </div>
              {event.capacity && (
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                    <Users size={14} className="text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Capacidade</p>
                    <p className="font-medium text-gray-800">{event.capacity} pessoas</p>
                  </div>
                </div>
              )}
              {event.description && (
                <div className="border-t border-gray-50 pt-3 mt-3">
                  <p className="text-xs text-gray-400 mb-1">Descrição</p>
                  <p className="text-sm text-gray-600 leading-relaxed">{event.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Pie chart */}
          {listDist.length > 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="font-semibold text-gray-900 text-sm mb-1">Por Lista</h2>
              <p className="text-xs text-gray-400 mb-4">Distribuição de convidados</p>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={listDist} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={65} innerRadius={30}>
                    {listDist.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip
                    contentStyle={{ border: 'none', borderRadius: '10px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 12 }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-2">
                {listDist.map((l, i) => (
                  <div key={l.name} className="flex items-center gap-2 text-xs text-gray-600">
                    <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="truncate flex-1">{l.name}</span>
                    <span className="font-semibold text-gray-800">{l.count}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center mb-3">
                <ListChecks size={22} className="text-gray-200" />
              </div>
              <p className="text-sm text-gray-400 font-medium">Sem dados</p>
              <p className="text-xs text-gray-300 mt-0.5">Adicione listas ao evento</p>
            </div>
          )}
        </div>

        {/* Lists */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <div>
              <h2 className="font-semibold text-gray-900 text-sm">Listas de Convidados</h2>
              <p className="text-xs text-gray-400 mt-0.5">{event.lists?.length || 0} lista(s)</p>
            </div>
            <Link
              href={`/dashboard/lists/new?eventId=${id}`}
              className="flex items-center gap-1 text-xs text-violet-600 hover:text-violet-700 font-medium"
            >
              <Plus size={13} /> Nova Lista
            </Link>
          </div>

          <div className="divide-y divide-gray-50">
            {event.lists?.map((list: any) => (
              <div key={list.id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50/50 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center flex-shrink-0">
                  <ListChecks size={16} className="text-violet-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{list.name}</p>
                  <p className="text-xs text-gray-400">
                    {listTypeLabels[list.type] || list.type}
                    {' · '}
                    <span className="font-medium text-gray-600">{list._count?.guests || 0}</span> convidado(s)
                    {list.maxGuests ? ` / ${list.maxGuests}` : ''}
                    {list.promoter?.user && ` · ${list.promoter.user.name}`}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleBulkQr(list.id)}
                    className="flex items-center gap-1.5 h-8 px-3 border border-gray-200 text-gray-500 text-xs rounded-lg hover:border-violet-300 hover:text-violet-600 hover:bg-violet-50 transition-all"
                  >
                    <QrCode size={13} /> QR Codes
                  </button>
                  <Link
                    href={`/dashboard/lists/${list.id}`}
                    className="h-8 px-3 bg-violet-600 hover:bg-violet-700 text-white text-xs rounded-lg transition flex items-center"
                  >
                    Ver Lista
                  </Link>
                </div>
              </div>
            ))}
            {!event.lists?.length && (
              <div className="py-14 text-center">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center">
                    <ListChecks size={22} className="text-gray-200" />
                  </div>
                  <p className="text-sm text-gray-400 font-medium">Nenhuma lista criada</p>
                  <Link
                    href={`/dashboard/lists/new?eventId=${id}`}
                    className="mt-2 flex items-center gap-1.5 h-8 px-3 bg-violet-600 text-white text-xs rounded-lg hover:bg-violet-700 transition"
                  >
                    <Plus size={13} /> Criar lista
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
