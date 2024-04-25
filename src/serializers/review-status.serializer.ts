import { StatusResponse } from '../enum/selected-future-process-status';
import { BaseSerializer } from './base.serializer';

export class ReviewStatusSerializer extends BaseSerializer<StatusResponse> {
  serialize(item: StatusResponse): any {
    return {
      id: item.id,
      name: item.name,
    };
  }
}
