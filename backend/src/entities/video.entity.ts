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

@Entity('videos')
export class Video {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'title' })
  title!: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'file_path', nullable: true })
  filePath?: string;

  @Column({ name: 'thumbnail_path', nullable: true })
  thumbnailUrl?: string;

  @Column({ name: 'duration', nullable: true })
  duration?: number;

  @Column({ name: 'views', default: 0 })
  views!: number;

  @Column({ name: 'likes_count', default: 0 })
  likesCount!: number;

  @Column({ name: 'dislikes_count', default: 0 })
  dislikesCount!: number;

  @Column({ name: 'is_public', default: true })
  isPublic!: boolean;

  @Column({ name: 'user_id' })
  userId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ name: 'category_id', nullable: true })
  categoryId?: string;

  @ManyToOne(() => Category, (category) => category.videos, { nullable: true })
  @JoinColumn({ name: 'category_id' })
  category?: Category;

  @ManyToMany(() => Tag, (tag) => tag.videos)
  @JoinTable({
    name: 'video_tags',
    joinColumn: {
      name: 'video_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'tag_id',
      referencedColumnName: 'id',
    },
  })
  tags!: Tag[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
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
