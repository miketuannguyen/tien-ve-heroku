import { Injectable } from '@nestjs/common';
import { MessageDTO } from 'src/dtos';
import { MessageEntity } from 'src/entities';
import { BaseService } from 'src/includes';
import { MessageRepository } from 'src/repository';
import { CONSTANTS, Helpers, mapper } from 'src/utils';
import { CommonSearchQuery } from 'src/utils/types';

@Injectable()
export class MessageService extends BaseService {
    /** Constructor */
    constructor(private readonly _messageRepo: MessageRepository) {
        super();
    }

    public async create(message: MessageDTO): Promise<MessageDTO | null> {
        if (Helpers.isEmptyObject(message)) return null;

        const messageEntity = mapper.map(message, MessageDTO, MessageEntity);

        await this._messageRepo.save(messageEntity);

        return mapper.map(messageEntity, MessageEntity, MessageDTO);
    }

    public async getList(params: CommonSearchQuery): Promise<MessageDTO[]> {
        const query = this._messageRepo
            .createQueryBuilder('message')
            .select('message.*')
            .addSelect('DATE_FORMAT(message.send_date, \'%d/%m/%Y %H:%i:%s\') as send_date')
            .where('message.is_deleted = 0')
            .orderBy('message.send_date', 'DESC');

        if (Number(params?.page) > 0) {
            const page = Number(params?.page);
            const offset = (page - 1) * CONSTANTS.PAGE_SIZE;
            query.offset(offset).limit(CONSTANTS.PAGE_SIZE);
        }

        const result = await query.getRawMany<MessageDTO>();
        return Helpers.isFilledArray(result) ? result : [];
    }

    public async getTotal() {
        const query = this._messageRepo.createQueryBuilder('message').where('message.is_deleted = 0');
        return query.getCount();
    }
}
