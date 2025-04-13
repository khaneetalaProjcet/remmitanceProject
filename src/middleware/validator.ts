import { body } from 'express-validator';

export const validatorCreateCategoryBody = [
    body('name').notEmpty().isString().withMessage('name is required'),
    body('description').notEmpty().isString().withMessage('description is required'),
];
export const validatorUpdateCategoryBody = [
    body('name').optional().notEmpty().isString().withMessage('name is required'),
    body('description').optional().notEmpty().isString().withMessage('description is required'),
];

export const validatorCreateProductBody = [
    body('name')
        .isString()
        .withMessage('Name must be a string')
        .notEmpty()
        .withMessage('Name is required'),

    body('description')
        .isString()
        .withMessage('Description must be a string')
        .notEmpty()
        .withMessage('Description is required'),

    body('wage')
        .isNumeric()
        .withMessage('Wage must be a number')
        .notEmpty()
        .withMessage('Wage is required'),

    body('brand')
        .isString()
        .withMessage('Brand must be a string')
        .notEmpty()
        .withMessage('Brand is required'),

    body('mainPhoto')
        .isString()
        .withMessage('Main photo must be a string')
        .notEmpty()
        .withMessage('Main photo is required'),

    body('photos')
        .isArray()
        .withMessage('Photos must be an array')
        .optional(),

    body('features')
        .isArray()
        .withMessage('Features must a string ')
        .custom((value) => {
            return value.every((item: string) => 
                 typeof item == "string"
            );
        })
        .withMessage('Each feature must have a key and value'),
    body('categoryId')
        .isNumeric()
        .withMessage('Category ID must be a number')
        .notEmpty()
        .withMessage('Category ID is required'),
];

export const validatorUpdateProductBody= [
    body('name')
        .optional()
        .isString()
        .withMessage('Name must be a string'),

    body('description')
        .optional()
        .isString()
        .withMessage('Description must be a string'),

    body('wage')
        .optional()
        .isNumeric()
        .withMessage('Wage must be a number'),

    body('brand')
        .optional()
        .isString()
        .withMessage('Brand must be a string'),

    body('mainPhoto')
        .optional()
        .isString()
        .withMessage('Main photo must be a string'),

    body('photos')
        .optional()
        .isArray()
        .withMessage('Photos must be an array'),

    body('isExist')
        .optional()
        .isBoolean()
        .withMessage('isExist must be a boolean'),


    body('features')
        .optional()
        .isArray()
        .withMessage('Features must be an array of objects')
        .custom((value) => {
            return value.every((item: string) => 
                 typeof item == "string"
            );
        })
        .withMessage('Each feature must have a key and value'),
    body('categoryId')
        .optional()
        .isNumeric()
        .withMessage('Category ID must be a number'),
];

export const validatorCreateProductItem=[
    body('items')
    .isArray()
    .withMessage('Items must be an array of objects')
    .optional()
    .custom((value) => {
        return value.every((item: any) => 
            item.size && item.wight && item.count
        );
    })
    .withMessage('Each feature must have a key and value'),
] 

export const validatorUpdateProductItem=[
    body('size')
    .optional()
    .isString()
    .withMessage('size is string'),

    body('wight')
    .optional()
    .isNumeric()
    .withMessage("wight is number"),

    body('count')
    .optional()
    .isNumeric()
    .withMessage("count is number")

] 