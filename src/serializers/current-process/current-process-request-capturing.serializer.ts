import { BaseSerializer } from 'src/serializers/base.serializer';

export class CurrentProcessRequestCapturingSerializer extends BaseSerializer<any> {
  serialize(item: any): any {
    return item;
  }
}
