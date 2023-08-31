import { Injectable } from '@nestjs/common';
import { BankAccountDTO } from 'src/dtos';
import { BankAccountEntity } from 'src/entities';
import { BaseService } from 'src/includes';
import { BankAccountRepository } from 'src/repository';
import { CONSTANTS, Helpers, mapper } from 'src/utils';
import { CommonSearchQuery } from 'src/utils/types';

@Injectable()
export class BankAccountService extends BaseService {
    /** Constructor */
    constructor(private readonly _bankAccountRepo: BankAccountRepository) {
        super();
    }

    public async getList(params: CommonSearchQuery) {
        const query = this._bankAccountRepo
            .createQueryBuilder('bank_account')
            .select('bank_account.*')
            .addSelect('bank.brand_name as bank_brand_name')
            .addSelect('bank.name as bank_name')
            .leftJoin('m_banks', 'bank', 'bank.id = bank_account.bank_id')
            .where('bank_account.is_deleted = 0')
            .orderBy('bank_account.id', 'DESC');

        if (Number(params?.page) > 0) {
            const page = Number(params?.page);
            const offset = (page - 1) * CONSTANTS.PAGE_SIZE;
            query.offset(offset).limit(CONSTANTS.PAGE_SIZE);
        }

        const list = await query.getRawMany<BankAccountDTO>();
        return Helpers.isFilledArray(list) ? list : [];
    }

    public async getTotal() {
        const query = this._bankAccountRepo.createQueryBuilder('bank_account').where('bank_account.is_deleted = 0');

        return query.getCount();
    }

    public async getDetail(id: number): Promise<BankAccountDTO | null> {
        if (!(id > 0)) return null;

        const item = await this._bankAccountRepo.findOneBy({ id });
        if (!item) return null;

        return mapper.map(item, BankAccountEntity, BankAccountDTO);
    }

    public async getById(id: number): Promise<BankAccountDTO | null> {
        if (!(id > 0)) return null;

        const item = await this._bankAccountRepo.findOneBy({ id });
        if (!item) return null;

        return mapper.map(item, BankAccountEntity, BankAccountDTO);
    }

    public async create(data: BankAccountDTO): Promise<BankAccountDTO | null> {
        if (Helpers.isEmptyObject(data)) return null;

        const entity = mapper.map(data, BankAccountDTO, BankAccountEntity);

        await this._bankAccountRepo.save(entity);

        return mapper.map(entity, BankAccountEntity, BankAccountDTO);
    }

    public async update(data: BankAccountDTO): Promise<BankAccountDTO | null> {
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

        await this._bankAccountRepo.save(old);

        return mapper.map(old, BankAccountEntity, BankAccountDTO);
    }

    public async delete(id: number): Promise<BankAccountDTO | null> {
        if (!(id > 0)) return null;

        const item = await this._bankAccountRepo.findOneBy({ id });
        if (!item) return null;

        const entity = mapper.map(item, BankAccountEntity, BankAccountDTO);
        entity.is_deleted = 1;

        await this._bankAccountRepo.save(entity);

        return entity;
    }
}
