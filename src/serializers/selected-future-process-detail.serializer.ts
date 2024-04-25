import { SelectedFutureProcess } from 'src/modules/selected-future-process/entities/selected-future-process.entity';
import { BaseSerializer } from './base.serializer';

export class SelectedFutureProcessDetailSerializer extends BaseSerializer<SelectedFutureProcess> {
  serialize(item: SelectedFutureProcess): any {
    return {
      futureProcessName: item.futureProcessName,
      processId: item.visibleCode,
      spc: item.spcName,
      parentProcessName: item.parent
        ? `${item.parent.futureProcessName} (${item.parent.visibleCode})`
        : null,
      subProcess: item.children.map((child) => ({
        futureProcessName: `${child.futureProcessName} (${child.visibleCode})`,
      })),
      status: item.status,
      createdAt: item.createdAt.toISOString(),
      updateAt: item.updatedAt.toISOString(),
    };
  }
}
