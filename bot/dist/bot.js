import { Telegraf } from 'telegraf';
import dotenv from 'dotenv';
import axios from 'axios';
dotenv.config();
const bot = new Telegraf(process.env.BOT_TOKEN || '');
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';
const WEB_APP_URL = process.env.WEB_APP_URL || 'http://localhost:3000';
bot.start(async (ctx) => {
    const { id, first_name, username } = ctx.from;
    try {
        // Register or update user in backend
        await axios.post(`${BACKEND_URL}/users`, {
            telegramId: id.toString(),
            username: username || first_name,
            role: 'PROMOTER' // Default role
        });
        ctx.reply('歡迎來到 FLOWGROW —— 讓美被看見，流量變現更簡單！', {
            reply_markup: {
                inline_keyboard: [
                    [{ text: '開啟 FLOWGROW App', web_app: { url: WEB_APP_URL } }]
                ]
            }
        });
    }
    catch (error) {
        console.error('Registration error:', error);
        ctx.reply('暫時無法連接到伺服器，請稍後再試。');
    }
});
bot.launch().then(() => {
    console.log('FLOWLO Telegram Bot is running...');
});
// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
//# sourceMappingURL=bot.js.map