import { body, validationResult } from 'express-validator';


export const login=[
    body('otp').notEmpty().isString().withMessage('کد نامعتبر است'),
    body('phone').notEmpty().isString().withMessage('شماره تلفن نا معتبر'),
]


export const getOtp=[
    body('phone').notEmpty().isString().withMessage('شماره تلفن نا معتبر'),
]



