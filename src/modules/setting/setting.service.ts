import { Injectable } from '@nestjs/common';
import { SettingDTO } from 'src/dtos';
import { SettingEntity } from 'src/entities';
import { BaseService } from 'src/includes';
import { SettingRepository } from 'src/repository';
import { CONSTANTS, Helpers, mapper } from 'src/utils';
import { ValueOf } from 'src/utils/types';
import { In } from 'typeorm';

@Injectable()
export class SettingService extends BaseService {
    /** Constructor */
    constructor(private readonly _settingRepo: SettingRepository) {
        super();
    }

    public async getListByFieldNameList(fieldNameList: ValueOf<typeof CONSTANTS.SETTING_FIELD_NAMES>[]) {
        const list = await this._settingRepo.find({
            where: {
                is_deleted: 0,
                field_name: In(fieldNameList),
            },
        });
        if (!Helpers.isFilledArray(list)) return [];

        return list.map((setting) => mapper.map(setting, SettingEntity, SettingDTO));
    }

    public async updateMultiple(settings: { [fieldName: string]: string }) {
        const fieldNameList = Object.keys(settings);
        if (!Helpers.isFilledArray(fieldNameList)) return false;

        for (const fieldName of fieldNameList) {
            const item = await this._settingRepo.findOne({ where: { field_name: fieldName } });
            if (item && !Helpers.isEmptyObject(item)) {
                item.value = settings[fieldName];
                await this._settingRepo.save(item);
            }
        }

        return true;
    }
}
