import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import { appConfig } from '@config/app.config';
import { translations } from '../../types/translations';

@Injectable()
export class I18nService {
  /**
   * Определяет язык из заголовка запроса или возвращает язык по умолчанию
   * @param req Request объект Express
   * @returns код языка (ru, en, etc.)
   */
  getLanguage(req: Request): string {
    const { defaultLanguage, supportedLanguages, headerName, fallbackLanguage } = appConfig.i18n;
    
    // Получаем язык из заголовка, если он существует
    let lang = req.headers[headerName] as string;
    
    // Если заголовок не содержит языка, используем язык по умолчанию
    if (!lang) {
      return defaultLanguage;
    }
    
    // Обрабатываем формат типа 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7'
    if (lang.includes(',') || lang.includes(';')) {
      // Берем первый язык из списка (наиболее предпочтительный)
      lang = lang.split(',')[0].split(';')[0].trim();
    }
    
    // Если язык содержит региональную часть (ru-RU), берем только основную часть (ru)
    if (lang.includes('-')) {
      lang = lang.split('-')[0].toLowerCase();
    }
    
    // Проверяем, поддерживается ли этот язык
    if (supportedLanguages.includes(lang)) {
      return lang;
    }
    
    // Если язык не поддерживается, возвращаем fallback
    return fallbackLanguage;
  }

  /**
   * Получает перевод для ключа в указанной категории
   * @param category категория перевода (auth, common, etc.)
   * @param key ключ перевода
   * @param language код языка (ru, en)
   * @returns переведенный текст
   */
  translate(category: string, key: string, language: string): string {
    // Проверяем существование категории
    if (!translations[category]) {
      return `[Missing category: ${category}]`;
    }
    
    // Проверяем существование ключа в категории
    if (!translations[category][key]) {
      return `[Missing key: ${category}.${key}]`;
    }
    
    // Получаем перевод для указанного языка
    const translation = translations[category][key][language];
    
    // Если перевод существует, возвращаем его
    if (translation) {
      return translation;
    }
    
    // Если перевода нет, возвращаем для языка по умолчанию
    const defaultTranslation = translations[category][key][appConfig.i18n.defaultLanguage];
    
    // Если есть перевод для языка по умолчанию, возвращаем его
    if (defaultTranslation) {
      return defaultTranslation;
    }
    
    // Если нет перевода ни для запрошенного языка, ни для языка по умолчанию, возвращаем ключ
    return `[${category}.${key}]`;
  }
} 