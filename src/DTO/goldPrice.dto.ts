import { body, validationResult } from 'express-validator';


export const setGoldPrice=[
    body('goldPrice').notEmpty().isString().withMessage('قیمت نامعتبر'),
]