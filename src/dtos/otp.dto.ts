import { AutoMap } from '@automapper/classes';
import { CONSTANTS } from 'src/utils';
import { ValueOf } from 'src/utils/types';

export class OtpDTO {
    @AutoMap() id: number;
    @AutoMap() otp: string;
    @AutoMap() receive_address: string;
    @AutoMap() type: number;
    @AutoMap() expired_date: string;
    @AutoMap() is_used: 0 | 1;
    @AutoMap() created_date: string;
    @AutoMap() updated_date: string;
}

export class CreateOtpDTO {
    receive_address: string;
    type: ValueOf<typeof CONSTANTS.LOGIN_TYPES>;
}

export class LoginOtpDTP {
    id: number;
    otp: string;
    email_phone: string;
    type: ValueOf<typeof CONSTANTS.LOGIN_TYPES>;
}
