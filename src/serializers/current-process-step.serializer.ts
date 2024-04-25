import { TemplateBlock } from '../modules/presentation/entities/template-block.entity';
import { BaseSerializer } from './base.serializer';

export class CurrentProcessStepSerializer extends BaseSerializer<any> {
  serialize(item: any): any {
    const templateBlocks = item.templates?.map(
      (templateBlock: TemplateBlock) => ({
        id: templateBlock.id,
        name: templateBlock.title,
        step: templateBlock.step,
        comments: templateBlock.comments,
      }),
    );

    return {
      id: item.id,
      name: item.currentProcessState.name,
      templateBlocks: templateBlocks,
    };
  }
}
