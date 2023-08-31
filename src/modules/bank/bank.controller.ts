import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { Response } from 'express';
import { BankDTO } from 'src/dtos';
import { BaseController } from 'src/includes';
import { APIListResponse, MESSAGES } from 'src/utils';
import ROUTES from '../routes';
import { BankService } from './bank.service';

@Controller(ROUTES.BANK.MODULE)
export class BankController extends BaseController {
    /** Constructor */
    constructor(private readonly _bankService: BankService) {
        super();
    }

    @Get(ROUTES.BANK.LIST)
    public async getList(@Res() res: Response<APIListResponse<BankDTO>>) {
        try {
            const list = await this._bankService.getList();
            const successRes = APIListResponse.success<BankDTO>(MESSAGES.SUCCESS.SUCCESS, list, list.length);
            return res.status(HttpStatus.OK).json(successRes);
        } catch (e) {
            this._logger.error(this.getList.name, e);
            const errRes = APIListResponse.error(MESSAGES.ERROR.ERR_INTERNAL_SERVER_ERROR, []);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errRes);
        }
    }
}
