import { Body, Controller, Post, Res, Req, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { BaseController } from 'src/includes';
import ROUTES from '../routes';
import { DebtService } from './debt.service';
import { APIListResponse, Helpers, MESSAGES } from 'src/utils';
import { DebtDTO, SaveDebtDTO } from 'src/dtos';
import { AuthenticatedRequest } from 'src/utils/types';

@Controller(ROUTES.DEBT.MODULE)
export class DebtController extends BaseController {
    /** Constructor */
    constructor(private readonly _debtService: DebtService) {
        super();
    }

    @Post(ROUTES.DEBT.CREATE_MULTIPLE)
    public async createMultiple(@Req() req: AuthenticatedRequest, @Res() res: Response<APIListResponse<DebtDTO>>, @Body() body: SaveDebtDTO[]) {
        try {
            if (!Helpers.isFilledArray(body)) {
                const errRes = APIListResponse.error(MESSAGES.ERROR.ERR_INTERNAL_SERVER_ERROR, []);
                return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errRes);
            }

            const result = await this._debtService.createMultiple(body, req.userPayload.id);
            if (!Helpers.isFilledArray(result)) {
                const errRes = APIListResponse.error(MESSAGES.ERROR.ERR_INTERNAL_SERVER_ERROR, []);
                return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errRes);
            }

            const successRes = APIListResponse.success<DebtDTO>(MESSAGES.SUCCESS.SUCCESS, result);
            return res.status(HttpStatus.OK).json(successRes);
        } catch (e) {
            this._logger.error(this.createMultiple.name, e);
            const errRes = APIListResponse.error(MESSAGES.ERROR.ERR_INTERNAL_SERVER_ERROR, []);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errRes);
        }
    }
}
