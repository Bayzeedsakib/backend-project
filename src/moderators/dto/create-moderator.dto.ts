import { IsEmail, IsNotEmpty, MinLength, IsOptional } from 'class-validator';

export class CreateModeratorDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsOptional()
  displayName?: string;

  @IsOptional()
  bio?: string;
}
