import { MigrationInterface, QueryRunner } from 'typeorm';
import { readFileSync } from 'fs';
import { join } from 'path';

export class CreateDocumentAutomationTables1780780000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const sqlPath = join(
      __dirname,
      'sql',
      '0003_create_document_automation_tables.up.sql',
    );

    const sql = readFileSync(sqlPath, 'utf8');
    await queryRunner.query(sql);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const sqlPath = join(
      __dirname,
      'sql',
      '0003_create_document_automation_tables.down.sql',
    );
    const sql = readFileSync(sqlPath, 'utf8');
    await queryRunner.query(sql);
  }
}
