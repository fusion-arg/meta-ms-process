import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../entities/base.entity';
import { FileStorage } from '../../file-storage/entities/file-storage.entity';

@Entity()
export class PresentationDraftImage extends BaseEntity {
  @Column({ name: 'presentation_id' })
  presentationId: string;

  @Column({ name: 'project_id' })
  projectId: string;

  @ManyToOne(() => FileStorage)
  @JoinColumn({ name: 'file_id' })
  file: FileStorage;
}
