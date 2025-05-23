import { AppDataSource } from "../data-source";
import TelegramBot from 'node-telegram-bot-api';
import { TelegramUser } from "../entity/TelegramUser";
import { User } from "../entity/User";



const token = process.env.TELEGRAM_BOT_TOKEN || "7622536105:AAFR0NDFR27rLDF270uuL5Ww_K0XZi61FCw" ;
export class messageService{
   private telegramUserRepository=AppDataSource.getRepository(TelegramUser) 
   private userRepository=AppDataSource.getRepository(User) 
   private bot=new TelegramBot(token);


   async  sendMessage(message:string , userId: number){
     const telUser=await this.telegramUserRepository.findOne({where:{user:{id:userId}}})
     await this.bot.sendMessage(telUser.chatId,message)
   }
}