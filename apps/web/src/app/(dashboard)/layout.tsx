'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { Loader2 } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // localStorage é síncrono — se não tiver token, vai para login
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.replace('/login');
    } else {
      setReady(true);
    }
  }, []);

  if (!ready) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f5f5f8]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
            <Loader2 size={20} className="text-white animate-spin" />
          </div>
          <p className="text-sm text-gray-400">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#f5f5f8]">
      <Sidebar />
      <main className="flex-1 ml-60 overflow-auto">{children}</main>
    </div>
  );
}
