import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

interface JwtPayload {
  sub: string;
  username: string;
  iat: number;
  exp: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    const secret = configService.get<string>('jwt.secret') || 'your-super-secret-key-here';
    
    // Debug logging
    console.log('JWT Strategy initialized');
    console.log('JWT Secret:', secret);
    
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: true, // Ignore token expiration for debugging
      secretOrKey: secret,
    });
  }

  async validate(payload: JwtPayload) {
    console.log('JWT Payload:', JSON.stringify(payload));
    
    try {
      const user = await this.authService.validateUser(payload.sub);
      console.log('User validated:', user.username);
      return user;
    } catch (error: any) {
      console.error('JWT validation error:', error.message);
      throw error;
    }
  }
}
