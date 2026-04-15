import { MigrationInterface, QueryRunner } from 'typeorm';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

export class InitSchema1772467653411 implements MigrationInterface {
  private readSqlFile(fileName: string): string {
    const fromDirname = join(__dirname, 'sql', fileName);
    const fromCwd = join(process.cwd(), 'src', 'migrations', 'sql', fileName);

    const sqlPath = existsSync(fromDirname) ? fromDirname : fromCwd;
    return readFileSync(sqlPath, 'utf8');
  }

  public async up(queryRunner: QueryRunner): Promise<void> {
    const sql = this.readSqlFile('0001_init_schema.up.sql');
    await queryRunner.query(sql);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const sql = this.readSqlFile('0001_init_schema.down.sql');
    await queryRunner.query(sql);
  }
}
