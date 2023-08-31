import * as Joi from 'joi';
import { CONSTANTS } from 'src/utils';
import { ValueOf } from 'src/utils/types';

export const loginOtpSchema = Joi.object<{
    id: number;
    otp: string;
    email_phone: string;
    type: ValueOf<typeof CONSTANTS.LOGIN_TYPES>;
}>({
    id: Joi.required().messages({
        'any.required': 'required',
    }),
    otp: Joi.string().required().messages({
        'any.required': 'required',
        'string.base': 'required',
        'string.empty': 'required',
    }),
    email_phone: Joi.string().required().messages({
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

export const saveAccountSchema = Joi.object<{
    email: string;
    phone: string;
    name: string;
}>({
    email: Joi.string().required().messages({
        'any.required': 'required',
        'string.base': 'required',
        'string.empty': 'required',
    }),
    phone: Joi.string().required().messages({
        'any.required': 'required',
        'string.base': 'required',
        'string.empty': 'required',
    }),
    name: Joi.string().required().messages({
        'any.required': 'required',
        'string.base': 'required',
        'string.empty': 'required',
    }),
})
    .options({
        abortEarly: false,
    })
    .unknown(true);
