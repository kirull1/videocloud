import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Language } from './shared/decorators/language.decorator';
import { I18nService } from './shared/services/i18n/i18n.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly i18nService: I18nService,
  ) {}

  @Get()
  getHello(@Language() language: string): string {
    return this.appService.getHello(language);
  }
  
  @Get('info')
  getInfo(@Language() language: string): any {
    return {
      message: this.i18nService.translate('common', 'welcome', language),
      status: this.i18nService.translate('common', 'success', language),
      language,
      timestamp: new Date().toISOString(),
    };
  }
}
