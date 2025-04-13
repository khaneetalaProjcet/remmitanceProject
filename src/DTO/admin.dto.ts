import { body, validationResult } from 'express-validator';


export const registerNewAdmin=[
    body('firstName').notEmpty().isString().withMessage('اسم اجباری است'),
    body('lastName').notEmpty().isString().withMessage('فامیلی اجباری است'),
    body('phoneNumber').notEmpty().isString().withMessage('شماره تلفن اشتباه است'),
    body('password').notEmpty().isString().withMessage('رمز اجباری است'),
]


export const loginAdmin=[
    body('phone').notEmpty().isString().withMessage('شماره تلفن نا معتبر'),
    body('password').notEmpty().isString().withMessage('رمز اجباری است'),
]



