import { Injectable } from '@nestjs/common';
import { MessageDTO } from 'src/dtos';
import { MessageEntity } from 'src/entities';
import { BaseService } from 'src/includes';
import { MessageRepository } from 'src/repository';
import { Helpers, mapper } from 'src/utils';

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
}
