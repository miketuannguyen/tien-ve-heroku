import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Put, Query, Req, Res, UsePipes } from '@nestjs/common';
import * as dayjs from 'dayjs';
import { Response } from 'express';
import {
    BankAccountDTO,
    CreateMessageDTO,
    MessageAmountStatsDTO,
    MessageDTO,
    MessageDetailDTO,
    MessageSearchQuery,
    MessageStatsQuery,
} from 'src/dtos';
import { BaseController } from 'src/includes';
import { ValidationPipe } from 'src/pipes';
import { APIListResponse, APIResponse, CONSTANTS, Helpers, MESSAGES } from 'src/utils';
import { BankService } from '../bank/bank.service';
import { DebtService } from '../debt/debt.service';
import ROUTES from '../routes';
import { BankAccountService } from './../bank-account/bank-account.service';
import * as MessageSchemas from './message.schemas';
import { MessageService } from './message.service';
import { AuthenticatedRequest, IdListObject } from 'src/utils/types';

@Controller(ROUTES.MESSAGE.MODULE)
export class MessageController extends BaseController {
    /** Constructor */
    constructor(
        private readonly _messageService: MessageService,
        private readonly _bankService: BankService,
        private readonly _debtService: DebtService,
        private readonly _bankAccountService: BankAccountService,
    ) {
        super();
    }

    /**
     * Tạo message và gach nợ tương ứng
     *
     * Hệ thống sẽ dựa trên nội dung của các SMS từ ngân hàng để tiến hành gạch nợ. Hệ thống sẽ xử lý như sau:
     *
     * - Tìm kiếm đoạn text đầu tiên có dấu "+" và kết thúc bằng "VND" trong nội dung tin nhắn. Phần ở giữa đoạn này sẽ là số tiền dùng để tính toán gạch nợ.
     * - Tìm kiếm trong nội dung SMS có đoạn text nào là ID công nợ thuộc về users sỡ hữu số điện thoại này hay không
     * - Số điện thoại nhận tin nhắn cũng sẽ được đối chiếu xem có đúng với tài khoản ngân hàng của công nợ hay không.
     *
     * Đáp ứng được 3 điều kiện trên thì hệ thống mới xử lý gạch nợ cho công nợ.
     */
    @Post(ROUTES.MESSAGE.CREATE)
    @UsePipes(new ValidationPipe(MessageSchemas.createSchema))
    public async create(@Res() res: Response<APIResponse<MessageDTO | undefined>>, @Body() body: CreateMessageDTO) {
        try {
            // Khi address của message nằm trong danh sách brand_name của các banks thì mới xử lý típ
            // Tránh ghi log các SMS cá nhân của users
            const bank = await this._bankService.getByBrandName(body.address.toLowerCase());
            if (!bank) {
                const errRes = APIResponse.error(MESSAGES.ERROR.ERR_NOT_BANK_SMS);
                return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errRes);
            }

            const accountNumber = Helpers.getSubstringBetweenStartEnd(body.body, `${bank.account_number_start} `, ' ');
            let bankAccount: BankAccountDTO | null = null;
            if (Helpers.isString(accountNumber)) {
                const accountNumberEnd = accountNumber.substring(accountNumber.length - 4, accountNumber.length);
                bankAccount = await this._bankAccountService.getByAccountNumberAndBankId(accountNumberEnd, bank.id);
            }

            // Bóc tách số tiền của tin nhắn
            let sign: -1 | 1 = 1;
            let amountStr = Helpers.getSubstringBetweenStartEnd(body.body, '+', 'VND');
            if (!Helpers.isString(amountStr)) {
                sign = -1;
                amountStr = Helpers.getSubstringBetweenStartEnd(body.body, '-', 'VND');
            }
            const amount = Helpers.extractNumberFromString(amountStr);

            // Bóc tách số dư tài khoản của tin nhắn
            const balanceStr = Helpers.getSubstringBetweenStartEnd(body.body, 'SD', 'VND');
            const balance = Helpers.extractNumberFromString(balanceStr);

            const debtId = Helpers.getSubstringFromStart(
                body.body,
                `${CONSTANTS.DEBT_ID_FORMAT.PREFIX}${CONSTANTS.DEBT_ID_FORMAT.SEPARATOR}`,
                CONSTANTS.DEBT_ID_FORMAT.LENGTH,
            );
            const debt = await this._debtService.getDetail(debtId ?? '');

            // Device phone from flutter contains country code
            const replacedCodeReceivePhone = body.phone.replace(CONSTANTS.VN_PHONE_CODE, '0') || '';

            const message = new MessageDTO();
            message.address = body.address || '';
            message.phone = replacedCodeReceivePhone;
            message.body = body.body || '';
            message.send_date = dayjs(Number(body.send_date) || 0).format(CONSTANTS.MYSQL_DATETIME_FORMAT);
            message.receive_date = dayjs(Number(body.receive_date) || 0).format(CONSTANTS.MYSQL_DATETIME_FORMAT);
            message.amount = amount;
            message.balance = balance;
            message.sign = sign;
            message.bank_account_id = bankAccount?.id ?? 0;
            if (debt && debt.bank_account_phone === replacedCodeReceivePhone && sign > 0) {
                message.debt_id = debt.id;
            }

            const result = await this._messageService.create(message);
            if (Helpers.isEmptyObject(result)) {
                const errRes = APIResponse.error(MESSAGES.ERROR.ERR_INTERNAL_SERVER_ERROR);
                return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errRes);
            }

