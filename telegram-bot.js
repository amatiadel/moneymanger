const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

// Bot configuration
const BOT_TOKEN = '8432533152:AAH7siLTo-nTsna7TiBYM9ZMiIjgngD0bFc';
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';

// Create bot instance
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// User states for conversation flow
const userStates = new Map();

// Categories from your budget data
const categories = {
    expense: [
        'ипотека', 'продукты', 'транспорт', 'доставка продуктов', 'доставка готовой еды',
        'коммуналка', 'интернет', 'сотовая связь', 'куркур', 'машина', 'заправка',
        'маркетплейсы', 'аптека', 'врачи', 'документы', 'развлечения', 'продукты для баловства',
        'подарки', 'одежда', 'подписки', 'бытовое для дома', 'косметика', 'Зсд',
        'кафе', 'рестораны', 'автокредит', 'кредитная карта', 'кладовка', 'учебный кредит', 'Красота'
    ],
    income: [
        'ЗП Адель', 'ЗП Кристина', 'Tax refund', 'родители Кристины', 'Other',
        'доставка', 'подарки', 'ps5', 'кап'
    ]
};

// Helper function to create inline keyboard from categories
function createCategoryKeyboard(categoryList, type) {
    const keyboard = [];
    const buttonsPerRow = 2;
    
    for (let i = 0; i < categoryList.length; i += buttonsPerRow) {
        const row = [];
        for (let j = 0; j < buttonsPerRow && i + j < categoryList.length; j++) {
            const category = categoryList[i + j];
            row.push({
                text: category,
                callback_data: `${type}_${category}`
            });
        }
        keyboard.push(row);
    }
    
    return {
        reply_markup: {
            inline_keyboard: keyboard
        }
    };
}

// Helper function to save data to API
async function saveToAPI(type, data) {
    try {
        // Convert type to plural form for API endpoints
        const endpoint = type === 'expense' ? 'expenses' : 'income';
        const response = await axios.post(`${API_BASE_URL}/api/${endpoint}`, data);
        return response.data;
    } catch (error) {
        console.error(`Error saving ${type}:`, error.message);
        throw error;
    }
}

// Helper function to format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB'
    }).format(amount);
}

// Start command handler
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const welcomeMessage = `✨ Добро пожаловать, Адель и Кристина! ✨

Этот бот поможет вам вместе планировать бюджет, чтобы мечта о новом доме 🏡, машине 🚗 и путешествиях ✈️ стала реальностью.

Вместе вы справитесь с любой целью! 💖`;

    const keyboard = {
        reply_markup: {
            inline_keyboard: [[
                {
                    text: '➕ Добавить запись',
                    callback_data: 'add_entry'
                }
            ]]
        }
    };

    bot.sendMessage(chatId, welcomeMessage, keyboard);
});

// Add command handler
bot.onText(/\/add/, (msg) => {
    const chatId = msg.chat.id;
    const message = `🏡🚗✈️ Что запишем в наш общий бюджет, Адель и Кристина? 💖`;

    const keyboard = {
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: '🛒 Расходы',
                        callback_data: 'type_expense'
                    },
                    {
                        text: '💰 Доходы',
                        callback_data: 'type_income'
                    }
                ]
            ]
        }
    };

    bot.sendMessage(chatId, message, keyboard);
});

// Skip command handler
bot.onText(/\/skip/, (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    
    const userState = userStates.get(userId);
    if (userState && userState.step === 'description') {
        userState.description = '';
        userState.step = 'save';
        userStates.set(userId, userState);
        
        // Process the entry
        processEntry(chatId, userId, userState);
    }
});

