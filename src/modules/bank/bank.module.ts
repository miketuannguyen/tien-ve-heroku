import { Module } from '@nestjs/common';
import { BankController } from './bank.controller';
import { BankService } from './bank.service';
import { BankRepository } from 'src/repository';

@Module({
    controllers: [BankController],
    providers: [BankService, BankRepository],
})
export class BankModule {}
