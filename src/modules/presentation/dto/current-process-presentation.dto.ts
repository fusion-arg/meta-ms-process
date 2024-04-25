import { IsString, IsOptional } from 'class-validator';
import { PresentationDto } from 'src/modules/presentation/dto/presentation.dto';

export class CurrentProcessPresentationDto extends PresentationDto {
  @IsString()
  @IsOptional()
  processTitle?: string;
}
