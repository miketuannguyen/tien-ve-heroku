import { Module } from '@nestjs/common';
import { OtpRepository, MessageRepository, UserRepository, BankAccountRepository, DebtRepository, BankRepository } from './index';

@Module({
    providers: [UserRepository, MessageRepository, OtpRepository, BankRepository, BankAccountRepository, DebtRepository],
    exports: [UserRepository, MessageRepository, OtpRepository, BankRepository, BankAccountRepository, DebtRepository],
})
export class RepositoryModule {}
