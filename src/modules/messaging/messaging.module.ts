import { Global, Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { join } from 'path/posix';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { CONSTANTS } from 'src/utils';
import { SMSService } from './sms.service';

@Global()
@Module({
    imports: [
        ConfigModule,
        MailerModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                transport: {
                    host: configService.get('MAIL_HOST'),
                    secure: Boolean(configService.get('MAIL_SECURE')),
                    auth: {
                        user: configService.get('MAIL_USER'),
                        pass: configService.get('MAIL_PASSWORD'),
                    },
                },
                defaults: {
                    from: `${String(configService.get('MAIL_NAME'))} <${String(configService.get('MAIL_FROM'))}>`,
                },
                template: {
                    dir: join(__dirname, '../../templates/email'),
                    adapter: new HandlebarsAdapter(),
                    options: {
                        strict: true,
                    },
                },
            }),
        }),
        HttpModule.register({
            timeout: CONSTANTS.HTTP_REQUEST_TIMEOUT,
        }),
    ],
    providers: [MailService, SMSService, ConfigService],
    exports: [MailService, SMSService],
})
export class MessagingModule {}
