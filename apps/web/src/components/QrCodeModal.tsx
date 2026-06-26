'use client';

import { X, Download, Printer, QrCode } from 'lucide-react';

interface QrCodeModalProps {
  open: boolean;
  onClose: () => void;
  guestName: string;
  eventName?: string;
  imageBase64: string; // data:image/png;base64,...
}

export function QrCodeModal({ open, onClose, guestName, eventName, imageBase64 }: QrCodeModalProps) {
  if (!open) return null;

  function handleDownload() {
    const a = document.createElement('a');
    a.href = imageBase64;
    a.download = `qrcode-${guestName.replace(/\s+/g, '-').toLowerCase()}.png`;
    a.click();
  }

  function handlePrint() {
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`
      <html>
        <head>
          <title>QR Code — ${guestName}</title>
          <style>
            body { margin: 0; display: flex; flex-direction: column; align-items: center;
                   justify-content: center; min-height: 100vh; font-family: Arial, sans-serif; background: #fff; }
            img { width: 260px; height: 260px; }
            h2 { margin: 16px 0 4px; font-size: 18px; color: #111; }
            p  { margin: 0; font-size: 13px; color: #888; }
            @media print { body { padding: 20px; } }
          </style>
        </head>
        <body>
          <img src="${imageBase64}" />
          <h2>${guestName}</h2>
          ${eventName ? `<p>${eventName}</p>` : ''}
          <script>window.onload = () => { window.print(); window.close(); }<\/script>
        </body>
      </html>
    `);
    win.document.close();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center">
              <QrCode size={16} className="text-violet-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">QR Code</p>
              {eventName && <p className="text-xs text-gray-400">{eventName}</p>}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* QR Code Image */}
        <div className="flex flex-col items-center px-8 py-8 gap-4">
          <div className="p-4 bg-white rounded-2xl border-2 border-gray-100 shadow-inner">
            <img
              src={imageBase64}
              alt={`QR Code de ${guestName}`}
              className="w-52 h-52 block"
            />
          </div>

          <div className="text-center">
            <p className="font-semibold text-gray-900">{guestName}</p>
            <p className="text-xs text-gray-400 mt-0.5">Apresentar na entrada do evento</p>
          </div>

          {/* Actions */}
          <div className="flex gap-2 w-full">
            <button
              onClick={handleDownload}
              className="flex-1 flex items-center justify-center gap-2 h-9 border border-gray-200 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-50 transition"
            >
              <Download size={15} /> Baixar
            </button>
            <button
              onClick={handlePrint}
              className="flex-1 flex items-center justify-center gap-2 h-9 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded-xl transition"
            >
              <Printer size={15} /> Imprimir
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
