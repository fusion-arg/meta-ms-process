import { Column, ChildEntity } from 'typeorm';
import { TemplateBlock } from './template-block.entity';

@ChildEntity()
export class TextTemplateBlock extends TemplateBlock {
  @Column({ type: 'longtext' })
  description: string;
}
