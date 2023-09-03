import { AutoMap } from '@automapper/classes';

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
