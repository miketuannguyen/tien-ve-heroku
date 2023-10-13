import { Injectable } from '@nestjs/common';
import { MessageDTO, MessageSearchQuery } from 'src/dtos';
import { MessageEntity } from 'src/entities';
import { BaseService } from 'src/includes';
import { BankAccountRepository, MessageRepository } from 'src/repository';
import { CONSTANTS, Helpers, mapper } from 'src/utils';
import { DataSource } from 'typeorm';

@Injectable()
export class MessageService extends BaseService {
    /** Constructor */
    constructor(
        private readonly _messageRepo: MessageRepository,
        private readonly _bankAccountRepo: BankAccountRepository,
        private readonly _dataSource: DataSource,
    ) {
        super();
    }

    public async create(message: MessageDTO): Promise<MessageDTO | null> {
        if (Helpers.isEmptyObject(message)) return null;

        const queryRunner = this._dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const messageEntity = new MessageEntity();
            messageEntity.address = message.address;
            messageEntity.phone = message.phone;
            messageEntity.body = message.body;
            messageEntity.send_date = message.send_date;
            messageEntity.receive_date = message.receive_date;
            messageEntity.amount = message.amount;
            messageEntity.balance = message.balance;
            messageEntity.sign = message.sign;
            messageEntity.bank_account_id = message.bank_account_id;
            messageEntity.debt_id = message.debt_id ?? null;

            await this._messageRepo.save(messageEntity);

            if (message.bank_account_id) {
                const bankAccEntity = await this._bankAccountRepo.findOneBy({ id: message.bank_account_id });
                if (!bankAccEntity) {
                    await queryRunner.rollbackTransaction();
                    return null;
                }

                bankAccEntity.last_message_id = messageEntity.id;
                if (bankAccEntity.status === CONSTANTS.BANK_ACCOUNT_STATUSES.NOT_ACTIVATED) {
                    bankAccEntity.status = CONSTANTS.BANK_ACCOUNT_STATUSES.ACTIVATED;
                }

                await this._bankAccountRepo.save(bankAccEntity);
            }

            await queryRunner.commitTransaction();

            return mapper.map(messageEntity, MessageEntity, MessageDTO);
        } catch (error) {
            await queryRunner.rollbackTransaction();
            return null;
        } finally {
            await queryRunner.release();
        }
    }

    public async getList(params: MessageSearchQuery): Promise<MessageDTO[]> {
        const query = this._messageRepo
            .createQueryBuilder('message')
            .select('message.*')
            .addSelect('DATE_FORMAT(message.send_date, \'%d/%m/%Y %H:%i:%s\') as send_date')
            .addSelect('DATE_FORMAT(message.created_date, \'%d/%m/%Y %H:%i:%s\') as created_date')
            .where('message.is_deleted = 0')
            .groupBy('message.id')
            .orderBy('message.send_date', 'DESC');

        if (Helpers.isString(params.debt_id)) {
            query.andWhere('message.debt_id = :debt_id', { debt_id: params.debt_id });
        }

        if (Helpers.isString(params.keyword)) {
            query.andWhere(
                `(
                message.address LIKE :keyword OR
                message.phone LIKE :keyword OR
                message.body LIKE :keyword
            )`,
                { keyword: `%${params.keyword}%` },
            );
        }

        if (Helpers.isString(params.start_date)) {
            query.andWhere('message.created_date >= :start_date', { start_date: `${params.start_date} 00:00:00` });
        }

        if (Helpers.isString(params.end_date)) {
            query.andWhere('message.created_date <= :end_date', { end_date: `${params.end_date} 23:59:59` });
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
