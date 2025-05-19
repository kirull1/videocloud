import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../../entities/user.entity';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@CurrentUser() user: User) {
    return await this.usersService.getProfile(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  async updateProfile(@CurrentUser() user: User, @Body() updateProfileDto: UpdateProfileDto) {
    return await this.usersService.updateProfile(user.id, updateProfileDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('avatar')
  @UseInterceptors(
    FileInterceptor('avatar', {
      limits: {
        fileSize: 1024 * 1024 * 2, // 2MB
      },
      fileFilter: (req, file, callback) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
          return callback(new BadRequestException('Only image files are allowed'), false);
        }
        callback(null, true);
      },
    }),
  )
  async uploadAvatar(@CurrentUser() user: User, @UploadedFile() file: any) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    return await this.usersService.uploadAvatar(user.id, {
      originalname: file.originalname,
      buffer: file.buffer,
      mimetype: file.mimetype,
      size: file.size,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Patch('password')
  async changePassword(@CurrentUser() user: User, @Body() changePasswordDto: ChangePasswordDto) {
    return await this.usersService.changePassword(user.id, changePasswordDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('verify-email')
  async requestEmailVerification(@CurrentUser() user: User) {
    return await this.usersService.sendVerificationEmail(user.id);
  }

  @Post('verify-email/:token')
  async verifyEmail(@Body('token') token: string) {
    return await this.usersService.verifyEmail(token);
  }
}
