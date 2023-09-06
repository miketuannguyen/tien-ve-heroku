import { Injectable } from '@nestjs/common';
import { MessageDTO, MessageSearchQuery } from 'src/dtos';
import { MessageEntity } from 'src/entities';
import { BaseService } from 'src/includes';
import { MessageRepository } from 'src/repository';
import { CONSTANTS, Helpers, mapper } from 'src/utils';

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

    public async getList(params: MessageSearchQuery): Promise<MessageDTO[]> {
        const query = this._messageRepo
            .createQueryBuilder('message')
            .select('message.*')
            .addSelect('DATE_FORMAT(message.send_date, \'%d/%m/%Y %H:%i:%s\') as send_date')
            .where('message.is_deleted = 0')
            .groupBy('message.id')
            .orderBy('message.send_date', 'DESC');

        if (Helpers.isString(params.debt_id)) {
            query.andWhere('message.debt_id = :debt_id', { debt_id: params.debt_id });
        }

        if (params.receive_user_id) {
            query.innerJoin('d_bank_accounts', 'bank_account', 'bank_account.phone = message.phone AND bank_account.user_id = :user_id', {
                user_id: params.receive_user_id,
            });
        }

        if (Number(params?.page) > 0) {
            const page = Number(params?.page);
            const offset = (page - 1) * CONSTANTS.PAGE_SIZE;
            query.offset(offset).limit(CONSTANTS.PAGE_SIZE);
        }

        const result = await query.getRawMany<MessageDTO>();
        return Helpers.isFilledArray(result) ? result : [];
    }

    public async getTotal(params: MessageSearchQuery) {
        const query = this._messageRepo.createQueryBuilder('message').where('message.is_deleted = 0').groupBy('message.id');

        if (Helpers.isString(params.debt_id)) {
            query.andWhere('message.debt_id = :debt_id', { debt_id: params.debt_id });
        }

        if (params.receive_user_id) {
            query.innerJoin('d_bank_accounts', 'bank_account', 'bank_account.phone = message.phone AND bank_account.user_id = :user_id', {
                user_id: params.receive_user_id,
            });
        }

        return query.getCount();
    }

    public async updateDebtId(id: number, debtId?: string) {
        if (!id) return null;

        const item = await this._messageRepo.findOneBy({ id });
        if (!item) return null;

        item.debt_id = Helpers.isString(debtId) ? debtId : null;

        await this._messageRepo.save(item);

        return mapper.map(item, MessageEntity, MessageDTO);
    }
}
