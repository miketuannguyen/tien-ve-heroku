import { AutoMap } from '@automapper/classes';

export class SettingDTO {
    @AutoMap() id: number;
    @AutoMap() field_name: string;
    @AutoMap() value: string;
    @AutoMap() note: string;
    @AutoMap() is_deleted: 0 | 1;
    @AutoMap() created_date: string;
    @AutoMap() updated_date: string;
}
