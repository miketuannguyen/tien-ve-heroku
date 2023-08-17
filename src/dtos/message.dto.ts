import { AutoMap } from '@automapper/classes';

export class MessageDTO {
    @AutoMap() id: number;
    @AutoMap() address: string;
    @AutoMap() body: string;
    @AutoMap() send_date: string;
    @AutoMap() is_deleted: 0 | 1;
    @AutoMap() created_date: string;
    @AutoMap() updated_date: string;
}
