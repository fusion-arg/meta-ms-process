import { MigrationInterface, QueryRunner } from "typeorm";

export class CurrentProcessTitle1712856588970 implements MigrationInterface {
    name = 'CurrentProcessTitle1712856588970'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`proc_template_block\` ADD \`process_title\` varchar(255) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`proc_template_block\` DROP COLUMN \`process_title\``);
    }

}
