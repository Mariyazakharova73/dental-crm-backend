import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types';
import { PrismaService } from '../prisma/prisma.service';
import { PatientsModule } from './patients.module';

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
