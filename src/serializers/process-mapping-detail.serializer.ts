import { BaseSerializer } from './base.serializer';

interface ProcessMappingDetailResponse {
  id: string;
  futureProcessName: string;
  visibleCode: string;
  spcName: string;
  parent: {
    futureProcessName: string;
    visibleCode: string;
  };
  department?: object | null;
  status: string;
  children: Array<any>;
}

export class ProcessMappingDetailSerializer extends BaseSerializer<ProcessMappingDetailResponse> {
  serialize(item: ProcessMappingDetailResponse): any {
    return {
      id: item.id,
      futureProcessName: item.futureProcessName,
      visibleCode: item.visibleCode,
      spc: item.spcName,
      parentProcessName: item.parent
        ? `${item.parent.futureProcessName} (${item.parent.visibleCode})`
        : null,
      subProcess: item.children.map((child) => ({
        futureProcessName: `${child.futureProcessName} (${child.visibleCode})`,
      })),
      status: item.status,
      department: item.department,
    };
  }
}
