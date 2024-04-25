import { IsOptional, IsString } from 'class-validator';
export class CreateCurrentProcessStateDto {
  @IsString()
  name: string;

  @IsString()
  spcsId: string;

  @IsString()
  @IsOptional()
  associatesId: string;

  @IsString()
  @IsOptional()
  cloneId?: string;
}
