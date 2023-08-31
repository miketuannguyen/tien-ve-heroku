import { AutoMap } from '@automapper/classes';
import { BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('m_banks')
export class BankEntity {
    @PrimaryGeneratedColumn('increment', { type: 'bigint' })
    @AutoMap()
        id: number;

    @Column({ type: 'varchar', length: 100 })
    @AutoMap()
        brand_name: string;

    @Column({ type: 'varchar', length: 255 })
    @AutoMap()
        name: string;

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
