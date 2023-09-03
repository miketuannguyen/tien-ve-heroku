import { Injectable } from '@nestjs/common';
import { DebtDTO, SaveDebtDTO } from 'src/dtos';
import { DebtEntity } from 'src/entities';
import { BaseService } from 'src/includes';
import { DebtRepository } from 'src/repository';
import { CONSTANTS, Helpers, mapper } from 'src/utils';
import * as dayjs from 'dayjs';

@Injectable()
export class DebtService extends BaseService {
    /** Constructor */
    constructor(private readonly _debtRepo: DebtRepository) {
        super();
    }

    public async createMultiple(itemList: SaveDebtDTO[], userId: number) {
        if (!Helpers.isFilledArray(itemList) || !userId) return [];

        const { PREFIX, SEPARATOR, DATE_FORMAT, USER_ID_LENGTH, AUTO_INCREMENT_LENGTH } = CONSTANTS.DEBT_ID_FORMAT;
        const curDateStr = dayjs(new Date()).format(DATE_FORMAT);
        const paddedUserId = userId.toString().padStart(USER_ID_LENGTH, '0');
        const idSearchStr = `${PREFIX}${SEPARATOR}${curDateStr}${SEPARATOR}${paddedUserId}${SEPARATOR}`; // TV-DDMMYY-0000X-
        const debtCountQuery = this._debtRepo.createQueryBuilder('debt').where('debt.id LIKE :search_str', { search_str: `${idSearchStr}%` });
        const todayDebtCount = await debtCountQuery.getCount();

        const entityList = itemList.map((item, idx) => {
            const paddedAutoIncrement = (todayDebtCount + idx + 1).toString().padStart(AUTO_INCREMENT_LENGTH, '0');
            const entity = new DebtEntity();
            entity.id = `${idSearchStr}${paddedAutoIncrement}`;
            entity.user_id = userId;
            entity.bank_account_id = item.bank_account_id;
            entity.payer_name = item.payer_name;
            entity.payer_phone = item.payer_phone;
            entity.amount = item.amount;
            entity.note = item.note;
            return entity;
        });

        await this._debtRepo.save(entityList);

        return entityList.map((entity) => mapper.map(entity, DebtEntity, DebtDTO));
    }
}
