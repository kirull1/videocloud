import { IsNotEmpty, IsString, IsOptional, IsUUID, MaxLength, Matches } from 'class-validator';

export class CreateChannelDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100, { message: 'Channel name must be at most 100 characters long' })
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(255, { message: 'Description must be at most 255 characters long' })
  description?: string;

  @IsString()
  @IsOptional()
  @Matches(/^[a-zA-Z0-9_-]+$/, {
    message: 'Custom URL can only contain letters, numbers, underscores, and hyphens',
  })
  @MaxLength(50, { message: 'Custom URL must be at most 50 characters long' })
  customUrl?: string;

  @IsString()
  @IsOptional()
  @Matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
    message: 'Theme color must be a valid hex color code (e.g., #41A4FF)',
  })
  themeColor?: string;

  @IsUUID()
  @IsOptional()
  featuredVideoId?: string;
}