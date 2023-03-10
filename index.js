const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const cors = require('cors');

const webAppUrl = "https://telegram-bot-web-app-client.netlify.app" 
const token = "6130405633:AAGbXJb9YN4RGqwb2PjrX8hEPoT6iObcheQ";

const bot = new TelegramBot(token, {polling: true});

const app = express();
app.use(express.json());
app.use(cors());

bot.on("message", async (message) => {
    const chatId = message.chat.id;
    const text = message.text;

    if (text === "/start") {
        await bot.sendMessage(chatId, "There is button 'fill form' below", {
            reply_markup: {
                keyboard: [
                    [{text: "Fill form", web_app: {url: webAppUrl + "/form"}}]
                ]
            }
        })

        await bot.sendMessage(chatId, "There is button 'fill form' below", {
            reply_markup: {
                inline_keyboard: [
                    [{text: "Make order", web_app: {url: webAppUrl}}]
                ]
            }
        })
    }

    if (message?.web_app_data?.data) {
        try {
            const data = JSON.parse(message.web_app_data.data)

            await bot.sendMessage(chatId, "Thanks for the order")
            await bot.sendMessage(chatId, `Your country: ${data.country}. Your street: ${data.street}`)

            setTimeout(async () => {
                await bot.sendMessage(chatId, "Check all info in menu button")
            }, 2000)
        } catch (error) {
            console.log(error);
        }
    }
})

app.post("/web-data", async (req, res) => {
    const {queryId, products, totalPrice} = req.body
    try {
        await bot.answerWebAppQuery(queryId, {
            type: "article",
            id: queryId,
            title: "Your order",
            input_message_content: {
                message_text: `You bought products on ${totalPrice}`
            }
        })
        return res.status(200).json({})
    } catch (error) {
        console.log(error);
        await bot.answerWebAppQuery(queryId, {
            type: "article",
            id: queryId,
            title: "Error",
            input_message_content: {
                message_text: "Could not bought the products"
            }
        })
        return res.status(500).json({})
    }
})

const PORT = 8000
app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`)
})