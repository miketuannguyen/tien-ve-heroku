import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BankAccountEntity, BankEntity, MessageEntity, OtpEntity, UserEntity } from './index';

@Module({
    imports: [TypeOrmModule.forFeature([UserEntity, MessageEntity, OtpEntity, BankEntity, BankAccountEntity])],
    exports: [TypeOrmModule],
})
export class EntityModule {}
