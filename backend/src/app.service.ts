import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(language: string = 'ru'): string {
    // Возвращаем приветствие в зависимости от языка
    if (language === 'ru') {
      return 'Привет, мир!';
    }
    return 'Hello, World!';
  }
}
