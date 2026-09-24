import { Body, Controller, Post, Req } from '@nestjs/common';
import { Public } from './public.decorator';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Post('login')
  async login(@Body() body: { email: string; password: string }, @Req() _req: unknown) {
    return this.auth.login(body.email, body.password);
  }
}