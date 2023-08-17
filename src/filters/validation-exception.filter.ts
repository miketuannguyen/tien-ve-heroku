import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { ValidationException } from 'src/exceptions';
import { APIResponse, Helpers, MESSAGES } from 'src/utils';

/**
 * Response '400 Bad Request' on validation errors
 */
@Catch(ValidationException)
export class ValidationExceptionFilter implements ExceptionFilter {
    /**
     * Response '400 Bad Request' on validation errors
     */
    catch(exception: ValidationException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const res = ctx.getResponse<Response>();

        // Handle both cases when there is validation error and validation error list
        const errors = !Helpers.isEmptyObject(exception.errors) ? exception.errors : undefined;
        const errorList = Helpers.isFilledArray(exception.errorList) ? exception.errorList : undefined;

        // the request body has an invalid format
        if (exception.isBodyInvalid) {
            const errRes = APIResponse.error(MESSAGES.ERROR.ERR_INVALID_REQUEST_BODY);
            return res.status(HttpStatus.BAD_REQUEST).json(errRes);
        }

        // If both are undefined but the request body is valid
        // => response success but there is no data action processed
        if (!errors && !errorList) {
            const successRes = APIResponse.success(MESSAGES.SUCCESS.NO_ACTION);
            return res.status(HttpStatus.OK).json(successRes);
        }

        const errRes = APIResponse.error(MESSAGES.ERROR.ERR_VALIDATION, undefined, errors, errorList);
        return res.status(HttpStatus.BAD_REQUEST).json(errRes);
    }
}
