import { Category, CategoryStatus } from '../../../generated/prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CategoryResponse {
  @ApiProperty({ example: 1 })
  id!: number;
  @ApiProperty({ example: 'Beach Tour' })
  name!: string;
  @ApiProperty({ example: 'beach-tour' })
  slug!: string;
  @ApiProperty({ example: 0, nullable: true })
  parentId!: number | null;
  @ApiProperty({ example: 1 })
  position!: number;
  @ApiProperty({ enum: CategoryStatus, example: CategoryStatus.ACTIVE })
  status!: CategoryStatus;
  @ApiProperty({ example: 'https://example.com/image.jpg', nullable: true })
  image!: string | null;
  @ApiProperty({ example: 'Description', nullable: true })
  description!: string | null;
  @ApiProperty({ example: 1, nullable: true })
  createdBy!: number | null;
  @ApiProperty({ example: 1, nullable: true })
  updatedBy!: number | null;
  @ApiProperty({ type: String, format: 'date-time' })
  createdAt!: Date;
  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt!: Date;

  @ApiPropertyOptional({ type: () => [CategoryResponse] })
  children?: CategoryResponse[];

  constructor(category: Category, children?: CategoryResponse[]) {
    this.id = category.id;
    this.name = category.name;
    this.slug = category.slug;
    this.parentId = category.parentId;
    this.position = category.position;
    this.status = category.status;
    this.image = category.image;
    this.description = category.description;
    this.createdBy = category.createdBy;
    this.updatedBy = category.updatedBy;
    this.createdAt = category.createdAt;
    this.updatedAt = category.updatedAt;
    if (children) this.children = children;
  }
}
