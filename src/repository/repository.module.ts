import { Module } from '@nestjs/common';
import { MessageRepository } from './message.repository';
import { UserRepository } from './user.repository';

@Module({
    providers: [UserRepository, MessageRepository],
    exports: [UserRepository, MessageRepository],
})
export class RepositoryModule {}
