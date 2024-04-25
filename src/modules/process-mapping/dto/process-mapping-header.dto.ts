import { IsIn } from 'class-validator';

export class ProcessMappingCsvHeaderDto {
  @IsIn(['processId', 'departmentId'], {
    message: 'Invalid header: processId',
  })
  processId: string;

  @IsIn(['processId', 'departmentId'], {
    message: 'Invalid header: departmentId',
  })
  departmentId: string;
}
