import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date));
}

export function formatDateTime(date: string | Date) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function formatCpf(cpf: string) {
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

export function formatPhone(phone: string) {
  return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
}

export const listTypeLabels: Record<string, string> = {
  VIP: 'VIP',
  BIRTHDAY: 'Aniversariante',
  GENERAL: 'Geral',
  PROMOTIONAL: 'Promocional',
  CORPORATE: 'Corporativo',
  STANDARD: 'Padrão',
  STAFF: 'Staff',
  PRESS: 'Imprensa',
};

export const eventStatusLabels: Record<string, string> = {
  DRAFT: 'Rascunho',
  PUBLISHED: 'Publicado',
  CANCELLED: 'Cancelado',
  COMPLETED: 'Concluído',
};

export const roleLabels: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin',
  ORGANIZER: 'Organizador',
  PROMOTER: 'Promotor',
  RECEPTION: 'Portaria',
  GUEST: 'Convidado',
};
