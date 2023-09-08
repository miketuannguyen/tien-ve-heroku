import { AutoMap } from '@automapper/classes';
import { BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('m_users')
export class UserEntity extends BaseEntity {
    @PrimaryGeneratedColumn('increment', { type: 'bigint' })
    @AutoMap()
        id: number;

    @Column({ type: 'varchar', length: 255, nullable: true })
    @AutoMap()
        email: string;

    @Column({ type: 'varchar', length: BaseEntity.PHONE_ML, nullable: true })
    @AutoMap()
        phone: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    @AutoMap()
        name: string;

    @Column({ type: 'varchar', length: 255 })
    @AutoMap()
        password: string;

    @Column({ type: 'tinyint', default: 1 })
    @AutoMap()
        is_active: 0 | 1;

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
