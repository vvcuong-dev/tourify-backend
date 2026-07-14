import { IsNotEmpty, IsString } from 'class-validator';
import { TOURIFY_ERROR_CODES } from '../../../constants/error-code.constant';

export class ScheduleItemDto {
  @IsString()
  @IsNotEmpty({ message: TOURIFY_ERROR_CODES.TOUR.SCHEDULE_TITLE_REQUIRED })
  title!: string;

  @IsString()
  @IsNotEmpty({
    message: TOURIFY_ERROR_CODES.TOUR.SCHEDULE_DESCRIPTION_REQUIRED,
  })
  description!: string;
}
