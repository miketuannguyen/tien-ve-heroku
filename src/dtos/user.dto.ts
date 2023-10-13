/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { AutoMap } from '@automapper/classes';
import { Helpers } from '../utils';

export class UserDTO {
    @AutoMap() id: number;
    @AutoMap() email: string;
    @AutoMap() phone: string;
    @AutoMap() name: string;
    @AutoMap() password: string;
    @AutoMap() remind_count: number;
    @AutoMap() max_remind_count: number;
    @AutoMap() is_active: 0 | 1;
    @AutoMap() created_date: string;
    @AutoMap() updated_date: string;

    /**
     * Check if a variable is a `UserDTO` instance or not
     * @param data - any variable
     * @returns `data` is a `UserDTO` instance or not
     */
    public static is(data: any): data is UserDTO & {
        [key: string]: any;
    } {
        return (
            data !== null &&
            typeof data === 'object' &&
            !!data?.id &&
            (Number(data?.is_active) === 1 || Number(data?.is_active) === 0) &&
            Helpers.isString(data?.created_date) &&
            Helpers.isString(data?.updated_date)
        );
    }
}

export class LoginUserDTO extends UserDTO {
    public access_token: string;
}

export class SaveAccountDTO {
    email: string;
    phone: string;
    name: string;
    password: string;
}

export class RenewPasswordDTO {
    password: string;
}

export class ValidateForgotPasswordOtpDTO {
    id: number;
    otp: string;
    email_phone: string;
}
