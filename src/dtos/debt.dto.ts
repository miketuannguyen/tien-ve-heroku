import { AutoMap } from '@automapper/classes';
import { CommonSearchQuery } from 'src/utils/types';

export class DebtDTO {
    @AutoMap() id: string;
    @AutoMap() user_id: number;
    @AutoMap() bank_account_id: number;
    @AutoMap() payer_name: string;
    @AutoMap() payer_phone: string;
    @AutoMap() amount: number;
    @AutoMap() note: string;
    @AutoMap() is_deleted: 0 | 1;
    @AutoMap() created_date: string;
    @AutoMap() updated_date: string;
}

export class SaveDebtDTO {
    public bank_account_id = 0;
    public payer_name = '';
    public payer_phone = '';
    public amount = 0;
    public note = '';
}

export class DebtListDTO extends DebtDTO {
    public paid_amount?: number;
    public bank_account_number?: string;
    public bank_brand_name?: string;
}

export class DebtDetailDTO extends DebtDTO {
    public paid_amount?: number;
    public bank_account_bank_id?: number;
    public bank_account_user_id?: number;
    public bank_account_phone?: string;
    public bank_account_branch_name?: string;
    public bank_account_card_owner?: string;
    public bank_account_number?: string;
    public bank_account_name?: string;
    public bank_brand_name?: string;
}

export type DebtSearchQuery = CommonSearchQuery & {
    min_amount?: number;
    max_amount?: number;
    start_date?: string;
    end_date?: string;
    is_paid?: boolean;
    is_not_paid?: boolean;
};
