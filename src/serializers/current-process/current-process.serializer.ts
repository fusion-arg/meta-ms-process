import { BaseSerializer } from '../base.serializer';
import { CurrentProcessState } from '../../modules/current-process-state/entities/current-process-state.entity';

export class CurrentProcessSerializer extends BaseSerializer<CurrentProcessState> {
  serialize(item: CurrentProcessState): any {
    const associatedSpc = item.associatedSpcs.length
      ? {
          id: item.associatedSpcs[0].spcId,
          name: item.associatedSpcs[0].name,
          branchCode: item.associatedSpcs[0].visibleCode,
        }
      : null;

    const associatedCurrentProcesses = item.associatedProcesses.length
      ? {
          id: item.associatedProcesses[0].currentProcess.id,
          name: item.associatedProcesses[0].currentProcess.name,
        }
      : null;
    return {
      id: item.id,
      name: item.name,
      associatedCurrentProcesses,
      associatedSpc,
      spcBranch: item.associatedSpcs.map((spc) => spc.branchName),
      mappedBy: null,
      status: item.status,
      updatedAt: item.updatedAt.toISOString(),
      canBeDeleted: true,
    };
  }
}
