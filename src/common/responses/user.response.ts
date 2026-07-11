import { Exclude, Expose } from 'class-transformer';
import { UserStatus } from '../../generated/prisma/enums';

@Exclude()
export class UserResponse {
  @Expose()
  id!: number;

  @Expose()
  name!: string;

  @Expose()
  email!: string;

  @Expose()
  status!: UserStatus;

  @Expose()
  avatar!: string | null;

  @Expose()
  phone!: string | null;

  @Expose()
  createdAt!: Date;

  @Expose()
  updatedAt!: Date;

  constructor(partial: Partial<UserResponse>) {
    Object.assign(this, partial);
  }
}
