'use client';

import { useEffect, useState, useRef } from 'react';
import { Header } from '@/components/layout/Header';
import api from '@/lib/api';
import {
  QrCode, Search, CheckCircle2, XCircle, Loader2,
  Clock, Calendar, AlertCircle, ChevronDown,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDateTime } from '@/lib/utils';

type CheckInResult = {
  success: boolean;
  guest?: any;
  message?: string;
  alreadyCheckedIn?: boolean;
};

export default function CheckInPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CheckInResult | null>(null);
  const [recentCheckIns, setRecentCheckIns] = useState<any[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api.get('/events').then((r) => setEvents(r.data)).catch(() => {});
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (selectedEvent) loadRecentCheckIns();
    else setRecentCheckIns([]);
  }, [selectedEvent]);

  async function loadRecentCheckIns() {
    try {
      // GET /checkin/event/:eventId?page=1&limit=10
      const { data } = await api.get(`/checkin/event/${selectedEvent}?page=1&limit=10`);
      setRecentCheckIns(Array.isArray(data) ? data : (data.items || data.data || []));
    } catch {}
  }

  async function handleCheckIn(e?: React.FormEvent) {
    e?.preventDefault();
    if (!code.trim()) return;
    if (!selectedEvent) return toast.error('Selecione um evento primeiro');

    setLoading(true);
    setResult(null);
    try {
      // POST /checkin/qrcode — body: { token, eventId }
      const { data } = await api.post('/checkin/qrcode', {
        token: code.trim(),
        eventId: selectedEvent,
      });
      setResult({ success: true, guest: data.guest || data, message: 'Check-in realizado!' });
      toast.success('Check-in realizado!');
      setCode('');
      loadRecentCheckIns();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Código inválido ou não encontrado';
      const alreadyIn = msg.toLowerCase().includes('já') || msg.toLowerCase().includes('already');
      setResult({ success: false, message: msg, alreadyCheckedIn: alreadyIn });
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }

  return (
    <div>
      <Header title="Check-in" subtitle="Credenciamento por QR Code" />

      <div className="p-6 space-y-5 max-w-4xl">
        {/* Event selector */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Evento ativo</p>
          <div className="relative">
            <Calendar size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <select
              value={selectedEvent}
              onChange={(e) => { setSelectedEvent(e.target.value); setResult(null); setCode(''); }}
              className="w-full pl-9 pr-10 h-10 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-400/50 focus:border-violet-400 transition appearance-none bg-white"
            >
              <option value="">Selecione o evento para check-in...</option>
              {events.map((e) => (
                <option key={e.id} value={e.id}>{e.name}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {/* QR input */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center">
                <QrCode size={15} className="text-violet-600" />
              </div>
              <p className="font-semibold text-gray-900 text-sm">Leitura de QR Code</p>
            </div>

            <form onSubmit={handleCheckIn} className="space-y-3">
              <div className="relative">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  ref={inputRef}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Aponte o leitor ou cole o código QR..."
                  disabled={!selectedEvent || loading}
                  className="w-full pl-10 pr-4 h-11 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-400/50 focus:border-violet-400 transition disabled:opacity-50 disabled:cursor-not-allowed font-mono"
                  autoComplete="off"
                />
              </div>
              <button
                type="submit"
                disabled={!selectedEvent || !code.trim() || loading}
                className="w-full h-10 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white text-sm font-semibold rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 size={15} className="animate-spin" /> : <QrCode size={15} />}
                {loading ? 'Verificando...' : 'Fazer Check-in'}
              </button>
            </form>

            {/* Result */}
            {result && (
              <div className={`rounded-xl p-4 border ${
                result.success
                  ? 'bg-emerald-50 border-emerald-200'
                  : result.alreadyCheckedIn
                    ? 'bg-amber-50 border-amber-200'
                    : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-start gap-3">
                  {result.success ? (
                    <CheckCircle2 size={20} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                  ) : result.alreadyCheckedIn ? (
                    <AlertCircle size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className={`font-semibold text-sm ${
                      result.success ? 'text-emerald-800' :
                      result.alreadyCheckedIn ? 'text-amber-800' : 'text-red-700'
                    }`}>
                      {result.success ? 'Acesso liberado!' :
                       result.alreadyCheckedIn ? 'Já credenciado' : 'Acesso negado'}
                    </p>
                    {result.guest?.name && (
                      <p className="text-sm font-medium mt-0.5 text-emerald-700">{result.guest.name}</p>
                    )}
                    {!result.success && result.message && (
                      <p className="text-xs text-gray-600 mt-0.5">{result.message}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {!selectedEvent && (
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
                <AlertCircle size={14} className="text-gray-400" />
                <p className="text-xs text-gray-500">Selecione um evento para iniciar</p>
              </div>
            )}
          </div>

          {/* Recent check-ins */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center gap-2.5 px-5 py-4 border-b border-gray-50">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                <Clock size={15} className="text-emerald-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">Entradas recentes</p>
                <p className="text-xs text-gray-400">Últimas entradas registradas</p>
              </div>
            </div>
            <div className="divide-y divide-gray-50">
              {recentCheckIns.length === 0 ? (
                <div className="py-12 flex flex-col items-center gap-2 text-center">
                  <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center">
                    <CheckCircle2 size={22} className="text-gray-200" />
                  </div>
                  <p className="text-sm text-gray-400">
                    {selectedEvent ? 'Nenhuma entrada ainda' : 'Selecione um evento'}
                  </p>
                </div>
              ) : (
                recentCheckIns.map((ci: any) => (
                  <div key={ci.id} className="flex items-center gap-3 px-5 py-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center text-emerald-700 text-xs font-bold flex-shrink-0">
                      {(ci.guest?.name || ci.guestName || '?').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {ci.guest?.name || ci.guestName || 'Convidado'}
                      </p>
                      <p className="text-xs text-gray-400">
                        {ci.guest?.list?.name || ci.listName || ''}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-[11px] text-gray-400">
                        {formatDateTime(ci.checkedAt || ci.createdAt)}
                      </p>
                      <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-700 font-medium">
                        <CheckCircle2 size={10} /> OK
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
