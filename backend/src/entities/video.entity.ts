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

@Entity('videos')
export class Video {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'title' })
  title!: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description?: string;

  @Column({
    name: 'status',
    type: 'enum',
    enum: VideoStatus,
    default: VideoStatus.PROCESSING,
  })
  status!: VideoStatus;

  @Column({
    name: 'visibility',
    type: 'enum',
    enum: VideoVisibility,
    default: VideoVisibility.PRIVATE,
  })
  visibility!: VideoVisibility;

  @Column({ name: 'file_path', nullable: true })
  filePath?: string;

  @Column({ name: 'duration', nullable: true })
  duration?: number;

  @Column({ name: 'thumbnail_path', nullable: true })
  thumbnailUrl?: string;

  @Column({ name: 'file_size', nullable: true })
  fileSize?: number;

  @Column({ name: 'views', default: 0 })
  views!: number;

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
