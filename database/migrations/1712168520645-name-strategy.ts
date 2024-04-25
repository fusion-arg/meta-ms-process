import { MigrationInterface, QueryRunner } from 'typeorm';

export class NameStrategy1712168520645 implements MigrationInterface {
  name = 'NameStrategy1712168520645';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`proc_associated_spc\` (\`id\` varchar(36) NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` timestamp(6) NULL, \`spc_id\` varchar(255) NOT NULL, \`name\` varchar(255) NOT NULL, \`code\` varchar(255) NOT NULL, \`visible_code\` varchar(255) NOT NULL, \`branch_name\` varchar(255) NULL, \`current_process\` varchar(36) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`proc_current_process_state\` (\`id\` varchar(36) NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` timestamp(6) NULL, \`project_id\` varchar(255) NOT NULL, \`name\` varchar(255) NOT NULL, \`status\` varchar(255) NOT NULL DEFAULT 'not started', PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`proc_associated_process\` (\`id\` varchar(36) NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` timestamp(6) NULL, \`associated_id\` varchar(36) NOT NULL, \`current_process\` varchar(36) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`proc_file_storage\` (\`id\` varchar(36) NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` timestamp(6) NULL, \`filename\` varchar(255) NOT NULL, \`bucket_name\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`proc_selected_future_process\` (\`id\` varchar(36) NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` timestamp(6) NULL, \`project_id\` varchar(255) NOT NULL, \`future_process_id\` varchar(255) NOT NULL, \`code\` varchar(255) NOT NULL, \`spc_name\` varchar(255) NOT NULL, \`future_process_name\` varchar(255) NOT NULL, \`visible_code\` varchar(255) NOT NULL, \`status\` varchar(255) NOT NULL DEFAULT 'not started', \`department_id\` varchar(255) NULL, \`mapped_status\` varchar(255) NULL, \`parent_id\` varchar(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`proc_future_process_state\` (\`id\` varchar(36) NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` timestamp(6) NULL, \`created_by\` varchar(255) NOT NULL, \`parent_id\` varchar(36) NULL, \`selected_future_process_id\` varchar(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`proc_template_block\` (\`id\` varchar(36) NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` timestamp(6) NULL, \`step\` int NOT NULL, \`title\` varchar(255) NOT NULL, \`comments\` longtext NULL, \`image_data\` json NULL, \`description\` longtext NULL, \`type\` varchar(255) NOT NULL, \`reference_id\` varchar(36) NULL, \`future_process_state\` varchar(36) NULL, \`current_process_presentation\` varchar(36) NULL, \`file_id\` varchar(36) NULL, INDEX \`IDX_fa2479b48efd8fd24a8c766db3\` (\`type\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`proc_current_process_presentation\` (\`id\` varchar(36) NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` timestamp(6) NULL, \`created_by\` varchar(255) NOT NULL, \`current_process_state_id\` varchar(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`proc_presentation_draft_image\` (\`id\` varchar(36) NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` timestamp(6) NULL, \`presentation_id\` varchar(255) NOT NULL, \`project_id\` varchar(255) NOT NULL, \`file_id\` varchar(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`proc_associated_spc\` ADD CONSTRAINT \`FK_9c1447d102c336f1a502a690925\` FOREIGN KEY (\`current_process\`) REFERENCES \`proc_current_process_state\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`proc_associated_process\` ADD CONSTRAINT \`FK_a179730c745adf1eae19dc0ae2b\` FOREIGN KEY (\`associated_id\`) REFERENCES \`proc_current_process_state\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`proc_associated_process\` ADD CONSTRAINT \`FK_c987b871d97629caa7379d6030e\` FOREIGN KEY (\`current_process\`) REFERENCES \`proc_current_process_state\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`proc_selected_future_process\` ADD CONSTRAINT \`FK_4aa89cc00f27bae89bae4fbe845\` FOREIGN KEY (\`parent_id\`) REFERENCES \`proc_selected_future_process\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`proc_future_process_state\` ADD CONSTRAINT \`FK_df5ac9f96d887e09de4976f9af6\` FOREIGN KEY (\`parent_id\`) REFERENCES \`proc_future_process_state\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`proc_future_process_state\` ADD CONSTRAINT \`FK_e257fe4e40d1c0331d82cf4f4f2\` FOREIGN KEY (\`selected_future_process_id\`) REFERENCES \`proc_selected_future_process\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`proc_template_block\` ADD CONSTRAINT \`FK_843bf408b9213eccb0796ce9cbc\` FOREIGN KEY (\`reference_id\`) REFERENCES \`proc_template_block\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`proc_template_block\` ADD CONSTRAINT \`FK_739274259982decf9610072625a\` FOREIGN KEY (\`future_process_state\`) REFERENCES \`proc_future_process_state\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`proc_template_block\` ADD CONSTRAINT \`FK_bd2bfa30243d7a37c7fbd9e80e5\` FOREIGN KEY (\`current_process_presentation\`) REFERENCES \`proc_current_process_presentation\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`proc_template_block\` ADD CONSTRAINT \`FK_e48aacc6da490845d976504f4b3\` FOREIGN KEY (\`file_id\`) REFERENCES \`proc_file_storage\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`proc_current_process_presentation\` ADD CONSTRAINT \`FK_e0c83dcaa0e46527cf317c10889\` FOREIGN KEY (\`current_process_state_id\`) REFERENCES \`proc_current_process_state\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`proc_presentation_draft_image\` ADD CONSTRAINT \`FK_a38047de3c37bf55e61a7ca1010\` FOREIGN KEY (\`file_id\`) REFERENCES \`proc_file_storage\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`proc_presentation_draft_image\` DROP FOREIGN KEY \`FK_a38047de3c37bf55e61a7ca1010\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`proc_current_process_presentation\` DROP FOREIGN KEY \`FK_e0c83dcaa0e46527cf317c10889\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`proc_template_block\` DROP FOREIGN KEY \`FK_e48aacc6da490845d976504f4b3\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`proc_template_block\` DROP FOREIGN KEY \`FK_bd2bfa30243d7a37c7fbd9e80e5\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`proc_template_block\` DROP FOREIGN KEY \`FK_739274259982decf9610072625a\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`proc_template_block\` DROP FOREIGN KEY \`FK_843bf408b9213eccb0796ce9cbc\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`proc_future_process_state\` DROP FOREIGN KEY \`FK_e257fe4e40d1c0331d82cf4f4f2\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`proc_future_process_state\` DROP FOREIGN KEY \`FK_df5ac9f96d887e09de4976f9af6\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`proc_selected_future_process\` DROP FOREIGN KEY \`FK_4aa89cc00f27bae89bae4fbe845\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`proc_associated_process\` DROP FOREIGN KEY \`FK_c987b871d97629caa7379d6030e\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`proc_associated_process\` DROP FOREIGN KEY \`FK_a179730c745adf1eae19dc0ae2b\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`proc_associated_spc\` DROP FOREIGN KEY \`FK_9c1447d102c336f1a502a690925\``,
    );
    await queryRunner.query(`DROP TABLE \`proc_presentation_draft_image\``);
    await queryRunner.query(`DROP TABLE \`proc_current_process_presentation\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_fa2479b48efd8fd24a8c766db3\` ON \`proc_template_block\``,
    );
    await queryRunner.query(`DROP TABLE \`proc_template_block\``);
    await queryRunner.query(`DROP TABLE \`proc_future_process_state\``);
    await queryRunner.query(`DROP TABLE \`proc_selected_future_process\``);
    await queryRunner.query(`DROP TABLE \`proc_file_storage\``);
    await queryRunner.query(`DROP TABLE \`proc_associated_process\``);
    await queryRunner.query(`DROP TABLE \`proc_current_process_state\``);
    await queryRunner.query(`DROP TABLE \`proc_associated_spc\``);
  }
}
