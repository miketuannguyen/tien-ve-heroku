import { createMap } from '@automapper/core';

import { UserEntity, MessageEntity } from 'src/entities';
import { mapper } from 'src/utils/mapper';

import { UserDTO, UserSaveDTO } from './user.dto';
import { MessageDTO } from './message.dto';

export * from './user.dto';
export * from './message.dto';

/**
 * Initialize mapper
 */
export const initMapper = () => {
    createMap(mapper, UserEntity, UserDTO);
    createMap(mapper, UserDTO, UserEntity);

    createMap(mapper, UserEntity, UserSaveDTO);
    createMap(mapper, UserSaveDTO, UserEntity);

    createMap(mapper, MessageEntity, MessageDTO);
    createMap(mapper, MessageDTO, MessageEntity);
};
