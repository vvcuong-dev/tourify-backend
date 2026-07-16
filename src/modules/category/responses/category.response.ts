import { Category } from '../../../generated/prisma/client';

export class CategoryResponse {
  id!: number;
  name!: string;
  slug!: string;
  parentId!: number | null;
  position!: number;
  status!: string;
  image!: string | null;
  description!: string | null;
  createdBy!: number | null;
  updatedBy!: number | null;
  createdAt!: Date;
  updatedAt!: Date;
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
