import { Injectable } from '@nestjs/common';
import { MessageEntity } from 'src/entities';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class MessageRepository extends Repository<MessageEntity> {
    /** Constructor */
    constructor(private readonly _dataSource: DataSource) {
        super(MessageEntity, _dataSource.createEntityManager());
    }
}
