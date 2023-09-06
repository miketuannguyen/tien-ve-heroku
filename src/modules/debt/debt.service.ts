import { Injectable } from '@nestjs/common';
import * as dayjs from 'dayjs';
import { DebtDTO, DebtDetailDTO, DebtListDTO, DebtSearchQuery, SaveDebtDTO } from 'src/dtos';
import { DebtEntity } from 'src/entities';
import { BaseService } from 'src/includes';
import { DebtRepository } from 'src/repository';
import { CONSTANTS, Helpers, mapper } from 'src/utils';

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

    public async getList(params: DebtSearchQuery, userId: number) {
        const query = this._debtRepo
            .createQueryBuilder('debt')
            .select('debt.*')
            .addSelect('DATE_FORMAT(debt.created_date, \'%d/%m/%Y %H:%i:%s\') as created_date')
            .addSelect('IFNULL(SUM(message.amount), 0) as paid_amount')
            .addSelect('bank_account.account_number as bank_account_number')
            .addSelect('bank.brand_name as bank_brand_name')
            .leftJoin('d_messages', 'message', 'message.debt_id = debt.id')
            .leftJoin('d_bank_accounts', 'bank_account', 'bank_account.id = debt.bank_account_id')
            .leftJoin('m_banks', 'bank', 'bank.id = bank_account.bank_id')
            .where('debt.is_deleted = 0')
            .andWhere('debt.user_id = :user_id', { user_id: userId })
            .groupBy('debt.id')
            .orderBy('debt.id', 'DESC');

        if (params?.min_amount) {
            query.andWhere('debt.amount >= :min_amount', { min_amount: Number(params?.min_amount) || 0 });
        }

        if (params?.max_amount) {
            query.andWhere('debt.amount <= :max_amount', { max_amount: Number(params?.max_amount) || 0 });
        }

        if (Helpers.isString(params.start_date)) {
            query.andWhere('debt.created_date >= :start_date', { start_date: `${params.start_date} 00:00:00` });
        }

        if (Helpers.isString(params.end_date)) {
            query.andWhere('debt.created_date <= :end_date', { end_date: `${params.end_date} 23:59:59` });
        }

        if (params?.is_paid) {
            query.andWhere('(SELECT IFNULL(SUM(message.amount), 0) FROM d_messages AS message WHERE message.debt_id = debt.id) >= debt.amount');
        }

        if (params?.is_not_paid) {
            query.andWhere('(SELECT IFNULL(SUM(message.amount), 0) FROM d_messages AS message WHERE message.debt_id = debt.id) < debt.amount');
        }

        if (Number(params?.page) > 0) {
            const page = Number(params?.page);
            const offset = (page - 1) * CONSTANTS.PAGE_SIZE;
            query.offset(offset).limit(CONSTANTS.PAGE_SIZE);
        }

        const list = await query.getRawMany<DebtListDTO>();
        return Helpers.isFilledArray(list) ? list : [];
    }

    public async getTotal(params: DebtSearchQuery, userId: number) {
        const query = this._debtRepo
            .createQueryBuilder('debt')
            .where('debt.is_deleted = 0')
            .andWhere('debt.user_id = :user_id', { user_id: userId })
            .leftJoin('d_messages', 'message', 'message.debt_id = debt.id')
            .groupBy('debt.id');

        if (params?.min_amount) {
            query.andWhere('debt.amount >= :min_amount', { min_amount: params?.min_amount });
        }

        if (params?.max_amount) {
            query.andWhere('debt.amount <= :max_amount', { max_amount: params?.max_amount });
        }

        if (Helpers.isString(params.start_date)) {
            query.andWhere('debt.created_date >= :start_date', { start_date: `${params.start_date} 00:00:00` });
        }

        if (Helpers.isString(params.end_date)) {
            query.andWhere('debt.created_date <= :end_date', { end_date: `${params.end_date} 23:59:59` });
        }

        if (params?.is_paid) {
            query.andWhere('(SELECT IFNULL(SUM(message.amount), 0) FROM d_messages AS message WHERE message.debt_id = debt.id) >= debt.amount');
        }

        if (params?.is_not_paid) {
            query.andWhere('(SELECT IFNULL(SUM(message.amount), 0) FROM d_messages AS message WHERE message.debt_id = debt.id) < debt.amount');
        }

        return query.getCount();
    }

    public async getDetail(id: string) {
        if (!Helpers.isString(id)) return null;

        const query = this._debtRepo
            .createQueryBuilder('debt')
            .select('debt.*')
            .addSelect('DATE_FORMAT(debt.created_date, \'%d/%m/%Y %H:%i:%s\') as created_date')
            .addSelect('IFNULL(SUM(message.amount), 0) as paid_amount')
            .addSelect('bank_account.bank_id AS bank_account_bank_id')
            .addSelect('bank_account.user_id AS bank_account_user_id')
            .addSelect('bank_account.phone AS bank_account_phone')
            .addSelect('bank_account.branch_name AS bank_account_branch_name')
            .addSelect('bank_account.card_owner AS bank_account_card_owner')
            .addSelect('bank_account.account_number AS bank_account_number')
            .addSelect('bank_account.name AS bank_account_name')
            .addSelect('bank.brand_name AS bank_brand_name')
            .leftJoin('d_bank_accounts', 'bank_account', 'bank_account.id = debt.bank_account_id')
            .leftJoin('m_banks', 'bank', 'bank.id = bank_account.bank_id')
            .leftJoin('d_messages', 'message', 'message.debt_id = debt.id')
            .where('debt.is_deleted = 0')
            .where('debt.id = :id', { id });

        const item = await query.getRawOne<DebtDetailDTO>();
        return item ?? null;
    }
}
