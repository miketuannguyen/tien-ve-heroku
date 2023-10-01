import { Injectable } from '@nestjs/common';
import { BankDTO } from 'src/dtos';
import { BankEntity } from 'src/entities';
import { BaseService } from 'src/includes';
import { BankRepository } from 'src/repository';
import { Helpers, mapper } from 'src/utils';

@Injectable()
export class BankService extends BaseService {
    /** Constructor */
    constructor(private readonly _bankRepo: BankRepository) {
        super();
    }

    public async getList() {
        const query = this._bankRepo.createQueryBuilder('bank').where('bank.is_deleted = 0').orderBy('bank.brand_name', 'ASC');

        const list = await query.getMany();
        if (!Helpers.isFilledArray(list)) return [];

        return list.map((item) => mapper.map(item, BankEntity, BankDTO));
    }

    public async getByBrandName(brandName: string) {
        const query = this._bankRepo
            .createQueryBuilder('bank')
            .where('LOWER(bank.brand_name) = :brand_name', { brand_name: brandName })
            .andWhere('bank.is_deleted = 0');

        const item = await query.getOne();
        return item;
    }
}
