import { AutoMap } from '@automapper/classes';
import { CommonSearchQuery } from 'src/utils/types';

export class MessageDTO {
    @AutoMap() id: number;
    @AutoMap() address: string;
    @AutoMap() phone: string;
    @AutoMap() body: string;
    @AutoMap() send_date: string;
    @AutoMap() receive_date: string;
    @AutoMap() debt_id?: string;
    @AutoMap() amount: number;
    @AutoMap() is_deleted: 0 | 1;
    @AutoMap() created_date: string;
    @AutoMap() updated_date: string;
}

export class CreateMessageDTO {
    address: string;
    phone: string;
    body: string;
    send_date: number;
    receive_date: number;
}

export type MessageSearchQuery = CommonSearchQuery & {
    debt_id?: string;
    receive_user_id?: number;
};
