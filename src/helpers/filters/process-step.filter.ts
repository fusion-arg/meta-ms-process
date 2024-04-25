import { IsIn } from 'class-validator';
import { Filter } from 'src/contracts/filter.contract';

export class ProcessStepFilter implements Filter {
  @IsIn(['current_state_process', 'future_state_process'])
  type: string;
}
