import { Module } from '@nestjs/common';
import { OtpRepository } from 'src/repository';
import { OtpController } from './otp.controller';
import { OtpService } from './otp.service';

@Module({
    controllers: [OtpController],
    providers: [OtpService, OtpRepository],
})
export class OtpModule {}
