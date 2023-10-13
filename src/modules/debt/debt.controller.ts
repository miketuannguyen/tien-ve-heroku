import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Query, Req, Res } from '@nestjs/common';
import { Response } from 'express';
import { DebtDTO, DebtDetailDTO, DebtListDTO, DebtRemindRequest, DebtSearchQuery, RemindMessageDTO, SaveDebtDTO } from 'src/dtos';
import { BaseController } from 'src/includes';
import { APIListResponse, APIResponse, CONSTANTS, Helpers, MESSAGES } from 'src/utils';
import { AuthenticatedRequest, IdListObject } from 'src/utils/types';
import ROUTES from '../routes';
import { DebtService } from './debt.service';
import { SettingService } from '../setting/setting.service';
import { RemindMessageService } from '../remind-message/remind-message.service';
import { UserService } from '../user/user.service';

@Controller(ROUTES.DEBT.MODULE)
export class DebtController extends BaseController {
    /** Constructor */
    constructor(
        private readonly _debtService: DebtService,
        private readonly _settingService: SettingService,
        private readonly _userService: UserService,
        private readonly _remindMessageService: RemindMessageService,
    ) {
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

    @Post(ROUTES.DEBT.REMIND)
    public async remind(@Req() req: AuthenticatedRequest, @Res() res: Response<APIResponse<RemindMessageDTO[]>>, @Body() body: DebtRemindRequest) {
        try {
            if (!Helpers.isFilledArray(body.id_list) && !body.is_not_paid) {
                const errRes = APIResponse.error(MESSAGES.ERROR.ERR_BAD_REQUEST, []);
                return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errRes);
            }

            const userId = req.userPayload.id;
            const user = await this._userService.getById(userId);
            if (!user) {
                const errRes = APIResponse.error(MESSAGES.ERROR.ERR_UNAUTHENTICATED, []);
                return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errRes);
            }

            const debtSearchParams: DebtSearchQuery = {
                page: -1,
            };

            if (Helpers.isFilledArray(body.id_list)) {
                debtSearchParams.id_list = body.id_list;
            }

            if (body.is_not_paid) {
                debtSearchParams.is_not_paid = body.is_not_paid;
            }

            let debtList = await this._debtService.getList(debtSearchParams, userId);
            debtList = (debtList || []).filter((debt) => (debt.paid_amount ?? 0) < debt.amount);
            if (!Helpers.isFilledArray(debtList)) {
                const errRes = APIResponse.error(MESSAGES.ERROR.ERR_NO_DEBT_NOT_PAID, []);
                return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errRes);
            }

            if (user.remind_count + debtList.length > user.max_remind_count) {
                const errRes = APIResponse.error(MESSAGES.ERROR.ERR_OVER_MAX_REMIND_COUNT, []);
                return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errRes);
            }

            const settingList = await this._settingService.getListByFieldNameList([CONSTANTS.SETTING_FIELD_NAMES.REMIND_MESSAGE_TEMPLATE]);
            if (!Helpers.isFilledArray(settingList)) {
                const errRes = APIResponse.error(MESSAGES.ERROR.ERR_INTERNAL_SERVER_ERROR, []);
                return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errRes);
            }
            const template = settingList[0].value;

            const msgList = debtList.map((debt) => {
                const msg = new RemindMessageDTO();
                msg.receiver_name = debt.payer_name;
                msg.phone = debt.payer_phone;
                msg.body = template
                    .replace(`{{${CONSTANTS.MESSAGE_TEMPLATE_ALIASES.RECEIVER_NAME}}}`, debt.payer_name)
                    .replace(
                        `{{${CONSTANTS.MESSAGE_TEMPLATE_ALIASES.AMOUNT}}}`,
                        Helpers.formatNumber((Number(debt.amount) || 0) - (Number(debt.paid_amount) || 0)),
                    );
                msg.debt_id = debt.id;
                msg.channel_type = CONSTANTS.REMIND_MESSAGE.CHANNEL_TYPE.ZALO;
                msg.status = CONSTANTS.REMIND_MESSAGE.STATUS.SENDING;
                return msg;
            });

            // ! Send SMS here

            const result = await this._remindMessageService.sendMultiple(msgList, userId);
            if (!Helpers.isFilledArray(result)) {
                const errRes = APIResponse.error(MESSAGES.ERROR.ERR_INTERNAL_SERVER_ERROR, []);
                return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errRes);
            }

            const successRes = APIResponse.success(MESSAGES.SUCCESS.SUCCESS, result);
            return res.status(HttpStatus.OK).json(successRes);
        } catch (e) {
            this._logger.error(this.remind.name, e);
            const errRes = APIResponse.error(MESSAGES.ERROR.ERR_INTERNAL_SERVER_ERROR, []);
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

    @Delete(ROUTES.DEBT.DELETE_MULTIPLE)
    public async deleteMultiple(@Query() query: IdListObject<string>, @Res() res: Response<APIResponse<DebtDTO[]>>) {
        try {
            const idList = query.id_list;
            const result = await this._debtService.deleteMultiple(idList);
            if (!Helpers.isFilledArray(result)) {
                const errRes = APIResponse.error<DebtDTO[]>(MESSAGES.ERROR.ERR_INTERNAL_SERVER_ERROR, []);
                return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errRes);
            }

            const successRes = APIResponse.success(MESSAGES.SUCCESS.SUCCESS, result);
            return res.status(HttpStatus.OK).json(successRes);
        } catch (e) {
            this._logger.error(this.deleteMultiple.name, e);
            const errRes = APIResponse.error(MESSAGES.ERROR.ERR_INTERNAL_SERVER_ERROR, []);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errRes);
        }
    }
}
