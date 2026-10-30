import { Transform } from 'class-transformer';
import { IsInt, Max, Min } from 'class-validator';

function toInteger(value: unknown): number {
  return typeof value === 'string' && /^\d+$/.test(value)
    ? Number(value)
    : Number.NaN;
}

export class GetPatientsQueryDto {
  @Transform(({ value }: { value: unknown }) => toInteger(value))
  @IsInt()
  @Min(1)
  @Max(500)
  _page = 1;

  @Transform(({ value }: { value: unknown }) => toInteger(value))
  @IsInt()
  @Min(1)
  @Max(100)
  _limit = 10;
}
