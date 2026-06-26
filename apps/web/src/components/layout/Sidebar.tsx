'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, Calendar, Users, ListChecks,
  QrCode, BarChart3, Settings, LogOut, Zap, ChevronRight,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { roleLabels } from '@/lib/utils';

const navGroups = [
  {
    label: 'Principal',
    items: [
      { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', exact: true },
      { href: '/dashboard/events', icon: Calendar, label: 'Eventos' },
    ],
  },
  {
    label: 'Gestão',
    items: [
      { href: '/dashboard/lists', icon: ListChecks, label: 'Listas' },
      { href: '/dashboard/guests', icon: Users, label: 'Convidados' },
      { href: '/dashboard/checkin', icon: QrCode, label: 'Check-in' },
    ],
  },
  {
    label: 'Análise',
    items: [
      { href: '/dashboard/reports', icon: BarChart3, label: 'Relatórios' },
      { href: '/dashboard/settings', icon: Settings, label: 'Configurações' },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + '/');

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <aside className="w-60 h-screen flex flex-col fixed left-0 top-0 bg-[#0d0d14] border-r border-white/[0.06]">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/[0.06]">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-900/50 group-hover:scale-105 transition-transform">
            <Zap size={15} className="text-white" />
          </div>
          <div>
            <span className="text-white font-bold text-[15px] tracking-tight">Dash Job</span>
            <span className="block text-white/30 text-[10px] -mt-0.5">Event Management</span>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-5 scrollbar-none">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="text-white/25 text-[10px] font-semibold uppercase tracking-widest px-3 mb-1.5">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href, item.exact);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all group relative',
                      active
                        ? 'bg-white/10 text-white'
                        : 'text-white/40 hover:text-white/70 hover:bg-white/[0.04]',
                    )}
                  >
                    {active && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-gradient-to-b from-violet-400 to-indigo-500 rounded-full" />
                    )}
                    <Icon size={16} className={active ? 'text-violet-400' : 'text-current'} />
                    {item.label}
                    {active && <ChevronRight size={13} className="ml-auto text-white/30" />}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User */}
      <div className="px-3 pb-4 border-t border-white/[0.06] pt-3">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.05] mb-1">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-medium truncate leading-none mb-0.5">{user?.name}</p>
            <p className="text-white/30 text-[10px] truncate">{roleLabels[user?.role || ''] || user?.role}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 text-white/30 hover:text-red-400 hover:bg-red-500/5 rounded-lg text-xs transition-all"
        >
          <LogOut size={14} />
          Sair da conta
        </button>
      </div>
    </aside>
  );
}
