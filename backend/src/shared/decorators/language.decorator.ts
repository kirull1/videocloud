import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

/**
 * Декоратор для получения языка из запроса
 * Пример использования: @Language() language: string
 */
export const Language = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest<Request & { language?: string }>();
    return request.language || 'ru'; // Русский по умолчанию, если не определено
  },
); 