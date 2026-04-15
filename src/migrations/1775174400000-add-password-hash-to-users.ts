import { MigrationInterface, QueryRunner } from 'typeorm';
import { readFileSync } from 'fs';
import { join } from 'path';

export class AddPasswordHashToUsers1775174400000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const sqlPath = join(
      __dirname,
      'sql',
      '0002_add_password_hash_to_users.up.sql',
    );

    const sql = readFileSync(sqlPath, 'utf8');
    await queryRunner.query(sql);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const sqlPath = join(
      __dirname,
      'sql',
      '0002_add_password_hash_to_users.down.sql',
    );
    const sql = readFileSync(sqlPath, 'utf8');
    await queryRunner.query(sql);
  }
}
