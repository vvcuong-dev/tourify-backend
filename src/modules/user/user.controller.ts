import { Controller, Get, Req, UseGuards, Body } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import type { RequestWithUser } from '../../common/types/request-with-user.type';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  getMe(@Req() req: RequestWithUser) {
    return req.user;
  }
}
