import { AppDataSource } from "../data-source";
import { Request, Response,NextFunction } from "express";
import { User } from "../entity/User";
import { responseModel } from "../utills/response.model";
import TelegramBot from 'node-telegram-bot-api';
const token = process.env.TELEGRAM_BOT_TOKEN;



export class UserController{
    private userRepository = AppDataSource.getRepository(User);
    private bot=new TelegramBot(token);
     
    async profile(req: Request, res: Response, next: NextFunction){
        try{
            const userId=req.user.id
          const user=await this.userRepository.findOne({where:{id:userId},relations:["bankAccounts"]})
          if(!user){
            return  next(new responseModel(req, res,"کاربر وجود ندارد",'profile', 402,"کاربر وجود ندارد",user))
          }
          return  next(new responseModel(req, res,null,'profile', 200,null,user))
        }catch(err){
            return next(new responseModel(req, res,"خطای داخلی سیستم",'send otp', 500,"خطای داخلی سیستم",null))
        }
          
    }

    async sendMessageToUserInTelegram(req: Request, res: Response, next: NextFunction){
      const message=req.body.message
      const userId=req.body.userId
      const user=await this.userRepository.findOneBy({id:userId})
      // const chatId=parseInt(user.telegramChatId)
      // this.bot.sendMessage(chatId,message)
      return  next(new responseModel(req, res,null,'telegram ', 200,null,user))
    }

     

    

    

}