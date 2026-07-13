'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Calendar, ListChecks, QrCode, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSidebarStore } from '@/store/sidebar.store';

const items = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Início', exact: true },
  { href: '/dashboard/events', icon: Calendar, label: 'Eventos' },
  { href: '/dashboard/lists', icon: ListChecks, label: 'Listas' },
  { href: '/dashboard/checkin', icon: QrCode, label: 'Check-in' },
];

export function BottomNav() {
  const pathname = usePathname();
  const { toggle } = useSidebarStore();

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + '/');

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-100 shadow-[0_-1px_12px_rgba(0,0,0,0.06)]">
      <div className="flex items-center justify-around h-[60px] px-1">
        {items.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href, item.exact);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 flex-1 h-full px-1 transition-colors',
                active ? 'text-violet-600' : 'text-gray-400 active:text-gray-600',
              )}
            >
              <div className={cn(
                'w-10 h-6 flex items-center justify-center rounded-full transition-all',
                active && 'bg-violet-100',
              )}>
                <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
              </div>
              <span className="text-[10px] font-medium leading-none">{item.label}</span>
            </Link>
          );
        })}

        {/* Mais — abre o drawer com itens secundários */}
        <button
          onClick={toggle}
          className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full px-1 text-gray-400 active:text-gray-600 transition-colors"
        >
          <div className="w-10 h-6 flex items-center justify-center rounded-full">
            <MoreHorizontal size={20} strokeWidth={1.8} />
          </div>
          <span className="text-[10px] font-medium leading-none">Mais</span>
        </button>
      </div>

      {/* Safe area iOS */}
      <div className="h-safe-bottom bg-white" style={{ height: 'env(safe-area-inset-bottom)' }} />
    </nav>
  );
}
