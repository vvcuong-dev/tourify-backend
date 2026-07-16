import { Category } from '../../../generated/prisma/client';

export class CategoryListResponse {
  id!: number;
  name!: string;
  position!: number;
  status!: string;
  image!: string | null;
  description!: string | null;
  createdAt!: Date;
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
