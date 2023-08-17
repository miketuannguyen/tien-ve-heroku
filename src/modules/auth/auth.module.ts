import { Module } from '@nestjs/common';
import { RepositoryModule } from 'src/repository/repository.module';
import { EntityModule } from './../../entities/entity.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
    imports: [EntityModule, RepositoryModule],
    controllers: [AuthController],
    providers: [AuthService],
    exports: [AuthService],
})
export class AuthModule {}
