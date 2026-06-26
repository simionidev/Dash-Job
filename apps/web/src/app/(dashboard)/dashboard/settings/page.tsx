'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { useAuthStore } from '@/store/auth.store';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import {
  User, Lock, Building2, Bell, LogOut,
  Save, Loader2, ChevronRight, Shield,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { roleLabels } from '@/lib/utils';

function Section({ icon: Icon, title, desc, children }: {
  icon: React.ElementType; title: string; desc?: string; children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-50">
        <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center flex-shrink-0">
          <Icon size={16} className="text-violet-600" />
        </div>
        <div>
          <p className="font-semibold text-gray-900 text-sm">{title}</p>
          {desc && <p className="text-xs text-gray-400 mt-0.5">{desc}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

export default function SettingsPage() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const [name, setName] = useState(user?.name || '');
  const [savingName, setSavingName] = useState(false);

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [savingPass, setSavingPass] = useState(false);

  async function handleSaveName() {
    if (!name.trim()) return;
    setSavingName(true);
    try {
      await api.patch('/users/me', { name });
      toast.success('Nome atualizado!');
    } catch { toast.error('Erro ao atualizar'); }
    finally { setSavingName(false); }
  }

  async function handleChangePassword() {
    if (!oldPassword || !newPassword) return toast.error('Preencha todos os campos');
    if (newPassword.length < 6) return toast.error('Mínimo 6 caracteres');
    setSavingPass(true);
    try {
      await api.patch('/users/me/password', { oldPassword, newPassword });
      toast.success('Senha alterada!');
      setOldPassword('');
      setNewPassword('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Senha atual incorreta');
    } finally { setSavingPass(false); }
  }

  async function handleLogout() {
    await logout();
    router.push('/login');
  }

  return (
    <div>
      <Header title="Configurações" subtitle="Gerencie sua conta e preferências" />

      <div className="p-6 max-w-2xl space-y-4">
        {/* Profile */}
        <Section icon={User} title="Perfil" desc="Suas informações pessoais">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{user?.name}</p>
              <p className="text-sm text-gray-400">{user?.email}</p>
              <span className="inline-block mt-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-violet-100 text-violet-700">
                {roleLabels[user?.role || ''] || user?.role}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Nome</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-400/50 focus:border-violet-400 transition"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">E-mail</label>
              <input
                value={user?.email || ''}
                disabled
                className="w-full px-3 py-2.5 border border-gray-100 rounded-xl text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
              />
            </div>
            <button
              onClick={handleSaveName}
              disabled={savingName || !name.trim()}
              className="flex items-center gap-2 h-9 px-4 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded-xl transition disabled:opacity-60"
            >
              {savingName ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              Salvar
            </button>
          </div>
        </Section>

        {/* Security */}
        <Section icon={Lock} title="Segurança" desc="Altere sua senha de acesso">
          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Senha atual</label>
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-400/50 focus:border-violet-400 transition"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Nova senha</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-400/50 focus:border-violet-400 transition"
              />
            </div>
            <button
              onClick={handleChangePassword}
              disabled={savingPass}
              className="flex items-center gap-2 h-9 px-4 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded-xl transition disabled:opacity-60"
            >
              {savingPass ? <Loader2 size={14} className="animate-spin" /> : <Shield size={14} />}
              Alterar senha
            </button>
          </div>
        </Section>

        {/* Account info */}
        <Section icon={Building2} title="Conta" desc="Informações da sua organização">
          <div className="space-y-2">
            {[
              { label: 'Plano', value: 'PRO' },
              { label: 'Organização', value: 'Dash Job Demo' },
              { label: 'Função', value: roleLabels[user?.role || ''] || user?.role || '—' },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                <p className="text-sm text-gray-500">{item.label}</p>
                <p className="text-sm font-medium text-gray-800">{item.value}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* Danger zone */}
        <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
              <LogOut size={16} className="text-red-500" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">Sair da plataforma</p>
              <p className="text-xs text-gray-400 mt-0.5">Encerrar sessão atual</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 h-9 px-4 border border-red-200 text-red-600 hover:bg-red-50 text-sm font-medium rounded-xl transition"
          >
            <LogOut size={14} /> Sair da conta
          </button>
        </div>
      </div>
    </div>
  );
}
