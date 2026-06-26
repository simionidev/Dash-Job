'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/layout/Header';
import api from '@/lib/api';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell,
} from 'recharts';
import {
  Calendar, Users, CheckCircle2, TrendingUp, Award,
  ArrowUpRight, Loader2, Star, Zap,
} from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';

const COLORS = ['#7c3aed', '#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd'];

const statusColors: Record<string, string> = {
  PUBLISHED: 'bg-emerald-100 text-emerald-700',
  DRAFT: 'bg-gray-100 text-gray-500',
  CANCELLED: 'bg-red-100 text-red-600',
  COMPLETED: 'bg-blue-100 text-blue-700',
};
const statusLabels: Record<string, string> = {
  PUBLISHED: 'Ativo', DRAFT: 'Rascunho', CANCELLED: 'Cancelado', COMPLETED: 'Concluído',
};

function StatCard({ label, value, sub, icon: Icon, gradient, trend }: any) {
  return (
    <div className={`relative rounded-2xl p-5 overflow-hidden ${gradient}`}>
      <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/10 -translate-y-8 translate-x-8" />
      <div className="absolute bottom-0 left-0 w-20 h-20 rounded-full bg-white/5 translate-y-6 -translate-x-4" />
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
            <Icon size={20} className="text-white" />
          </div>
          {trend && (
            <div className="flex items-center gap-1 bg-white/15 rounded-full px-2 py-1">
              <ArrowUpRight size={11} className="text-white" />
              <span className="text-white text-[11px] font-medium">{trend}</span>
            </div>
          )}
        </div>
        <p className="text-4xl font-bold text-white mb-1">{value}</p>
        <p className="text-white/80 text-sm font-medium">{label}</p>
        {sub && <p className="text-white/50 text-xs mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [promoters, setPromoters] = useState<any[]>([]);
  const [allEvents, setAllEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [sRes, eRes, pRes, evRes] = await Promise.all([
          api.get('/dashboard/overview'),
          api.get('/dashboard/events'),
          api.get('/dashboard/promoters/ranking'),
          api.get('/events'),
        ]);
        setStats(sRes.data);
        setEvents(eRes.data.slice(0, 7));
        setPromoters(pRes.data.slice(0, 5));
        setAllEvents(evRes.data.slice(0, 4));
      } catch {}
      finally { setLoading(false); }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
            <Loader2 size={20} className="text-white animate-spin" />
          </div>
          <p className="text-gray-400 text-sm">Carregando...</p>
        </div>
      </div>
    );
  }

  const kpis = [
    {
      label: 'Total de Eventos',
      value: stats?.totalEvents || 0,
      sub: `${stats?.activeEvents || 0} ativos agora`,
      icon: Calendar,
      gradient: 'bg-gradient-to-br from-violet-600 to-violet-800',
      trend: '+12%',
    },
    {
      label: 'Convidados',
      value: (stats?.totalGuests || 0).toLocaleString('pt-BR'),
      sub: 'cadastrados na plataforma',
      icon: Users,
      gradient: 'bg-gradient-to-br from-indigo-600 to-indigo-800',
      trend: '+8%',
    },
    {
      label: 'Check-ins',
      value: (stats?.totalCheckins || 0).toLocaleString('pt-BR'),
      sub: 'entradas registradas',
      icon: CheckCircle2,
      gradient: 'bg-gradient-to-br from-emerald-600 to-teal-700',
      trend: '+23%',
    },
    {
      label: 'Comparecimento',
      value: `${stats?.attendanceRate || 0}%`,
      sub: `${stats?.totalPromoters || 0} promotores ativos`,
      icon: TrendingUp,
      gradient: 'bg-gradient-to-br from-amber-500 to-orange-600',
      trend: '+5%',
    },
  ];

  const chartData = events.map((e) => ({
    name: e.name?.split(' ').slice(0, 2).join(' ') || 'Evento',
    convidados: e.guests || 0,
    presentes: e.checkins || 0,
  }));

  const pieData = promoters.slice(0, 4).map((p) => ({
    name: p.name?.split(' ')[0],
    value: p.totalGuests || 0,
  }));

  return (
    <div>
      <Header
        title="Dashboard"
        subtitle="Visão geral da plataforma"
        action={
          <Link
            href="/dashboard/events/new"
            className="flex items-center gap-1.5 h-8 px-3 bg-violet-600 hover:bg-violet-700 text-white text-xs font-medium rounded-lg transition-colors"
          >
            <Zap size={13} /> Novo evento
          </Link>
        }
      />

      <div className="p-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {kpis.map((k) => <StatCard key={k.label} {...k} />)}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {/* Bar chart */}
          <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-100 p-5 shadow-sm shadow-gray-100">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-semibold text-gray-900 text-sm">Desempenho por Evento</h2>
                <p className="text-xs text-gray-400 mt-0.5">Convidados vs Presentes</p>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-gray-400">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-violet-500" /> Convidados</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-indigo-300" /> Presentes</span>
              </div>
            </div>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ border: 'none', borderRadius: '12px', boxShadow: '0 4px 24px rgba(0,0,0,0.12)', fontSize: 12 }}
                    cursor={{ fill: '#f9fafb', radius: 4 }}
                  />
                  <Bar dataKey="convidados" fill="#7c3aed" radius={[5, 5, 0, 0]} />
                  <Bar dataKey="presentes" fill="#c4b5fd" radius={[5, 5, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[220px] flex items-center justify-center text-gray-300 text-sm">
                Nenhum dado disponível
              </div>
            )}
          </div>

          {/* Promoters ranking */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm shadow-gray-100">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-semibold text-gray-900 text-sm">Ranking Promotores</h2>
                <p className="text-xs text-gray-400 mt-0.5">Por check-ins realizados</p>
              </div>
              <Award size={16} className="text-amber-400" />
            </div>
            <div className="space-y-3">
              {promoters.map((p, i) => (
                <div key={p.id} className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    i === 0 ? 'bg-amber-100 text-amber-700' :
                    i === 1 ? 'bg-gray-100 text-gray-600' :
                    i === 2 ? 'bg-orange-50 text-orange-600' :
                    'bg-gray-50 text-gray-400'
                  }`}>{i + 1}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate leading-none mb-1">{p.name}</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full"
                          style={{ width: `${Math.min(100, ((p.checkedIn || 0) / (promoters[0]?.checkedIn || 1)) * 100)}%` }}
                        />
                      </div>
                      <span className="text-[11px] text-gray-400 flex-shrink-0">{p.checkedIn || 0}</span>
                    </div>
                  </div>
                  {i === 0 && <Star size={13} className="text-amber-400 fill-amber-400 flex-shrink-0" />}
                </div>
              ))}
              {!promoters.length && (
                <p className="text-sm text-gray-300 text-center py-8">Nenhum promotor ainda</p>
              )}
            </div>
          </div>
        </div>

        {/* Recent Events table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm shadow-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <div>
              <h2 className="font-semibold text-gray-900 text-sm">Eventos Recentes</h2>
              <p className="text-xs text-gray-400 mt-0.5">{allEvents.length} evento(s) cadastrado(s)</p>
            </div>
            <Link href="/dashboard/events" className="text-xs text-violet-600 hover:text-violet-700 font-medium">
              Ver todos →
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {allEvents.map((event) => (
              <Link
                key={event.id}
                href={`/dashboard/events/${event.id}`}
                className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50/60 transition-colors"
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center flex-shrink-0">
                  <Calendar size={16} className="text-violet-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{event.name}</p>
                  <p className="text-xs text-gray-400">{formatDate(event.date)} · {event.location}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-semibold text-gray-900">{event._count?.checkIns || 0}</p>
                    <p className="text-[10px] text-gray-400">entradas</p>
                  </div>
                  <span className={`text-[11px] px-2.5 py-1 rounded-full font-medium ${statusColors[event.status] || 'bg-gray-100 text-gray-500'}`}>
                    {statusLabels[event.status] || event.status}
                  </span>
                </div>
              </Link>
            ))}
            {!allEvents.length && (
              <div className="py-12 text-center text-gray-300 text-sm">
                <Calendar size={32} className="mx-auto mb-2 opacity-40" />
                Nenhum evento cadastrado
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
