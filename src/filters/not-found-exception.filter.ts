import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus, NotFoundException } from '@nestjs/common';
import { Response } from 'express';
import { APIResponse, MESSAGES } from 'src/utils';

/**
 * Response '404 Not Found' for requests which are not handled by any routes
 */
@Catch(NotFoundException)
export class NotFoundExceptionFilter implements ExceptionFilter {
    /**
     * Response '404 Not Found' for requests which are not handled by any routes
     */
    catch(exception: NotFoundException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const res = ctx.getResponse<Response>();
        return res.status(HttpStatus.NOT_FOUND).json(APIResponse.error(MESSAGES.ERROR.ERR_RESOURCE_NOT_FOUND));
    }
}
