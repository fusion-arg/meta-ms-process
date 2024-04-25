import { IsArray, IsNotEmpty } from 'class-validator';

export class PresentationDraftImageDto {
  @IsArray()
  @IsNotEmpty()
  images: string[] = [];
}
