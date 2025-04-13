import { AppDataSource } from "../data-source";
import { Request, Response,NextFunction } from "express";
import { User } from "../entity/User";
import { responseModel } from "../utills/response.model";



export class UserController{
    private userRepository = AppDataSource.getRepository(User);

    async profile(req: Request, res: Response, next: NextFunction){
        try{
            const userId=req.user.id
          const user=await this.userRepository.findOne({where:{id:userId}})
          if(!user){
            return  next(new responseModel(req, res,"کاربر وجود ندارد",'profile', 402,"کاربر وجود ندارد",user))
          }
          return  next(new responseModel(req, res,null,'profile', 200,null,user))
        }catch(err){
            return next(new responseModel(req, res,"خطای داخلی سیستم",'send otp', 500,"خطای داخلی سیستم",null))
        }
          
    }

}