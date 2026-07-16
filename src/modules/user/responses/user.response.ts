import { User } from '../../../generated/prisma/client';

export class UserResponse {
  id!: number;
  name!: string;
  email!: string;
  status!: string;
  avatar!: string | null;
  phone!: string | null;
  createdAt!: Date;
  updatedAt!: Date;

  constructor(user: User) {
    this.id = user.id;
    this.name = user.name;
    this.email = user.email;
    this.status = user.status;
    this.avatar = user.avatar;
    this.phone = user.phone;
    this.createdAt = user.createdAt;
    this.updatedAt = user.updatedAt;
  }
}
