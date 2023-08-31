import { Module } from '@nestjs/common';
import { OtpRepository, MessageRepository, UserRepository } from './index';

@Module({
    providers: [UserRepository, MessageRepository, OtpRepository],
    exports: [UserRepository, MessageRepository, OtpRepository],
})
export class RepositoryModule {}
