import { Controller, Get, Req, UseGuards, Body, Patch } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import type { RequestWithUser } from '../../common/types/request-with-user.type';
import { UpdateProfileDto } from './dto/update-user.dto';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('profile')
  getMe(@Req() req: RequestWithUser) {
    return req.user;
  }

  @Patch('profile')
  updateProfile(@Req() req: RequestWithUser, @Body() dto: UpdateProfileDto) {
    return this.userService.updateProfile(req.user.id, dto);
  }
}
