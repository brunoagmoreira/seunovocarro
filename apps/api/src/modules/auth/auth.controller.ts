import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { GoogleAuthDto, LoginDto, RegisterDto } from './dto/auth.dto';

@ApiTags('Autenticação')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('google')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Login com Google',
    description: 'Envie o `idToken` (JWT) retornado pelo botão Google Identity Services.',
  })
  @ApiBody({ type: GoogleAuthDto })
  async google(@Body() body: GoogleAuthDto) {
    return this.authService.loginWithGoogle(body.idToken);
  }

  @Post('register')
  @ApiOperation({ summary: 'Cadastro de usuário' })
  @ApiBody({ type: RegisterDto })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }
}
