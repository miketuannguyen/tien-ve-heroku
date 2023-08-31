import { Module } from '@nestjs/common';
import { RepositoryModule } from 'src/repository/repository.module';
import { EntityModule } from './../../entities/entity.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { OtpService } from '../otp/otp.service';
import { UserService } from '../user/user.service';

@Module({
    imports: [EntityModule, RepositoryModule],
    controllers: [AuthController],
    providers: [AuthService, OtpService, UserService],
    exports: [AuthService],
})
export class AuthModule {}
