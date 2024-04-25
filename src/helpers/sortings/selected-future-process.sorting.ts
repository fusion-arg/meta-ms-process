import { IsOptional } from 'class-validator';
import { Sorting } from 'src/contracts/sorting.contract';

export class SelectedFutureProcessSorting implements Sorting {
  @IsOptional()
  status?: 'ASC' | 'DESC';
}
