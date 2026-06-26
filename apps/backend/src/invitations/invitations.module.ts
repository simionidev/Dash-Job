import { Module } from '@nestjs/common';
import { InvitationsService } from './invitations.service';
import { InvitationsController } from './invitations.controller';
import { NotificationsModule } from '../notifications/notifications.module';
import { QrcodeModule } from '../qrcode/qrcode.module';

@Module({
  imports: [NotificationsModule, QrcodeModule],
  controllers: [InvitationsController],
  providers: [InvitationsService],
  exports: [InvitationsService],
})
export class InvitationsModule {}
