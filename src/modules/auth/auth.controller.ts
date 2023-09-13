import { Body, Controller, HttpStatus, Post, Req, Res, UsePipes } from '@nestjs/common';
import * as dayjs from 'dayjs';
import { Response } from 'express';
import { RegisterOtpDTO, RenewPasswordDTO, SaveAccountDTO, UserDTO, ValidateForgotPasswordOtpDTO } from 'src/dtos';
import BaseController from 'src/includes/base.controller';
import { ValidationPipe } from 'src/pipes';
import { APIResponse, CONSTANTS, Helpers, MESSAGES } from 'src/utils';
import { AuthenticatedRequest } from 'src/utils/types';
import { OtpService } from '../otp/otp.service';
import ROUTES from '../routes';
import { UserService } from '../user/user.service';
import * as AuthSchemas from './auth.schemas';
import { AuthService } from './auth.service';

@Controller(ROUTES.AUTH.MODULE)
export class AuthController extends BaseController {
    /** Constructor */
    constructor(private readonly _authService: AuthService, private readonly _otpService: OtpService, private readonly _userService: UserService) {
        super();
    }

    /**
     * Login
     * @param body - `username` and `password` are required
     * @param res - user DTO with access token
     */
    @Post(ROUTES.AUTH.LOGIN)
    @UsePipes(new ValidationPipe(AuthSchemas.loginSchema))
    public async login(
        @Body() body: { email_phone: string; password: string },
        @Res() res: Response<APIResponse<(UserDTO & { access_token: string }) | undefined>>,
    ) {
        try {
            const { email_phone: emailPhone, password } = body;
            const loginRes = await this._authService.login(emailPhone, password);
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
            this._logger.error(this.login.name, e);
            const errRes = APIResponse.error(MESSAGES.ERROR.ERR_INTERNAL_SERVER_ERROR);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errRes);
        }
    }

    @Post(ROUTES.AUTH.CHANGE_PASSWORD)
    public async changePassword(
        @Body() body: { old_password: string; new_password: string },
        @Req() req: AuthenticatedRequest,
        @Res() res: Response<APIResponse<void>>,
    ) {
        try {
            const oldPassword = body.old_password;
            const newPassword = body.new_password;
            const id = req.userPayload.id;

            const isSuccess = await this._authService.changePassword(id, oldPassword, newPassword);
            if (!isSuccess) {
                const errRes = APIResponse.error(MESSAGES.ERROR.ERR_PASSWORD_NOT_CORRECT);
                return res.status(HttpStatus.BAD_REQUEST).json(errRes);
            }

            const successRes = APIResponse.success<void>(MESSAGES.SUCCESS.SUCCESS);
            return res.status(HttpStatus.OK).json(successRes);
        } catch (e) {
            this._logger.error(this.changePassword.name, e);
            const errRes = APIResponse.error(MESSAGES.ERROR.ERR_INTERNAL_SERVER_ERROR);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errRes);
        }
    }

    @Post(ROUTES.AUTH.REGISTER)
    @UsePipes(new ValidationPipe(AuthSchemas.registerOtpSchema))
    public async register(@Body() body: RegisterOtpDTO, @Res() res: Response<APIResponse<(UserDTO & { access_token: string }) | undefined>>) {
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
            if (existence) {
                const errRes = APIResponse.error(MESSAGES.ERROR.ERR_EMAIL_PHONE_EXISTS);
                return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errRes);
            }

            const data = new UserDTO();
            if (body.type === CONSTANTS.REGISTER_TYPES.EMAIL) data.email = body.email_phone;
            if (body.type === CONSTANTS.REGISTER_TYPES.PHONE) data.phone = body.email_phone;
            const createdUser = await this._userService.save(data);
            if (!createdUser) {
                const errRes = APIResponse.error(MESSAGES.ERROR.ERR_INTERNAL_SERVER_ERROR);
                return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errRes);
            }

            const loginRes = await this._authService.loginNoPassword(body.email_phone, body.type, body.is_long_token);
            if (!loginRes) {
                const errRes = APIResponse.error(MESSAGES.ERROR.ERR_INTERNAL_SERVER_ERROR);
                return res.status(HttpStatus.BAD_REQUEST).json(errRes);
            }

            if (!loginRes.is_active) {
                const errRes = APIResponse.error(MESSAGES.ERROR.ERR_USER_DEACTIVATED);
                return res.status(HttpStatus.BAD_REQUEST).json(errRes);
            }

            const successRes = APIResponse.success(MESSAGES.SUCCESS.SUCCESS, loginRes);
            return res.status(HttpStatus.OK).json(successRes);
        } catch (e) {
            this._logger.error(this.register.name, e);
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
            data.password = body.password;

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

    @Post(ROUTES.AUTH.VALIDATE_FORGOT_PASSWORD_OTP)
    @UsePipes(new ValidationPipe(AuthSchemas.validateForgotPasswordOtpSchema))
    public async validateForgotPasswordOtp(
        @Body() body: ValidateForgotPasswordOtpDTO,
        @Res() res: Response<APIResponse<{ access_token: string } | undefined>>,
    ) {
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

            const accessToken = await this._authService.createForgotPasswordAccessToken(body.email_phone);
            if (!Helpers.isString(accessToken)) {
                const errRes = APIResponse.error(MESSAGES.ERROR.ERR_INTERNAL_SERVER_ERROR);
                return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errRes);
            }

            const successRes = APIResponse.success(MESSAGES.SUCCESS.SUCCESS, { access_token: accessToken });
            return res.status(HttpStatus.OK).json(successRes);
        } catch (e) {
            this._logger.error(this.validateForgotPasswordOtp.name, e);
            const errRes = APIResponse.error(MESSAGES.ERROR.ERR_INTERNAL_SERVER_ERROR);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errRes);
        }
    }

    @Post(ROUTES.AUTH.RENEW_PASSWORD)
    @UsePipes(new ValidationPipe(AuthSchemas.renewPasswordSchema))
    public async renewPassword(
        /** Temporary access token */
        @Req() req: AuthenticatedRequest,
        @Body() body: RenewPasswordDTO,
        @Res() res: Response<APIResponse<void>>,
    ) {
        try {
            const isSuccess = await this._authService.renewPassword(req.userPayload.id, body.password);
            if (!isSuccess) {
                const errRes = APIResponse.error(MESSAGES.ERROR.ERR_PASSWORD_NOT_CORRECT);
                return res.status(HttpStatus.BAD_REQUEST).json(errRes);
            }

            const successRes = APIResponse.success<void>(MESSAGES.SUCCESS.SUCCESS);
            return res.status(HttpStatus.OK).json(successRes);
        } catch (e) {
            this._logger.error(this.renewPassword.name, e);
            const errRes = APIResponse.error(MESSAGES.ERROR.ERR_INTERNAL_SERVER_ERROR);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errRes);
        }
    }
}
