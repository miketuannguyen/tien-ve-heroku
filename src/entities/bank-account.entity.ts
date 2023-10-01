import { AutoMap } from '@automapper/classes';
import { BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { CONSTANTS } from 'src/utils';
import { ValueOf } from 'src/utils/types';

@Entity('d_bank_accounts')
export class BankAccountEntity extends BaseEntity {
    @PrimaryGeneratedColumn('increment', { type: 'bigint' })
    @AutoMap()
        id: number;

    @Column({ type: 'bigint' })
    @AutoMap()
        bank_id: number;

    @Column({ type: 'bigint' })
    @AutoMap()
        user_id: number;

    @Column({ type: 'varchar', length: BaseEntity.PHONE_ML })
    @AutoMap()
        phone: string;

    @Column({ type: 'varchar', length: 255 })
    @AutoMap()
        branch_name: string;

    @Column({ type: 'varchar', length: 255 })
    @AutoMap()
        card_owner: string;

    @Column({ type: 'varchar', length: 20 })
    @AutoMap()
        account_number: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    @AutoMap()
        name: string;

    @Column({ type: 'tinyint', default: CONSTANTS.BANK_ACCOUNT_STATUSES.NOT_ACTIVATED })
    @AutoMap()
        status: ValueOf<typeof CONSTANTS.BANK_ACCOUNT_STATUSES>;

    @Column({ type: 'bigint' })
    @AutoMap()
        last_message_id: number;

    @Column({ type: 'tinyint', default: 1 })
    @AutoMap()
        is_deleted: 0 | 1;

    @CreateDateColumn({ type: 'datetime' })
    @AutoMap()
        created_date: string;

    @UpdateDateColumn({ type: 'datetime' })
    @AutoMap()
        updated_date: string;

    @BeforeInsert()
    beforeInsert() {
        this.created_date = new Date().toISOString();
        this.updated_date = new Date().toISOString();
    }

    @BeforeUpdate()
    beforeUpdate() {
        this.updated_date = new Date().toISOString();
    }
}
