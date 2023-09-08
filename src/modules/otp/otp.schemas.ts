import * as Joi from 'joi';
import { CONSTANTS } from 'src/utils';
import { ValueOf } from 'src/utils/types';

export const createSchema = Joi.object<{
    receive_address: string;
    type: ValueOf<typeof CONSTANTS.REGISTER_TYPES>;
}>({
    receive_address: Joi.string().required().messages({
        'any.required': 'required',
        'string.base': 'required',
        'string.empty': 'required',
    }),
    type: Joi.required().messages({
        'any.required': 'required',
    }),
})
    .options({
        abortEarly: false,
    })
    .unknown(true);
