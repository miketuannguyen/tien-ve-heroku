import { Controller, Get, HttpStatus, Param, Req, Res } from '@nestjs/common';
import { Response } from 'express';
import { UserDTO } from 'src/dtos';
import { BaseController } from 'src/includes';
import { APIResponse, MESSAGES } from 'src/utils';
import { AuthenticatedRequest } from 'src/utils/types';
import ROUTES from '../routes';
import { UserService } from './user.service';

@Controller(ROUTES.USER.MODULE)
export class UserController extends BaseController {
    /** Constructor */
    constructor(private readonly _userService: UserService) {
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
}
