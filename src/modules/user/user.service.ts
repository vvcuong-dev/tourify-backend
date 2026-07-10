import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-user.dto';
import { TOURIFY_ERROR_CODES } from '../../constants/error-code.constant';
import { AppException } from '../../exceptions/app.exception';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string) {
    const user = await this.prisma.user.findFirst({
      where: { email },
    });
    return user;
  }

  async updateProfile(userId: number, dto: UpdateProfileDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new AppException(
        TOURIFY_ERROR_CODES.USER.USER_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: dto,
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = updatedUser;
    return result;
  }
}
