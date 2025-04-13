import { body, validationResult } from 'express-validator';


export const phoneAndNationalAndBirthDate=[
    body('nationalCode').notEmpty().isString().withMessage('شماره ملی الزامی میباشد'),
    body('birthDate').notEmpty().isString().withMessage('تاریخ تولد الزامی میباشد'),
]






