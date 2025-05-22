import { Exclude, Expose, Type } from 'class-transformer';
import { ReactionType } from '../../../entities/reaction.entity';

export class ReactionResponseDto {
  @Expose()
  id: string;

  @Expose()
  type: ReactionType;

  @Expose()
  videoId: string;

  @Expose()
  userId: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}