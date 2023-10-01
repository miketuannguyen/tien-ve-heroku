import { AutoMap } from '@automapper/classes';
import { CONSTANTS } from 'src/utils';
import { CommonSearchQuery, ValueOf } from 'src/utils/types';

export class BankAccountDTO {
    @AutoMap() id: number;
    @AutoMap() bank_id: number;
    @AutoMap() user_id: number;
    @AutoMap() phone: string;
    @AutoMap() branch_name: string;
    @AutoMap() card_owner: string;
    @AutoMap() account_number: string;
    @AutoMap() name: string;
    @AutoMap() status: ValueOf<typeof CONSTANTS.BANK_ACCOUNT_STATUSES>;
    @AutoMap() last_message_id: number;
    @AutoMap() is_deleted: 0 | 1;
    @AutoMap() created_date: string;
    @AutoMap() updated_date: string;
}

export class BankAccountListDTO extends BankAccountDTO {
    bank_brand_name?: string;
    bank_name?: string;
    last_message_balance?: number;
    last_message_sign?: -1 | 1;
}

export class BankAccountDetailDTO extends BankAccountDTO {
    bank_brand_name?: string;
    bank_name?: string;
    last_message_balance?: number;
    last_message_sign?: -1 | 1;
}

export class SaveBankAccountDTO {
    id?: number;
    bank_id: number;
    phone: string;
    branch_name: string;
    card_owner: string;
    account_number: string;
    name?: string;
    status?: ValueOf<typeof CONSTANTS.BANK_ACCOUNT_STATUSES>;
}

export type BankAccountSearchQuery = CommonSearchQuery & {
    status?: ValueOf<typeof CONSTANTS.BANK_ACCOUNT_STATUSES>;
};
