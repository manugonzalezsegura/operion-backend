import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

type TenantResponse = {
  id: string;
  name: string;
};

type ProductPassportResponse = {
  id: string;
  name: string;
  sku: string;
  description?: string;
  tenantId: string;
  status: string;
};

type ErrorResponse = {
  message: string | string[];
};

type DeleteResponse = {
  message: string;
};

describe('ProductPassports (e2e)', () => {
  let app: INestApplication;

  const createTestTenantId = async (): Promise<string> => {
    const unique = Date.now();
    const createTenantPayload = {
      name: `E2E_TEST_TENANT_${unique}`,
    };

    const response = await request(app.getHttpServer())
      .post('/tenants')
      .send(createTenantPayload)
      .expect(201);

    const tenantBody = response.body as TenantResponse;
    return tenantBody.id;
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should create required tenant using POST /tenants', async () => {
    const createdTenantId = await createTestTenantId();

    expect(createdTenantId).toBeDefined();
    expect(typeof createdTenantId).toBe('string');
  });

  it('should create product passport with valid POST /pasaporte-productos', async () => {
    const tenantId = await createTestTenantId();
    const unique = Date.now();
    const createProductPassportPayload = {
      name: `E2E_TEST_PRODUCT_${unique}`,
      sku: `E2E_TEST_SKU_${unique}`,
      description: 'E2E_TEST_DESCRIPTION',
      tenantId,
    };

    const response = await request(app.getHttpServer())
      .post('/pasaporte-productos')
      .send(createProductPassportPayload)
      .expect(201);

    const productPassportBody = response.body as ProductPassportResponse;

    expect(productPassportBody).toHaveProperty('id');
    expect(productPassportBody.name).toBe(createProductPassportPayload.name);
    expect(productPassportBody.sku).toBe(createProductPassportPayload.sku);
    expect(productPassportBody.tenantId).toBe(tenantId);
    expect(productPassportBody.status).toBe('DRAFT');
  });

  it('should fail with incomplete body on POST /pasaporte-productos', async () => {
    const invalidPayload = {
      name: `E2E_TEST_INVALID_${Date.now()}`,
    };

    const response = await request(app.getHttpServer())
      .post('/pasaporte-productos')
      .send(invalidPayload)
      .expect(400);

    const errorBody = response.body as ErrorResponse;

    expect(errorBody).toHaveProperty('message');
  });

  it('should fail on POST /pasaporte-productos with non-existent tenant', async () => {
    const unique = Date.now();
    const invalidTenantPayload = {
      name: `E2E_TEST_PRODUCT_${unique}`,
      sku: `E2E_TEST_SKU_${unique}`,
      description: 'E2E_TEST_DESCRIPTION',
      tenantId: '00000000-0000-0000-0000-000000000000',
    };

    const response = await request(app.getHttpServer())
      .post('/pasaporte-productos')
      .send(invalidTenantPayload)
      .expect(404);

    const errorBody = response.body as ErrorResponse;
    expect(errorBody).toHaveProperty('message');
  });

  it('should fail on POST /pasaporte-productos with duplicate SKU in same tenant', async () => {
    const tenantId = await createTestTenantId();
    const unique = Date.now();
    const duplicatedSku = `E2E_TEST_SKU_${unique}`;

    const firstPayload = {
      name: `E2E_TEST_PRODUCT_A_${unique}`,
      sku: duplicatedSku,
      description: 'E2E_TEST_DESCRIPTION_A',
      tenantId,
    };

    const secondPayload = {
      name: `E2E_TEST_PRODUCT_B_${unique}`,
      sku: duplicatedSku,
      description: 'E2E_TEST_DESCRIPTION_B',
      tenantId,
    };

    await request(app.getHttpServer())
      .post('/pasaporte-productos')
      .send(firstPayload)
      .expect(201);

    const response = await request(app.getHttpServer())
      .post('/pasaporte-productos')
      .send(secondPayload)
      .expect(409);

    const errorBody = response.body as ErrorResponse;
    expect(errorBody).toHaveProperty('message');
  });

  it('should return GET all from /pasaporte-productos', async () => {
    const tenantId = await createTestTenantId();
    const unique = Date.now();
    const payload = {
      name: `E2E_TEST_PRODUCT_${unique}`,
      sku: `E2E_TEST_SKU_${unique}`,
      description: 'E2E_TEST_DESCRIPTION',
      tenantId,
    };

    const createdResponse = await request(app.getHttpServer())
      .post('/pasaporte-productos')
      .send(payload)
      .expect(201);

    const createdBody = createdResponse.body as ProductPassportResponse;

    const response = await request(app.getHttpServer())
      .get('/pasaporte-productos')
      .expect(200);

    const productPassports = response.body as ProductPassportResponse[];

    expect(Array.isArray(productPassports)).toBe(true);
    expect(productPassports.some((item) => item.id === createdBody.id)).toBe(
      true,
    );
  });

  it('should return GET by id from /pasaporte-productos/:id', async () => {
    const tenantId = await createTestTenantId();
    const unique = Date.now();
    const payload = {
      name: `E2E_TEST_PRODUCT_${unique}`,
      sku: `E2E_TEST_SKU_${unique}`,
      description: 'E2E_TEST_DESCRIPTION',
      tenantId,
    };

    const createdResponse = await request(app.getHttpServer())
      .post('/pasaporte-productos')
      .send(payload)
      .expect(201);

    const createdBody = createdResponse.body as ProductPassportResponse;

    const response = await request(app.getHttpServer())
      .get(`/pasaporte-productos/${createdBody.id}`)
      .expect(200);

    const productPassportBody = response.body as ProductPassportResponse;

    expect(productPassportBody.id).toBe(createdBody.id);
    expect(productPassportBody.tenantId).toBe(tenantId);
  });

  it('should return GET by tenant from /pasaporte-productos/tenant/:tenantId', async () => {
    const tenantId = await createTestTenantId();
    const unique = Date.now();
    const payload = {
      name: `E2E_TEST_PRODUCT_${unique}`,
      sku: `E2E_TEST_SKU_${unique}`,
      description: 'E2E_TEST_DESCRIPTION',
      tenantId,
    };

    const createdResponse = await request(app.getHttpServer())
      .post('/pasaporte-productos')
      .send(payload)
      .expect(201);

    const createdBody = createdResponse.body as ProductPassportResponse;

    const response = await request(app.getHttpServer())
      .get(`/pasaporte-productos/tenant/${tenantId}`)
      .expect(200);

    const productPassports = response.body as ProductPassportResponse[];

    expect(Array.isArray(productPassports)).toBe(true);
    expect(productPassports.some((item) => item.id === createdBody.id)).toBe(
      true,
    );
    expect(productPassports.every((item) => item.tenantId === tenantId)).toBe(
      true,
    );
  });

  it('should update product passport with valid PATCH /pasaporte-productos/:id', async () => {
    const tenantId = await createTestTenantId();
    const unique = Date.now();
    const createPayload = {
      name: `E2E_TEST_PRODUCT_${unique}`,
      sku: `E2E_TEST_SKU_${unique}`,
      description: 'E2E_TEST_DESCRIPTION',
      tenantId,
    };

    const createdResponse = await request(app.getHttpServer())
      .post('/pasaporte-productos')
      .send(createPayload)
      .expect(201);

    const createdBody = createdResponse.body as ProductPassportResponse;
    const patchPayload = {
      description: `E2E_TEST_UPDATED_DESCRIPTION_${Date.now()}`,
    };

    const response = await request(app.getHttpServer())
      .patch(`/pasaporte-productos/${createdBody.id}`)
      .send(patchPayload)
      .expect(200);

    const updatedBody = response.body as ProductPassportResponse;

    expect(updatedBody.id).toBe(createdBody.id);
    expect(updatedBody.description).toBe(patchPayload.description);
  });

  it('should fail PATCH /pasaporte-productos/:id with invalid null value', async () => {
    const tenantId = await createTestTenantId();
    const unique = Date.now();
    const createPayload = {
      name: `E2E_TEST_PRODUCT_${unique}`,
      sku: `E2E_TEST_SKU_${unique}`,
      description: 'E2E_TEST_DESCRIPTION',
      tenantId,
    };

    const createdResponse = await request(app.getHttpServer())
      .post('/pasaporte-productos')
      .send(createPayload)
      .expect(201);

    const createdBody = createdResponse.body as ProductPassportResponse;
    const invalidPatchPayload = {
      description: null,
    };

    const response = await request(app.getHttpServer())
      .patch(`/pasaporte-productos/${createdBody.id}`)
      .send(invalidPatchPayload)
      .expect(400);

    const errorBody = response.body as ErrorResponse;

    expect(errorBody).toHaveProperty('message');
  });

  it('should delete product passport with valid DELETE /pasaporte-productos/:id', async () => {
    const tenantId = await createTestTenantId();
    const unique = Date.now();
    const createPayload = {
      name: `E2E_TEST_PRODUCT_${unique}`,
      sku: `E2E_TEST_SKU_${unique}`,
      description: 'E2E_TEST_DESCRIPTION',
      tenantId,
    };

    const createdResponse = await request(app.getHttpServer())
      .post('/pasaporte-productos')
      .send(createPayload)
      .expect(201);

    const createdBody = createdResponse.body as ProductPassportResponse;

    const response = await request(app.getHttpServer())
      .delete(`/pasaporte-productos/${createdBody.id}`)
      .expect(200);

    const deleteBody = response.body as DeleteResponse;

    expect(deleteBody).toHaveProperty('message');

    await request(app.getHttpServer())
      .get(`/pasaporte-productos/${createdBody.id}`)
      .expect(404);
  });
});
