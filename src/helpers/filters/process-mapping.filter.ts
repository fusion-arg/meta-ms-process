import { IsString, IsOptional, IsArray } from 'class-validator';
import { Filter } from 'src/contracts/filter.contract';

export class ProcessMappingFilter implements Filter {
  @IsOptional()
  @IsString()
  processBranch?: string;

  @IsOptional()
  @IsArray()
  mappedTo?: Array<string>;

  @IsOptional()
  @IsArray()
  mappedStatus?: Array<string>;
}
