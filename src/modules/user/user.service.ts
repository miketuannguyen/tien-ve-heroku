import { Injectable } from '@nestjs/common';
import { UserDTO } from 'src/dtos';
import { UserEntity } from 'src/entities';
import { BaseService } from 'src/includes';
import { UserRepository } from 'src/repository';
import { Helpers, mapper } from 'src/utils';

@Injectable()
export class UserService extends BaseService {
    /** Constructor */
    constructor(private readonly _userRepo: UserRepository) {
        super();
    }

    public async getById(id: number) {
        if (!id) return null;

        const user = await this._userRepo.findOneBy({ id });
        if (Helpers.isEmptyObject(user)) return null;

        return mapper.map(user, UserEntity, UserDTO);
    }

    public async getByEmailPhone(emailPhone: string) {
        if (!Helpers.isString(emailPhone)) return null;

        let user = await this._userRepo.findOneBy({ email: emailPhone });
        if (Helpers.isEmptyObject(user)) {
            user = await this._userRepo.findOneBy({ phone: emailPhone });
            if (Helpers.isEmptyObject(user)) {
                return null;
            }
        }

        return mapper.map(user, UserEntity, UserDTO);
    }

    public async getByEmail(email: string) {
        if (!Helpers.isString(email)) return null;

        const user = await this._userRepo.findOneBy({ email });
        if (Helpers.isEmptyObject(user)) return null;

        return mapper.map(user, UserEntity, UserDTO);
    }

    public async getByPhone(phone: string) {
        if (!Helpers.isString(phone)) return null;

        const user = await this._userRepo.findOneBy({ phone });
        if (Helpers.isEmptyObject(user)) return null;

        return mapper.map(user, UserEntity, UserDTO);
    }

    public async save(data: UserDTO) {
        if (Helpers.isEmptyObject(data)) return null;

        const user = mapper.map(data, UserDTO, UserEntity);

        await this._userRepo.save(user);

        return mapper.map(data, UserEntity, UserDTO);
    }
}
