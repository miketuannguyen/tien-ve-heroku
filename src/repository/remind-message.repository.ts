import { Injectable } from '@nestjs/common';
import { RemindMessageEntity } from 'src/entities';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class RemindMessageRepository extends Repository<RemindMessageEntity> {
    /** Constructor */
    constructor(private readonly _dataSource: DataSource) {
        super(RemindMessageEntity, _dataSource.createEntityManager());
    }
}
