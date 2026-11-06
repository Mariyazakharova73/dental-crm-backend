import { Injectable, NotFoundException } from '@nestjs/common';
import type { Patient } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { GetPatientsQueryDto } from './dto/get-patients-query.dto';
import type { CreatePatientDto } from './dto/create-patient.dto';

@Injectable()
export class PatientsService {
  constructor(private readonly prisma: PrismaService) {}

  async findOne(id: number): Promise<Patient> {
    const patient = await this.prisma.patient.findUnique({ where: { id } });
    if (!patient) {
      throw new NotFoundException('Patient not found');
    }
    return patient;
  }

  create(data: CreatePatientDto): Promise<Patient> {
    return this.prisma.patient.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        birthDate: data.birthDate,
        email: data.email,
        comment: data.comment,
      },
    });
  }

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
