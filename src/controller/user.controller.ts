import { AppDataSource } from "../data-source";
import { Request, Response,NextFunction } from "express";
import { User } from "../entity/User";
import { Invoice } from "../entity/Invoice";
import {BankAccount} from "../entity/BankAccount"
import { TelegramUser } from "../entity/TelegramUser";

import { responseModel } from "../utills/response.model";
import TelegramBot from 'node-telegram-bot-api';
import { runInThisContext } from "vm";
import { Wallet } from "../entity/Wallet";
import { ReturnDocument } from "typeorm";
import { CoinWallet } from "../entity/CoinWallet";
import { Actions } from "../entity/Actions";
import { Delivery } from "../entity/Delivery";
const token = process.env.TELEGRAM_BOT_TOKEN || "7622536105:AAFR0NDFR27rLDF270uuL5Ww_K0XZi61FCw";



export class UserController{
    private userRepository = AppDataSource.getRepository(User);
    private invoioceRepository=AppDataSource.getRepository(Invoice)
    private bankRepository=AppDataSource.getRepository(BankAccount)
    private telegramRepository=AppDataSource.getRepository(TelegramUser)
    private walletRepository=AppDataSource.getRepository(Wallet)
    private coinWalletRepository=AppDataSource.getRepository(CoinWallet)
    private actionRepository=AppDataSource.getRepository(Actions)
    private deliveryRepository=AppDataSource.getRepository(Delivery)

    private bot=new TelegramBot(token);
     
    async profile(req: Request, res: Response, next: NextFunction){
        try{
            const userId=req.user.id
          const user=await this.userRepository.findOne({where:{id:userId},relations:{wallet:{transactions:true,coins:{product:true}},telegram:true,bankAccounts:true}})
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
      const user=await this.userRepository.findOne({where:{phoneNumber:phone},relations:["bankAccounts","telegram","sells","buys","actions","transferdeliveries","deliveries"]})
      if(!user){
        return  next(new responseModel(req, res,"کاربر وجود ندارد",'profile', 402,"کاربر وجود ندارد",user))
      }
      try{
        await this.actionRepository.remove(user.actions)
        await this.deliveryRepository.remove(user.deliveries)
        await this.deliveryRepository.remove(user.transferdeliveries)
        await this.invoioceRepository.remove(user.sells)
        await this.invoioceRepository.remove(user.buys)
        await this.bankRepository.remove(user.bankAccounts)
        await this.telegramRepository.remove(user.telegram)
        await this.userRepository.remove(user)
        return  next(new responseModel(req, res,"deleteUser",'profile', 200,"deleteUser",user))
      }catch(err){
        console.log("err",err);
        return  next(new responseModel(req, res,null,'telegram ',500,null,null))
      }
     

    }
     
    async addWallet(req: Request, res: Response, next: NextFunction){
          const phone=req.params.phone
          const newWalet=this.walletRepository.create({goldWeight:0,balance:0})
          const user=await this.userRepository.findOne({where:{phoneNumber:phone}})
          user.wallet=newWalet
          await  this.userRepository.save(user)
          return  next(new responseModel(req, res,null,'profile', 200,null,user))

    }
    

     
    async createSystemUser(req: Request, res: Response, next: NextFunction){
         
      const systemUser=new User()
      systemUser.isSystemUser=true
      systemUser.phoneNumber="091211111111"
      const wallet =new Wallet()
      wallet.balance=10000000
      wallet.goldWeight=10000
      systemUser.wallet=wallet
      await this.userRepository.save(systemUser)

      return  next(new responseModel(req, res,null,'profile', 200,null,systemUser))
    
    }

    async deleteUSerWallrt(req: Request, res: Response, next: NextFunction){
      const users=await this.userRepository.find({relations:{wallet:{coins:true}}})


      for (let index = 0; index < users.length; index++) {
        const user = users[index];
        
        user.wallet.balance=0
        await this.coinWalletRepository.remove(user.wallet.coins)
        user.wallet.goldWeight=0

        await this.userRepository.save(user.wallet)


      
      }
      return  next(new responseModel(req, res,null,'telegram ', 200,null,null))
    }

    

}







