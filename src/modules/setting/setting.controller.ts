import { Body, Controller, Get, HttpStatus, Put, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { SettingDTO } from 'src/dtos';
import { BaseController } from 'src/includes';
import { APIListResponse, APIResponse, CONSTANTS, Helpers, MESSAGES } from 'src/utils';
import { ValueOf } from 'src/utils/types';
import ROUTES from '../routes';
import { SettingService } from './setting.service';

@Controller(ROUTES.SETTING.MODULE)
export class SettingController extends BaseController {
    /** Constructor */
    constructor(private readonly _settingService: SettingService) {
        super();
    }

    @Get(ROUTES.SETTING.GET_LIST_BY_FIELD_NAME_LIST)
    public async getListByFieldNameList(
        @Res() res: Response<APIListResponse<SettingDTO | null>>,
        @Query() query: { field_name_list: ValueOf<typeof CONSTANTS.SETTING_FIELD_NAMES>[] },
    ) {
        try {
            const list = await this._settingService.getListByFieldNameList(query.field_name_list || []);
            if (!Helpers.isFilledArray(list)) {
                const errRes = APIListResponse.error(MESSAGES.ERROR.ERR_NO_DATA);
                return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errRes);
            }

            const successRes = APIListResponse.success<SettingDTO>(MESSAGES.SUCCESS.SUCCESS, list, list.length);
            return res.status(HttpStatus.OK).json(successRes);
        } catch (e) {
            this._logger.error(this.getListByFieldNameList.name, e);
            const errRes = APIListResponse.error(MESSAGES.ERROR.ERR_INTERNAL_SERVER_ERROR);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errRes);
        }
    }

    @Put(ROUTES.SETTING.UPDATE_MULTIPLE)
    public async updateMultiple(@Res() res: Response<APIResponse<void>>, @Body() body: { [fieldName: string]: string }) {
        try {
            const isSuccess = await this._settingService.updateMultiple(body);
            if (!isSuccess) {
                const errRes = APIResponse.error<undefined>(MESSAGES.ERROR.ERR_INTERNAL_SERVER_ERROR);
                return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errRes);
            }

            const successRes = APIResponse.success<void>(MESSAGES.SUCCESS.SUCCESS);
            return res.status(HttpStatus.OK).json(successRes);
        } catch (e) {
            this._logger.error(this.updateMultiple.name, e);
            const errRes = APIResponse.error(MESSAGES.ERROR.ERR_INTERNAL_SERVER_ERROR);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errRes);
        }
    }
}
