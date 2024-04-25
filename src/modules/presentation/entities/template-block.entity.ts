import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  TableInheritance,
} from 'typeorm';
import { BaseEntity } from '../../../entities/base.entity';
import { FutureProcessState } from './future-process-state.entity';
import { CurrentProcessPresentation } from './current-process-presentation.entity';

@Entity()
@TableInheritance({ column: { type: 'varchar', name: 'type' } })
export class TemplateBlock extends BaseEntity {
  @Column()
  step: number;

  @Column({ nullable: false })
  title: string;

  @Column({ nullable: true, type: 'longtext' })
  comments: string | null;

  @Column({ name: 'process_title', nullable: true })
  processTitle: string;

  @ManyToOne(() => TemplateBlock, { nullable: true })
  @JoinColumn({ name: 'reference_id' })
  referenceId: TemplateBlock;

  @ManyToOne(() => FutureProcessState, { nullable: true })
  @JoinColumn({ name: 'future_process_state' })
  futureProcessState: FutureProcessState;

  @ManyToOne(() => CurrentProcessPresentation, { nullable: true })
  @JoinColumn({ name: 'current_process_presentation' })
  currentProcessPresentation: CurrentProcessPresentation;
}
