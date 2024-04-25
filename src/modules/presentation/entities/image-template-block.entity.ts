import { Column, ChildEntity, JoinColumn, ManyToOne } from 'typeorm';
import { TemplateBlock } from './template-block.entity';
import { FileStorage } from '../../file-storage/entities/file-storage.entity';

@ChildEntity()
export class ImageTemplateBlock extends TemplateBlock {
  @ManyToOne(() => FileStorage, (file) => file.id)
  @JoinColumn({ name: 'file_id' })
  file: FileStorage;

  @Column({ name: 'image_data', type: 'json' })
  imageData: string;
}
