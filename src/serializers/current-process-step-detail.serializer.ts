import { TemplateBlock } from '../modules/presentation/entities/template-block.entity';
import { BaseSerializer } from './base.serializer';

export class CurrentProcessStepDetailSerializer extends BaseSerializer<any> {
  serialize(item: any): any {
    const templateBlocks = item.steps?.map((templateBlock: TemplateBlock) => ({
      templateBlock,
    }));

    return {
      id: item.id,
      name: item.name,
      templateBlocks: templateBlocks,
    };
  }
}
