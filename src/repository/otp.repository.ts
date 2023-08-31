import { Injectable } from '@nestjs/common';
import { OtpEntity } from 'src/entities';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class OtpRepository extends Repository<OtpEntity> {
    /** Constructor */
    constructor(private readonly _dataSource: DataSource) {
        super(OtpEntity, _dataSource.createEntityManager());
    }
}
