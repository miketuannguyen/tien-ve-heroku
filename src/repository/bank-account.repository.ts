import { Injectable } from '@nestjs/common';
import { BankAccountEntity } from 'src/entities';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class BankAccountRepository extends Repository<BankAccountEntity> {
    /** Constructor */
    constructor(private readonly _dataSource: DataSource) {
        super(BankAccountEntity, _dataSource.createEntityManager());
    }
}
