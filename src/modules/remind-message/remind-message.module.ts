import { Module } from '@nestjs/common';
import { RemindMessageService } from './remind-message.service';
import { DebtRepository, RemindMessageRepository, UserRepository } from 'src/repository';
import { RemindMessageController } from './remind-message.controller';

@Module({
    providers: [RemindMessageService, RemindMessageRepository, UserRepository, DebtRepository],
    controllers: [RemindMessageController],
})
export class RemindMessageModule {}
