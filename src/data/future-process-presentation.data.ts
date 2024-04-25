import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsJSON,
  IsBoolean,
  IsNumber,
} from 'class-validator';
import { PresentationType } from '../enum/presentation-type';

export class FutureProcessPresentationData {
  @IsString()
  @ApiProperty()
  stepId?: string | null;

  @IsString()
  @ApiProperty()
  title: string;

  @IsString()
  @ApiProperty()
  comment: string;

  @IsEnum(PresentationType)
  @ApiProperty({ enum: PresentationType, enumName: 'PresentationType' })
  type: PresentationType;

  @IsString()
  @IsOptional()
  @ApiProperty()
  imageId: string | null;

  @IsJSON()
  @IsOptional()
  @ApiProperty()
  imageData: string | null;

  @IsString()
  @IsOptional()
  @ApiProperty()
  text: string | null;

  @IsBoolean()
  @IsOptional()
  @ApiProperty()
  deleted: boolean;

  @IsOptional()
  @IsNumber()
  step: number;
}
