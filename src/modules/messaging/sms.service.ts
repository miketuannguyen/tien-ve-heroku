import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { BaseService } from 'src/includes';
import { CONSTANTS } from 'src/utils';

@Injectable()
export class SMSService extends BaseService {
    constructor(private readonly _httpService: HttpService, private readonly _configService: ConfigService) {
        super();
    }

    async sendOTP(phone: string, otp: string) {
        const esmsUrl = String(this._configService.get('ESMS_URL'));
        const esmsApiKey = String(this._configService.get('ESMS_API_KEY'));
        const esmsSecretKey = String(this._configService.get('ESMS_SECRET_KEY'));
        const esmsBrandName = String(this._configService.get('ESMS_BRAND_NAME'));
        const esmsSandBox = this._configService.get('ESMS_SAND_BOX') ? 1 : 0;

        // eSMS chỉ support gửi type này: tin Chăm sóc khách hàng
        const customerSupportSMSType = '2';
        const params = {
            ApiKey: esmsApiKey,
            SecretKey: esmsSecretKey,
            Content: `Mã xác nhận của bạn là ${otp}`,
            Phone: phone,
            Unicode: 1,
            Brandname: esmsBrandName,
            SmsType: customerSupportSMSType,
            SandBox: esmsSandBox,
        };

        const result = await firstValueFrom(
            this._httpService.post<{
                CodeResult: string;
                CountRegenerate: number;
                SMSID: string;
            }>(esmsUrl, params, { headers: { 'Content-Type': 'application/json' } }),
        );

        const isSuccess = String(result.data?.CodeResult) === CONSTANTS.SMS_SUCCESS_CODE;
        if (!isSuccess) {
            this._logger.error(this.sendOTP.name, result.data);
        }
        return isSuccess;
    }
}
