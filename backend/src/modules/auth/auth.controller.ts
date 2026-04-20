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

    res.setCookie('AccessToken', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 5 * 60, 
    });

    res.setCookie('RefreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60,
    });

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

    res.setCookie('AccessToken', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 5 * 60, 
    });

    res.setCookie('RefreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60,
    });

    return { message: MESSAGES.AUTH.LOGGED_IN, data: user };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard) 
  async getProfile(@GetCurrentUser('userId') userId: string) {
    const user = await this.usersService.getProfile(userId);
    
    return user;
  }

  @Post('refresh')
  async refreshToken(@Req() req: FastifyRequest) {
    const refreshToken = req.cookies.RefreshToken;
    const userAgent = req.headers['user-agent'] as string;

    if (!refreshToken) {
      throw new UnauthorizedException(MESSAGES.AUTH.REFRESH_TOKEN_MISSING);
    }

    const {refreshToken: newRefreshToken} = await this.authService.refreshTokens(refreshToken, userAgent);

    return {refreshToken: newRefreshToken, oldRefreshToken: refreshToken, userAgent}

    // const tokens = await this.authService.refreshToken(refreshToken, userAgent);

    // return { message: MESSAGES.AUTH.REFRESHED, data: tokens };
  }
}
