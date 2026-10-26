import { Controller, Get, Query, Res, ValidationPipe } from '@nestjs/common';
import type { Response } from 'express';
import type { Patient } from '../generated/prisma/client';
import { GetPatientsQueryDto } from './dto/get-patients-query.dto';
import { PatientsService } from './patients.service';

@Controller('patients')
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Get()
  async findAll(
    @Query(new ValidationPipe({ transform: true, whitelist: true }))
    query: GetPatientsQueryDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<Patient[]> {
    const { patients, total } = await this.patientsService.findAll(query);
    response.setHeader('X-Total-Count', total);
    return patients;
  }
}
