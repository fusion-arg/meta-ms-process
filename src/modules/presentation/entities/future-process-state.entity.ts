import { Entity, ManyToOne, JoinColumn, OneToMany, Column } from 'typeorm';
import { BaseEntity } from '../../../entities/base.entity';
import { SelectedFutureProcess } from '../../selected-future-process/entities/selected-future-process.entity';
import { TemplateBlock } from './template-block.entity';

@Entity()
export class FutureProcessState extends BaseEntity {
  @ManyToOne(() => FutureProcessState, { nullable: true })
  @JoinColumn({ name: 'parent_id' })
  parent: FutureProcessState;

  @Column({ name: 'created_by' })
  createdBy: string;

  @ManyToOne(
    () => SelectedFutureProcess,
    (selectedFutureProcess) => selectedFutureProcess.id,
  )
  @JoinColumn({ name: 'selected_future_process_id' })
  selectedFutureProcess: SelectedFutureProcess;

  @OneToMany(() => TemplateBlock, (template) => template.futureProcessState)
  templates: TemplateBlock[];
}
