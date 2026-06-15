import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';

import { databaseConfig } from './config/database.config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RolesModule } from './core/roles/roles.module';
import { UsersModule } from './core/usuarios/user.module';
import { TenantsModule } from './core/tenants/tenants.module';
import { ProductPassportsModule } from './modules/product-passports/product-passports.module';
import { AuthModule } from './core/auth/auth.module';
import { JwtAuthGuard } from './core/auth/guards/jwt-auth.guard';
import { ConfigModule } from '@nestjs/config';
import { authConfig } from './core/auth/config/auth.config';
import { DocumentAutomationModule } from './modules/document-automation/document-automation.module';
@Module({
  imports: [
    TypeOrmModule.forRoot(databaseConfig),
    RolesModule,
    UsersModule,
    TenantsModule,
    AuthModule,
    ProductPassportsModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [authConfig],
    }),
    DocumentAutomationModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