// Callback query handler
bot.on('callback_query', async (callbackQuery) => {
    const message = callbackQuery.message;
    const chatId = message.chat.id;
    const userId = callbackQuery.from.id;
    const data = callbackQuery.data;

    try {
        if (data === 'add_entry') {
            const messageText = `🏡🚗✈️ Что запишем в наш общий бюджет, Адель и Кристина? 💖`;

            const keyboard = {
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: '🛒 Расходы',
                                callback_data: 'type_expense'
                            },
                            {
                                text: '💰 Доходы',
                                callback_data: 'type_income'
                            }
                        ]
                    ]
                }
            };

            await bot.editMessageText(messageText, {
                chat_id: chatId,
                message_id: message.message_id,
                ...keyboard
            });
        }
        else if (data.startsWith('type_')) {
            const type = data.split('_')[1];
            const userState = {
                type: type,
                step: 'category',
                userId: userId
            };
            userStates.set(userId, userState);

            const categoryList = categories[type];
            const keyboard = createCategoryKeyboard(categoryList, type);

            await bot.editMessageText(`📁 Выберите категорию для ${type === 'expense' ? 'расхода' : 'дохода'}:`, {
                chat_id: chatId,
                message_id: message.message_id,
                ...keyboard
            });
        }
        else if (data.startsWith('expense_') || data.startsWith('income_')) {
            const [type, category] = data.split('_', 2);
            const userState = userStates.get(userId);
            
            if (userState) {
                userState.category = category;
                userState.step = 'amount';
                userStates.set(userId, userState);

                await bot.editMessageText(`💰 Сколько запишем?`, {
                    chat_id: chatId,
                    message_id: message.message_id
                });
            }
        }

        // Answer the callback query
        await bot.answerCallbackQuery(callbackQuery.id);
    } catch (error) {
        console.error('Error handling callback query:', error);
        
        // If it's a message edit error, send a new message instead
        if (error.code === 'ETELEGRAM' && error.response && error.response.body && 
            error.response.body.description && error.response.body.description.includes('message to edit not found')) {
            try {
                const messageText = `🏡🚗✈️ Что запишем в наш общий бюджет, Адель и Кристина? 💖`;
                const keyboard = {
                    reply_markup: {
                        inline_keyboard: [
                            [
                                {
                                    text: '🛒 Расходы',
                                    callback_data: 'type_expense'
                                },
                                {
                                    text: '💰 Доходы',
                                    callback_data: 'type_income'
                                }
                            ]
                        ]
                    }
                };
                await bot.sendMessage(chatId, messageText, keyboard);
            } catch (sendError) {
                console.error('Error sending new message:', sendError);
            }
        }
        
        await bot.answerCallbackQuery(callbackQuery.id, { text: 'Произошла ошибка. Попробуйте еще раз.' });
    }
});

// Message handler for amount and description
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const text = msg.text;

    // Skip if it's a command
    if (text.startsWith('/')) {
        return;
    }

    const userState = userStates.get(userId);
    if (!userState) {
        return;
    }

    try {
        if (userState.step === 'amount') {
            const amount = parseFloat(text.replace(',', '.'));
            
            if (isNaN(amount) || amount <= 0) {
                await bot.sendMessage(chatId, '❌ Пожалуйста, введите корректную сумму (например: 1000 или 1000.50)');
                return;
            }

            userState.amount = amount;
            userState.step = 'description';
            userStates.set(userId, userState);

            await bot.sendMessage(chatId, `💬 Введите описание (по желанию):\nили нажмите /skip, чтобы пропустить ✨`);
        }
        else if (userState.step === 'description') {
            userState.description = text;
            userState.step = 'save';
            userStates.set(userId, userState);

            // Process the entry
            await processEntry(chatId, userId, userState);
        }
    } catch (error) {
        console.error('Error handling message:', error);
        await bot.sendMessage(chatId, '❌ Произошла ошибка. Попробуйте еще раз.');
    }
});

// Process and save entry
async function processEntry(chatId, userId, userState) {
    try {
        const entryData = {
            date: new Date().toISOString().split('T')[0],
            category: userState.category,
            description: userState.description || '',
            amount: userState.amount
        };

        await saveToAPI(userState.type, entryData);

        // Clear user state
        userStates.delete(userId);

        // Send success message
        const isIncome = userState.type === 'income';
        const emoji = isIncome ? '💰' : '🛒';
        const typeText = isIncome ? 'Доход' : 'Расход';
        const motivationText = isIncome 
            ? '🌟 Каждый доход приближает вас к мечте о доме 🏠, машине 🚙 и путешествиях 🌍'
            : '⚡ Даже расходы помогают держать бюджет под контролем и двигаться к целям вместе 💕';

        const successMessage = `${emoji} ${typeText} успешно добавлен!

💵 Сумма: ${formatCurrency(userState.amount)}
📁 Категория: ${userState.category}
🖊️ Описание: ${userState.description || 'Без описания'}

${motivationText}

🌸 Для добавления новой записи отправьте /add`;

        const keyboard = {
            reply_markup: {
                inline_keyboard: [[
                    {
                        text: '➕ Добавить еще',
                        callback_data: 'add_entry'
                    }
                ]]
            }
        };

        await bot.sendMessage(chatId, successMessage, keyboard);
    } catch (error) {
        console.error('Error processing entry:', error);
        await bot.sendMessage(chatId, '❌ Ошибка при сохранении записи. Попробуйте еще раз.');
        
        // Clear user state on error
        userStates.delete(userId);
    }
}

// Error handling
bot.on('polling_error', (error) => {
    console.error('Polling error:', error);
});

bot.on('error', (error) => {
    console.error('Bot error:', error);
});

console.log('🤖 Telegram Bot is running...');
console.log('📱 Bot Token:', BOT_TOKEN);
console.log('🌐 API Base URL:', API_BASE_URL);
