import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { User } from '../../entities/user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { S3Module } from '../../shared/services/s3.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    MulterModule.register({
      // Don't specify dest to use memory storage by default
    }),
    S3Module,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
