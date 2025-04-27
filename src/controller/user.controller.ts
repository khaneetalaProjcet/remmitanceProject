import { AppDataSource } from "../data-source";
import { Request, Response,NextFunction } from "express";
import { User } from "../entity/User";
import { Invoice } from "../entity/Invoice";
import {BankAccount} from "../entity/BankAccount"
import { TelegramUser } from "../entity/TelegramUser";

import { responseModel } from "../utills/response.model";
import TelegramBot from 'node-telegram-bot-api';
import { runInThisContext } from "vm";
const token = process.env.TELEGRAM_BOT_TOKEN || "7622536105:AAFR0NDFR27rLDF270uuL5Ww_K0XZi61FCw";



export class UserController{
    private userRepository = AppDataSource.getRepository(User);
    private invoioceRepository=AppDataSource.getRepository(Invoice)
    private bankRepository=AppDataSource.getRepository(BankAccount)
    private telegramRepository=AppDataSource.getRepository(TelegramUser)
    private bot=new TelegramBot(token);
     
    async profile(req: Request, res: Response, next: NextFunction){
        try{
            const userId=req.user.id
          const user=await this.userRepository.findOne({where:{id:userId},relations:["bankAccounts","telegram"]})
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


    async deleteUser(req: Request, res: Response, next: NextFunction){
      const phone=req.params.phone
      const user=await this.userRepository.findOne({where:{phoneNumber:phone},relations:["bankAccounts","telegram","sells","buys"]})
      if(!user){
        return  next(new responseModel(req, res,"کاربر وجود ندارد",'profile', 402,"کاربر وجود ندارد",user))
      }
      await  this.invoioceRepository.remove(user.sells)
      await  this.invoioceRepository.remove(user.buys)
      await this.bankRepository.remove(user.bankAccounts)
      await this.telegramRepository.remove(user.telegram)
      await this.userRepository.remove(user)
   
      return  next(new responseModel(req, res,"deleteUser",'profile', 200,"deleteUser",user))

    }
     

     

    

    

}