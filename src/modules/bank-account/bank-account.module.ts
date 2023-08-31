import { Module } from '@nestjs/common';
import { BankAccountController } from './bank-account.controller';
import { BankAccountService } from './bank-account.service';
import { BankAccountRepository } from 'src/repository';

@Module({
    controllers: [BankAccountController],
    providers: [BankAccountService, BankAccountRepository],
})
export class BankAccountModule {}
