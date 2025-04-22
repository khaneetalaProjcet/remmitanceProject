import {AppDataSource} from "../../../data-source"
import { User } from "../../../entity/User";
import { TelegramUser } from "../../../entity/TelegramUser";
const { showMainMenu ,clearMenu } = require('../menu');

export async function  handleAuth(bot, msg) {
  const userRepository=AppDataSource.getRepository(User)
  const telegramUserRepository=AppDataSource.getRepository(TelegramUser)
  const chatId = msg.chat.id;
  const text = msg.text;
  const telUser=await telegramUserRepository.findOne({where:{chatId}})

  if(text=="/start"){
    if(!telUser){
      const newTelUser=telegramUserRepository.create({chatId})
      telegramUserRepository.save(newTelUser)
    }
    await clearMenu(bot,chatId,'خوش آمدید! لطفا شماره تلفن خود را وارد کنید:')
    return;
  }
  

  if (!telUser) {
    // ایجاد پروفایل اولیه
    const newTelUser=telegramUserRepository.create({chatId})
    telegramUserRepository.save(newTelUser)
    // bot.sendMessage(chatId, ' لطفا شماره تلفن خود را وارد کنید');
    await clearMenu(bot,chatId,' لطفا شماره تلفن خود را وارد کنید')
    return;
  }

  switch (telUser.authState) {
    case "awaiting_phone":
      // store.updateUser(chatId, { phone: text, state: 'authenticated' });
      const result=validatinPhoneNumber(text)
      if(!result.isValidate){
        bot.sendMessage(chatId, 'فرمت شماره تلفن اشتباه است');
        break;
      }

      

      const user=await userRepository.findOne({where:{phoneNumber:result.phone}})
      
      if(!user){
        bot.sendMessage(chatId, 'لطفا اول در سایت ثبت نام کنید');
        break;
      }
      if(user.verificationStatus==0){
        bot.sendMessage(chatId, 'لطفا ثبت نام خود را در سایت کامل کنید');
        break;
      }
      if(user.verificationStatus==1){
        bot.sendMessage(chatId, 'کاربر گرامی در خواست تکمیل ثبت نام شما در حال بررسی می باشد');
        break;
      }
      if(user.verificationStatus==3){
        bot.sendMessage(chatId, 'کاربر گرامی در خواست تکمیل ثبت نام شما رد شده است');
        break;
      }

      
      telUser.user=user
      telUser.authState='authenticated' 
      telUser.state="in_main_menue"
      await telegramUserRepository.save(telUser)
      await userRepository.save(user)

      await bot.sendMessage(chatId, 'احراز هویت با موفقیت انجام شد.');
      showMainMenu(bot, chatId,'برات چه کاری انجام بدم');
      break;

    default:
      clearMenu(bot,chatId)
      break;
  }
}


const validatinPhoneNumber=(text:string) =>{
  const phone=convertPersianToEnglish(text)
   console.log("phone",phone);  
   
  if(phone.length!=11){
     return {isValidate:false,phone}
  }
  if(phone.split("")[0]!="0"&&phone.split("")[0]!="1"){
    return {isValidate:false,phone}
  }

  return {isValidate:true,phone}
}

const convertPersianToEnglish = (dateStr : string) => {
  const persianToEnglishMap = {
      '۰': '0',
      '۱': '1',
      '۲': '2',
      '۳': '3',
      '۴': '4',
      '۵': '5',
      '۶': '6',
      '۷': '7',
      '۸': '8',
      '۹': '9'
  };

  return dateStr.replace(/[۰-۹]/g, (char) => persianToEnglishMap[char]);
};

