import { Module } from '@nestjs/common';
import { OtpRepository, MessageRepository, UserRepository, BankAccountRepository, DebtRepository, BankRepository } from './index';
import { RemindMessageRepository } from './remind-message.repository';

@Module({
    providers: [UserRepository, MessageRepository, OtpRepository, BankRepository, BankAccountRepository, DebtRepository, RemindMessageRepository],
    exports: [UserRepository, MessageRepository, OtpRepository, BankRepository, BankAccountRepository, DebtRepository, RemindMessageRepository],
})
export class RepositoryModule {}
