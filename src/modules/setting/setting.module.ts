import { Module } from '@nestjs/common';
import { SettingController } from './setting.controller';
import { SettingService } from './setting.service';
import { SettingRepository } from 'src/repository';

@Module({
    controllers: [SettingController],
    providers: [SettingService, SettingRepository],
})
export class SettingModule {}
