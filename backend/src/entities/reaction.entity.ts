import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';
import { User } from './user.entity';
import { Video } from './video.entity';

export enum ReactionType {
  LIKE = 'like',
  DISLIKE = 'dislike',
}

@Entity('reactions')
@Unique(['userId', 'videoId'])
export class Reaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: ReactionType,
    default: ReactionType.LIKE,
  })
  type: ReactionType;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @ManyToOne(() => Video, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'videoId' })
  video: Video;

  @Column()
  videoId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}