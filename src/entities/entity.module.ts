import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BankAccountEntity, BankEntity, MessageEntity, OtpEntity, SettingEntity, UserEntity } from './index';
import { DebtEntity } from './debt.entity';
import { RemindMessageEntity } from './remind-message.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            UserEntity,
            MessageEntity,
            OtpEntity,
            BankEntity,
            BankAccountEntity,
            DebtEntity,
            SettingEntity,
            RemindMessageEntity,
        ]),
    ],
    exports: [TypeOrmModule],
})
export class EntityModule {}
