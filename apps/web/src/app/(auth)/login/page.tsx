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
    <div className="min-h-screen flex bg-[#07070e]">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a0847] via-[#1e1070] to-[#0a0820]" />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              radial-gradient(ellipse at 25% 45%, rgba(139,92,246,0.35) 0%, transparent 55%),
              radial-gradient(ellipse at 75% 15%, rgba(99,102,241,0.20) 0%, transparent 45%),
              radial-gradient(ellipse at 60% 85%, rgba(79,70,229,0.15) 0%, transparent 40%)
            `,
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo in branded white card */}
          <div className="inline-flex">
            <div className="bg-white rounded-2xl px-4 py-3 shadow-2xl shadow-black/60">
              <Image
                src="/logo.png"
                alt="Dash Job Eventos"
                width={130}
                height={44}
                className="object-contain"
                priority
              />
            </div>
          </div>

          <div>
            <div className="inline-flex items-center gap-2 bg-white/[0.08] border border-white/[0.15] rounded-full px-4 py-2 mb-8 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-white/70 text-sm font-medium">Plataforma ao vivo</span>
            </div>

            <h1 className="text-[52px] font-bold text-white leading-[1.1] tracking-tight mb-5">
              Gerencie eventos<br />
              <span className="bg-gradient-to-r from-violet-300 via-purple-300 to-indigo-300 bg-clip-text text-transparent">
                com inteligência
              </span>
            </h1>
            <p className="text-white/55 text-[17px] leading-relaxed max-w-[420px]">
              Listas VIP, credenciamento por QR Code, RSVP, relatórios em tempo real e muito mais.
            </p>

            <div className="grid grid-cols-3 gap-3 mt-12">
              {[
                { label: 'Eventos gerenciados', value: '12k+' },
                { label: 'Convidados credenciados', value: '2M+' },
                { label: 'Promotores ativos', value: '8k+' },
              ].map((s) => (
                <div
                  key={s.label}
                  className="bg-white/[0.07] border border-white/[0.13] rounded-2xl p-5 backdrop-blur-sm"
                >
                  <p className="text-[28px] font-bold text-white mb-1 tracking-tight">{s.value}</p>
                  <p className="text-white/45 text-xs leading-snug">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          <p className="text-white/20 text-sm">© 2025 Dash Job. Todos os direitos reservados.</p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-16 relative">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse at 0% 50%, rgba(99,102,241,0.07) 0%, transparent 60%)',
          }}
        />

        <div className="w-full max-w-[400px] relative">
          {/* Mobile logo */}
          <div className="flex items-center mb-10 lg:hidden">
            <div className="bg-white rounded-2xl px-4 py-3 shadow-xl shadow-black/40">
              <Image
                src="/logo.png"
                alt="Dash Job"
                width={120}
                height={40}
                className="object-contain"
                priority
              />
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-[32px] font-bold text-white tracking-tight mb-2">Entrar</h2>
            <p className="text-white/40 text-[15px]">Acesse sua conta para continuar</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-white/40 uppercase tracking-widest">
                Email
              </label>
              <input
                {...register('email')}
                type="email"
                placeholder="seu@email.com"
                autoComplete="email"
                className="w-full h-[50px] px-4 rounded-xl bg-white/[0.06] border border-white/[0.14] text-white placeholder:text-white/20 focus:outline-none focus:border-violet-400/70 focus:bg-white/[0.09] transition-all text-[15px]"
              />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-white/40 uppercase tracking-widest">
                Senha
              </label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full h-[50px] px-4 pr-12 rounded-xl bg-white/[0.06] border border-white/[0.14] text-white placeholder:text-white/20 focus:outline-none focus:border-violet-400/70 focus:bg-white/[0.09] transition-all text-[15px]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors p-1"
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>
              )}
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-[50px] rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-[15px] transition-all shadow-xl shadow-violet-900/50 hover:shadow-violet-800/60 hover:scale-[1.015] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? <Loader2 size={17} className="animate-spin" /> : null}
                {isSubmitting ? 'Entrando...' : 'Entrar na plataforma'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
