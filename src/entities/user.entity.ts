import { AutoMap } from '@automapper/classes';
import { BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity('m_users')
export class UserEntity {
    @PrimaryColumn({ type: 'varchar', length: 20 })
    @AutoMap()
        username: string;

    @Column({ type: 'varchar', length: 64 })
    @AutoMap()
        password: string;

    @Column({ type: 'varchar', length: 255 })
    @AutoMap()
        name: string;

    @Column({ type: 'tinyint', default: 1 })
    @AutoMap()
        is_active: 0 | 1;

    @Column({ type: 'tinyint', default: 0 })
    @AutoMap()
        role: 0 | 1;

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
