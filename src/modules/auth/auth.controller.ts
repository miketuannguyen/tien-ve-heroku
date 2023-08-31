import { Body, Controller, HttpStatus, Post, Req, Res, UsePipes } from '@nestjs/common';
import * as dayjs from 'dayjs';
import { Response } from 'express';
import { LoginOtpDTP as LoginOtpDTO, SaveAccountDTO, UserDTO } from 'src/dtos';
import BaseController from 'src/includes/base.controller';
import { ValidationPipe } from 'src/pipes';
import { APIResponse, CONSTANTS, MESSAGES } from 'src/utils';
import { OtpService } from '../otp/otp.service';
import ROUTES from '../routes';
import * as AuthSchemas from './auth.schemas';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { AuthenticatedRequest } from 'src/utils/types';

@Controller(ROUTES.AUTH.MODULE)
export class AuthController extends BaseController {
    /** Constructor */
    constructor(private readonly _authService: AuthService, private readonly _otpService: OtpService, private readonly _userService: UserService) {
        super();
    }

    @Post(ROUTES.AUTH.LOGIN_OTP)
    @UsePipes(new ValidationPipe(AuthSchemas.loginOtpSchema))
    public async loginOtp(@Body() body: LoginOtpDTO, @Res() res: Response<APIResponse<(UserDTO & { access_token: string }) | undefined>>) {
        try {
            const otp = await this._otpService.getById(body.id);
            if (!otp) {
                const errRes = APIResponse.error(MESSAGES.ERROR.ERR_INTERNAL_SERVER_ERROR);
                return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errRes);
            }

            if (otp.otp !== body.otp) {
                const errRes = APIResponse.error(MESSAGES.ERROR.ERR_OTP_NOT_VALID);
                return res.status(HttpStatus.BAD_REQUEST).json(errRes);
            }

            const current = dayjs();
            const expireDate = dayjs(otp.expired_date);
            if (current.isAfter(expireDate)) {
                const errRes = APIResponse.error(MESSAGES.ERROR.ERR_OTP_EXPIRED);
                return res.status(HttpStatus.BAD_REQUEST).json(errRes);
            }

            if (otp.is_used) {
                const errRes = APIResponse.error(MESSAGES.ERROR.ERR_OTP_USED);
                return res.status(HttpStatus.BAD_REQUEST).json(errRes);
            }

            await this._otpService.setUsed(body.id);

            const existence = await this._userService.getByEmailPhone(body.email_phone);
            if (!existence) {
                const data = new UserDTO();
                if (body.type === CONSTANTS.LOGIN_TYPES.EMAIL) data.email = body.email_phone;
                if (body.type === CONSTANTS.LOGIN_TYPES.PHONE) data.phone = body.email_phone;
                const createdUser = await this._userService.save(data);
                if (!createdUser) {
                    const errRes = APIResponse.error(MESSAGES.ERROR.ERR_INTERNAL_SERVER_ERROR);
                    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errRes);
                }
            }

            const loginRes = await this._authService.login(body.email_phone, body.type);
            if (!loginRes) {
                const errRes = APIResponse.error(MESSAGES.ERROR.ERR_LOGIN);
                return res.status(HttpStatus.BAD_REQUEST).json(errRes);
            }

            if (!loginRes.is_active) {
                const errRes = APIResponse.error(MESSAGES.ERROR.ERR_USER_DEACTIVATED);
                return res.status(HttpStatus.BAD_REQUEST).json(errRes);
            }

            const successRes = APIResponse.success(MESSAGES.SUCCESS.SUCCESS, loginRes);
            return res.status(HttpStatus.OK).json(successRes);
        } catch (e) {
            this._logger.error(this.loginOtp.name, e);
            const errRes = APIResponse.error(MESSAGES.ERROR.ERR_INTERNAL_SERVER_ERROR);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errRes);
        }
    }

    @Post(ROUTES.AUTH.SAVE_ACCOUNT)
    @UsePipes(new ValidationPipe(AuthSchemas.saveAccountSchema))
    public async saveAccount(@Req() req: AuthenticatedRequest, @Body() body: SaveAccountDTO, @Res() res: Response<APIResponse<UserDTO | undefined>>) {
        try {
            const data = new UserDTO();
            data.id = req.userPayload.id;
            data.email = body.email;
            data.phone = body.phone;
            data.name = body.name;

            const emailUser = await this._userService.getByEmail(data.email);
            if (emailUser && emailUser.id !== req.userPayload.id) {
                const errRes = APIResponse.error(MESSAGES.ERROR.ERR_EMAIL_EXISTS);
                return res.status(HttpStatus.BAD_REQUEST).json(errRes);
            }

            const phoneUser = await this._userService.getByPhone(data.phone);
            if (phoneUser && phoneUser.id !== req.userPayload.id) {
                const errRes = APIResponse.error(MESSAGES.ERROR.ERR_PHONE_EXISTS);
                return res.status(HttpStatus.BAD_REQUEST).json(errRes);
            }

            const result = await this._userService.save(data);
            if (!result) {
                const errRes = APIResponse.error(MESSAGES.ERROR.ERR_INTERNAL_SERVER_ERROR);
                return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errRes);
            }

            const successRes = APIResponse.success(MESSAGES.SUCCESS.SUCCESS, result);
            return res.status(HttpStatus.OK).json(successRes);
        } catch (e) {
            this._logger.error(this.saveAccount.name, e);
            const errRes = APIResponse.error(MESSAGES.ERROR.ERR_INTERNAL_SERVER_ERROR);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errRes);
        }
    }
}
