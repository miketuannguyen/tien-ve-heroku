import { Body, Controller, Get, HttpStatus, Param, Post, Put, Query, Res } from '@nestjs/common';
import * as dayjs from 'dayjs';
import { Response } from 'express';
import { CreateMessageDTO, MessageDTO, MessageSearchQuery } from 'src/dtos';
import { BaseController } from 'src/includes';
import { APIListResponse, APIResponse, CONSTANTS, Helpers, MESSAGES } from 'src/utils';
import { BankService } from '../bank/bank.service';
import { DebtService } from '../debt/debt.service';
import ROUTES from '../routes';
import { MessageService } from './message.service';

@Controller(ROUTES.MESSAGE.MODULE)
export class MessageController extends BaseController {
    /** Constructor */
    constructor(
        private readonly _messageService: MessageService,
        private readonly _bankService: BankService,
        private readonly _debtService: DebtService,
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
    public async create(@Res() res: Response<APIResponse<MessageDTO | undefined>>, @Body() body: CreateMessageDTO) {
        try {
            // Khi address của message nằm trong danh sách brand_name của các banks thì mới xử lý típ
            // Tránh ghi log các SMS cá nhân của users
            const isBankSMS = await this._bankService.isBrandNameExist(body.address.toLowerCase());
            if (!isBankSMS) {
                const errRes = APIResponse.error<undefined>(MESSAGES.ERROR.ERR_NOT_BANK_SMS);
                return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errRes);
            }

            // Bóc tách số tiền của tin nhắn
            const amountStr = Helpers.getSubstringBetweenStartEnd(body.body, '+', 'VND');
            const amount = Helpers.extractNumberFromString(amountStr);
            if (amount <= 0) {
                const errRes = APIResponse.error<undefined>(MESSAGES.ERROR.ERR_SMS_AMOUNT_NOT_POSITIVE);
                return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errRes);
            }

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
            if (Helpers.isString(debtId) && debt && debt.bank_account_phone === replacedCodeReceivePhone) {
                message.debt_id = debtId;
            }

            const result = await this._messageService.create(message);
            if (Helpers.isEmptyObject(result)) {
                const errRes = APIResponse.error<undefined>(MESSAGES.ERROR.ERR_INTERNAL_SERVER_ERROR);
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
    public async getList(@Res() res: Response<APIListResponse<MessageDTO>>, @Query() query: MessageSearchQuery) {
        try {
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
}
