import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Channel } from './channel.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ unique: true })
  username!: string;

  @Exclude()
  @Column()
  password!: string;

  @Column({ name: 'isEmailVerified', default: false })
  isEmailVerified!: boolean;

  @Column({ name: 'avatarUrl', nullable: true })
  avatarUrl?: string;

  @Column({ name: 'channelId', nullable: true, unique: true })
  channelId?: string;

  @OneToOne(() => Channel, channel => channel.user, { nullable: true })
  @JoinColumn({ name: 'channelId' })
  channel?: Channel;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updatedAt' })
  updatedAt!: Date;
}
