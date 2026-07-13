export class PaginationMeta {
  page!: number;
  limit!: number;
  totalRecord!: number;
  totalPage!: number;

  constructor(data: PaginationMeta) {
    Object.assign(this, data);
  }
}

export class PaginatedResponse<T> {
  items!: T[];
  pagination!: PaginationMeta;

  constructor(items: T[], pagination: PaginationMeta) {
    this.items = items;
    this.pagination = pagination;
  }
}
