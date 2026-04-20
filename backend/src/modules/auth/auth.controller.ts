import { Body, Controller, Post , Res, Req, Get, UseGuards, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { AuthService } from './auth.service';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { MESSAGES } from '../../common/constants/messages';
import { LoginUserDto } from './dto/login-user.dto';
import '@fastify/cookie';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GetCurrentUser } from './decorators/get-current-user.decorator';
import { UsersService } from '../users/users.service';
import { COOKIE_CONFIG, COOKIE_NAMES } from '../../common/configs/auth-cookies.config';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService, private readonly usersService: UsersService) {}

    @Post('init-owner')
    async initOwner(
        @Body() createUserDto: CreateUserDto,
        @Res({ passthrough: true }) res: FastifyReply,
        @Req() req: FastifyRequest,
    ) {
    const userAgent = req.headers['user-agent'];
    const tokens = await this.authService.createInitialOwner(createUserDto, userAgent);

    res.setCookie(COOKIE_NAMES.ACCESS_TOKEN, tokens.accessToken, COOKIE_CONFIG.ACCESS_TOKEN);
    res.setCookie(COOKIE_NAMES.REFRESH_TOKEN, tokens.refreshToken, COOKIE_CONFIG.REFRESH_TOKEN);

    return { message: MESSAGES.AUTH.OWNER_CREATED };
  }
  
  @Post('login')
  async loginUser(
    @Body() loginUserDto: LoginUserDto,
    @Res({ passthrough: true }) res: FastifyReply,
    @Req() req: FastifyRequest,
  ) {
    const userAgent = req.headers['user-agent'] as string;
    const {user, tokens} = await this.authService.loginUser(loginUserDto, userAgent);

    res.setCookie(COOKIE_NAMES.ACCESS_TOKEN, tokens.accessToken, COOKIE_CONFIG.ACCESS_TOKEN);
    res.setCookie(COOKIE_NAMES.REFRESH_TOKEN, tokens.refreshToken, COOKIE_CONFIG.REFRESH_TOKEN);

    return { message: MESSAGES.AUTH.LOGGED_IN, data: user };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard) 
  async getProfile(@GetCurrentUser('userId') userId: string) {
    const user = await this.usersService.getProfile(userId);
    
    return user;
  }

  @Post('refresh')
  async refreshToken(
    @Req() req: FastifyRequest,
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    const refreshToken = req.cookies[COOKIE_NAMES.REFRESH_TOKEN];
    const userAgent = req.headers['user-agent'] as string;

    if (!refreshToken) {
      throw new UnauthorizedException(MESSAGES.AUTH.REFRESH_TOKEN_MISSING);
    }

    const { tokens, user } = await this.authService.refreshTokens(refreshToken, userAgent);

    res.setCookie(COOKIE_NAMES.ACCESS_TOKEN, tokens.accessToken, COOKIE_CONFIG.ACCESS_TOKEN);
    res.setCookie(COOKIE_NAMES.REFRESH_TOKEN, tokens.refreshToken, COOKIE_CONFIG.REFRESH_TOKEN);

    return { message: MESSAGES.AUTH.REFRESHED, data: user };
  }

  @Post('logout')
  async logout(
    @Req() req: FastifyRequest,
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    const refreshToken = req.cookies[COOKIE_NAMES.REFRESH_TOKEN];
    await this.authService.logout(refreshToken);

    res.clearCookie(COOKIE_NAMES.ACCESS_TOKEN, { path: '/' });
    res.clearCookie(COOKIE_NAMES.REFRESH_TOKEN, { path: '/' });

    return { message: MESSAGES.AUTH.LOGGED_OUT };
  }
}
