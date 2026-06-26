'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { Header } from '@/components/layout/Header';
import { ArrowLeft, Loader2, Calendar, MapPin, Users, Settings, Info } from 'lucide-react';
import Link from 'next/link';

const schema = z.object({
  name: z.string().min(3, 'Nome obrigatório'),
  description: z.string().optional(),
  date: z.string().min(1, 'Data obrigatória'),
  endDate: z.string().optional(),
  location: z.string().min(2, 'Local obrigatório'),
  address: z.string().optional(),
  capacity: z.coerce.number().optional(),
  isPublic: z.boolean().default(false),
  allowWaitlist: z.boolean().default(true),
  requireCpf: z.boolean().default(false),
});

type FormData = z.infer<typeof schema>;

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{children}</label>;
}

function TextInput({ error, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { error?: string }) {
  return (
    <>
      <input
        {...props}
        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-400/50 focus:border-violet-400 transition bg-white"
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </>
  );
}

function Section({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center">
          <Icon size={15} className="text-violet-600" />
        </div>
        <p className="font-semibold text-gray-900 text-sm">{title}</p>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

export default function NewEventPage() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      await api.post('/events', { ...data, status: 'DRAFT' });
      toast.success('Evento criado com sucesso!');
      router.push('/dashboard/events');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao criar evento');
    }
  };

  return (
    <div>
      <Header title="Novo Evento" subtitle="Preencha as informações do evento" />

      <div className="p-6 max-w-2xl">
        <Link href="/dashboard/events" className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-violet-600 transition-colors mb-5">
          <ArrowLeft size={13} /> Voltar para eventos
        </Link>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Section icon={Info} title="Informações básicas">
            <div>
              <FieldLabel>Nome do Evento *</FieldLabel>
              <TextInput
                {...register('name')}
                placeholder="Open Bar Saturday"
                error={errors.name?.message}
              />
            </div>
            <div>
              <FieldLabel>Descrição</FieldLabel>
              <textarea
                {...register('description')}
                rows={3}
                placeholder="Descreva o evento, atrações, dress code..."
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-400/50 focus:border-violet-400 transition resize-none"
              />
            </div>
          </Section>

          <Section icon={Calendar} title="Data e horário">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <FieldLabel>Início *</FieldLabel>
                <TextInput
                  {...register('date')}
                  type="datetime-local"
                  error={errors.date?.message}
                />
              </div>
              <div>
                <FieldLabel>Fim</FieldLabel>
                <TextInput
                  {...register('endDate')}
                  type="datetime-local"
                />
              </div>
            </div>
          </Section>

          <Section icon={MapPin} title="Local">
            <div>
              <FieldLabel>Nome do local *</FieldLabel>
              <TextInput
                {...register('location')}
                placeholder="Club W, The Venue..."
                error={errors.location?.message}
              />
            </div>
            <div>
              <FieldLabel>Endereço completo</FieldLabel>
              <TextInput
                {...register('address')}
                placeholder="Rua, número, bairro, cidade"
              />
            </div>
          </Section>

          <Section icon={Users} title="Capacidade">
            <div>
              <FieldLabel>Capacidade máxima</FieldLabel>
              <TextInput
                {...register('capacity')}
                type="number"
                placeholder="500"
              />
              <p className="text-xs text-gray-400 mt-1">Deixe vazio para ilimitado</p>
            </div>
          </Section>

          <Section icon={Settings} title="Configurações">
            <div className="space-y-3">
              {[
                { name: 'isPublic',      label: 'Evento público', desc: 'Visível sem necessidade de convite' },
                { name: 'allowWaitlist', label: 'Lista de espera', desc: 'Permitir inscrições após atingir a capacidade' },
                { name: 'requireCpf',    label: 'CPF obrigatório', desc: 'Exigir CPF no cadastro de convidados' },
              ].map((opt) => (
                <label key={opt.name} className="flex items-start gap-3 cursor-pointer p-3 rounded-xl hover:bg-gray-50 transition-colors">
                  <input
                    {...register(opt.name as any)}
                    type="checkbox"
                    className="mt-0.5 w-4 h-4 accent-violet-600 flex-shrink-0"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-800">{opt.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{opt.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </Section>

          {/* Submit */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 h-10 border border-gray-200 text-gray-500 text-sm font-medium rounded-xl hover:bg-gray-50 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 h-10 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white text-sm font-semibold rounded-xl transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isSubmitting && <Loader2 size={15} className="animate-spin" />}
              {isSubmitting ? 'Criando...' : 'Criar Evento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
