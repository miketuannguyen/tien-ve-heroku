import * as Joi from 'joi';

export const createSchema = Joi.object<{
    address: string;
    phone: string;
    body: string;
    send_date: number;
    receive_date: number;
}>({
    address: Joi.string().required().messages({
        'any.required': 'required',
        'string.base': 'required',
        'string.empty': 'required',
    }),
    phone: Joi.string().required().messages({
        'any.required': 'required',
        'string.base': 'required',
        'string.empty': 'required',
    }),
    body: Joi.string().required().messages({
        'any.required': 'required',
        'string.base': 'required',
        'string.empty': 'required',
    }),
    send_date: Joi.number().required().messages({
        'any.required': 'required',
        'number.base': 'required',
    }),
    receive_date: Joi.number().required().messages({
        'any.required': 'required',
        'number.base': 'required',
    }),
})
    .options({
        abortEarly: false,
    })
    .unknown(true);
