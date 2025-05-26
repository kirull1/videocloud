import { Injectable, ExecutionContext, Logger, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    
    this.logger.log(`Auth header: ${authHeader ? authHeader.substring(0, 20) + '...' : 'none'}`);
    
    this.logger.log(`Request method: ${request.method}`);
    this.logger.log(`Request URL: ${request.url}`);
    
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    if (err || !user) {
      this.logger.error(`JWT authentication failed: ${err?.message || 'No user'}`);
      this.logger.error(`JWT info: ${JSON.stringify(info)}`);
      
      throw new UnauthorizedException(info?.message || 'Unauthorized');
    }
    
    this.logger.log(`User authenticated: ${user.username} (${user.id})`);
    return user;
  }
}
