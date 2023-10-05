import { Injectable } from '@nestjs/common';
import { SettingEntity } from 'src/entities';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class SettingRepository extends Repository<SettingEntity> {
    /** Constructor */
    constructor(private readonly _dataSource: DataSource) {
        super(SettingEntity, _dataSource.createEntityManager());
    }
}
