import { Module } from '@nestjs/common';
import { BankRepository, DebtRepository, MessageRepository } from 'src/repository';
import { BankService } from '../bank/bank.service';
import { DebtService } from '../debt/debt.service';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';

@Module({
    controllers: [MessageController],
    providers: [MessageService, MessageRepository, BankService, BankRepository, DebtService, DebtRepository],
})
export class MessageModule {}
