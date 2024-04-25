import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSprint1713366380040 implements MigrationInterface {
  name = 'AddSprint1713366380040';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`proc_selected_future_process\` ADD \`sprint_id\` varchar(255) NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`proc_selected_future_process\` DROP COLUMN \`sprint_id\``,
    );
  }
}
