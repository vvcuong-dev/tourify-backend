import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TOURIFY_ERROR_CODES } from '../../../constants/error-code.constant';

export class ScheduleItemDto {
  @ApiProperty({ example: 'Day 1' })
  @IsString()
  @IsNotEmpty({ message: TOURIFY_ERROR_CODES.TOUR.SCHEDULE_TITLE_REQUIRED })
  title!: string;

  @ApiProperty({ example: 'Visit the beach and local market' })
  @IsString()
  @IsNotEmpty({
    message: TOURIFY_ERROR_CODES.TOUR.SCHEDULE_DESCRIPTION_REQUIRED,
  })
  description!: string;
}
