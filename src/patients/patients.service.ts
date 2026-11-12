import { Injectable, NotFoundException } from '@nestjs/common';
import type { Patient } from '../generated/prisma/client';
import { Prisma } from '../generated/prisma/client';
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

  async update(id: number, data: CreatePatientDto): Promise<Patient> {
    try {
      return await this.prisma.patient.update({
        where: { id },
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          birthDate: data.birthDate,
          email: data.email,
          comment: data.comment,
        },
      });
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Patient not found');
      }
      throw error;
    }
  }

  async remove(id: number): Promise<void> {
    try {
      await this.prisma.patient.delete({ where: { id } });
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Patient not found');
      }
      throw error;
    }
  }

  async findAll(
    query: GetPatientsQueryDto,
  ): Promise<{ patients: Patient[]; total: number }> {
    const columns: Record<string, Prisma.Sql> = {
      id: Prisma.sql`"id"`,
      firstName: Prisma.sql`"firstName"`,
      lastName: Prisma.sql`"lastName"`,
      phone: Prisma.sql`"phone"`,
      birthDate: Prisma.sql`"birthDate"`,
      email: Prisma.sql`"email"`,
      comment: Prisma.sql`"comment"`,
    };
    const conditions: Prisma.Sql[] = [];
    const search = query.q?.trim();
    if (search) {
      
      const pattern = `%${search.replace(/[\\%_]/g, '\\$&')}%`;
      conditions.push(
        Prisma.sql`concat_ws(' ', "firstName", "lastName", "phone", "email", "comment") ILIKE ${pattern}`,
      );
    }
    if (query.commentFilter !== 'all') {
      const empty = query.commentFilter === 'without_comment';
      conditions.push(Prisma.sql`("comment" ~ '[^[:space:]]') = ${!empty}`);
    }
    const where = conditions.length
      ? Prisma.sql`WHERE ${Prisma.join(conditions, ' AND ')}`
      : Prisma.empty;
    const direction =
      query._order === 'desc' ? Prisma.sql`DESC` : Prisma.sql`ASC`;
    const column = columns[query._sort] ?? columns.id;
    const [patients, counts] = await Promise.all([
      this.prisma.$queryRaw<Patient[]>(Prisma.sql`
        SELECT * FROM "Patient" ${where}
        ORDER BY ${column} ${direction}, "id" ASC
        LIMIT ${query._limit} OFFSET ${(query._page - 1) * query._limit}
      `),
      this.prisma.$queryRaw<{ total: number }[]>(Prisma.sql`
        SELECT COUNT(*)::int AS total FROM "Patient" ${where}
      `),
    ]);
    return { patients, total: counts[0].total };
  }
}
