// server.ts
import express from 'express';
import cors from 'cors';
import axios from 'axios';

const app = express();
const PORT = 3000;

// Middlewares
app.use(express.json());
app.use(cors({
    origin: '*', // Разрешаем все источники (для тестирования)
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

const TELEGRAM_BOT_TOKEN = '8542901647:AAEUZYbviyxzRQka6BHjQQGnjV237AUCIiM';
const TELEGRAM_CHAT_ID = '740359458';

// API endpoint для отправки сообщений
app.post('/send-message', async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) return res.status(400).json({ error: 'Сообщение не указано' });

        const response = await axios.post(
            `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
            {
                chat_id: TELEGRAM_CHAT_ID,
                text: message
            }
        );

        res.json({ success: true, response: response.data });
    } catch (error: any) {
        console.error('Ошибка отправки в Telegram:', error.message);
        res.status(500).json({ error: 'Ошибка отправки сообщения' });
    }
});

app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});
