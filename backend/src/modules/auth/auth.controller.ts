import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Language } from '../../shared/decorators/language.decorator';
import { I18nService } from '../../shared/services/i18n/i18n.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly i18nService: I18nService
  ) {}

  @Post('register')
  async register(
    @Body() registerDto: RegisterDto,
    @Language() language: string
  ) {
    const result = await this.authService.register(registerDto);
    return {
      ...result,
      message: this.i18nService.translate('auth', 'registrationSuccess', language)
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
    @Language() language: string
  ) {
    const result = await this.authService.login(loginDto);
    return {
      ...result,
      message: this.i18nService.translate('auth', 'loginSuccess', language)
    };
  }
}
