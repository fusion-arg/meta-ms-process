import { IsOptional } from 'class-validator';
import { Sorting } from 'src/contracts/sorting.contract';

export class CurrentProcessSorting implements Sorting {
  @IsOptional()
  currentProcess?: 'ASC' | 'DESC';

  @IsOptional()
  spcBranch?: 'ASC' | 'DESC';

  @IsOptional()
  updatedAt?: 'ASC' | 'DESC';

  @IsOptional()
  status?: 'ASC' | 'DESC';
}
