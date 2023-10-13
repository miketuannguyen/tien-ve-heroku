import { AutoMap } from '@automapper/classes';
import { BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('d_debts')
export class DebtEntity extends BaseEntity {
    @PrimaryColumn({ type: 'varchar', length: 25 }) // 25 cho dư dả
    @AutoMap()
        id: string;

    @Column({ type: 'bigint' })
    @AutoMap()
        user_id: number;

    @Column({ type: 'bigint' })
    @AutoMap()
        bank_account_id: number;

    @Column({ type: 'varchar', length: 255 })
    @AutoMap()
        payer_name: string;

    @Column({ type: 'varchar', length: BaseEntity.PHONE_ML })
    @AutoMap()
        payer_phone: string;

    @Column({ type: 'decimal', precision: 15, scale: 3 })
    @AutoMap()
        amount: number;

    @Column({ type: 'int', default: 0 })
    @AutoMap()
        remind_count: number;

    @Column({ type: 'varchar', length: 255 })
    @AutoMap()
        note: string;

    @Column({ type: 'tinyint', default: 0 })
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
