import * as Joi from 'joi';

export const loginSchema = Joi.object<{
    username: string;
    password: string;
}>({
    username: Joi.string().required().messages({
        'any.required': 'required',
        'string.base': 'required',
        'string.empty': 'required',
    }),
    password: Joi.string().required().messages({
        'any.required': 'required',
        'string.base': 'required',
        'string.empty': 'required',
    }),
})
    .options({
        abortEarly: false,
    })
    .unknown(true);
