import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessageEntity, UserEntity } from './index';

@Module({
    imports: [TypeOrmModule.forFeature([UserEntity, MessageEntity])],
    exports: [TypeOrmModule],
})
export class EntityModule {}
