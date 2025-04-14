import { body } from 'express-validator';

const InvoiceType = {
    SELL: 0,
    BUY: 1,
   
};

export const invoiceBody = [
    body('type').notEmpty().isIn([InvoiceType.SELL, InvoiceType.BUY]).withMessage('ورودی نامعتبر است'),
    body('goldWeight').notEmpty().withMessage('ورودی نامعتبر است'),
    body('goldPrice').notEmpty().withMessage('ورودی نامعتبر است'),
    body('totalPrice').notEmpty().withMessage('ورودی نامعتبر است'),
]