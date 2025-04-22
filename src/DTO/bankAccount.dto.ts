
import { body, validationResult } from 'express-validator';

export const CreateBankAccount = [
    body('cardNumber').isString().notEmpty().withMessage('ورودی نامعتبر است'),
]


export const CreateAppBankAccount = [
    body('cardNumber').isString().notEmpty().withMessage('ورودی نامعتبر است'),
    body('shebaNumber').isString().notEmpty().withMessage('ورودی نامعتبر است'),
    body('name').isString().notEmpty().withMessage('ورودی نامعتبر است'),
    body('ownerName').isString().notEmpty().withMessage('ورودی نامعتبر است'),
]

    