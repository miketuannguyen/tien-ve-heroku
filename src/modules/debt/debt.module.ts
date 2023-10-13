import { Module } from '@nestjs/common';
import { DebtController } from './debt.controller';
import { DebtService } from './debt.service';
import { DebtRepository, RemindMessageRepository, SettingRepository, UserRepository } from 'src/repository';
import { SettingService } from '../setting/setting.service';
import { RemindMessageService } from '../remind-message/remind-message.service';
import { UserService } from '../user/user.service';

@Module({
    controllers: [DebtController],
    providers: [
        DebtService,
        DebtRepository,
        SettingService,
        SettingRepository,
        RemindMessageService,
        RemindMessageRepository,
        UserService,
        UserRepository,
    ],
})
export class DebtModule {}
