import { Injectable } from '@nestjs/common';
import type { Patient } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { GetPatientsQueryDto } from './dto/get-patients-query.dto';

@Injectable()
export class PatientsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    query: GetPatientsQueryDto,
  ): Promise<{ patients: Patient[]; total: number }> {
    const [patients, total] = await Promise.all([
      this.prisma.patient.findMany({
        orderBy: { id: 'asc' },
        skip: (query._page - 1) * query._limit,
        take: query._limit,
      }),
      this.prisma.patient.count(),
    ]);
    return { patients, total };
  }
}
