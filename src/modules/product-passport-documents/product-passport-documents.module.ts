import { Module } from '@nestjs/common';
import { ProductPassportDocumentsService } from './product-passport-documents.service';
import { ProductPassportDocumentsController } from './product-passport-documents.controller';

@Module({
  providers: [ProductPassportDocumentsService],
  controllers: [ProductPassportDocumentsController],
})
export class ProductPassportDocumentsModule {}
