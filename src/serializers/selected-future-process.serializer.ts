import { SelectedFutureProcess } from 'src/modules/selected-future-process/entities/selected-future-process.entity';
import { BaseSerializer } from './base.serializer';

export class SelectedFutureProcessSerializer extends BaseSerializer<SelectedFutureProcess> {
  serialize(item: SelectedFutureProcess): any {
    return {
      id: item.id,
      futureProcessName: item.futureProcessName,
      code: item.code,
      spcName: item.spcName,
      mappedTo: null,
      branchCode: item.visibleCode,
      hasChildren: !!item.children.length,
      status: item.status,
    };
  }
}
