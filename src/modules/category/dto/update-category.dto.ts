import { PartialType } from '@nestjs/mapped-types';
import { ApiExtraModels } from '@nestjs/swagger';

import { CreateCategoryDto } from './create-category.dto';

@ApiExtraModels(CreateCategoryDto)
export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {}
