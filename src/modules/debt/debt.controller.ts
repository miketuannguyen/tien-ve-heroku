import { Body, Controller, Get, HttpStatus, Param, Post, Query, Req, Res } from '@nestjs/common';
import { Response } from 'express';
import { DebtDTO, DebtDetailDTO, DebtListDTO, DebtSearchQuery, SaveDebtDTO } from 'src/dtos';
import { BaseController } from 'src/includes';
import { APIListResponse, APIResponse, Helpers, MESSAGES } from 'src/utils';
import { AuthenticatedRequest } from 'src/utils/types';
import ROUTES from '../routes';
import { DebtService } from './debt.service';

@Controller(ROUTES.DEBT.MODULE)
export class DebtController extends BaseController {
    /** Constructor */
    constructor(private readonly _debtService: DebtService) {
        super();
    }

    @Get(ROUTES.DEBT.LIST)
    public async getList(@Req() req: AuthenticatedRequest, @Res() res: Response<APIListResponse<DebtListDTO>>, @Query() query: DebtSearchQuery) {
        try {
            const total = await this._debtService.getTotal(query, req.userPayload.id);
            let list: DebtListDTO[] = [];
            if (total > 0) {
                list = await this._debtService.getList(query, req.userPayload.id);
                if (!Helpers.isFilledArray(list)) {
                    const errRes = APIListResponse.error(MESSAGES.ERROR.ERR_NO_DATA, []);
                    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errRes);
                }
            }

            const successRes = APIListResponse.success(MESSAGES.SUCCESS.SUCCESS, list, total);
            return res.status(HttpStatus.OK).json(successRes);
        } catch (e) {
            this._logger.error(this.getList.name, e);
            const errRes = APIListResponse.error(MESSAGES.ERROR.ERR_INTERNAL_SERVER_ERROR, []);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errRes);
        }
    }

    @Get(ROUTES.DEBT.DETAIL)
    public async getDetail(@Param('id') id: string, @Req() req: AuthenticatedRequest, @Res() res: Response<APIResponse<DebtDetailDTO | undefined>>) {
        try {
            const item = await this._debtService.getDetail(id);
            if (!item) {
                const errRes = APIResponse.error(MESSAGES.ERROR.ERR_NOT_FOUND);
                return res.status(HttpStatus.BAD_REQUEST).json(errRes);
            }

            const successRes = APIResponse.success(MESSAGES.SUCCESS.SUCCESS, item);
            return res.status(HttpStatus.OK).json(successRes);
        } catch (e) {
            this._logger.error(this.getDetail.name, e);
            const errRes = APIResponse.error(MESSAGES.ERROR.ERR_INTERNAL_SERVER_ERROR);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errRes);
        }
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

            const successRes = APIListResponse.success(MESSAGES.SUCCESS.SUCCESS, result);
            return res.status(HttpStatus.OK).json(successRes);
        } catch (e) {
            this._logger.error(this.createMultiple.name, e);
            const errRes = APIListResponse.error(MESSAGES.ERROR.ERR_INTERNAL_SERVER_ERROR, []);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errRes);
        }
    }
}
