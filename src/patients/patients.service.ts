import { Injectable } from '@nestjs/common';
import type { Patient } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PatientsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(): Promise<Patient[]> {
    return this.prisma.patient.findMany({ orderBy: { id: 'asc' } });
  }
}
