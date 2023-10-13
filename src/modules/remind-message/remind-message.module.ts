import { Module } from '@nestjs/common';
import { RemindMessageService } from './remind-message.service';
import { DebtRepository, RemindMessageRepository, UserRepository } from 'src/repository';

@Module({
    providers: [RemindMessageService, RemindMessageRepository, UserRepository, DebtRepository],
})
export class RemindMessageModule {}
