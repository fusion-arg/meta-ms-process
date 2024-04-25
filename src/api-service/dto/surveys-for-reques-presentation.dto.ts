import { Type } from 'class-transformer';
import { IsNotEmpty, ValidateNested } from 'class-validator';
export class SurveysForRequesPresentationDto {
  @ValidateNested({ each: true })
  @Type(() => RequestPresentationDto)
  requestPresentation: RequestPresentationDto[];
}

export class RequestPresentationDto {
  @IsNotEmpty()
  userId: string;
  @ValidateNested({ each: true })
  @Type(() => PrecessesDto)
  precesses: PrecessesDto[];
}

export class PrecessesDto {
  @IsNotEmpty()
  id: string;
  @IsNotEmpty()
  name: string;
}
