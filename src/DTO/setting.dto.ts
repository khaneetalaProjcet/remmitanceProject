import { body ,} from 'express-validator';

export const invoiceBody = [
    body('maxTradeSell').isNumeric().withMessage('ورودی نامعتبر است'),
    body('minTradeSell').isNumeric().withMessage('ورودی نامعتبر است'),
    body('maxTradeBuy').isNumeric().withMessage('ورودی نامعتبر است'),
    body('minTradeBuy').isNumeric().withMessage('ورودی نامعتبر است'),
    body('offerTolerance').isNumeric().withMessage('ورودی نامعتبر است'),
    body('expireTime').isNumeric().withMessage('ورودی نامعتبر است'),
    body('tradeIsOpen').isBoolean().withMessage('ورودی نامعتبر است')

]