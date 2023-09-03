import { Injectable } from '@nestjs/common';
import { DebtEntity } from 'src/entities';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class DebtRepository extends Repository<DebtEntity> {
    /** Constructor */
    constructor(private readonly _dataSource: DataSource) {
        super(DebtEntity, _dataSource.createEntityManager());
    }
}
