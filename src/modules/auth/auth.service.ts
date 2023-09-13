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

    /**
     * Login user
     * @param emailPhone - `m_users.emailPhone`
     * @param password - `m_users.password`
     * @returns user entity
     */
    public async login(emailPhone: string, password: string): Promise<(UserDTO & { access_token: string }) | null> {
        const secret = process.env.ACCESS_TOKEN_SECRET;
        if (!Helpers.isString(secret)) return null;

        const user = await this._userRepo
            .createQueryBuilder('user')
            .where('user.email = :email', { email: emailPhone })
            .orWhere('user.phone = :phone', { phone: emailPhone })
            .getOne();
        if (Helpers.isEmptyObject(user)) return null;
        if (user?.password !== password) return null;

        const userDTO = mapper.map(user, UserEntity, UserDTO);

        // jwt need userDTO to be plain object
        const expiredTime = Number(this._configService.get('ACCESS_TOKEN_EXPIRED_TIME')) || 0;
        const accessToken = jwt.sign({ ...userDTO }, secret, { expiresIn: expiredTime });

        return { ...userDTO, access_token: accessToken };
    }

    public async changePassword(id: number, oldPassword: string, newPassword: string) {
        if (!id || !Helpers.isString(oldPassword) || !Helpers.isString(newPassword)) return false;

        const user = await this._userRepo.findOneBy({ id });
        if (!user || Helpers.isEmptyObject(user)) return false;

        if (user.password !== oldPassword) return false;

        user.password = newPassword;
        await this._userRepo.save(user);

        return true;
    }

    public async loginNoPassword(
        emailPhone: string,
        type: ValueOf<typeof CONSTANTS.REGISTER_TYPES>,
        isLongToken: boolean,
    ): Promise<LoginUserDTO | null> {
        const secret = process.env.ACCESS_TOKEN_SECRET;
        if (!Helpers.isString(secret)) return null;

        const userEntity =
            type === CONSTANTS.REGISTER_TYPES.EMAIL
                ? await this._userRepo.findOneBy({ email: emailPhone })
                : await this._userRepo.findOneBy({ phone: emailPhone });
        if (Helpers.isEmptyObject(userEntity)) return null;

        const userDTO = mapper.map(userEntity, UserEntity, UserDTO);

        // jwt need userDTO to be plain object
        const configKey = isLongToken ? 'LONG_ACCESS_TOKEN_EXPIRED_TIME' : 'ACCESS_TOKEN_EXPIRED_TIME';
        const expiredTime = Number(this._configService.get(configKey)) || 0;
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

    public async createForgotPasswordAccessToken(emailPhone: string) {
        const secret = process.env.ACCESS_TOKEN_SECRET;
        if (!Helpers.isString(secret)) return '';

        const user = await this._userRepo
            .createQueryBuilder('user')
            .where('user.email = :email', { email: emailPhone })
            .orWhere('user.phone = :phone', { phone: emailPhone })
            .getOne();
        if (Helpers.isEmptyObject(user)) return '';

        const userDTO = mapper.map(user, UserEntity, UserDTO);

        // jwt need userDTO to be plain object
        const expiredTime = Number(this._configService.get('FORGOT_PASSWORD_ACCESS_TOKEN_EXPIRED_TIME')) || 0;
        const accessToken = jwt.sign({ ...userDTO }, secret, { expiresIn: expiredTime });

        return accessToken;
    }

    public async renewPassword(id: number, newPassword: string) {
        if (!id || !Helpers.isString(newPassword)) return false;

        const user = await this._userRepo.findOneBy({ id });
        if (!user || Helpers.isEmptyObject(user)) return false;

        user.password = newPassword;
        await this._userRepo.save(user);

        return true;
    }
}
