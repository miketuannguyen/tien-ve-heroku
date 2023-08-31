import { createMap } from '@automapper/core';

import { BankAccountEntity, BankEntity, MessageEntity, OtpEntity, UserEntity } from 'src/entities';
import { mapper } from 'src/utils/mapper';

import { BankAccountDTO } from './bank-account.dto';
import { BankDTO } from './bank.dto';
import { MessageDTO } from './message.dto';
import { OtpDTO } from './otp.dto';
import { UserDTO } from './user.dto';

export * from './bank-account.dto';
export * from './bank.dto';
export * from './message.dto';
export * from './otp.dto';
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
};
