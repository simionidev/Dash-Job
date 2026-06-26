'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import api from '@/lib/api';
import { formatPhone, formatCpf, listTypeLabels } from '@/lib/utils';
import {
  UserPlus, Search, Send, QrCode, CheckCircle2, XCircle,
  Loader2, ArrowLeft, Users, Star, Eye, Zap,
  Download, FileSpreadsheet, FileText, ChevronDown,
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { QrCodeModal } from '@/components/QrCodeModal';
import { exportToExcel, exportToPdf } from '@/lib/export';

const rsvpConfig: Record<string, { label: string; cls: string }> = {
  CONFIRMED: { label: 'Confirmado', cls: 'bg-emerald-50 text-emerald-700' },
  DECLINED:  { label: 'Recusou',    cls: 'bg-red-50 text-red-600' },
  PENDING:   { label: 'Pendente',   cls: 'bg-amber-50 text-amber-700' },
};

interface QrState {
  guestName: string;
  image: string;
}

export default function ListDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [list, setList] = useState<any>(null);
  const [guests, setGuests] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAddGuest, setShowAddGuest] = useState(false);
  const [newGuest, setNewGuest] = useState({ name: '', email: '', phone: '', cpf: '' });
  const [saving, setSaving] = useState(false);
  const [generatingAll, setGeneratingAll] = useState(false);
  const [qrModal, setQrModal] = useState<QrState | null>(null);
  const [loadingQr, setLoadingQr] = useState<string | null>(null);
  const [showExport, setShowExport] = useState(false);

  useEffect(() => { loadData(); }, [id]);

  async function loadData() {
    try {
      const [listRes, guestsRes] = await Promise.all([
        api.get(`/lists/${id}`),
        api.get(`/guests/list/${id}`),
      ]);
      setList(listRes.data);
      setGuests(guestsRes.data);
    } catch { toast.error('Erro ao carregar lista'); }
    finally { setLoading(false); }
  }

  async function searchGuests(q: string) {
    setSearch(q);
    const { data } = await api.get(`/guests/list/${id}?search=${q}`);
    setGuests(data);
  }

  async function addGuest() {
    if (!newGuest.name) return toast.error('Nome obrigatório');
    try {
      setSaving(true);
      await api.post('/guests', { ...newGuest, listId: id });
      toast.success('Convidado adicionado!');
      setNewGuest({ name: '', email: '', phone: '', cpf: '' });
      setShowAddGuest(false);
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao adicionar');
    } finally { setSaving(false); }
  }

  async function sendInvite(guestId: string) {
    try {
      await api.post(`/invitations/send/${guestId}`, { channel: 'EMAIL' });
      toast.success('Convite enviado!');
    } catch { toast.error('Erro ao enviar convite'); }
  }

  async function generateQr(guestId: string, guestName: string) {
    try {
      setLoadingQr(guestId);
      const { data } = await api.post(`/qrcode/generate/${guestId}`);
      loadData();
      setQrModal({ guestName, image: data.image });
    } catch { toast.error('Erro ao gerar QR Code'); }
    finally { setLoadingQr(null); }
  }

  async function generateAllQr() {
    try {
      setGeneratingAll(true);
      await api.post(`/qrcode/bulk/${id}`);
      toast.success('QR Codes gerados para todos os convidados!');
      loadData();
    } catch { toast.error('Erro ao gerar QR Codes em massa'); }
    finally { setGeneratingAll(false); }
  }

  async function handleExcelExport() {
    setShowExport(false);
    try {
      await exportToExcel(guests, list?.name || 'Lista');
    } catch { toast.error('Erro ao exportar Excel'); }
  }

  async function handlePdfExport() {
    setShowExport(false);
    try {
      await exportToPdf(guests, list?.name || 'Lista', list?.event?.name);
    } catch { toast.error('Erro ao exportar PDF'); }
  }

  const checkedIn = guests.filter((g) => g.checkIn).length;
  const confirmed = guests.filter((g) => g.rsvp?.status === 'CONFIRMED').length;
  const vips = guests.filter((g) => g.isVip).length;
  const withQr = guests.filter((g) => g.qrCode?.isValid).length;

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
          <Loader2 size={20} className="text-white animate-spin" />
        </div>
        <p className="text-gray-400 text-sm">Carregando lista...</p>
      </div>
    </div>
  );

  return (
    <div>
      <Header
        title={list?.name || 'Lista'}
        subtitle={`${listTypeLabels[list?.type] || list?.type} · ${guests.length} convidado(s)`}
        action={
          <div className="flex items-center gap-2">
            {guests.length > 0 && withQr < guests.length && (
              <button
                onClick={generateAllQr}
                disabled={generatingAll}
                className="flex items-center gap-1.5 h-8 px-3 border border-gray-200 text-gray-600 text-xs font-semibold rounded-lg hover:bg-gray-50 transition disabled:opacity-60"
              >
                {generatingAll ? <Loader2 size={13} className="animate-spin" /> : <Zap size={13} />}
                Gerar todos os QR
              </button>
            )}
            {/* Export dropdown */}
            {guests.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setShowExport((v) => !v)}
                  className="flex items-center gap-1.5 h-8 px-3 border border-gray-200 text-gray-600 text-xs font-semibold rounded-lg hover:bg-gray-50 transition"
                >
                  <Download size={13} /> Exportar <ChevronDown size={11} className={`transition-transform ${showExport ? 'rotate-180' : ''}`} />
                </button>
                {showExport && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowExport(false)} />
                    <div className="absolute right-0 mt-1.5 w-44 bg-white rounded-xl border border-gray-100 shadow-lg z-20 overflow-hidden">
                      <button
                        onClick={handleExcelExport}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
                      >
                        <FileSpreadsheet size={15} className="text-emerald-600" /> Excel (.xlsx)
                      </button>
                      <button
                        onClick={handlePdfExport}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
                      >
                        <FileText size={15} className="text-red-500" /> PDF (.pdf)
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
            <button
              onClick={() => setShowAddGuest(true)}
              className="flex items-center gap-1.5 h-8 px-3 bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold rounded-lg transition-colors"
            >
              <UserPlus size={14} /> Adicionar
            </button>
          </div>
        }
      />

      <div className="p-6 space-y-5">
        {/* Back link */}
        <Link href={`/dashboard/events/${list?.eventId}`} className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-violet-600 transition-colors">
          <ArrowLeft size={13} /> Voltar ao evento
        </Link>

        {/* Stats strip */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { icon: Users,       label: 'Total',     value: guests.length,  cls: 'text-indigo-600',  bg: 'bg-indigo-50' },
            { icon: CheckCircle2,label: 'Check-ins', value: checkedIn,      cls: 'text-emerald-600', bg: 'bg-emerald-50' },
            { icon: Star,        label: 'VIPs',      value: vips,           cls: 'text-amber-600',   bg: 'bg-amber-50' },
            { icon: QrCode,      label: 'QR Codes',  value: withQr,         cls: 'text-violet-600',  bg: 'bg-violet-50' },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-100 px-4 py-3 flex items-center gap-3 shadow-sm">
              <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center flex-shrink-0`}>
                <s.icon size={16} className={s.cls} />
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900 leading-none">{s.value}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Add Guest Form */}
        {showAddGuest && (
          <div className="bg-white rounded-2xl border border-violet-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 text-sm">Novo Convidado</h3>
              <button onClick={() => setShowAddGuest(false)} className="text-gray-300 hover:text-gray-500 transition">
                <XCircle size={18} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: 'name',  label: 'Nome *',   placeholder: 'Nome completo' },
                { key: 'email', label: 'Email',    placeholder: 'email@exemplo.com' },
                { key: 'phone', label: 'Telefone', placeholder: '11 99999-0000' },
                { key: 'cpf',   label: 'CPF',      placeholder: '000.000.000-00' },
              ].map((f) => (
                <div key={f.key}>
                  <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1">{f.label}</label>
                  <input
                    value={(newGuest as any)[f.key]}
                    onChange={(e) => setNewGuest((prev) => ({ ...prev, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-400/50 focus:border-violet-400 transition"
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setShowAddGuest(false)}
                className="px-4 py-2 text-sm text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
              <button
                onClick={addGuest}
                disabled={saving}
                className="px-4 py-2 text-sm bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition disabled:opacity-70 flex items-center gap-2"
              >
                {saving && <Loader2 size={13} className="animate-spin" />}
                Adicionar
              </button>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="relative max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => searchGuests(e.target.value)}
            placeholder="Buscar por nome, CPF ou telefone..."
            className="w-full pl-9 pr-4 h-9 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-400/50 focus:border-violet-400 transition"
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-50">
                <th className="text-left py-3 px-5 text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Convidado</th>
                <th className="text-left py-3 px-5 text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Contato</th>
                <th className="text-left py-3 px-5 text-[11px] font-semibold text-gray-400 uppercase tracking-wide">RSVP</th>
                <th className="text-left py-3 px-5 text-[11px] font-semibold text-gray-400 uppercase tracking-wide">QR Code</th>
                <th className="text-left py-3 px-5 text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Check-in</th>
                <th className="text-right py-3 px-5 text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {guests.map((guest) => (
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
                  <td className="py-3.5 px-5">
                    <div className="text-xs text-gray-500 space-y-0.5">
                      {guest.email && <p className="truncate max-w-[160px]">{guest.email}</p>}
                      {guest.phone && <p>{formatPhone(guest.phone)}</p>}
                      {!guest.email && !guest.phone && <p className="text-gray-300">—</p>}
                    </div>
                  </td>
                  <td className="py-3.5 px-5">
                    {guest.rsvp ? (
                      <span className={`text-[11px] px-2.5 py-1 rounded-full font-medium ${rsvpConfig[guest.rsvp.status]?.cls || 'bg-gray-100 text-gray-500'}`}>
                        {rsvpConfig[guest.rsvp.status]?.label || guest.rsvp.status}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-300">Aguardando</span>
                    )}
                  </td>
                  <td className="py-3.5 px-5">
                    {guest.qrCode?.isValid ? (
                      <button
                        onClick={() => generateQr(guest.id, guest.name)}
                        className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 transition"
                        title="Ver QR Code"
                      >
                        <CheckCircle2 size={15} className="fill-emerald-100" />
                        <span className="text-[11px] font-medium">Gerado</span>
                        <Eye size={11} className="opacity-50" />
                      </button>
                    ) : (
                      <span className="text-xs text-gray-300">—</span>
                    )}
                  </td>
                  <td className="py-3.5 px-5">
                    {guest.checkIn ? (
                      <span className="inline-flex items-center gap-1 text-indigo-600">
                        <CheckCircle2 size={15} className="fill-indigo-100" />
                        <span className="text-[11px] font-medium">Entrou</span>
                      </span>
                    ) : (
                      <span className="text-xs text-gray-300">—</span>
                    )}
                  </td>
                  <td className="py-3.5 px-5">
                    <div className="flex items-center justify-end gap-1">
                      {!guest.invitation && (
                        <button
                          onClick={() => sendInvite(guest.id)}
                          className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition"
                          title="Enviar convite"
                        >
                          <Send size={13} />
                        </button>
                      )}
                      <button
                        onClick={() => generateQr(guest.id, guest.name)}
                        disabled={loadingQr === guest.id}
                        className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition disabled:opacity-50"
                        title={guest.qrCode?.isValid ? 'Ver QR Code' : 'Gerar QR Code'}
                      >
                        {loadingQr === guest.id
                          ? <Loader2 size={13} className="animate-spin" />
                          : <QrCode size={13} />
                        }
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!guests.length && (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center">
                        <Users size={22} className="text-gray-200" />
                      </div>
                      <p className="text-sm text-gray-400 font-medium">Nenhum convidado ainda</p>
                      <p className="text-xs text-gray-300">Adicione o primeiro convidado para esta lista</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {guests.length > 0 && (
            <div className="px-5 py-3 border-t border-gray-50 flex items-center justify-between">
              <p className="text-xs text-gray-400">{guests.length} convidado(s)</p>
              <div className="flex items-center gap-3 text-xs text-gray-400">
                <span className="flex items-center gap-1"><CheckCircle2 size={12} className="text-emerald-500" /> {checkedIn} check-in(s)</span>
                <span className="flex items-center gap-1"><QrCode size={12} className="text-violet-400" /> {withQr} QR Code(s)</span>
                <span className="flex items-center gap-1"><Star size={12} className="text-amber-400" /> {vips} VIP(s)</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* QR Code Modal */}
      {qrModal && (
        <QrCodeModal
          open
          onClose={() => setQrModal(null)}
          guestName={qrModal.guestName}
          eventName={list?.event?.name}
          imageBase64={qrModal.image}
        />
      )}
    </div>
  );
}
