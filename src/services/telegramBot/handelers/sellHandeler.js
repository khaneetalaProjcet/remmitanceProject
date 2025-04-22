const { showAfterTradeMenu } = require('../menu');
const store = require('../storage/userStore');
const { sellPrice } = require('../constants');

function handleSellFlow(bot, msg) {
  const chatId = msg.chat.id;
  const text = msg.text;
  let user = store.getUser(chatId);

  // اگر در مرحله وارد کردن مقدار طلا هستیم (بر اساس گرم)
  if (user.state === 'awaiting_sell_amount_gram') {
    const amount = parseFloat(text);
    if (isNaN(amount) || amount <= 0) {
      bot.sendMessage(chatId, 'لطفاً یک عدد معتبر وارد کن.');
    } else {
      const total = amount * sellPrice;
      user.lastTrade = { type: 'sell', basedOn: 'gram', amount, unitPrice: sellPrice, total };
      bot.sendMessage(chatId,` مبلغ دریافتی شما: ${total.toLocaleString()} تومان`);
      showAfterTradeMenu(bot, chatId);
    }
  }

  // اگر در مرحله وارد کردن مقدار طلا هستیم (بر اساس تومان)
  if (user.state === 'awaiting_sell_amount_toman') {
    const amount = parseFloat(text);
    if (isNaN(amount) || amount <= 0) {
      bot.sendMessage(chatId, 'لطفاً یک عدد معتبر وارد کن.');
    } else {
      const gram = amount / sellPrice;
      user.lastTrade = { type: 'sell', basedOn: 'toman', amount: gram, unitPrice: sellPrice, total: amount };
      bot.sendMessage(chatId,` مقدار طلای قابل فروش: ${gram.toFixed(3)} گرم`);
      showAfterTradeMenu(bot, chatId);
    }
  }
}

module.exports = { handleSellFlow };