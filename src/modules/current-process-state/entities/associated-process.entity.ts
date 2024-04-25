import { Entity, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../entities/base.entity';
import { CurrentProcessState } from './current-process-state.entity';

@Entity()
export class AssociatedProcess extends BaseEntity {
  @ManyToOne(() => CurrentProcessState, { nullable: false })
  @JoinColumn({ name: 'associated_id' })
  associated: CurrentProcessState;

  @ManyToOne(() => CurrentProcessState, { nullable: false })
  @JoinColumn({ name: 'current_process' })
  currentProcess: CurrentProcessState;
}
