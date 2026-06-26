import { formatCpf, formatPhone } from './utils';

interface Guest {
  name: string;
  cpf?: string;
  email?: string;
  phone?: string;
  isVip?: boolean;
  rsvp?: { status: string } | null;
  qrCode?: { isValid: boolean } | null;
  checkIn?: boolean | null;
}

const rsvpLabel: Record<string, string> = {
  CONFIRMED: 'Confirmado',
  DECLINED: 'Recusou',
  PENDING: 'Pendente',
};

function buildRows(guests: Guest[]) {
  return guests.map((g, i) => [
    i + 1,
    g.name,
    g.isVip ? 'Sim' : 'Não',
    g.cpf ? formatCpf(g.cpf) : '—',
    g.email || '—',
    g.phone ? formatPhone(g.phone) : '—',
    g.rsvp ? (rsvpLabel[g.rsvp.status] ?? g.rsvp.status) : 'Aguardando',
    g.qrCode?.isValid ? 'Gerado' : 'Não',
    g.checkIn ? 'Sim' : 'Não',
  ]);
}

const HEADERS = ['#', 'Nome', 'VIP', 'CPF', 'Email', 'Telefone', 'RSVP', 'QR Code', 'Check-in'];

// ─── Excel ────────────────────────────────────────────────────────────────────

export async function exportToExcel(guests: Guest[], listName: string) {
  const { utils, writeFile } = await import('xlsx');

  const rows = buildRows(guests);
  const ws = utils.aoa_to_sheet([HEADERS, ...rows]);

  // Column widths
  ws['!cols'] = [4, 28, 5, 15, 28, 16, 12, 10, 10].map((w) => ({ wch: w }));

  const wb = utils.book_new();
  utils.book_append_sheet(wb, ws, 'Convidados');
  writeFile(wb, `${listName.replace(/\s+/g, '_')}_convidados.xlsx`);
}

// ─── PDF ──────────────────────────────────────────────────────────────────────

export async function exportToPdf(guests: Guest[], listName: string, eventName?: string) {
  const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ]);

  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  // Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(listName, 14, 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(120);
  if (eventName) doc.text(`Evento: ${eventName}`, 14, 25);
  doc.text(
    `Exportado em ${new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`,
    14,
    eventName ? 30 : 25,
  );

  autoTable(doc, {
    head: [HEADERS],
    body: buildRows(guests),
    startY: eventName ? 35 : 30,
    styles: { fontSize: 8, cellPadding: 2.5 },
    headStyles: { fillColor: [109, 40, 217], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 247, 255] },
    columnStyles: {
      0: { cellWidth: 8 },
      1: { cellWidth: 42 },
      2: { cellWidth: 10 },
      3: { cellWidth: 26 },
      4: { cellWidth: 52 },
      5: { cellWidth: 26 },
      6: { cellWidth: 22 },
      7: { cellWidth: 18 },
      8: { cellWidth: 18 },
    },
  });

  // Page numbers
  const total = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(160);
    doc.text(`Página ${i} de ${total}`, doc.internal.pageSize.width - 14, doc.internal.pageSize.height - 8, { align: 'right' });
  }

  doc.save(`${listName.replace(/\s+/g, '_')}_convidados.pdf`);
}
