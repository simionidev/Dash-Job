'use client';

import { Bell } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { roleLabels } from '@/lib/utils';

interface HeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function Header({ title, subtitle, action }: HeaderProps) {
  const { user } = useAuthStore();

  return (
    <header className="h-[60px] border-b border-gray-100/60 bg-white/80 backdrop-blur-sm px-6 flex items-center justify-between sticky top-0 z-20">
      <div>
        <h1 className="text-[15px] font-semibold text-gray-900 leading-none">{title}</h1>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-2">
        {action}
        <button className="relative w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
          <Bell size={16} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-violet-500 rounded-full" />
        </button>
        <div className="w-px h-5 bg-gray-200 mx-1" />
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="hidden sm:block">
            <p className="text-[12px] font-medium text-gray-800 leading-none">{user?.name}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">{roleLabels[user?.role || '']}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
