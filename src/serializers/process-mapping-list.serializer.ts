import { BaseSerializer } from './base.serializer';

interface ProcessMappingResponse {
  id: string;
  futureProcessName: string;
  code: string;
  visibleCode: string;
  department?: object | null;
  mappedStatus?: string | null;
  children: Array<any>;
}

export class ProcessMappingListSerializer extends BaseSerializer<ProcessMappingResponse> {
  serialize(item: ProcessMappingResponse): any {
    return {
      id: item.id,
      futureProcessName: item.futureProcessName,
      code: item.code,
      branchCode: item.visibleCode,
      department: item.department,
      mappedStatus: item.mappedStatus,
      hasChildren: !!item.children.length,
    };
  }
}
