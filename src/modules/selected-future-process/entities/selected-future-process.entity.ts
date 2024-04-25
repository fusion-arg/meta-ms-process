import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../entities/base.entity';
import { SelectedFutureProcessStatus } from '../../../enum/selected-future-process-status';

@Entity()
export class SelectedFutureProcess extends BaseEntity {
  @Column({ name: 'project_id' })
  projectId: string;

  //Relation with ms-projects
  @Column({ name: 'future_process_id' })
  futureProcessId: string;

  @Column()
  code: string;

  @Column({ name: 'spc_name' })
  spcName: string;

  @Column({ name: 'future_process_name' })
  futureProcessName: string;

  @Column({ name: 'visible_code' })
  visibleCode: string;

  @ManyToOne(
    () => SelectedFutureProcess,
    (selectedFutureProceess) => selectedFutureProceess.id,
  )
  @JoinColumn({ name: 'parent_id' })
  parent: SelectedFutureProcess;

  @Column({
    default: SelectedFutureProcessStatus.NotStarted,
  })
  status: string;

  @OneToMany(() => SelectedFutureProcess, (process) => process.parent)
  children: SelectedFutureProcess[];

  //Relation with ms-organization
  @Column({ name: 'department_id', nullable: true })
  departmentId: string;

  @Column({ name: 'mapped_status', nullable: true })
  mappedStatus: string;

  @Column({ name: 'sprint_id', nullable: true })
  sprintId: string;
}
