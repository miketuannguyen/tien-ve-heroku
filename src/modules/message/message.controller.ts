import { Body, Controller, HttpStatus, Post, Res } from '@nestjs/common';
import * as dayjs from 'dayjs';
import { Response } from 'express';
import { MessageDTO } from 'src/dtos';
import { BaseController } from 'src/includes';
import { APIResponse, CONSTANTS, Helpers, MESSAGES } from 'src/utils';
import ROUTES from '../routes';
import { MessageService } from './message.service';

@Controller(ROUTES.MESSAGE.MODULE)
export class MessageController extends BaseController {
    /** Constructor */
    constructor(private readonly _messageService: MessageService) {
        super();
    }

    @Post(ROUTES.MESSAGE.CREATE)
    public async create(@Res() res: Response<APIResponse<MessageDTO | null>>, @Body() body: { address: string; body: string; send_date: number }) {
        try {
            const message = new MessageDTO();
            message.address = body.address || '';
            message.body = body.body || '';
            message.send_date = dayjs(Number(body.send_date) || 0).format(CONSTANTS.MYSQL_DATETIME_FORMAT);

            const result = await this._messageService.create(message);
            if (Helpers.isEmptyObject(result)) {
                const errRes = APIResponse.error<null>(MESSAGES.ERROR.ERR_INTERNAL_SERVER_ERROR);
                return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errRes);
            }

            const successRes = APIResponse.success<MessageDTO | null>(MESSAGES.SUCCESS.SUCCESS, result);
            return res.status(HttpStatus.OK).json(successRes);
        } catch (e) {
            this._logger.error(this.create.name, e);
            const errRes = APIResponse.error(MESSAGES.ERROR.ERR_INTERNAL_SERVER_ERROR);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errRes);
        }
    }
}
