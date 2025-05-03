
import TelegramBot from 'node-telegram-bot-api'
const { showMainMenu , showPricingMenu , showAfterTradeMenu} = require('./menu');
import { goldPriceService } from '../goldPrice.service';
import { handleAuth }  from "./handelers/authHandeler" 
// const { handleBuyFlow } = require('./handlers/buyHandler');
// const { handleSellFlow } = require('./handlers/sellHandler');
// const { handleConfirm } = require('./handlers/confirmHandler');
import {AppDataSource} from "./../../data-source"
import { User } from "./../../entity/User";
import { TelegramUser } from "./../../entity/TelegramUser";

const token = process.env.TELEGRAM_BOT_TOKEN || "7622536105:AAFR0NDFR27rLDF270uuL5Ww_K0XZi61FCw";
const bot = new TelegramBot(token, { polling: true });

// پیام‌های ورودی
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;
  const telegramUserRepository=AppDataSource.getRepository(TelegramUser)
  const telUser=await telegramUserRepository.findOne({where:{chatId}})
  
  // ثبت‌نام اولیه
  if (!telUser||telUser.authState!=='authenticated') {
    console.log("here");
    console.log("salam");

    
    
    return handleAuth(bot, msg);
  }

  // احراز هویت کامل انجام شده
  
  if (telUser.authState === 'authenticated') {
    // منوهای اصلی
    switch (text) {
      case 'گرفتن مظنه امروز':
         
        const priceService=new goldPriceService()
        const prices=await priceService.getGoldPrice()
        const sellPrice=prices.sellPrice
        const buyPrice=prices.buyPrice
        showPricingMenu(bot,chatId,sellPrice,buyPrice)
        break;
      case 'ثبت معاملات':
        bot.sendMessage(chatId, 'نوع معامله را انتخاب کن:', {
          reply_markup: {
            keyboard: [['ثبت خرید', 'ثبت فروش'], ['بازگشت']],
            resize_keyboard: true
          }
        });
        break;
      case 'بازگشت':
        showMainMenu(bot, chatId, 'بازگشت به منوی اصلی');
        break;
      default:
        // handleBuyFlow(bot, msg);
        // handleSellFlow(bot, msg);
        // handleConfirm(bot, msg);
        showMainMenu(bot, chatId,'برات چه کاری انجام بدم');
        break;
    }
  } else {
    // هنوز احراز هویت نشده
    handleAuth(bot, msg);
  }


  


});
bot.on('callback_query', (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;

  console.log("here");
  console.log("data",data);
  

  if (data.startsWith('user-yes:')) {
    const id = parseFloat(data.split(':')[1]);
    bot.sendMessage(chatId,`id:${id}`);
  }

  if (data.startsWith('user-cancel:')) {
    const id = data.split(':')[1];
    bot.sendMessage(chatId,`id:${id}`);
  }
});