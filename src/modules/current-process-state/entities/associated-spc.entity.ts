import { Entity, ManyToOne, JoinColumn, Column } from 'typeorm';
import { BaseEntity } from '../../../entities/base.entity';
import { CurrentProcessState } from './current-process-state.entity';

@Entity()
export class AssociatedSpc extends BaseEntity {
  //Relation with ms-projects
  @Column({ name: 'spc_id' })
  spcId: string;

  @Column({ name: 'name' })
  name: string;

  @Column()
  code: string;

  @Column({ name: 'visible_code' })
  visibleCode: string;

  @Column({ nullable: true, name: 'branch_name' })
  branchName: string;

  @ManyToOne(() => CurrentProcessState, { nullable: false })
  @JoinColumn({ name: 'current_process' })
  currentProcess: CurrentProcessState;
}
