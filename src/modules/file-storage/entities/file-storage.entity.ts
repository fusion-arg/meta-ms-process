import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../../entities/base.entity';

@Entity()
export class FileStorage extends BaseEntity {
  @Column()
  filename: string;

  @Column({ name: 'bucket_name' })
  bucketName: string;
}
