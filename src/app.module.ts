import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { NotFoundExceptionFilter } from './filters';
import { ValidationExceptionFilter } from './filters/validation-exception.filter';
import { LoggerModule } from './logger/logger.module';
import { AuthMiddleware } from './middleware';
import { MiddlewareModule } from './middleware/middleware.module';
import { AuthController } from './modules/auth/auth.controller';
import { AuthModule } from './modules/auth/auth.module';
import { BankAccountController } from './modules/bank-account/bank-account.controller';
import { BankAccountModule } from './modules/bank-account/bank-account.module';
import { BankController } from './modules/bank/bank.controller';
import { BankModule } from './modules/bank/bank.module';
import { DebtController } from './modules/debt/debt.controller';
import { DebtModule } from './modules/debt/debt.module';
import { MessageModule } from './modules/message/message.module';
import { MessagingModule } from './modules/messaging/messaging.module';
import { OtpModule } from './modules/otp/otp.module';
import ROUTES from './modules/routes';
import { UserController } from './modules/user/user.controller';
import { UserModule } from './modules/user/user.module';
import { RepositoryModule } from './repository/repository.module';
import { CONSTANTS } from './utils';

@Module({
    imports: [
        ServeStaticModule.forRoot({
            rootPath: join(__dirname, '..', CONSTANTS.FRONTEND_DIR),
        }),
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        MiddlewareModule,
        RepositoryModule,
        AuthModule,
        UserModule,
        MessageModule,
        OtpModule,
        BankModule,
        BankAccountModule,
        DebtModule,
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                type: 'mysql',
                host: configService.get('MYSQL_HOST'),
                port: Number(configService.get('MYSQL_PORT')),
                username: configService.get('MYSQL_USERNAME'),
                password: configService.get('MYSQL_PASSWORD'),
                database: configService.get('MYSQL_DATABASE'),
                autoLoadEntities: true,
            }),
        }),
        LoggerModule,
        MessagingModule,
    ],
    controllers: [],
    providers: [
        {
            provide: APP_FILTER,
            useClass: NotFoundExceptionFilter,
        },
        {
            provide: APP_FILTER,
            useClass: ValidationExceptionFilter,
        },
    ],
})
export class AppModule {
    /**
     * Configure middlewares
     */
    configure(consumer: MiddlewareConsumer) {
        const authExcludeRouteList = [ROUTES.AUTH.LOGIN, ROUTES.AUTH.REGISTER, ROUTES.AUTH.VALIDATE_FORGOT_PASSWORD_OTP];
        const userExcludeRouteList = [ROUTES.USER.GET_BY_EMAIL_PHONE];
        consumer
            .apply(AuthMiddleware)
            .exclude(...authExcludeRouteList.map((route) => `/${ROUTES.AUTH.MODULE}/${route}`))
            .forRoutes(AuthController);
        consumer
            .apply(AuthMiddleware)
            .exclude(...userExcludeRouteList.map((route) => `/${ROUTES.USER.MODULE}/${route}`))
            .forRoutes(UserController);

        consumer.apply(AuthMiddleware).forRoutes(BankController, BankAccountController, DebtController);
    }
}
