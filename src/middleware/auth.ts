import { Request, Response, NextFunction } from 'express';
import { JwtPayload } from 'jsonwebtoken';
import * as jwt from "jsonwebtoken"
import {jwtGeneratorInterfaceUser,jwtGeneratorInterfaceAdmin} from "../interface/interfaces.interface"
import {responseModel} from "../utills/response.model"



declare global {
    namespace Express {
        interface Request {
            user?:jwtGeneratorInterfaceUser,
            admin?:jwtGeneratorInterfaceAdmin
        }
    }
}  


export const authMiddlewareUser = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.replace('Bearer ', '');

    try {
        
        const secretKey = process.env.JWT_SECRET_KEY_User ; 
        const decoded = jwt.verify(token, secretKey) as JwtPayload;

      
        req.user = { id: decoded.id ,phoneNumber:decoded.phoneNumber , isBlocked:decoded.isBlocked  };

        console.log(decoded);
        

        next(); 

    } catch (error) {
        console.error(error);
         return next(new responseModel(req,res,"کاربر اجازه دسترسی ندارد","user",401,"کاربر اجازه دسترسی ندارد",null))
    }
};
export const authMiddlewareAdmin = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.replace('Bearer ', '');

    try {
        const secretKey = process.env.JWT_SECRET_KEY_Admin; 
        const decoded = jwt.verify(token, secretKey) as JwtPayload;
        req.admin = { id: decoded.id ,firstName:decoded.firstName,lastName:decoded.lastName ,phoneNumber:decoded.phoneNumber,role:decoded.role , isBlocked:decoded.isBlocked };
        console.log(decoded);
        next(); 

    } catch (error) {
        console.error(error);
        return next(new responseModel(req,res,"کاربر اجازه دسترسی ندارد","admin",401,"کاربر اجازه دسترسی ندارد",null))
    }
};

