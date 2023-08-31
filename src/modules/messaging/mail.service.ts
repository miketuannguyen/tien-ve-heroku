import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
    constructor(private mailerService: MailerService) {}

    async sendOTP(email: string, otp: string) {
        await this.mailerService.sendMail({
            to: email,
            // from: '"Support Team" <support@example.com>', // override default from
            subject: 'Tiền Về - Mã xác nhận',
            template: '../../templates/email/otp', // `.hbs` extension is appended automatically
            // filling curly brackets with content
            context: { otp },
        });
    }
}
