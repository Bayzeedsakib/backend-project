import { IsOptional, MinLength } from 'class-validator';

export class UpdateModeratorDto {
  @IsOptional()
  @MinLength(6)
  password?: string;

  @IsOptional()
  status?: 'active' | 'inactive';

  @IsOptional()
  displayName?: string;

  @IsOptional()
  bio?: string;
}
