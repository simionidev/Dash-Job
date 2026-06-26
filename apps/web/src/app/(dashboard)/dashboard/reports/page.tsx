'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/layout/Header';
import api from '@/lib/api';
import {
  Download, Users, ClipboardList, Loader2, Calendar,
  FileSpreadsheet, TrendingUp, CheckCircle2, ChevronDown,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function ReportsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [loading, setLoading] = useState<string | null>(null);
  const [eventStats, setEventStats] = useState<any>(null);

  useEffect(() => {
    api.get('/events').then((r) => setEvents(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (selectedEvent) loadEventStats();
    else setEventStats(null);
  }, [selectedEvent]);

  async function loadEventStats() {
    try {
      const { data } = await api.get(`/dashboard/events`);
      const ev = data.find((e: any) => e.id === selectedEvent);
      setEventStats(ev);
    } catch {}
  }

  async function downloadExcel(type: 'guests' | 'checkins') {
    if (!selectedEvent) return toast.error('Selecione um evento');
    try {
      setLoading(type);
      const res = await api.get(`/reports/${type}/${selectedEvent}/excel`, { responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      const ev = events.find((e) => e.id === selectedEvent);
      a.download = `${type}-${ev?.name || selectedEvent}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Arquivo baixado!');
    } catch { toast.error('Erro ao exportar'); }
    finally { setLoading(null); }
  }

  const selectedEventData = events.find((e) => e.id === selectedEvent);

  const reports = [
    {
      id: 'guests',
      icon: Users,
      title: 'Lista de Convidados',
      desc: 'Nome, contato, RSVP, QR Code e status de check-in',
      gradient: 'from-violet-500 to-indigo-600',
      bg: 'bg-violet-50',
      iconCls: 'text-violet-600',
      rows: eventStats?.guests || '—',
      rowLabel: 'convidados',
    },
    {
      id: 'checkins',
      icon: ClipboardList,
      title: 'Registro de Check-ins',
      desc: 'Entradas realizadas com data, hora e promotor responsável',
      gradient: 'from-emerald-500 to-teal-600',
      bg: 'bg-emerald-50',
      iconCls: 'text-emerald-600',
      rows: eventStats?.checkins || '—',
      rowLabel: 'entradas',
    },
  ] as const;

  return (
    <div>
      <Header title="Relatórios" subtitle="Exporte dados dos seus eventos em Excel" />

      <div className="p-6 space-y-6 max-w-3xl">
        {/* Event selector */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Evento</p>
          <div className="relative">
            <Calendar size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <select
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
              className="w-full pl-9 pr-10 h-10 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-400/50 focus:border-violet-400 transition appearance-none bg-white text-gray-700"
            >
              <option value="">Selecione um evento para exportar...</option>
              {events.map((e) => (
                <option key={e.id} value={e.id}>{e.name}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          {selectedEventData && (
            <div className="mt-4 flex items-center gap-4 p-3 rounded-xl bg-gray-50 border border-gray-100">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center flex-shrink-0">
                <Calendar size={16} className="text-violet-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{selectedEventData.name}</p>
                <p className="text-xs text-gray-400">{selectedEventData.location}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-bold text-gray-900">{selectedEventData._count?.checkIns || 0}</p>
                <p className="text-[10px] text-gray-400">check-ins</p>
              </div>
            </div>
          )}
        </div>

        {/* Report Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {reports.map((report) => {
            const Icon = report.icon;
            const isLoading = loading === report.id;
            return (
              <div
                key={report.id}
                className={`bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all ${
                  selectedEvent ? 'hover:shadow-md hover:border-violet-100' : 'opacity-60'
                }`}
              >
                {/* Top gradient bar */}
                <div className={`h-1.5 bg-gradient-to-r ${report.gradient}`} />

                <div className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-10 h-10 rounded-xl ${report.bg} flex items-center justify-center`}>
                      <Icon size={20} className={report.iconCls} />
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">{report.rows}</p>
                      <p className="text-[10px] text-gray-400">{report.rowLabel}</p>
                    </div>
                  </div>

                  <h3 className="font-semibold text-gray-900 text-sm mb-1">{report.title}</h3>
                  <p className="text-xs text-gray-400 mb-5 leading-relaxed">{report.desc}</p>

                  <button
                    onClick={() => downloadExcel(report.id as 'guests' | 'checkins')}
                    disabled={isLoading || !selectedEvent}
                    className={`w-full flex items-center justify-center gap-2 h-9 rounded-xl text-sm font-medium transition-all ${
                      selectedEvent
                        ? `bg-gradient-to-r ${report.gradient} text-white hover:opacity-90 shadow-sm`
                        : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {isLoading ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <FileSpreadsheet size={14} />
                    )}
                    {isLoading ? 'Exportando...' : 'Exportar Excel'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Tips */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-3">Informações exportadas</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              'Nome e dados de contato',
              'Status de RSVP e convite',
              'Data e hora do check-in',
              'QR Code e validação',
              'Promotor responsável',
              'Observações e notas',
            ].map((item) => (
              <div key={item} className="flex items-center gap-2 text-xs text-gray-500">
                <CheckCircle2 size={13} className="text-emerald-500 flex-shrink-0" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
