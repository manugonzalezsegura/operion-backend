import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'operion',
  password: 'operion123',
  database: 'operion_dev',
  autoLoadEntities: true,
  synchronize: false,
  logging: true,
};
