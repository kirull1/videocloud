import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChannelsService } from './channels.service';
import { ChannelsController } from './channels.controller';
import { Channel } from '../../entities/channel.entity';
import { Video } from '../../entities/video.entity';
import { User } from '../../entities/user.entity';
import { S3Module } from '../../shared/services/s3.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Channel, Video, User]),
    S3Module,
  ],
  controllers: [ChannelsController],
  providers: [ChannelsService],
  exports: [ChannelsService],
})
export class ChannelsModule {}