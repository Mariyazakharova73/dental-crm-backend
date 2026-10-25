import { Controller, Get, Res } from '@nestjs/common';
import type { Response } from 'express';
import type { Patient } from '../generated/prisma/client';
import { PatientsService } from './patients.service';

@Controller('patients')
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Get()
  async findAll(@Res({ passthrough: true }) response: Response): Promise<Patient[]> {
    const patients = await this.patientsService.findAll();
    response.setHeader('X-Total-Count', patients.length);
    return patients;
  }
}
