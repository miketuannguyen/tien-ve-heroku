import { BadRequestException } from '@nestjs/common';

export class ValidationException extends BadRequestException {
    /**
     * Construct a new validation exception
     * @param errors - The validation errors when the body is an `object`
     * @param errorList - The validation errors when the body is an `object array`
     * @param isBodyInvalid - true if the request body is in a wrong format
     */
    constructor(public errors?: { [key: string]: string }, public errorList?: { [key: string]: string }[], public isBodyInvalid?: boolean) {
        super({
            errors,
            errorList,
            isBodyInvalid,
        });
    }
}
