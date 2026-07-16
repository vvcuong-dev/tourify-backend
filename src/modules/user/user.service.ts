import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-user.dto';
import { TOURIFY_ERROR_CODES } from '../../constants/error-code.constant';
import { AppException } from '../../common/exceptions/app.exception';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CLOUDINARY_FOLDERS } from '../../constants/cloudinary.constant';
import { Logger } from '@nestjs/common';
import { User } from '../../generated/prisma/browser';
import { UserResponse } from './responses/user.response';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async findById(id: number): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    return user;
  }

  async updateProfile(
    userId: number,
    dto: UpdateProfileDto,
  ): Promise<UserResponse> {
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

    return new UserResponse(updatedUser);
  }

  async updateAvatar(
    userId: number,
    file: Express.Multer.File,
  ): Promise<UserResponse> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new AppException(
        TOURIFY_ERROR_CODES.USER.USER_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }

    const uploaded = await this.cloudinaryService.uploadImage(
      file,
      CLOUDINARY_FOLDERS.AVATARS,
    );

    const upload = await this.prisma.user.update({
      where: { id: userId },
      data: {
        avatar: uploaded.secure_url,
        avatarPublicId: uploaded.public_id,
      },
    });

    if (user.avatarPublicId) {
      await this.cloudinaryService
        .deleteImage(user.avatarPublicId)
        .catch((error: Error) => {
          this.logger.error(`Failed to delete old avatar: ${error.message}`);
        });
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = upload;
    return new UserResponse(result);
  }
}
