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
  Logger,
  Param,
  Res,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../../entities/user.entity';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { RequestPasswordResetDto } from './dto/request-password-reset.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Controller('users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(private readonly usersService: UsersService) {}

  @Get(':id/avatar')
  async getUserAvatar(@Param('id') userId: string, @Res() res: Response) {
    this.logger.log(`Getting avatar for user: ${userId}`);
    const { avatarUrl } = await this.usersService.getUserAvatar(userId);
    
    // Redirect to the avatar URL
    return res.redirect(avatarUrl);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@CurrentUser() user: User) {
    this.logger.log(`Getting profile for user: ${user.username} (${user.id})`);
    return await this.usersService.getProfile(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  async updateProfile(@CurrentUser() user: User, @Body() updateProfileDto: UpdateProfileDto) {
    this.logger.log(`Updating profile for user: ${user.username} (${user.id})`);
    return await this.usersService.updateProfile(user.id, updateProfileDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('avatar')
  @UseInterceptors(
    FileInterceptor('avatar', {
      // Don't specify storage to use memory storage by default
      limits: {
        fileSize: 1024 * 1024 * 2, // 2MB
      },
      fileFilter: (req, file, callback) => {
        // Log the incoming file details
        console.log('Incoming file:', {
          fieldname: file.fieldname,
          originalname: file.originalname,
          mimetype: file.mimetype,
          encoding: file.encoding,
        });
        
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
          return callback(new BadRequestException('Only image files are allowed'), false);
        }
        callback(null, true);
      },
    }),
  )
  async uploadAvatar(@CurrentUser() user: User, @UploadedFile() file: any) {
    this.logger.log(`Uploading avatar for user: ${user.username} (${user.id})`);
    
    if (!file) {
      this.logger.error('No file uploaded');
      throw new BadRequestException('No file uploaded');
    }
    
    // Log detailed file information
    this.logger.log(`File received: ${file.originalname}, size: ${file.size}, type: ${file.mimetype}`);
    this.logger.log(`Buffer exists: ${!!file.buffer}, Buffer length: ${file.buffer ? file.buffer.length : 'N/A'}`);
    
    try {
      // Ensure we have a buffer
      if (!file.buffer || file.buffer.length === 0) {
        throw new BadRequestException('Empty file or missing buffer');
      }
      
      const result = await this.usersService.uploadAvatar(user.id, {
        originalname: file.originalname,
        buffer: file.buffer,
        mimetype: file.mimetype,
        size: file.size,
      });
      
      this.logger.log(`Avatar uploaded successfully: ${result.avatarUrl}`);
      return result;
    } catch (error: any) {
      this.logger.error(`Error uploading avatar: ${error.message}`, error.stack);
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Patch('password')
  async changePassword(@CurrentUser() user: User, @Body() changePasswordDto: ChangePasswordDto) {
    this.logger.log(`Changing password for user: ${user.username} (${user.id})`);
    return await this.usersService.changePassword(user.id, changePasswordDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('verify-email')
  async requestEmailVerification(@CurrentUser() user: User) {
    this.logger.log(`Requesting email verification for user: ${user.username} (${user.id})`);
    return await this.usersService.sendVerificationEmail(user.id);
  }

  @Post('verify-email/:token')
  async verifyEmail(@Body('token') token: string) {
    this.logger.log(`Verifying email with token: ${token.substring(0, 10)}...`);
    return await this.usersService.verifyEmail(token);
  }

  @Post('password-reset/request')
  async requestPasswordReset(@Req() request: Request) {
    try {
      // Log the raw request for debugging
      this.logger.log(`Password reset request received`);
      
      // Get the email from the request body
      const email = request.body?.email;
      
      if (!email) {
        throw new BadRequestException('Email is required');
      }
      
      this.logger.log(`Password reset requested for email: ${email}`);
      return await this.usersService.requestPasswordReset(email);
    } catch (error: any) {
      this.logger.error(`Error requesting password reset: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Post('password-reset/reset')
  async resetPassword(@Req() request: Request) {
    try {
      // Log the raw request for debugging
      this.logger.log(`Password reset request received`);
      
      // Get the data from the request body
      const { token, password, confirmPassword } = request.body || {};
      
      if (!token || !password || !confirmPassword) {
        throw new BadRequestException('Token, password and confirmPassword are required');
      }
      
      this.logger.log(`Password reset with token: ${token.substring(0, 10)}...`);
      return await this.usersService.resetPassword(
        token,
        password,
        confirmPassword
      );
    } catch (error: any) {
      this.logger.error(`Error resetting password: ${error.message}`, error.stack);
      throw error;
    }
  }
}
