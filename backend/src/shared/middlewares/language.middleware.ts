import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { I18nService } from '../services/i18n/i18n.service';

/**
 * Промежуточное ПО для определения языка запроса и установки его в request
 */
@Injectable()
export class LanguageMiddleware implements NestMiddleware {
  constructor(private readonly i18nService: I18nService) {}

  /**
   * Определяет язык из заголовка запроса и добавляет его в объект запроса
   */
  use(req: Request & { language?: string }, res: Response, next: NextFunction) {
    // Определяем язык из заголовка запроса
    const language = this.i18nService.getLanguage(req);
    
    // Добавляем язык в объект запроса
    req.language = language;
    
    next();
  }
} 