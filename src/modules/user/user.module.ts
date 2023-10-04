import { Module } from '@nestjs/common';
import { DebtRepository, UserRepository } from 'src/repository';
import { DebtService } from '../debt/debt.service';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
    controllers: [UserController],
    providers: [UserService, UserRepository, DebtService, DebtRepository],
})
export class UserModule {}
