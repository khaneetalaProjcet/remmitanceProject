import { body, validationResult } from 'express-validator';


export const login=[
    body('otp').notEmpty().isString().withMessage('کد نامعتبر است'),
    body('phone').notEmpty().isString().withMessage('شماره تلفن نا معتبر'),
]


export const getOtp=[
    body('phone').notEmpty().isString().withMessage('شماره تلفن نا معتبر'),
]

export const refreshTokenCheck=[
    body('refreshToken').notEmpty().isString().withMessage('  توکن نا معتبر'),
]

export const logout=[
    body('refreshToken').notEmpty().isString().withMessage('  توکن نا معتبر'),
]



