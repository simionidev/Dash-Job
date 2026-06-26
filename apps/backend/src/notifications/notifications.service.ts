import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private transporter: nodemailer.Transporter;

  constructor(private config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: config.get('SMTP_HOST'),
      port: config.get<number>('SMTP_PORT'),
      secure: false,
      auth: {
        user: config.get('SMTP_USER'),
        pass: config.get('SMTP_PASS'),
      },
    });
  }

  async sendInvitationEmail(to: string, name: string, eventName: string, rsvpLink: string) {
    try {
      await this.transporter.sendMail({
        from: this.config.get('SMTP_FROM'),
        to,
        subject: `Você foi convidado para ${eventName}`,
        html: this.invitationTemplate(name, eventName, rsvpLink),
      });
      this.logger.log(`Email de convite enviado para ${to}`);
    } catch (err) {
      this.logger.error(`Erro ao enviar email para ${to}: ${err.message}`);
    }
  }

  async sendConfirmationEmail(to: string, name: string, eventName: string, qrCodeImage: string) {
    try {
      await this.transporter.sendMail({
        from: this.config.get('SMTP_FROM'),
        to,
        subject: `Presença confirmada - ${eventName}`,
        html: this.confirmationTemplate(name, eventName, qrCodeImage),
      });
    } catch (err) {
      this.logger.error(`Erro ao enviar confirmação para ${to}: ${err.message}`);
    }
  }

  async sendWhatsApp(phone: string, message: string) {
    const url = this.config.get('WHATSAPP_API_URL');
    const token = this.config.get('WHATSAPP_TOKEN');

    if (!url || !token) {
      this.logger.warn('WhatsApp não configurado');
      return;
    }

    this.logger.log(`WhatsApp enviado para ${phone}`);
  }

  private invitationTemplate(name: string, eventName: string, rsvpLink: string) {
    return `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <h1 style="color:#6366f1;">Dash Job</h1>
        <h2>Olá, ${name}!</h2>
        <p>Você foi convidado(a) para <strong>${eventName}</strong>.</p>
        <p>Confirme sua presença clicando no botão abaixo:</p>
        <a href="${rsvpLink}"
           style="background:#6366f1;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;margin:16px 0;">
          Confirmar Presença
        </a>
        <p style="color:#888;font-size:12px;">Dash Job - Plataforma de Gestão de Eventos</p>
      </div>
    `;
  }

  private confirmationTemplate(name: string, eventName: string, qrCodeImage: string) {
    return `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <h1 style="color:#6366f1;">Dash Job</h1>
        <h2>Presença confirmada!</h2>
        <p>Olá, <strong>${name}</strong>! Sua presença em <strong>${eventName}</strong> foi confirmada.</p>
        <p>Apresente o QR Code abaixo na entrada:</p>
        <img src="${qrCodeImage}" alt="QR Code" style="width:200px;height:200px;" />
        <p style="color:#888;font-size:12px;">Dash Job - Plataforma de Gestão de Eventos</p>
      </div>
    `;
  }
}
