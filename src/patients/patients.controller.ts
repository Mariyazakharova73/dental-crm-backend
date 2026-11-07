import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Res,
  ValidationPipe,
} from '@nestjs/common';
import type { Response } from 'express';
import type { Patient } from '../generated/prisma/client';
import { CreatePatientDto } from './dto/create-patient.dto';
import { GetPatientParamsDto } from './dto/get-patient-params.dto';
import { GetPatientsQueryDto } from './dto/get-patients-query.dto';
import { PatientsService } from './patients.service';

@Controller('patients')
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Get(':id')
  findOne(
    @Param(new ValidationPipe({ transform: true, whitelist: true }))
    params: GetPatientParamsDto,
  ): Promise<Patient> {
    return this.patientsService.findOne(params.id);
  }

  @Post()
  create(
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    data: CreatePatientDto,
  ): Promise<Patient> {
    return this.patientsService.create(data);
  }

  @Put(':id')
  update(
    @Param(new ValidationPipe({ transform: true, whitelist: true }))
    params: GetPatientParamsDto,
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    data: CreatePatientDto,
  ): Promise<Patient> {
    return this.patientsService.update(params.id, data);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param(new ValidationPipe({ transform: true, whitelist: true }))
    params: GetPatientParamsDto,
  ): Promise<void> {
    return this.patientsService.remove(params.id);
  }

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
