import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { initMapper } from './dtos';
import AppLogger from './logger/logger';

/**
 * Bootstrap
 */
async function bootstrap() {
    const app = await NestFactory.create(AppModule, {
        bufferLogs: true,
    });
    app.enableCors();

    AppLogger.initAppLogFolder();
    initMapper();

    const configService = app.get(ConfigService);
    const port = Number(configService.get<number>('PORT'));
    if (!port) {
        process.exit(1);
    }

    await app.listen(port);

    const mainLogger = new AppLogger('main');
    mainLogger.info('=========== TienVeAPI start =========== ');
}
void bootstrap();
