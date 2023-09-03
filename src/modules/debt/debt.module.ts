import { Module } from '@nestjs/common';
import { DebtController } from './debt.controller';
import { DebtService } from './debt.service';
import { DebtRepository } from 'src/repository';

@Module({
    controllers: [DebtController],
    providers: [DebtService, DebtRepository],
})
export class DebtModule {}
