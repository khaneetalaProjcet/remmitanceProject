import { body, validationResult } from 'express-validator';


export const setGoldPrice=[
    body('goldPrice').notEmpty().isString().withMessage('قیمت نامعتبر'),
]

export const setGoldPriceFee=[
    body('sellFee').notEmpty().isString().withMessage('کارمزد نامعتبر'),
    body('buyFee').notEmpty().isString().withMessage('کارمزد نامعتبر'),
]

