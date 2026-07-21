import { IsArray, IsEnum, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { MultiAction } from '../../../common/enums/multi-action.enum';
import { TOURIFY_ERROR_CODES } from '../../../constants/error-code.constant';

export class ChangeMultiCategoryDto {
  @ApiProperty({ enum: MultiAction, description: 'The bulk action to perform' })
  @IsEnum(MultiAction, { message: TOURIFY_ERROR_CODES.COMMON.INVALID_OPTION })
  option!: MultiAction;

  @ApiProperty({
    type: [Number],
    example: [1, 2, 3],
    description: 'The ids of the categories to apply the action to',
  })
  @IsArray({ message: TOURIFY_ERROR_CODES.CATEGORY.IDS_INVALID })
  @IsInt({ each: true, message: TOURIFY_ERROR_CODES.CATEGORY.IDS_INVALID })
  ids!: number[];
}
