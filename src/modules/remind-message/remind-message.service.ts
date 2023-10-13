import { Injectable } from '@nestjs/common';
import { RemindMessageDTO } from 'src/dtos';
import { RemindMessageEntity } from 'src/entities';
import { BaseService } from 'src/includes';
import { DebtRepository, RemindMessageRepository, UserRepository } from 'src/repository';
import { Helpers, mapper } from 'src/utils';
import { DataSource, In } from 'typeorm';

@Injectable()
export class RemindMessageService extends BaseService {
    /** Constructor */
    constructor(
        private readonly _remindMessageRepo: RemindMessageRepository,
        private readonly _userRepo: UserRepository,
        private readonly _debtRepo: DebtRepository,
        private readonly _dataSource: DataSource,
    ) {
        super();
    }

    public async sendMultiple(list: RemindMessageDTO[], userId: number) {
        if (!Helpers.isFilledArray(list) || !userId) return [];

        const msgList = list.map((item) => mapper.map(item, RemindMessageDTO, RemindMessageEntity));
        if (!Helpers.isFilledArray(msgList)) return [];

        const debtIdList = msgList.map((msg) => msg.debt_id);
        const debtList = await this._debtRepo.findBy({ id: In(debtIdList) });
        if (!Helpers.isFilledArray(debtList) || debtList.length !== debtIdList.length) return [];

        const user = await this._userRepo.findOneBy({ id: userId });
        if (!user || Helpers.isEmptyObject(user)) return [];

        const queryRunner = this._dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const result = await this._remindMessageRepo.save(msgList);

            user.remind_count += msgList.length;

            await this._userRepo.save(user);

            for (const debt of debtList) {
                debt.remind_count += 1;
            }

            await this._debtRepo.save(debtList);

            await queryRunner.commitTransaction();

            return result.map((item) => mapper.map(item, RemindMessageEntity, RemindMessageDTO));
        } catch (error) {
            await queryRunner.rollbackTransaction();
            return [];
        } finally {
            await queryRunner.release();
        }
    }
}
