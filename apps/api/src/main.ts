import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  console.log('\n--- 🚀 INICIANDO BOOTSTRAP DA API ---');
  
  // 1. Diagnóstico de Ambiente
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('❌ ERRO CRÍTICO: DATABASE_URL não encontrada!');
  } else {
    console.log('✅ DATABASE_URL presente.');
  }

  try {
    const app = await NestFactory.create(AppModule);

    // Configurações globais
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    app.setGlobalPrefix('api');

    // CORS Robusto
    app.enableCors({
      origin: [
        'https://seunovocarro.com.br',
        'https://www.seunovocarro.com.br',
        'http://localhost:3000',
        process.env.FRONTEND_URL,
      ].filter(Boolean).map(url => (url as string).replace(/\/$/, '')) as string[],
      credentials: true,
    });

    // Default 3001 alinhado ao Dockerfile / compose; 80 costuma falhar sem root no container.
    const port = Number.parseInt(process.env.PORT || '3001', 10) || 3001;
    await app.listen(port, '0.0.0.0');
    
    console.log(`\n************************************`);
    console.log(`🚀 API Seu Novo Carro ONLINE`);
    console.log(`🚀 Ouvindo em: http://0.0.0.0:${port}/api`);
    console.log(`************************************\n`);

  } catch (error) {
    console.error('❌ FALHA CRÍTICA NA INICIALIZAÇÃO:', error);
    process.exit(1);
  }
}

// Captura de erros globais para evitar morte silenciosa
process.on('uncaughtException', (err) => {
  console.error('💥 UNCAUGHT EXCEPTION:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 UNHANDLED REJECTION:', reason);
});

bootstrap();
