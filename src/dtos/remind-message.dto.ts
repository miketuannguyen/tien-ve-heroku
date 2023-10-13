import { AutoMap } from '@automapper/classes';

export class RemindMessageDTO {
    @AutoMap() id: number;
    @AutoMap() receiver_name: string;
    @AutoMap() phone: string;
    @AutoMap() body: string;
    @AutoMap() debt_id: string;
    @AutoMap() channel_type: number;
    @AutoMap() status: number;
    @AutoMap() is_deleted: 0 | 1;
    @AutoMap() created_date: string;
    @AutoMap() updated_date: string;
}
