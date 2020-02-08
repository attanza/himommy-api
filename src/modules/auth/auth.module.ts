import { MommyDetailModule } from '@modules/mommy-detail/mommy-detail.module';
import { RoleSchema } from '@modules/role/role.schema';
import { TocologistModule } from '@modules/tocologist/tocologist.module';
import { UserModule } from '@modules/user/user.module';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { UserSchema } from '../user/user.schema';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { FacebookStrategy } from './facebook.strategy';
import { JwtStrategy } from './jwt.strategy';
import { MobileAuthController } from './mobile-auth.controller';
import { TocologistAuthController } from './tocologist-auth.controller';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'User', schema: UserSchema },
      { name: 'Role', schema: RoleSchema },
    ]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.APP_SECRET,
      signOptions: {
        expiresIn: '1h',
      },
    }),
    TocologistModule,
    MommyDetailModule,
    UserModule,
  ],
  controllers: [AuthController, MobileAuthController, TocologistAuthController],
  providers: [AuthService, JwtStrategy, FacebookStrategy],
  exports: [JwtStrategy, PassportModule],
})
export class AuthModule {}
