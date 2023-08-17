import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { UserDTO } from 'src/dtos';
import { UserEntity } from 'src/entities';
import { BaseService } from 'src/includes';
import { UserRepository } from 'src/repository';
import { CONSTANTS, Helpers } from 'src/utils';
import { mapper } from 'src/utils/mapper';

@Injectable()
export class AuthService extends BaseService {
    /** Constructor */
    constructor(private readonly _userRepo: UserRepository) {
        super();
    }

    /**
     * Login user
     * @param username - `m_users.username`
     * @param password - `m_users.password`
     * @returns user entity
     */
    public async login(username: string, password: string): Promise<(UserDTO & { access_token: string }) | null> {
        const secret = process.env.ACCESS_TOKEN_SECRET;
        if (!Helpers.isString(secret)) return null;

        const user = await this._userRepo.findOneBy({ username });
        if (Helpers.isEmptyObject(user)) return null;
        if (user?.password !== password) return null;

        const userDTO = mapper.map(user, UserEntity, UserDTO);

        // jwt need userDTO to be plain object
        const accessToken = jwt.sign({ ...userDTO }, secret, { expiresIn: CONSTANTS.ACCESS_TOKEN_EXPIRED_TIME });

        return { ...userDTO, access_token: accessToken };
    }

    /**
     * Find user by username
     * @param username - `m_users.username`
     */
    public async findUserByUsername(username: string) {
        if (!Helpers.isString(username)) return null;

        const user = await this._userRepo.findOneBy({ username });
        if (Helpers.isEmptyObject(user)) return null;

        return mapper.map(user, UserEntity, UserDTO);
    }
}
