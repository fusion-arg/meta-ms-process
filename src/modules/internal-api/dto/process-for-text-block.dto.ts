import { IsArray } from 'class-validator';
export class ProcessForTextBlockDto {
  @IsArray()
  referenceIds: string[];
}
