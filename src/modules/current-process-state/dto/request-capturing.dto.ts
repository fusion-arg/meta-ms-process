import { IsArray } from 'class-validator';
export class RequestCapturingDto {
  @IsArray()
  processes: string[];
}
