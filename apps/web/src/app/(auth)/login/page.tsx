'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/auth.store';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import Image from 'next/image';

const schema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      await login(data.email, data.password);
      toast.success('Bem-vindo de volta!');
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Credenciais inválidas');
    }
  };

  return (
    <div className="min-h-screen flex bg-[#0a0a0f]">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-900/80 via-indigo-900/60 to-[#0a0a0f]" />
        <div className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, rgba(99,102,241,0.15) 0%, transparent 60%),
                              radial-gradient(circle at 80% 20%, rgba(139,92,246,0.1) 0%, transparent 50%)`,
          }}
        />
        {/* Decorative grid */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div className="flex items-center">
            <Image src="/logo.jpeg" alt="Dash Job" width={140} height={48} className="object-contain" priority />
          </div>

          <div>
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 mb-8">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-white/60 text-sm">Plataforma ao vivo</span>
            </div>
            <h1 className="text-5xl font-bold text-white leading-tight mb-5">
              Gerencie eventos<br />
              <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
                com inteligência
              </span>
            </h1>
            <p className="text-white/50 text-lg leading-relaxed max-w-md">
              Listas VIP, credenciamento por QR Code, RSVP, relatórios em tempo real e muito mais.
            </p>

            <div className="grid grid-cols-3 gap-4 mt-12">
              {[
                { label: 'Eventos gerenciados', value: '12k+' },
                { label: 'Convidados credenciados', value: '2M+' },
                { label: 'Promotores ativos', value: '8k+' },
              ].map((s) => (
                <div key={s.label} className="bg-white/5 border border-white/10 rounded-2xl p-4">
                  <p className="text-2xl font-bold text-white mb-1">{s.value}</p>
                  <p className="text-white/40 text-xs">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          <p className="text-white/20 text-sm">© 2025 Dash Job. Todos os direitos reservados.</p>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center mb-10 lg:hidden">
            <Image src="/logo.jpeg" alt="Dash Job" width={120} height={40} className="object-contain" priority />
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Entrar</h2>
            <p className="text-white/40">Acesse sua conta para continuar</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-white/60">Email</label>
              <input
                {...register('email')}
                type="email"
                placeholder="seu@email.com"
                autoComplete="email"
                className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:border-violet-500 focus:bg-white/8 transition-all"
              />
              {errors.email && <p className="text-red-400 text-xs">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-white/60">Senha</label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full h-12 px-4 pr-12 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:border-violet-500 focus:bg-white/8 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors p-1"
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-sm transition-all shadow-lg shadow-violet-900/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? <Loader2 size={17} className="animate-spin" /> : null}
              {isSubmitting ? 'Entrando...' : 'Entrar na plataforma'}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
