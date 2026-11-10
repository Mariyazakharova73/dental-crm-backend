import { Transform } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

function toInteger(value: unknown): number {
  return typeof value === 'string' && /^\d+$/.test(value)
    ? Number(value)
    : Number.NaN;
}

export class GetPatientsQueryDto {
  @Transform(({ value }: { value: unknown }) => toInteger(value))
  @IsInt()
  @Min(1)
  @Max(1_000_000)
  _page = 1;

  @Transform(({ value }: { value: unknown }) => toInteger(value))
  @IsInt()
  @Min(1)
  @Max(100)
  _limit = 10;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  q?: string;

  @IsIn(['id', 'firstName', 'lastName', 'phone', 'birthDate', 'email', 'comment'])
  _sort = 'id';

  @IsIn(['asc', 'desc'])
  _order: 'asc' | 'desc' = 'asc';

  @IsIn(['all', 'with_comment', 'without_comment'])
  commentFilter: 'all' | 'with_comment' | 'without_comment' = 'all';
}
