import {
  Controller,
  Get,
  Req,
  UseGuards,
  Body,
  Patch,
  UseInterceptors,
  Post,
  UploadedFile,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import type { RequestWithUser } from '../../common/types/request-with-user.type';
import { UpdateProfileDto } from './dto/update-user.dto';
import { createImageUploadOptions } from '../../utils/multer.util';
import { FileInterceptor } from '@nestjs/platform-express/multer/interceptors/file.interceptor';
import { UPLOAD_LIMITS } from '../../constants/upload.constant';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserResponse } from './responses/user.response';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('admin/users')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get the profile of the authenticated user' })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully.',
    type: UserResponse,
  })
  getMe(@Req() req: RequestWithUser) {
    return req.user;
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Update the profile of the authenticated user' })
  @ApiResponse({
    status: 200,
    description: 'User profile updated successfully.',
    type: UserResponse,
  })
  @ApiResponse({ status: 400, description: 'Invalid user data provided.' })
  updateProfile(@Req() req: RequestWithUser, @Body() dto: UpdateProfileDto) {
    return this.userService.updateProfile(req.user.id, dto);
  }

  @Post('avatar')
  @ApiOperation({ summary: 'Update the avatar of the authenticated user' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        avatar: {
          type: 'string',
          format: 'binary', // hiển thị nút "Choose File" trong Swagger UI
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'User avatar updated successfully.',
    type: UserResponse,
  })
  @UseInterceptors(
    FileInterceptor('avatar', createImageUploadOptions(UPLOAD_LIMITS.AVATAR)),
  )
  updateAvatar(
    @Req() req: RequestWithUser,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.userService.updateAvatar(req.user.id, file);
  }
}
