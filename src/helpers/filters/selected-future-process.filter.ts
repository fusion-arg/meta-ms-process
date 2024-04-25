import { IsString, IsOptional } from 'class-validator';
import { Filter } from 'src/contracts/filter.contract';

export class SelectedFutureProcessFilter implements Filter {
  @IsOptional()
  @IsString()
  processBranch?: string;

  @IsOptional()
  @IsString()
  status?: string;
}
