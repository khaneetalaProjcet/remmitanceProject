import { Request, Response, NextFunction } from 'express';
import jwt,{ JwtPayload } from 'jsonwebtoken';
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
    console.log('token>>>')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No token provided' });
    }

    var token = req.headers.authorization.split(' ')[1];

    

    try {
        
        const secretKey = process.env.JWT_SECRET_KEY_USER  || "69b9381954141365ff7be95516f16c252edcb37eb39c7a42eaaf6184d93bccb2cscavdfvsdvsdvcsacvdc"; 
        const decoded = jwt.verify(token, secretKey) as JwtPayload;

      
        req.user = { id: decoded.id ,phoneNumber:decoded.phoneNumber , isBlocked:decoded.isBlocked  };

        console.log(decoded);
        

        next(); 

    } catch (error) {
        console.error(error);
         return next(new responseModel(req,res,"0","user",401,"کاربر اجازه دسترسی ندارد",null))
    }
};
export const authMiddlewareUserRefreshToken = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No token provided' });
    }

    var token = req.headers.authorization.split(' ')[1];

    console.log("tt",token);
    

    try {
        
        const secretKey = process.env.JWT_SECRET_KEY_USER_REFRESH || "69b9381954141365ff7be95516f16c252edcb37eb39c7a42eaaf6184d93bccb2cscavdfvsdvsdvcsacvdcsacascsacv12432r" ; 
        console.log("secretKey");
        
        const decoded = jwt.verify(token, secretKey) as JwtPayload;

        console.log("hereeeeeeeeeeeeeeeeeeeeeee",decoded);
        
        
      
        req.user = { id: decoded.id ,phoneNumber:decoded.phoneNumber , isBlocked:decoded.isBlocked  };

        console.log(decoded);

        next(); 

    } catch (error) {
        console.error(error);
         return next(new responseModel(req,res,"1","user",401,"کاربر اجازه دسترسی ندارد",null))
    }
};
export const authMiddlewareAdmin = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No token provided' });
    }
    console.log('token>>>>' , req.headers.authorization)

    var token = req.headers.authorization.split(' ')[1];
    console.log('token>>>>' , token)
    try {
        const secretKey = process.env.JWT_SECRET_KEY_ADMIN || "69b9381954141365ff7be95516f16c252edcb37eb39c7a42eaaf6184d93bccb2cscavdfvsdvsdv"; 
        const decoded = jwt.verify(token, secretKey) as JwtPayload;
        req.admin = { id: decoded.id ,firstName:decoded.firstName,lastName:decoded.lastName ,phoneNumber:decoded.phoneNumber,role:decoded.role , isBlocked:decoded.isBlocked };
        console.log(decoded);
        if(req.admin.isBlocked){
            return next(new responseModel(req,res,"اکانت شما غیر فعال می باشد","admin",401,"اکانت شما غیر فعال می باشد",null))
        }
        next(); 
    } catch (error) {
        console.error(error);
        return next(new responseModel(req,res,"کاربر اجازه دسترسی ندارد","admin",401,"کاربر اجازه دسترسی ندارد",null))
    }
};

