import { createMap } from '@automapper/core';

import { BankAccountEntity, BankEntity, DebtEntity, MessageEntity, OtpEntity, UserEntity } from 'src/entities';
import { mapper } from 'src/utils/mapper';

import { SettingEntity } from 'src/entities/setting.entity';
import { BankAccountDTO } from './bank-account.dto';
import { BankDTO } from './bank.dto';
import { DebtDTO } from './debt.dto';
import { MessageDTO } from './message.dto';
import { OtpDTO } from './otp.dto';
import { SettingDTO } from './setting.dto';
import { UserDTO } from './user.dto';

export * from './bank-account.dto';
export * from './bank.dto';
export * from './debt.dto';
export * from './message.dto';
export * from './otp.dto';
export * from './setting.dto';
export * from './user.dto';

/**
 * Initialize mapper
 */
export const initMapper = () => {
    createMap(mapper, UserEntity, UserDTO);
    createMap(mapper, UserDTO, UserEntity);

    createMap(mapper, MessageEntity, MessageDTO);
    createMap(mapper, MessageDTO, MessageEntity);

    createMap(mapper, OtpEntity, OtpDTO);
    createMap(mapper, OtpDTO, OtpEntity);

    createMap(mapper, BankAccountEntity, BankAccountDTO);
    createMap(mapper, BankAccountDTO, BankAccountEntity);

    createMap(mapper, BankEntity, BankDTO);
    createMap(mapper, BankDTO, BankEntity);

    createMap(mapper, DebtEntity, DebtDTO);
    createMap(mapper, DebtDTO, DebtEntity);

    createMap(mapper, SettingEntity, SettingDTO);
    createMap(mapper, SettingDTO, SettingEntity);
};
