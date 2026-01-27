// backend/src/main.ts

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express'; // ✅ CAMBIO
import { AppModule } from './app.module';
import { join } from 'path'; // ✅ AGREGAR

async function bootstrap() {
  // ✅ CAMBIO: Usar NestExpressApplication en lugar de solo crear la app
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['error', 'warn', 'log', 'debug'],
  });

  const config = app.get(ConfigService);
  const isDevelopment = config.get('NODE_ENV') !== 'production';

  // Global prefix (ANTES de CORS)
  app.setGlobalPrefix('api');

  // ✅ CONFIGURAR ARCHIVOS ESTÁTICOS (avatares, etc.)
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  // ✅ CORS DINÁMICO: Permisivo en desarrollo, restrictivo en producción
  if (isDevelopment) {
    // 🔓 DESARROLLO: Permitir TODOS los orígenes localhost
    app.enableCors({
      origin: (origin, callback) => {
        // Sin origin (Postman, Thunder Client, etc.)
        if (!origin) return callback(null, true);
        
        // Permitir cualquier localhost o 127.0.0.1
        if (
          origin.startsWith('http://localhost') ||
          origin.startsWith('http://127.0.0.1') ||
          origin.startsWith('https://localhost') ||
          origin.startsWith('https://127.0.0.1')
        ) {
          return callback(null, true);
        }
        
        // ✅ Permitir chrome-extension (Flutter Web usa esto en algunos casos)
        if (origin.startsWith('chrome-extension://')) {
          return callback(null, true);
        }
        
        // Bloquear otros orígenes
        console.log(`⚠️  CORS blocked: ${origin}`);
        callback(new Error(`Origin ${origin} not allowed`));
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
  } else {
    // 🔐 PRODUCCIÓN: Solo orígenes específicos
    const allowedOrigins = config
      .get('ALLOWED_ORIGINS', '')
      .split(',')
      .filter(Boolean);

    app.enableCors({
      origin: allowedOrigins,
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
  }

  // Global validation pipe
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
  console.log(`🚀 Server running on port ${port}`);
  console.log(`📁 Static files: http://localhost:${port}/uploads/`); // ✅ AGREGAR
  console.log(`🔐 Environment: ${isDevelopment ? 'development' : 'production'}`);
  
  if (isDevelopment) {
    console.log(`📡 CORS Policy: 🔓 OPEN (All localhost origins allowed)`);
    console.log(`   → Flutter Web: ✓ Any localhost port`);
    console.log(`   → Postman/Tools: ✓ Allowed`);
  } else {
    const allowedOrigins = config.get('ALLOWED_ORIGINS', '').split(',');
    console.log(`📡 CORS Policy: 🔐 RESTRICTED`);
    console.log(`   → Allowed: ${allowedOrigins.join(', ')}`);
  }
  
  console.log(`🔑 JWT Secret: ${config.get('JWT_SECRET') ? '✓ Configured' : '✗ Missing'}\n`);
}

bootstrap();