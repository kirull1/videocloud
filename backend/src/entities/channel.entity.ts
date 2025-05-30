import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from './user.entity';
import { Video } from './video.entity';

@Entity('channels')
export class Channel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 255, nullable: true })
  description: string;

  @Column({ name: 'banner_url', nullable: true })
  bannerUrl: string;

  @Column({ name: 'custom_url', nullable: true, unique: true })
  customUrl: string;

  @Column({ name: 'theme_color', nullable: true, default: '#41A4FF' })
  themeColor: string;

  @Column({ name: 'featured_video_id', nullable: true })
  featuredVideoId: string;

  @Column({ name: 'total_views', default: 0 })
  totalViews: number;

  @Column({ name: 'subscriber_count', default: 0 })
  subscriberCount: number;

  @Column({ name: 'video_count', default: 0 })
  videoCount: number;

  @Column({ name: 'user_id' })
  userId: string;

  @OneToOne(() => User, (user) => user.channel, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => Video, (video) => video.channel)
  videos: Video[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}