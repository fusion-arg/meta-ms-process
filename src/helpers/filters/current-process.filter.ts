import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { Filter } from 'src/contracts/filter.contract';

export class CurrentProcessFilter implements Filter {
  @IsOptional()
  @IsString()
  currentProcess?: string;

  @IsOptional()
  @IsString()
  associatedSPCProcess?: string;

  @IsOptional()
  @IsString()
  associatedCurrentProcess?: string;

  @IsOptional()
  @IsString()
  spcBranch?: string;

  @IsOptional()
  @IsBoolean()
  spcBranchOnlyUncategorized?: boolean;

  @IsOptional()
  @IsString()
  updatedAtFrom?: string;

  @IsOptional()
  @IsString()
  updatedAtTo?: string;

  @IsOptional()
  @IsString()
  status?: string;
}