            const successRes = APIResponse.success<MessageDTO | undefined>(MESSAGES.SUCCESS.SUCCESS);
            return res.status(HttpStatus.OK).json(successRes);
        } catch (e) {
            this._logger.error(this.create.name, e);
            const errRes = APIResponse.error(MESSAGES.ERROR.ERR_INTERNAL_SERVER_ERROR);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errRes);
        }
    }

    @Get(ROUTES.MESSAGE.LIST)
    public async getList(@Req() req: AuthenticatedRequest, @Res() res: Response<APIListResponse<MessageDTO>>, @Query() query: MessageSearchQuery) {
        try {
            query.receive_user_id = req.userPayload.id;
            const total = await this._messageService.getTotal(query);
            let list: MessageDTO[] = [];
            if (total > 0) {
                list = await this._messageService.getList(query);
                if (!Helpers.isFilledArray(list)) {
                    const errRes = APIListResponse.error<MessageDTO>(MESSAGES.ERROR.ERR_NO_DATA);
                    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errRes);
                }
            }

            const successRes = APIListResponse.success<MessageDTO>(MESSAGES.SUCCESS.SUCCESS, list, total);
            return res.status(HttpStatus.OK).json(successRes);
        } catch (e) {
            this._logger.error(this.getList.name, e);
            const errRes = APIListResponse.error<MessageDTO>(MESSAGES.ERROR.ERR_INTERNAL_SERVER_ERROR);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errRes);
        }
    }

    @Get(ROUTES.MESSAGE.DETAIL)
    public async getDetail(@Param('id') id: number, @Res() res: Response<APIResponse<MessageDetailDTO | undefined>>) {
        try {
            const item = await this._messageService.getDetail(id);
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

    @Put(ROUTES.MESSAGE.UPDATE_DEBT_ID)
    public async updateDebtId(
        @Param('id') id: number,
        @Res() res: Response<APIResponse<MessageDTO | undefined>>,
        @Body() body: { debt_id?: string },
    ) {
        try {
            if (!id) {
                const errRes = APIResponse.error(MESSAGES.ERROR.ERR_INTERNAL_SERVER_ERROR);
                return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errRes);
            }

            const result = await this._messageService.updateDebtId(id, body.debt_id);
            if (!result) {
                const errRes = APIResponse.error(MESSAGES.ERROR.ERR_INTERNAL_SERVER_ERROR);
                return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errRes);
            }

            const successRes = APIResponse.success(MESSAGES.SUCCESS.SUCCESS, result);
            return res.status(HttpStatus.OK).json(successRes);
        } catch (e) {
            this._logger.error(this.updateDebtId.name, e);
            const errRes = APIResponse.error(MESSAGES.ERROR.ERR_INTERNAL_SERVER_ERROR);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errRes);
        }
    }

    @Get(ROUTES.MESSAGE.AMOUNT_MONTHLY_STATS)
    public async getAmountMonthlyStats(
        @Req() req: AuthenticatedRequest,
        @Res() res: Response<APIResponse<MessageAmountStatsDTO[]>>,
        @Query() query: MessageStatsQuery,
    ) {
        try {
            const result = await this._messageService.getAmountMonthlyStats(query, req.userPayload.id);
            const successRes = APIResponse.success(MESSAGES.SUCCESS.SUCCESS, result);
            return res.status(HttpStatus.OK).json(successRes);
        } catch (e) {
            this._logger.error(this.getAmountMonthlyStats.name, e);
            const errRes = APIResponse.error(MESSAGES.ERROR.ERR_INTERNAL_SERVER_ERROR, []);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errRes);
        }
    }

    @Get(ROUTES.MESSAGE.AMOUNT_DAILY_STATS)
    public async getAmountDailyStats(
        @Req() req: AuthenticatedRequest,
        @Res() res: Response<APIResponse<MessageAmountStatsDTO[]>>,
        @Query() query: MessageStatsQuery,
    ) {
        try {
            const result = await this._messageService.getAmountDailyStats(query, req.userPayload.id);
            const successRes = APIResponse.success(MESSAGES.SUCCESS.SUCCESS, result);
            return res.status(HttpStatus.OK).json(successRes);
        } catch (e) {
            this._logger.error(this.getAmountDailyStats.name, e);
            const errRes = APIResponse.error(MESSAGES.ERROR.ERR_INTERNAL_SERVER_ERROR, []);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errRes);
        }
    }

    @Delete(ROUTES.MESSAGE.DELETE_MULTIPLE)
    public async deleteMultiple(@Query() query: IdListObject<number>, @Res() res: Response<APIResponse<MessageDTO[]>>) {
        try {
            const idList = query.id_list;
            const result = await this._messageService.deleteMultiple(idList);
            if (!Helpers.isFilledArray(result)) {
                const errRes = APIResponse.error<MessageDTO[]>(MESSAGES.ERROR.ERR_INTERNAL_SERVER_ERROR, []);
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
