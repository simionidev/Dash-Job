import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, user, ip, headers } = request;

    return next.handle().pipe(
      tap(async () => {
        if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method) && user) {
          await this.prisma.auditLog.create({
            data: {
              action: this.getAction(method),
              entity: this.getEntity(url),
              userId: user.id,
              organizationId: user.organizationId,
              ipAddress: ip,
              userAgent: headers['user-agent'],
            },
          });
        }
      }),
    );
  }

  private getAction(method: string) {
    const map = { POST: 'CREATE', PUT: 'UPDATE', PATCH: 'UPDATE', DELETE: 'DELETE' };
    return map[method] || 'CREATE';
  }

  private getEntity(url: string) {
    const parts = url.split('/').filter(Boolean);
    return parts[1] || 'unknown';
  }
}
