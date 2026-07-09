export interface BaseDelegate<
  TModel,
  TWhereInput,
  TWhereUniqueInput,
  TCreateInput,
  TUpdateInput,
> {
  findFirst(args: { where: TWhereInput }): Promise<TModel | null>;
  findUnique(args: { where: TWhereUniqueInput }): Promise<TModel | null>;
  findMany(args?: {
    where?: TWhereInput;
    skip?: number;
    take?: number;
  }): Promise<TModel[]>;
  create(args: { data: TCreateInput }): Promise<TModel>;
  update(args: {
    where: TWhereUniqueInput;
    data: TUpdateInput;
  }): Promise<TModel>;
  count(args?: { where?: TWhereInput }): Promise<number>;
}

export abstract class BaseRepository<
  TModel,
  TWhereInput extends { deleted?: boolean },
  TWhereUniqueInput,
  TCreateInput,
  TUpdateInput,
> {
  protected constructor(
    protected readonly delegate: BaseDelegate<
      TModel,
      TWhereInput,
      TWhereUniqueInput,
      TCreateInput,
      TUpdateInput
    >,
  ) {}

  async findById(where: TWhereUniqueInput): Promise<TModel | null> {
    return this.delegate.findUnique({ where });
  }

  async findOne(where: TWhereInput): Promise<TModel | null> {
    return this.delegate.findFirst({ where });
  }

  async create(data: TCreateInput): Promise<TModel> {
    return this.delegate.create({ data });
  }

  async update(where: TWhereUniqueInput, data: TUpdateInput): Promise<TModel> {
    return this.delegate.update({ where, data });
  }

  async count(where?: TWhereInput): Promise<number> {
    return this.delegate.count({ where });
  }
}
