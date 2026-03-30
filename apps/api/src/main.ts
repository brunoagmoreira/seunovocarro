import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

const BUILD_VERSION = '2026-03-30T13:47:00';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilitar CORS para o frontend (Next.js em localhost:3000)
  app.enableCors({
    origin: [
      'https://seunovocarro.com.br',
      'https://www.seunovocarro.com.br',
      'http://localhost:3000',
      process.env.FRONTEND_URL,
    ].filter(Boolean) as string[],
    credentials: true,
  });

  // Prefixo global: todas as rotas começam com /api
  // Ex: GET /api/vehicles, POST /api/auth/login
  app.setGlobalPrefix('api');

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(`🚀 API rodando em http://localhost:${port}/api`);
}
bootstrap();
