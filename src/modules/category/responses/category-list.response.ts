import { Category, CategoryStatus } from '../../../generated/prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class CategoryListResponse {
  @ApiProperty({ example: 1 })
  id!: number;
  @ApiProperty({ example: 'Beach Tour' })
  name!: string;
  @ApiProperty({ example: 1 })
  position!: number;
  @ApiProperty({ enum: CategoryStatus, example: CategoryStatus.ACTIVE })
  status!: CategoryStatus;
  @ApiProperty({ example: 'https://example.com/image.jpg', nullable: true })
  image!: string | null;
  @ApiProperty({ example: 'Description', nullable: true })
  description!: string | null;
  @ApiProperty({ type: String, format: 'date-time' })
  createdAt!: Date;
  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt!: Date;

  constructor(category: Category) {
    this.id = category.id;
    this.name = category.name;
    this.position = category.position;
    this.status = category.status;
    this.image = category.image;
    this.description = category.description;
    this.createdAt = category.createdAt;
    this.updatedAt = category.updatedAt;
  }
}
