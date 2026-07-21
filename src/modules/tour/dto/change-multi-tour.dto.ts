import { IsArray, IsEnum, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MultiAction } from '../../../common/enums/multi-action.enum';
import { TOURIFY_ERROR_CODES } from '../../../constants/error-code.constant';

export class ChangeMultiTourDto {
  @ApiProperty({ enum: MultiAction })
  @IsEnum(MultiAction, { message: TOURIFY_ERROR_CODES.COMMON.INVALID_OPTION })
  option!: MultiAction;

  @ApiProperty({ type: [Number], example: [1, 2, 3] })
  @IsArray()
  @IsInt({ each: true })
  ids!: number[];
}
