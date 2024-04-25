import { IsOptional, IsString } from 'class-validator';
import { ProcessStepFilter } from './process-step.filter';

export class StepsFilter extends ProcessStepFilter {
  @IsString()
  startStep: string;

  @IsString()
  @IsOptional()
  endStep: string;
}
