import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsNotEmpty,
  IsString,
  Matches,
  ValidateBy,
} from 'class-validator';

function trimString(value: unknown): unknown {
  return typeof value === 'string' ? value.trim() : value;
}

export class CreatePatientDto {
  @Transform(({ value }: { value: unknown }) => trimString(value))
  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @Transform(({ value }: { value: unknown }) => trimString(value))
  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @Transform(({ value }: { value: unknown }) => trimString(value))
  @IsString()
  @Matches(/^(?:\+7|8)\d{10}$/)
  phone!: string;

  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  @IsDateString({ strict: true })
  @ValidateBy({
    name: 'notFutureDate',
    validator: {
      validate: (value: unknown) =>
        typeof value === 'string' &&
        value <= new Date().toISOString().slice(0, 10),
      defaultMessage: () => 'birthDate must not be in the future',
    },
  })
  birthDate!: string;

  @Transform(({ value }: { value: unknown }) => trimString(value))
  @IsString()
  @Matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
  email!: string;

  @IsString()
  comment!: string;
}
