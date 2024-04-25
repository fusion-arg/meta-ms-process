import { Entity, Column, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../entities/base.entity';
import { AssociatedProcess } from './associated-process.entity';
import { AssociatedSpc } from './associated-spc.entity';
import { CurrentProcessStatus } from '../../../enum/current-process-status';

@Entity()
export class CurrentProcessState extends BaseEntity {
  //Relation with ms-project
  @Column({ name: 'project_id' })
  projectId: string;

  @Column({ nullable: false })
  name: string;

  @Column({
    default: CurrentProcessStatus.NotStarted,
  })
  status: string;

  @OneToMany(
    () => AssociatedProcess,
    (associatedProcess) => associatedProcess.associated,
  )
  @JoinColumn()
  associatedProcesses: AssociatedProcess[];

  @OneToMany(
    () => AssociatedSpc,
    (associatedSpc) => associatedSpc.currentProcess,
  )
  @JoinColumn()
  associatedSpcs: AssociatedSpc[];
}
