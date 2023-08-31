import { AutoMap } from '@automapper/classes';

export class BankAccountDTO {
    @AutoMap() id: number;
    @AutoMap() bank_id: number;
    @AutoMap() user_id: number;
    @AutoMap() phone: string;
    @AutoMap() branch_name: string;
    @AutoMap() card_owner: string;
    @AutoMap() account_number: string;
    @AutoMap() name: string;
    @AutoMap() is_deleted: 0 | 1;
    @AutoMap() created_date: string;
    @AutoMap() updated_date: string;

    bank_brand_name?: string;
    bank_name?: string;
}

export class SaveBankAccountDTO {
    id?: number;
    bank_id: number;
    phone: string;
    branch_name: string;
    card_owner: string;
    account_number: string;
    name?: string;
}
