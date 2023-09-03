import { AutoMap } from '@automapper/classes';
import { CONSTANTS } from 'src/utils';
import { BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('d_otps')
export class OtpEntity extends BaseEntity {
    @PrimaryGeneratedColumn('increment', { type: 'bigint' })
    @AutoMap()
        id: number;

    @Column({ type: 'varchar', length: CONSTANTS.OTP.LENGTH })
    @AutoMap()
        otp: string;

    @Column({ type: 'varchar', length: 255 })
    @AutoMap()
        receive_address: string;

    @Column({ type: 'datetime' })
    @AutoMap()
        expired_date: string;

    @Column({ type: 'tinyint', default: 0 })
    @AutoMap()
        is_used: 0 | 1;

    @Column({ type: 'tinyint' })
    @AutoMap()
        type: number;

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
