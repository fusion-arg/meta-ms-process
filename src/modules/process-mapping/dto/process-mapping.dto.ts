export interface CountMap {
  [key: string]: number;
}

export class ProcessMappingItem {
  row: number;
  branchCode: string;
  deparmentCode: string;
  deparmentId: string;
  errors: string[];
}

export class ProcessMappingDto {
  file: string;
  branchCodes: string[];
  departmentCodes: string[];
  items: ProcessMappingItem[];
  hasErrors: boolean;
}
