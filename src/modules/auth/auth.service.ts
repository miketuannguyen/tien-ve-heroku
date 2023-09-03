import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { LoginUserDTO, UserDTO } from 'src/dtos';
import { UserEntity } from 'src/entities';
import { BaseService } from 'src/includes';
import { UserRepository } from 'src/repository';
import { CONSTANTS, Helpers } from 'src/utils';
import { mapper } from 'src/utils/mapper';
import { ValueOf } from 'src/utils/types';

@Injectable()
export class AuthService extends BaseService {
    /** Constructor */
    constructor(private readonly _userRepo: UserRepository, private readonly _configService: ConfigService) {
        super();
    }

    public async login(emailPhone: string, type: ValueOf<typeof CONSTANTS.LOGIN_TYPES>): Promise<LoginUserDTO | null> {
        const secret = process.env.ACCESS_TOKEN_SECRET;
        if (!Helpers.isString(secret)) return null;

        const userEntity =
            type === CONSTANTS.LOGIN_TYPES.EMAIL
                ? await this._userRepo.findOneBy({ email: emailPhone })
                : await this._userRepo.findOneBy({ phone: emailPhone });
        if (Helpers.isEmptyObject(userEntity)) return null;

        const userDTO = mapper.map(userEntity, UserEntity, UserDTO);

        // jwt need userDTO to be plain object
        const expiredTime = Number(this._configService.get('ACCESS_TOKEN_EXPIRED_TIME')) || 0;
        const accessToken = jwt.sign({ ...userDTO }, secret, { expiresIn: expiredTime });

        const loginUserDTO = new LoginUserDTO();
        loginUserDTO.id = userDTO.id;
        loginUserDTO.email = userDTO.email;
        loginUserDTO.phone = userDTO.phone;
        loginUserDTO.name = userDTO.name;
        loginUserDTO.is_active = userDTO.is_active;
        loginUserDTO.created_date = userDTO.created_date;
        loginUserDTO.updated_date = userDTO.updated_date;
        loginUserDTO.access_token = accessToken;
        return loginUserDTO;
    }

    public async findUserById(id: number) {
        if (!Helpers.isString(id)) return null;

        const user = await this._userRepo.findOneBy({ id });
        if (Helpers.isEmptyObject(user)) return null;

        return mapper.map(user, UserEntity, UserDTO);
    }
}
