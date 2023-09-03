import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BankAccountEntity, BankEntity, MessageEntity, OtpEntity, UserEntity } from './index';
import { DebtEntity } from './debt.entity';

@Module({
    imports: [TypeOrmModule.forFeature([UserEntity, MessageEntity, OtpEntity, BankEntity, BankAccountEntity, DebtEntity])],
    exports: [TypeOrmModule],
})
export class EntityModule {}
