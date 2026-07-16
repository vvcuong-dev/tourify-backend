import { Expose, Type } from 'class-transformer';

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
  image!: string | null;

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

  @Expose()
  @Type(() => CategoryResponse)
  children?: CategoryResponse[];

  constructor(partial: Partial<CategoryResponse>) {
    Object.assign(this, partial);
  }
}
