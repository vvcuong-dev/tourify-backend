import { Request } from 'express';
import { User } from '../../generated/prisma/browser';

export interface RequestWithUser extends Request {
  user: Omit<User, 'password'>;
}
