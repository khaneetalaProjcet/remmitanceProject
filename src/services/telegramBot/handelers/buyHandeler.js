const { showAfterTradeMenu } = require('../menu');



function handleBuyFlow(bot, msg) {
  const chatId = msg.chat.id;
  const text = msg.text;
  let user = store.getUser(chatId);

  // اگر در مرحله وارد کردن مقدار طلا هستیم
  if (user.state === 'awaiting_buy_amount_gram') {
    const amount = parseFloat(text);
    if (isNaN(amount) || amount <= 0) {
      bot.sendMessage(chatId, 'لطفاً یک عدد معتبر وارد کن.');
    } else {
      const total = amount * buyPrice;
      user.lastTrade = { type: 'buy', basedOn: 'gram', amount, unitPrice: buyPrice, total };
      bot.sendMessage(chatId,` مبلغ قابل پرداخت: ${total.toLocaleString()} تومان`);
      showAfterTradeMenu(bot, chatId);
    }
  }

  if (user.state === 'awaiting_buy_amount_toman') {
    const amount = parseFloat(text);
    if (isNaN(amount) || amount <= 0) {
      bot.sendMessage(chatId, 'لطفاً یک عدد معتبر وارد کن.');
    } else {
      const gram = amount / buyPrice;
      user.lastTrade = { type: 'buy', basedOn: 'toman', amount: gram, unitPrice: buyPrice, total: amount };
      bot.sendMessage(chatId,` مقدار طلای قابل خرید: ${gram.toFixed(3)} گرم`);
      showAfterTradeMenu(bot, chatId);
    }
  }
}

module.exports = { handleBuyFlow };