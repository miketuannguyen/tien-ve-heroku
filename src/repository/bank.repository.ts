import { Injectable } from '@nestjs/common';
import { BankEntity } from 'src/entities';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class BankRepository extends Repository<BankEntity> {
    /** Constructor */
    constructor(private readonly _dataSource: DataSource) {
        super(BankEntity, _dataSource.createEntityManager());
    }
}
