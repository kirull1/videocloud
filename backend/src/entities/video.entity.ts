import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { User } from './user.entity';
import { Category } from './category.entity';
import { Tag } from './tag.entity';
import { Channel } from './channel.entity';

@Entity('videos')
export class Video {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'title' })
  title!: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'filePath', nullable: true })
  filePath?: string;

  @Column({ name: 'thumbnailUrl', nullable: true })
  thumbnailUrl?: string;

  @Column({ name: 'duration', nullable: true })
  duration?: number;

  @Column({ name: 'views', default: 0 })
  views!: number;

  @Column({ name: 'likesCount', default: 0 })
  likesCount!: number;

  @Column({ name: 'dislikesCount', default: 0 })
  dislikesCount!: number;

  @Column({ name: 'isPublic', default: true })
  isPublic!: boolean;

  @Column({ name: 'userId' })
  userId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column({ name: 'channelId', nullable: true })
  channelId?: string;

  @ManyToOne(() => Channel, (channel) => channel.videos, { nullable: true })
  @JoinColumn({ name: 'channelId' })
  channel?: Channel;

  @Column({ name: 'categoryId', nullable: true })
  categoryId?: string;

  @ManyToOne(() => Category, (category) => category.videos, { nullable: true })
  @JoinColumn({ name: 'categoryId' })
  category?: Category;

  @ManyToMany(() => Tag, (tag) => tag.videos)
  @JoinTable({
    name: 'videoTags',
    joinColumn: {
      name: 'videoId',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'tagId',
      referencedColumnName: 'id',
    },
  })
  tags!: Tag[];

  @CreateDateColumn({ name: 'createdAt' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updatedAt' })
  updatedAt!: Date;
}

// Keep these enums for backward compatibility with existing code
export enum VideoStatus {
  PROCESSING = 'processing',
  READY = 'ready',
  FAILED = 'failed',
}

export enum VideoVisibility {
  PUBLIC = 'public',
  UNLISTED = 'unlisted',
  PRIVATE = 'private',
}
