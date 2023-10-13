import { AutoMap } from '@automapper/classes';
import { BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('d_remind_messages')
export class RemindMessageEntity extends BaseEntity {
    @PrimaryGeneratedColumn('increment', { type: 'bigint' })
    @AutoMap()
        id: number;

    @Column({ type: 'varchar', length: 255 })
    @AutoMap()
        receiver_name: string;

    @Column({ type: 'varchar', length: 20 })
    @AutoMap()
        phone: string;

    @Column({ type: 'text' })
    @AutoMap()
        body: string;

    @Column({ type: 'varchar', length: 25 })
    @AutoMap()
        debt_id: string;

    @Column({ type: 'tinyint' })
    @AutoMap()
        channel_type: number;

    @Column({ type: 'tinyint' })
    @AutoMap()
        status: number;

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
