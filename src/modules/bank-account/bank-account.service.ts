import { Injectable } from '@nestjs/common';
import { BankAccountDTO, BankAccountDetailDTO, BankAccountListDTO, BankAccountSearchQuery } from 'src/dtos';
import { BankAccountEntity } from 'src/entities';
import { BaseService } from 'src/includes';
import { BankAccountRepository } from 'src/repository';
import { CONSTANTS, Helpers, mapper } from 'src/utils';
import { In } from 'typeorm';

@Injectable()
export class BankAccountService extends BaseService {
    /** Constructor */
    constructor(private readonly _bankAccountRepo: BankAccountRepository) {
        super();
    }

    public async getList(params: BankAccountSearchQuery, userId: number) {
        const query = this._bankAccountRepo
            .createQueryBuilder('bank_account')
            .select('bank_account.*')
            .addSelect('bank.brand_name as bank_brand_name')
            .addSelect('bank.name as bank_name')
            .addSelect('last_message.balance as last_message_balance')
            .addSelect('last_message.sign as last_message_sign')
            .leftJoin('m_banks', 'bank', 'bank.id = bank_account.bank_id')
            .leftJoin('d_messages', 'last_message', 'last_message.id = bank_account.last_message_id')
            .where('bank_account.is_deleted = 0')
            .andWhere('bank_account.user_id = :user_id', { user_id: userId })
            .orderBy('bank_account.id', 'DESC');

        if (Helpers.isString(params.keyword)) {
            query.andWhere(
                `(
                bank_account.name LIKE :keyword OR
                bank_account.branch_name LIKE :keyword OR
                bank_account.card_owner LIKE :keyword OR
                bank_account.account_number LIKE :keyword OR
                bank_account.phone LIKE :keyword OR
                bank.brand_name LIKE :keyword
            )`,
                { keyword: `%${params.keyword}%` },
            );
        }

        if (Helpers.isObjectValue(Number(params.status), CONSTANTS.BANK_ACCOUNT_STATUSES)) {
            query.andWhere('bank_account.status = :status', { status: Number(params.status) });
        }

        if (Number(params?.page) > 0) {
            const page = Number(params?.page);
            const offset = (page - 1) * CONSTANTS.PAGE_SIZE;
            query.offset(offset).limit(CONSTANTS.PAGE_SIZE);
        }

        query.groupBy('bank_account.id');

        const list = await query.getRawMany<BankAccountListDTO>();
        return Helpers.isFilledArray(list) ? list : [];
    }

    public async getTotal(params: BankAccountSearchQuery, userId: number) {
        const query = this._bankAccountRepo
            .createQueryBuilder('bank_account')
            .leftJoin('m_banks', 'bank', 'bank.id = bank_account.bank_id')
            .where('bank_account.is_deleted = 0')
            .andWhere('bank_account.user_id = :user_id', { user_id: userId });

        if (Helpers.isString(params.keyword)) {
            query.andWhere(
                `(
                    bank_account.name LIKE :keyword OR
                    bank_account.branch_name LIKE :keyword OR
                    bank_account.card_owner LIKE :keyword OR
                    bank_account.account_number LIKE :keyword OR
                    bank_account.phone LIKE :keyword OR
                    bank.brand_name LIKE :keyword
                )`,
                { keyword: `%${params.keyword}%` },
            );
        }

        if (Helpers.isObjectValue(Number(params.status), CONSTANTS.BANK_ACCOUNT_STATUSES)) {
            query.andWhere('bank_account.status = :status', { status: Number(params.status) });
        }

        return query.groupBy('bank_account.id').getCount();
    }

    public async getDetail(id: number) {
        if (!(id > 0)) return null;

        const query = this._bankAccountRepo
            .createQueryBuilder('bank_account')
            .select('bank_account.*')
            .addSelect('bank.brand_name as bank_brand_name')
            .addSelect('bank.name as bank_name')
            .addSelect('last_message.balance as last_message_balance')
            .addSelect('last_message.sign as last_message_sign')
            .leftJoin('m_banks', 'bank', 'bank.id = bank_account.bank_id')
            .leftJoin('d_messages', 'last_message', 'last_message.id = bank_account.last_message_id')
            .where('bank_account.is_deleted = 0')
            .andWhere('bank_account.id = :id', { id });

        const item = await query.getRawOne<BankAccountDetailDTO>();
        return item ?? null;
    }

    public async getById(id: number) {
        if (!(id > 0)) return null;

        const item = await this._bankAccountRepo.findOneBy({ id });
        if (!item) return null;

        return mapper.map(item, BankAccountEntity, BankAccountDTO);
    }

    public async create(data: BankAccountDTO) {
        if (Helpers.isEmptyObject(data)) return null;

        const entity = mapper.map(data, BankAccountDTO, BankAccountEntity);

        await this._bankAccountRepo.save(entity);

        return mapper.map(entity, BankAccountEntity, BankAccountDTO);
    }

    public async update(data: BankAccountDTO) {
        if (Helpers.isEmptyObject(data) || !data.id) return null;

        const old = await this._bankAccountRepo.findOneBy({ id: data.id });
        if (!old) return null;

        old.bank_id = data.bank_id;
        old.user_id = data.user_id;
        old.phone = data.phone;
        old.branch_name = data.branch_name;
        old.card_owner = data.card_owner;
        old.account_number = data.account_number;
        old.name = data.name;
        old.status = data.status;

        await this._bankAccountRepo.save(old);

        return mapper.map(old, BankAccountEntity, BankAccountDTO);
    }

    public async delete(id: number) {
        if (!(id > 0)) return null;

        const item = await this._bankAccountRepo.findOneBy({ id });
        if (!item) return null;

        const entity = mapper.map(item, BankAccountEntity, BankAccountDTO);
        entity.is_deleted = 1;

        await this._bankAccountRepo.save(entity);

        return entity;
    }

    public async deleteMultiple(idList: number[]) {
        if (!Helpers.isFilledArray(idList)) return [];

        const itemList = await this._bankAccountRepo.findBy({ id: In(idList) });
        if (!Helpers.isFilledArray(idList)) return [];

        itemList.forEach((item) => (item.is_deleted = 1));

        await this._bankAccountRepo.save(itemList);

        return itemList.map((item) => mapper.map(item, BankAccountEntity, BankAccountDTO));
    }

    public async getByAccountNumberAndBankId(accountNumber: string, bankId: number) {
        const query = this._bankAccountRepo
            .createQueryBuilder('bank_account')
            .select('bank_account.*')
            .where('bank_account.is_deleted = 0')
            .where('bank_account.bank_id = :bank_id', { bank_id: bankId })
            .andWhere('bank_account.account_number LIKE :account_number', { account_number: `%${accountNumber}` });

        const item = await query.getRawOne<BankAccountDTO>();
        return item ?? null;
    }
}
