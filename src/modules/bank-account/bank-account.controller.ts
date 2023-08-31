import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Put, Query, Req, Res } from '@nestjs/common';
import { Response } from 'express';
import { BankAccountDTO, SaveBankAccountDTO } from 'src/dtos';
import { BaseController } from 'src/includes';
import { APIListResponse, APIResponse, Helpers, MESSAGES } from 'src/utils';
import { AuthenticatedRequest, CommonSearchQuery } from 'src/utils/types';
import ROUTES from '../routes';
import { BankAccountService } from './bank-account.service';

@Controller(ROUTES.BANK_ACCOUNT.MODULE)
export class BankAccountController extends BaseController {
    /** Constructor */
    constructor(private readonly _bankAccountService: BankAccountService) {
        super();
    }

    @Get(ROUTES.BANK_ACCOUNT.LIST)
    public async getList(@Req() req: AuthenticatedRequest, @Res() res: Response<APIListResponse<BankAccountDTO>>, @Query() query: CommonSearchQuery) {
        try {
            const total = await this._bankAccountService.getTotal();
            let list: BankAccountDTO[] = [];
            if (total > 0) {
                list = await this._bankAccountService.getList(query);
                if (!Helpers.isFilledArray(list)) {
                    const errRes = APIListResponse.error(MESSAGES.ERROR.ERR_NO_DATA, []);
                    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errRes);
                }
            }

            const successRes = APIListResponse.success<BankAccountDTO>(MESSAGES.SUCCESS.SUCCESS, list, total);
            return res.status(HttpStatus.OK).json(successRes);
        } catch (e) {
            this._logger.error(this.getList.name, e);
            const errRes = APIListResponse.error(MESSAGES.ERROR.ERR_INTERNAL_SERVER_ERROR, []);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errRes);
        }
    }

    @Get(ROUTES.BANK_ACCOUNT.DETAIL)
    public async getDetail(@Param('id') id: number, @Req() req: AuthenticatedRequest, @Res() res: Response<APIResponse<BankAccountDTO | undefined>>) {
        try {
            const item = await this._bankAccountService.getDetail(id);
            if (!item) {
                const errRes = APIResponse.error(MESSAGES.ERROR.ERR_NOT_FOUND);
                return res.status(HttpStatus.BAD_REQUEST).json(errRes);
            }

            const successRes = APIResponse.success<BankAccountDTO>(MESSAGES.SUCCESS.SUCCESS, item);
            return res.status(HttpStatus.OK).json(successRes);
        } catch (e) {
            this._logger.error(this.getDetail.name, e);
            const errRes = APIResponse.error(MESSAGES.ERROR.ERR_INTERNAL_SERVER_ERROR);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errRes);
        }
    }

    @Post(ROUTES.BANK_ACCOUNT.CREATE)
    public async create(
        @Req() req: AuthenticatedRequest,
        @Res() res: Response<APIResponse<BankAccountDTO | undefined>>,
        @Body() body: SaveBankAccountDTO,
    ) {
        try {
            const bankAccount = new BankAccountDTO();
            bankAccount.bank_id = body.bank_id;
            bankAccount.user_id = req.userPayload.id;
            bankAccount.phone = body.phone;
            bankAccount.branch_name = body.branch_name;
            bankAccount.card_owner = body.card_owner;
            bankAccount.account_number = body.account_number;
            bankAccount.name = body.name ?? '';

            const result = await this._bankAccountService.create(bankAccount);
            if (!result) {
                const errRes = APIResponse.error<undefined>(MESSAGES.ERROR.ERR_INTERNAL_SERVER_ERROR);
                return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errRes);
            }

            const successRes = APIResponse.success<BankAccountDTO | undefined>(MESSAGES.SUCCESS.SUCCESS, result);
            return res.status(HttpStatus.OK).json(successRes);
        } catch (e) {
            this._logger.error(this.create.name, e);
            const errRes = APIResponse.error(MESSAGES.ERROR.ERR_INTERNAL_SERVER_ERROR);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errRes);
        }
    }

    @Put(ROUTES.BANK_ACCOUNT.UPDATE)
    public async update(
        @Req() req: AuthenticatedRequest,
        @Res() res: Response<APIResponse<BankAccountDTO | undefined>>,
        @Body() body: SaveBankAccountDTO,
    ) {
        try {
            if (!body.id) {
                const errRes = APIResponse.error<undefined>(MESSAGES.ERROR.ERR_INTERNAL_SERVER_ERROR);
                return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errRes);
            }

            const ins = await this._bankAccountService.getById(body.id);
            if (!ins) {
                const errRes = APIResponse.error<undefined>(MESSAGES.ERROR.ERR_NO_DATA);
                return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errRes);
            }

            const bankAccount = new BankAccountDTO();
            bankAccount.id = body.id;
            bankAccount.bank_id = body.bank_id;
            bankAccount.user_id = req.userPayload.id;
            bankAccount.phone = body.phone;
            bankAccount.branch_name = body.branch_name;
            bankAccount.card_owner = body.card_owner;
            bankAccount.account_number = body.account_number;
            bankAccount.name = body.name ?? '';

            const result = await this._bankAccountService.update(bankAccount);
            if (!result) {
                const errRes = APIResponse.error<undefined>(MESSAGES.ERROR.ERR_INTERNAL_SERVER_ERROR);
                return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errRes);
            }

            const successRes = APIResponse.success<BankAccountDTO | undefined>(MESSAGES.SUCCESS.SUCCESS, result);
            return res.status(HttpStatus.OK).json(successRes);
        } catch (e) {
            this._logger.error(this.update.name, e);
            const errRes = APIResponse.error(MESSAGES.ERROR.ERR_INTERNAL_SERVER_ERROR);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errRes);
        }
    }

    @Delete(ROUTES.BANK_ACCOUNT.DELETE)
    public async delete(@Param('id') id: number, @Req() req: AuthenticatedRequest, @Res() res: Response<APIResponse<BankAccountDTO | undefined>>) {
        try {
            const ins = await this._bankAccountService.getById(id);
            if (!ins) {
                const errRes = APIResponse.error<undefined>(MESSAGES.ERROR.ERR_NO_DATA);
                return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errRes);
            }

            const result = await this._bankAccountService.delete(id);
            if (!result) {
                const errRes = APIResponse.error<undefined>(MESSAGES.ERROR.ERR_INTERNAL_SERVER_ERROR);
                return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errRes);
            }

            const successRes = APIResponse.success<BankAccountDTO | undefined>(MESSAGES.SUCCESS.SUCCESS, result);
            return res.status(HttpStatus.OK).json(successRes);
        } catch (e) {
            this._logger.error(this.delete.name, e);
            const errRes = APIResponse.error(MESSAGES.ERROR.ERR_INTERNAL_SERVER_ERROR);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errRes);
        }
    }
}
