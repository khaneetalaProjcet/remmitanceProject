
import TelegramBot from 'node-telegram-bot-api'
const { showMainMenu , showPricingMenu , showAfterTradeMenu} = require('./menu');
import { goldPriceService } from '../goldPrice.service';
import { handleAuth }  from "./handelers/authHandeler" 
import { Invoice } from '../../entity/Invoice';
import { Actions } from '../../entity/Actions';
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
bot.on('callback_query',async (query) => {
  const invoiceRepository=AppDataSource.getRepository(Invoice)
  const userRepository=AppDataSource.getRepository(User)
  const actionRepository=AppDataSource.getRepository(Actions)

  const chatId = query.message.chat.id;
  const data = query.data;
  const time= new Date().toLocaleString('fa-IR').split(',')[1]
  const date= new Date().toLocaleString('fa-IR').split(',')[0]
  console.log("here");
  console.log("data",data);
  

  if (data.startsWith('user-yes:')) {
    const id = parseFloat(data.split(':')[1]);
    await bot.answerCallbackQuery(query.id);
    const invoice=await invoiceRepository.findOne({where:{id},relations:{seller:true,buyer:true}})
    
    if(invoice.status!=1){
        const message="درخواست نامعتبر"
        bot.sendMessage(chatId,message)
        return ;
    }

   
    
    const user=invoice.type==0?invoice.seller:invoice.buyer
    const newAction=actionRepository.create({user:user,fromStatus:1,toStatus:2,date,time,type:1,invoice})
    invoice.panelTabel=1
    invoice.status=2
    await invoiceRepository.save(invoice)
    await actionRepository.save(newAction)
    
   const message='درخواست شما تایید شد و پس در وضعیت بررسی ادمین قرار گرفت'

   bot.sendMessage(chatId,message)

   return ;

  }

  if (data.startsWith('user-cancel:')) {
    const id = data.split(':')[1];
    await bot.answerCallbackQuery(query.id);
    const invoice=await invoiceRepository.findOne({where:{id},relations:{seller:true,buyer:true}})

    if(invoice.status!=1){
      const message="درخواست نامعتبر"
      bot.sendMessage(chatId,message)
      return ;
  }

  const user=invoice.type==0?invoice.seller:invoice.buyer
  const newAction=actionRepository.create({user:user,fromStatus:1,toStatus:3,date,time,type:1,invoice})
  invoice.status=3
  await invoiceRepository.save(invoice)
  await actionRepository.save(newAction)

  const message='درخواست شما لفو شد'

   bot.sendMessage(chatId,message)

   return ;

  }





  if (data.startsWith('bank-ok:')) {
    const id = data.split(':')[1];
    await bot.answerCallbackQuery(query.id);
    const invoice=await invoiceRepository.findOne({where:{id},relations:{seller:{wallet:true}}})
    const systemUser=await userRepository.findOne({where:{isSystemUser:true},relations:["wallet"]})
    const sellerBalance = parseFloat(invoice.seller.wallet.balance.toString());
    const systemUserBalance = parseFloat(systemUser.wallet.balance.toString());
    const invoiceTotalPrice = parseFloat(invoice.totalPrice.toString());


    if(invoice.status!=5){
      const message="درخواست نامعتبر"
      bot.sendMessage(chatId,message)
      return ;
  }
   
  
   systemUser.wallet.balance = Math.round(systemUserBalance - invoiceTotalPrice);
   invoice.seller.wallet.balance = Math.round(sellerBalance + invoiceTotalPrice);
   const user=invoice.type==0?invoice.seller:invoice.buyer
   const newAction=actionRepository.create({user:user,fromStatus:5,toStatus:7,date,time,type:1,invoice})
   invoice.status=7
   await invoiceRepository.save(invoice.seller.wallet)
   await invoiceRepository.save(invoice)
   await actionRepository.save(newAction)
   await userRepository.save(systemUser.wallet)

   const message='اظلاعات بانکی شما دریافت شد و تا ساعاتی اینده برای شما واریز می شود'

   bot.sendMessage(chatId,message)

   return ;

  }

  if (data.startsWith('bank-nok:')) {
    const id = data.split(':')[1];
    await bot.answerCallbackQuery(query.id);
    const invoice=await invoiceRepository.findOne({where:{id}})

    if(invoice.status!=5){
      const message="درخواست نامعتبر"
      bot.sendMessage(chatId,message)
      return ;
  }

   invoice.bankAccount=null
   invoice.status=6
   const user=invoice.type==0?invoice.seller:invoice.buyer
   const newAction=actionRepository.create({user:user,fromStatus:5,toStatus:6,date,time,type:1,invoice})
   await invoiceRepository.save(invoice)
   await actionRepository.save(newAction)
   const message='برای ویرایش اطلاعات با شما تماس گرفته خواهد شد'

   bot.sendMessage(chatId,message)

   return ;

  }

});