import { Controller } from '@nestjs/common';
import { ProductPassportDocumentsService } from './product-passport-documents.service';

@Controller('documentos-pasaporte-productos')
export class ProductPassportDocumentsController {
  constructor(private readonly productPassportDocumentsService: ProductPassportDocumentsService) {}
}
