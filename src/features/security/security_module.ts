import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import type { SignOptions } from 'jsonwebtoken';
import { PrismaModule } from '../../app/prisma/prisma_module.js';
import { SecurityApplication } from './application/security_application.js';
import { PasswordHasher } from './domain/password_hasher.js';
import { TokenIssuer } from './domain/token_issuer.js';
import { IUserRepository } from './domain/repositories/i_user_repository.js';
import { BcryptPasswordHasher } from './infra/bcrypt_password_hasher.js';
import { JwtAuthGuard } from './infra/jwt_auth_guard.js';
import { JwtTokenIssuer } from './infra/jwt_token_issuer.js';
import { PrismaUserRepository } from './infra/persistence/prisma_user_repository.js';
import { AuthController } from './presentation/auth_controller.js';

@Module({
  imports: [
    PrismaModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: (config.get<string>('JWT_EXPIRES_IN') ?? '7d') as NonNullable<
            SignOptions['expiresIn']
          >,
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    SecurityApplication,
    { provide: IUserRepository, useClass: PrismaUserRepository },
    { provide: PasswordHasher, useClass: BcryptPasswordHasher },
    { provide: TokenIssuer, useClass: JwtTokenIssuer },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
  exports: [IUserRepository],
})
export class SecurityModule {}
