import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      /**
       * Код языка, определенный из заголовка Accept-Language
       * или установленный по умолчанию (ru)
       */
      language?: string;
    }
  }
} 