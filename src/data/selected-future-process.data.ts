import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class SelectedFutureProcessData {
  @IsString()
  @ApiProperty()
  code: string;

  @IsString()
  @ApiProperty()
  futureProcessId: string;

  @IsString()
  @ApiProperty()
  spcName: string;

  @IsString()
  @ApiProperty()
  futureProcessName: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  parent: string | null;

  @IsString()
  @ApiProperty()
  projectId: string;

  @IsString()
  @ApiProperty()
  visibleCode: string;

  @IsBoolean()
  @ApiProperty()
  isSelected: boolean;
}
