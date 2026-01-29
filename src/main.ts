// backend/src/main.ts

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['error', 'warn', 'log', 'debug'],
  });

  const config = app.get(ConfigService);
  const isDevelopment = config.get('NODE_ENV') !== 'production';

  app.setGlobalPrefix('api');

 app.useStaticAssets(join(__dirname, '..', 'uploads'), {
  prefix: '/uploads/',
  setHeaders: (res) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Cross-Origin-Resource-Policy', 'cross-origin');
  },
});

  // ✅ CORS UNIFICADO: Funciona para web Y apps móviles
  const allowedOrigins = config
    .get('ALLOWED_ORIGINS', '')
    .split(',')
    .filter(Boolean);

  app.enableCors({
    origin: (origin, callback) => {
      // ✅ Apps móviles NO envían origin - PERMITIR
      if (!origin) {
        return callback(null, true);
      }

      // ✅ Desarrollo: permitir localhost
      if (isDevelopment) {
        if (
          origin.startsWith('http://localhost') ||
          origin.startsWith('http://127.0.0.1') ||
          origin.startsWith('http://10.0.2.2')
        ) {
          return callback(null, true);
        }
      }

      // ✅ Producción: verificar lista de orígenes permitidos
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // ✅ Permitir chrome-extension
      if (origin.startsWith('chrome-extension://')) {
        return callback(null, true);
      }

      console.log(`⚠️  CORS blocked: ${origin}`);
      callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'Origin',
      'X-Requested-With',
    ],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const port = config.get('PORT', 3000);
  await app.listen(port, '0.0.0.0');

  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║                                                        ║');
  console.log('║         🛡️  SIRTECH CREATOR API - ONLINE 🛡️           ║');
  console.log('║                                                        ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  console.log(`🚀 Server running on: http://localhost:${port}/api`);
  console.log(`📁 Static files: http://localhost:${port}/uploads/`);
  console.log(`🔐 Environment: ${isDevelopment ? 'development' : 'production'}`);
  console.log(`📡 CORS Policy: ${isDevelopment ? '🔓 DEVELOPMENT' : '🔐 RESTRICTED'}`);
  console.log(`   → Allowed: ${allowedOrigins.join(', ') || 'None configured'}`);
  console.log(`   → Mobile apps: ✓ Allowed (no origin)`);
  console.log(`🔑 JWT Secret: ${config.get('JWT_SECRET') ? '✓ Configured' : '✗ Missing'}\n`);
}

bootstrap();