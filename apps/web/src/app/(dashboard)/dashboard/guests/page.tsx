'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/layout/Header';
import api from '@/lib/api';
import { formatPhone, formatCpf } from '@/lib/utils';
import {
  Users, Search, CheckCircle2, Star, Loader2,
  Mail, Phone, ChevronRight, Calendar, ChevronDown,
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function GuestsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [guests, setGuests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'vip' | 'checkedin'>('all');

  useEffect(() => {
    api.get('/events').then((r) => setEvents(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (selectedEvent) loadGuests();
    else setGuests([]);
  }, [selectedEvent]);

  async function loadGuests() {
    setLoading(true);
    try {
      const { data } = await api.get(`/guests/event/${selectedEvent}`);
      setGuests(data);
    } catch { toast.error('Erro ao carregar convidados'); }
    finally { setLoading(false); }
  }

  const filtered = guests.filter((g) => {
    const matchSearch =
      g.name?.toLowerCase().includes(search.toLowerCase()) ||
      g.email?.toLowerCase().includes(search.toLowerCase()) ||
      g.cpf?.includes(search);
    const matchFilter =
      filter === 'all' ? true :
      filter === 'vip' ? g.isVip :
      !!g.checkIn;
    return matchSearch && matchFilter;
  });

  const stats = {
    total: guests.length,
    vip: guests.filter((g) => g.isVip).length,
    checkedIn: guests.filter((g) => g.checkIn).length,
    confirmed: guests.filter((g) => g.rsvp?.status === 'CONFIRMED').length,
  };

  return (
    <div>
      <Header title="Convidados" subtitle="Visualize convidados por evento" />

      <div className="p-6 space-y-5">
        {/* Event selector */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Filtrar por evento</p>
          <div className="relative">
            <Calendar size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <select
              value={selectedEvent}
              onChange={(e) => { setSelectedEvent(e.target.value); setSearch(''); setFilter('all'); }}
              className="w-full pl-9 pr-10 h-10 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-400/50 focus:border-violet-400 transition appearance-none bg-white"
            >
              <option value="">Selecione um evento...</option>
              {events.map((e) => (
                <option key={e.id} value={e.id}>{e.name}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {selectedEvent && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
              {[
                { label: 'Total',       value: stats.total,     icon: Users,        bg: 'bg-violet-50',  cls: 'text-violet-600' },
                { label: 'VIPs',        value: stats.vip,       icon: Star,         bg: 'bg-amber-50',   cls: 'text-amber-600' },
                { label: 'Check-ins',   value: stats.checkedIn, icon: CheckCircle2, bg: 'bg-emerald-50', cls: 'text-emerald-600' },
                { label: 'Confirmados', value: stats.confirmed, icon: Mail,         bg: 'bg-indigo-50',  cls: 'text-indigo-600' },
              ].map((s) => {
                const Icon = s.icon;
                return (
                  <div key={s.label} className="bg-white rounded-xl border border-gray-100 px-4 py-3 flex items-center gap-3 shadow-sm">
                    <div className={`w-9 h-9 rounded-lg ${s.bg} flex items-center justify-center flex-shrink-0`}>
                      <Icon size={17} className={s.cls} />
                    </div>
                    <div>
                      <p className="text-xl font-bold text-gray-900 leading-none">{s.value}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">{s.label}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Filters + Search */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative flex-1 max-w-xs">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar por nome, e-mail ou CPF..."
                  className="w-full pl-9 pr-4 h-9 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-400/50 focus:border-violet-400 transition"
                />
              </div>
              <div className="flex gap-2">
                {([
                  { key: 'all'       as const, label: 'Todos' },
                  { key: 'vip'       as const, label: 'VIPs' },
                  { key: 'checkedin' as const, label: 'Check-in' },
                ]).map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setFilter(f.key)}
                    className={`h-9 px-3 text-xs font-medium rounded-lg border transition-all ${
                      filter === f.key
                        ? 'bg-violet-600 text-white border-violet-600'
                        : 'bg-white text-gray-500 border-gray-200 hover:border-violet-300'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Table */}
            {loading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="animate-spin text-violet-600" size={28} />
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-50">
                      <th className="text-left py-3 px-5 text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Convidado</th>
                      <th className="text-left py-3 px-5 text-[11px] font-semibold text-gray-400 uppercase tracking-wide hidden sm:table-cell">Contato</th>
                      <th className="text-left py-3 px-5 text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Lista</th>
                      <th className="text-left py-3 px-5 text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Status</th>
                      <th className="py-3 px-5" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filtered.map((guest) => (
                      <tr key={guest.id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center text-violet-600 text-xs font-bold flex-shrink-0">
                              {guest.name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <p className="font-medium text-gray-900 text-sm leading-none">{guest.name}</p>
                                {guest.isVip && (
                                  <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-md font-semibold">VIP</span>
                                )}
                              </div>
                              {guest.cpf && <p className="text-xs text-gray-400 mt-0.5">{formatCpf(guest.cpf)}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-5 hidden sm:table-cell">
                          <div className="text-xs text-gray-500 space-y-0.5">
                            {guest.email && (
                              <p className="flex items-center gap-1.5">
                                <Mail size={11} className="text-gray-300" />
                                <span className="truncate max-w-[160px]">{guest.email}</span>
                              </p>
                            )}
                            {guest.phone && (
                              <p className="flex items-center gap-1.5">
                                <Phone size={11} className="text-gray-300" />
                                {formatPhone(guest.phone)}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-5">
                          {guest.list ? (
                            <Link href={`/dashboard/lists/${guest.list.id}`} className="text-xs text-violet-600 hover:underline font-medium">
                              {guest.list.name}
                            </Link>
                          ) : (
                            <span className="text-xs text-gray-300">—</span>
                          )}
                        </td>
                        <td className="py-3.5 px-5">
                          {guest.checkIn ? (
                            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
                              <CheckCircle2 size={12} /> Check-in
                            </span>
                          ) : guest.rsvp?.status === 'CONFIRMED' ? (
                            <span className="text-[11px] text-indigo-600 font-medium">Confirmado</span>
                          ) : (
                            <span className="text-[11px] text-gray-400">Pendente</span>
                          )}
                        </td>
                        <td className="py-3.5 px-5">
                          {guest.list && (
                            <Link href={`/dashboard/lists/${guest.list.id}`} className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition">
                              <ChevronRight size={14} />
                            </Link>
                          )}
                        </td>
                      </tr>
                    ))}
                    {!filtered.length && (
                      <tr>
                        <td colSpan={5} className="py-14 text-center">
                          <div className="flex flex-col items-center gap-2">
                            <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center">
                              <Users size={22} className="text-gray-200" />
                            </div>
                            <p className="text-sm text-gray-400 font-medium">Nenhum convidado encontrado</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
                {filtered.length > 0 && (
                  <div className="px-5 py-3 border-t border-gray-50">
                    <p className="text-xs text-gray-400">{filtered.length} convidado(s) exibido(s)</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {!selectedEvent && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
              <Users size={28} className="text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium">Selecione um evento</p>
            <p className="text-gray-400 text-sm mt-1">Escolha um evento acima para ver os convidados</p>
          </div>
        )}
      </div>
    </div>
  );
}
