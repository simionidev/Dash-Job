import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { EventsModule } from './events/events.module';
import { ListsModule } from './lists/lists.module';
import { GuestsModule } from './guests/guests.module';
import { InvitationsModule } from './invitations/invitations.module';
import { RsvpModule } from './rsvp/rsvp.module';
import { QrcodeModule } from './qrcode/qrcode.module';
import { CheckinModule } from './checkin/checkin.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { ReportsModule } from './reports/reports.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AuditModule } from './audit/audit.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    UsersModule,
    OrganizationsModule,
    EventsModule,
    ListsModule,
    GuestsModule,
    InvitationsModule,
    RsvpModule,
    QrcodeModule,
    CheckinModule,
    DashboardModule,
    ReportsModule,
    NotificationsModule,
    AuditModule,
  ],
})
export class AppModule {}
