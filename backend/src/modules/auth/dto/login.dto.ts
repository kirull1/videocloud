import { IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsString()
  emailOrUsername!: string;

  @IsString()
  @MinLength(8)
  password!: string;
}
