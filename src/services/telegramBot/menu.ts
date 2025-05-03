

// منوی اصلی پس از احراز هویت
export function showMainMenu(bot:any, chatId :number,message :string) {
  const options = {
    reply_markup: {
      keyboard: [
        ['گرفتن مظنه امروز'],
        ['ثبت معاملات'],
        ['پرداخت و دریافت', 'مقدار اعتبار'],
      ],
      resize_keyboard: true,
      
    },
    parse_mode:"HTML"
  };
  bot.sendMessage(chatId, message, options);
}

// منوی مظنه
export function showPricingMenu(bot:any, chatId:number,sellPrice:number,buyPrice:number) {

  bot.sendMessage(chatId,` مظنه خرید: ${buyPrice.toLocaleString()} تومان\nمظنه فروش: ${sellPrice.toLocaleString()} تومان`, {
    reply_markup: {
      keyboard: [['بازگشت']],
      resize_keyboard: true
    }
  });
}

// منوی بعد از ثبت خرید/فروش برای تایید
export function showAfterTradeMenu(bot:any, chatId:any) {
  bot.sendMessage(chatId, 'آیا مایل به ثبت نهایی معامله هستید؟', {
    reply_markup: {
      keyboard: [['تایید نهایی', 'لغو معامله'], ['بازگشت']],
      resize_keyboard: true
    }
  });
}

export function clearMenu(bot, chatId, message ) {
  bot.sendMessage(chatId, message, {
    reply_markup: {
      remove_keyboard: true
    }
  });
}

