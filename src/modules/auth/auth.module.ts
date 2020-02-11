import { MommyDetailModule } from '@modules/mommy-detail/mommy-detail.module';
import { RoleModule } from '@modules/role/role.module';
import { TocologistModule } from '@modules/tocologist/tocologist.module';
import { UserModule } from '@modules/user/user.module';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { UserSchema } from '../user/user.schema';
import { AuthService } from './auth.service';
import { AuthController } from './controllers/auth.controller';
import { MobileAuthController } from './controllers/mobile-auth.controller';
import { TocologistAuthController } from './controllers/tocologist-auth.controller';
import { FacebookStrategy } from './strategies/facebook.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.APP_SECRET,
      signOptions: {
        expiresIn: '4h',
      },
    }),
    RoleModule,
    TocologistModule,
    MommyDetailModule,
    UserModule,
  ],
  controllers: [AuthController, MobileAuthController, TocologistAuthController],
  providers: [AuthService, JwtStrategy, FacebookStrategy],
  exports: [JwtStrategy, PassportModule],
})
export class AuthModule {}
