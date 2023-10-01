import { AutoMap } from '@automapper/classes';
import { BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('d_messages')
export class MessageEntity extends BaseEntity {
    @PrimaryGeneratedColumn('increment', { type: 'bigint' })
    @AutoMap()
        id: number;

    @Column({ type: 'varchar', length: 255 })
    @AutoMap()
        address: string;

    @Column({ type: 'varchar', length: 20 }) // Số điện thoại do app lấy được chưa được format
    @AutoMap()
        phone: string;

    @Column({ type: 'text' })
    @AutoMap()
        body: string;

    @Column({ type: 'datetime' })
    @AutoMap()
        send_date: string;

    @Column({ type: 'datetime' })
    @AutoMap()
        receive_date: string;

    @Column({ type: 'varchar', length: 25, nullable: true })
    @AutoMap()
        debt_id: string | null;

    @Column({ type: 'decimal', precision: 15, scale: 3 })
    @AutoMap()
        amount: number;

    @Column({ type: 'decimal', precision: 15, scale: 3 })
    @AutoMap()
        balance: number;

    @Column({ type: 'tinyint' })
    @AutoMap()
        sign: -1 | 1;

    @Column({ type: 'bigint' })
    @AutoMap()
        bank_account_id: number;

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
