import { IsArray, IsEnum, IsInt } from 'class-validator';
import { MultiAction } from '../../../common/enums/multi-action.enum';
import { TOURIFY_ERROR_CODES } from '../../../constants/error-code.constant';

export class ChangeMultiCategoryDto {
  @IsEnum(MultiAction, { message: TOURIFY_ERROR_CODES.COMMON.INVALID_OPTION })
  option!: MultiAction;

  @IsArray()
  @IsInt({ each: true })
  ids!: number[];
}
