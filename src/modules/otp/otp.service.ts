import { Injectable } from '@nestjs/common';
import { OtpDTO } from 'src/dtos';
import { OtpEntity } from 'src/entities';
import { BaseService } from 'src/includes';
import { OtpRepository } from 'src/repository';
import { Helpers, mapper } from 'src/utils';

@Injectable()
export class OtpService extends BaseService {
    /** Constructor */
    constructor(private readonly _otpRepo: OtpRepository) {
        super();
    }

    public async create(otp: OtpDTO) {
        if (Helpers.isEmptyObject(otp)) return null;

        const item = mapper.map(otp, OtpDTO, OtpEntity);

        await this._otpRepo.save(item);

        return mapper.map(item, OtpEntity, OtpDTO);
    }

    public async getById(id: number) {
        if (!id) return null;

        const item = await this._otpRepo.findOneBy({ id });
        if (!item) return null;

        return mapper.map(item, OtpEntity, OtpDTO);
    }

    public async setUsed(id: number) {
        if (!id) return null;

        const item = await this._otpRepo.findOneBy({ id });
        if (!item) return null;

        item.is_used = 1;
        await this._otpRepo.save(item);

        return mapper.map(item, OtpEntity, OtpDTO);
    }
}
