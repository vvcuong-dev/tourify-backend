import { Expose } from 'class-transformer';

export class CategoryResponse {
  @Expose()
  id!: number;

  @Expose()
  name!: string;

  @Expose()
  slug!: string;

  @Expose()
  parentId!: number | null;

  @Expose()
  position!: number;

  @Expose()
  status!: string;

  @Expose()
  avatar!: string | null;

  @Expose()
  description!: string | null;

  @Expose()
  createdBy!: number | null;

  @Expose()
  updatedBy!: number | null;

  @Expose()
  createdAt!: Date;

  @Expose()
  updatedAt!: Date;

  constructor(partial: Partial<CategoryResponse>) {
    Object.assign(this, partial);
  }
}
