import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { User } from '../../entities/user.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getProfile(userId: string): Promise<Omit<User, 'password'>> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Exclude password from response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user;
    return result;
  }

  async updateProfile(
    userId: string,
    updateProfileDto: UpdateProfileDto,
  ): Promise<Omit<User, 'password'>> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if email or username already exists
    if (updateProfileDto.email && updateProfileDto.email !== user.email) {
      const emailExists = await this.userRepository.findOne({
        where: { email: updateProfileDto.email },
      });

      if (emailExists) {
        throw new ConflictException('Email already in use');
      }

      // If email is changed, set isEmailVerified to false
      user.isEmailVerified = false;
    }

    if (updateProfileDto.username && updateProfileDto.username !== user.username) {
      const usernameExists = await this.userRepository.findOne({
        where: { username: updateProfileDto.username },
      });

      if (usernameExists) {
        throw new ConflictException('Username already in use');
      }
    }

    // Update user
    Object.assign(user, updateProfileDto);
    await this.userRepository.save(user);

    // Exclude password from response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user;
    return result;
  }

  async uploadAvatar(
    userId: string,
    file: { originalname: string },
  ): Promise<{ avatarUrl: string }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // In a real application, you would upload the file to a storage service
    // and get a URL back. For now, we'll simulate this with a placeholder URL.
    const avatarUrl = `https://storage.example.com/avatars/${userId}/${file.originalname}`;

    // Update user with new avatar URL
    user.avatarUrl = avatarUrl;
    await this.userRepository.save(user);

    return { avatarUrl };
  }

  async changePassword(
    userId: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    const { currentPassword, newPassword, confirmPassword } = changePasswordDto;

    if (newPassword !== confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Hash new password
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update user password
    user.password = hashedPassword;
    await this.userRepository.save(user);

    return { message: 'Password changed successfully' };
  }

  async sendVerificationEmail(userId: string): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.isEmailVerified) {
      throw new BadRequestException('Email already verified');
    }

    // Generate verification token
    // In a real application, you would store this token in a database
    // and send an email with a link to verify the email
    const token = crypto.randomBytes(32).toString('hex');

    // For now, we'll just return the token
    return {
      message: `Verification email sent. Token: ${token}`,
    };
  }

  async verifyEmail(token: string): Promise<{ message: string }> {
    // In a real application, you would validate the token against a stored token
    // and update the user's isEmailVerified status
    // For now, we'll just simulate this

    // Simulate token validation
    if (!token || token.length < 10) {
      throw new BadRequestException('Invalid token');
    }

    // Simulate database operation with await
    await new Promise((resolve) => setTimeout(resolve, 100));

    // In a real application, you would find the user associated with this token
    // and update their isEmailVerified status
    // For now, we'll just return a success message
    return { message: 'Email verified successfully' };
  }
}
