import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PatientsModule } from './patients.module';
import { PatientsService } from './patients.service';

describe('GET /patients', () => {
  let app: INestApplication<App>;
  const patient = {
    id: 11,
    firstName: 'Иван',
    lastName: 'Иванов',
    phone: '+79991234567',
    birthDate: '1990-01-01',
    email: 'ivan@example.com',
    comment: '',
  };
  const prisma = {
    patient: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [PatientsModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prisma)
      .compile();
    app = module.createNestApplication();
    await app.init();
  });

  beforeEach(() => {
    jest.resetAllMocks();
    prisma.patient.findMany.mockResolvedValue([patient]);
    prisma.patient.count.mockResolvedValue(25);
  });

  afterAll(async () => {
    await app.close();
  });

  it('uses defaults when pagination parameters are omitted', async () => {
    await request(app.getHttpServer())
      .get('/patients')
      .expect(200)
      .expect('X-Total-Count', '25')
      .expect([patient]);
    expect(prisma.patient.findMany).toHaveBeenCalledWith({
      orderBy: { id: 'asc' },
      skip: 0,
      take: 10,
    });
  });

  it('returns a page with the total before pagination', async () => {
    await request(app.getHttpServer())
      .get('/patients?_page=2&_limit=10')
      .expect(200)
      .expect('X-Total-Count', '25')
      .expect([patient]);
    expect(prisma.patient.findMany).toHaveBeenCalledWith({
      orderBy: { id: 'asc' },
      skip: 10,
      take: 10,
    });
  });

  it('returns an empty page while preserving the total', async () => {
    prisma.patient.findMany.mockResolvedValue([]);
    await request(app.getHttpServer())
      .get('/patients?_page=4&_limit=10')
      .expect(200)
      .expect('X-Total-Count', '25')
      .expect([]);
  });

  it.each([
    '_page=0',
    '_page=-1',
    '_page=1.5',
    '_page=abc',
    '_page=',
    '_page=1000001',
    '_limit=0',
    '_limit=101',
    '_limit=2.5',
    '_limit=',
    '_page=1&_page=2',
    '_limit=10&_limit=20',
  ])('rejects invalid pagination: %s', async (query) => {
    await request(app.getHttpServer())
      .get(`/patients?${query}`)
      .expect(400);
    expect(prisma.patient.findMany).not.toHaveBeenCalled();
    expect(prisma.patient.count).not.toHaveBeenCalled();
  });
});

describe('DELETE /patients/:id', () => {
  let app: INestApplication<App>;
  let service: PatientsService;
  const prisma = {
    patient: {
      delete: jest.fn(),
    },
  };

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [PatientsModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prisma)
      .compile();
    service = module.get(PatientsService);
    app = module.createNestApplication();
    await app.init();
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  it('deletes the requested patient and returns 204 without a body', async () => {
    prisma.patient.delete.mockResolvedValue({ id: 11 });
    const response = await request(app.getHttpServer())
      .delete('/patients/11')
      .expect(204);
    expect(response.text).toBe('');
    expect(prisma.patient.delete).toHaveBeenCalledTimes(1);
    expect(prisma.patient.delete).toHaveBeenCalledWith({ where: { id: 11 } });
  });

  it('returns 404 for a missing patient, including a repeated deletion', async () => {
    prisma.patient.delete
      .mockResolvedValueOnce({ id: 11 })
      .mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('Record not found', {
          code: 'P2025',
          clientVersion: '7.10.1',
        }),
      );
    await request(app.getHttpServer()).delete('/patients/11').expect(204);
    await request(app.getHttpServer())
      .delete('/patients/11')
      .expect(404)
      .expect({
        statusCode: 404,
        message: 'Patient not found',
        error: 'Not Found',
      });
  });

  it.each(['0', '-1', '1.5', 'abc', '1e2', '2147483648'])(
    'rejects invalid ID %s before accessing the database',
    async (id) => {
      await request(app.getHttpServer()).delete(`/patients/${id}`).expect(400);
      expect(prisma.patient.delete).not.toHaveBeenCalled();
    },
  );

  it('does not turn unrelated database errors into 404', async () => {
    const error = new Error('Database unavailable');
    prisma.patient.delete.mockRejectedValue(error);
    await expect(service.remove(11)).rejects.toBe(error);
  });
});
