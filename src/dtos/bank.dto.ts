import { AutoMap } from '@automapper/classes';

export class BankDTO {
    @AutoMap() id: number;
    @AutoMap() brand_name: string;
    @AutoMap() name: string;
    @AutoMap() is_deleted: 0 | 1;
    @AutoMap() created_date: string;
    @AutoMap() updated_date: string;
}
