import { Controller, Get, HttpStatus, Param, Req, Res } from '@nestjs/common';
import { Response } from 'express';
import { UserDTO } from 'src/dtos';
import { BaseController } from 'src/includes';
import { APIResponse, MESSAGES } from 'src/utils';
import { AuthenticatedRequest, CountObject } from 'src/utils/types';
import { DebtService } from '../debt/debt.service';
import ROUTES from '../routes';
import { UserService } from './user.service';

@Controller(ROUTES.USER.MODULE)
export class UserController extends BaseController {
    /** Constructor */
    constructor(private readonly _userService: UserService, private readonly _debtService: DebtService) {
        super();
    }

    /**
     * Get user profile
     * @param req - Authenticated request
     * @param res - User data
     */
    @Get(ROUTES.USER.PROFILE)
    public async getProfile(@Req() req: AuthenticatedRequest, @Res() res: Response<APIResponse<UserDTO | undefined>>) {
        try {
            const result = await this._userService.getById(req.userPayload.id);
            if (!result) {
                const unauthorizedErrRes = APIResponse.error<undefined>(MESSAGES.ERROR.ERR_UNAUTHORIZED);
                return res.status(HttpStatus.UNAUTHORIZED).json(unauthorizedErrRes);
            }

            const successRes = APIResponse.success(MESSAGES.SUCCESS.SUCCESS, result);
            return res.status(HttpStatus.OK).json(successRes);
        } catch (e) {
            this._logger.error(this.getProfile.name, e);
            const errRes = APIResponse.error<undefined>(MESSAGES.ERROR.ERR_INTERNAL_SERVER_ERROR);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errRes);
        }
    }

    @Get(ROUTES.USER.GET_BY_EMAIL_PHONE)
    public async getByEmailPhone(@Param('email_phone') emailPhone: string, @Res() res: Response<APIResponse<UserDTO | undefined>>) {
        try {
            const result = await this._userService.getByEmailPhone(emailPhone);
            const successRes = APIResponse.success(MESSAGES.SUCCESS.SUCCESS, result ?? undefined);
            return res.status(HttpStatus.OK).json(successRes);
        } catch (e) {
            this._logger.error(this.getByEmailPhone.name, e);
            const errRes = APIResponse.error<undefined>(MESSAGES.ERROR.ERR_INTERNAL_SERVER_ERROR);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errRes);
        }
    }

    @Get(ROUTES.USER.GET_TODAY_DEBT_COUNT)
    public async getTodayDebtCount(@Req() req: AuthenticatedRequest, @Res() res: Response<APIResponse<CountObject>>) {
        try {
            const userId = req.userPayload.id;
            const result = await this._debtService.getDebtCountOfUser(userId);
            const successRes = APIResponse.success(MESSAGES.SUCCESS.SUCCESS, { count: result });
            return res.status(HttpStatus.OK).json(successRes);
        } catch (e) {
            this._logger.error(this.getTodayDebtCount.name, e);
            const errRes = APIResponse.error(MESSAGES.ERROR.ERR_INTERNAL_SERVER_ERROR, { count: 0 });
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errRes);
        }
    }
}
