import { IsString } from 'class-validator';

export class FutureProcessData {
  @IsString()
  id: string;
}
