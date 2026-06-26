'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import api from '@/lib/api';
import { ArrowLeft, Loader2, ListChecks, Calendar, Users, Settings } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

const schema = z.object({
  name: z.string().min(2, 'Nome obrigatório'),
  type: z.enum(['VIP', 'STANDARD', 'STAFF', 'PRESS']),
  eventId: z.string().min(1, 'Selecione um evento'),
  maxGuests: z.coerce.number().optional(),
  isPublic: z.boolean().default(false),
});
type FormData = z.infer<typeof schema>;

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

export default function NewListPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedEventId = searchParams.get('eventId') || '';

  const [events, setEvents] = useState<any[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { type: 'STANDARD', eventId: preselectedEventId, isPublic: false },
  });

  useEffect(() => {
    api.get('/events')
      .then((r) => setEvents(r.data))
      .catch(() => toast.error('Erro ao carregar eventos'))
      .finally(() => setLoadingEvents(false));
  }, []);

  const onSubmit = async (data: FormData) => {
    try {
      const res = await api.post('/lists', data);
      toast.success('Lista criada!');
      router.push(preselectedEventId
        ? `/dashboard/events/${preselectedEventId}`
        : `/dashboard/lists/${res.data.id}`
      );
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao criar lista');
    }
  };

  const typeOptions = [
    { value: 'STANDARD', label: 'Standard', desc: 'Lista padrão de convidados', color: 'border-blue-200 bg-blue-50 text-blue-700' },
    { value: 'VIP',      label: 'VIP',      desc: 'Convidados especiais',       color: 'border-amber-200 bg-amber-50 text-amber-700' },
    { value: 'STAFF',    label: 'Staff',    desc: 'Equipe e colaboradores',     color: 'border-violet-200 bg-violet-50 text-violet-700' },
    { value: 'PRESS',    label: 'Imprensa', desc: 'Jornalistas e mídia',        color: 'border-rose-200 bg-rose-50 text-rose-700' },
  ];

  return (
    <div>
      <Header title="Nova Lista" subtitle="Crie uma lista de convidados" />

      <div className="p-6 max-w-2xl">
        <Link href="/dashboard/lists" className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-violet-600 transition-colors mb-5">
          <ArrowLeft size={13} /> Voltar para listas
        </Link>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Section icon={ListChecks} title="Informações da lista">
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Nome da lista *</label>
              <input
                {...register('name')}
                placeholder="Lista VIP, Lista Staff..."
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-400/50 focus:border-violet-400 transition"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-2">Tipo</label>
              <div className="grid grid-cols-2 gap-2">
                {typeOptions.map((opt) => (
                  <label key={opt.value} className="cursor-pointer">
                    <input {...register('type')} type="radio" value={opt.value} className="sr-only peer" />
                    <div className="p-3 border-2 border-gray-100 rounded-xl peer-checked:border-violet-400 peer-checked:bg-violet-50 hover:border-gray-200 transition-all">
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${opt.color}`}>{opt.label}</span>
                      <p className="text-xs text-gray-400 mt-1.5">{opt.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </Section>

          <Section icon={Calendar} title="Evento">
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Vincular ao evento *</label>
              <select
                {...register('eventId')}
                disabled={loadingEvents}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-400/50 focus:border-violet-400 transition appearance-none bg-white"
              >
                <option value="">Selecione um evento...</option>
                {events.map((e) => (
                  <option key={e.id} value={e.id}>{e.name}</option>
                ))}
              </select>
              {errors.eventId && <p className="text-red-500 text-xs mt-1">{errors.eventId.message}</p>}
            </div>
          </Section>

          <Section icon={Users} title="Capacidade">
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Limite de convidados</label>
              <input
                {...register('maxGuests')}
                type="number"
                placeholder="Deixe vazio para ilimitado"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-400/50 focus:border-violet-400 transition"
              />
            </div>
          </Section>

          <Section icon={Settings} title="Configurações">
            <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl hover:bg-gray-50 transition-colors">
              <input {...register('isPublic')} type="checkbox" className="mt-0.5 w-4 h-4 accent-violet-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-800">Lista pública</p>
                <p className="text-xs text-gray-400 mt-0.5">Convidados podem se inscrever sem convite</p>
              </div>
            </label>
          </Section>

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
              {isSubmitting ? 'Criando...' : 'Criar Lista'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
