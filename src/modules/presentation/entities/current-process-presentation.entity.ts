import { Entity, ManyToOne, JoinColumn, OneToMany, Column } from 'typeorm';
import { BaseEntity } from '../../../entities/base.entity';
import { TemplateBlock } from './template-block.entity';
import { CurrentProcessState } from '../../current-process-state/entities/current-process-state.entity';

@Entity()
export class CurrentProcessPresentation extends BaseEntity {
  @Column({ name: 'created_by' })
  createdBy: string;

  @ManyToOne(() => CurrentProcessState, (currentProcess) => currentProcess.id)
  @JoinColumn({ name: 'current_process_state_id' })
  currentProcessState: CurrentProcessState;

  @OneToMany(
    () => TemplateBlock,
    (template) => template.currentProcessPresentation,
  )
  templates: TemplateBlock[];
}
