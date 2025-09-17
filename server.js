const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 5678;
const DATA_FILE = 'budget_data.json';

// Middleware
app.use(cors());
app.use(express.json());

// Initialize data file if it doesn't exist
if (!fs.existsSync(DATA_FILE)) {
    const initialData = {
        expenses: [],
        income: [],
        budget: { monthlyBudget: 0 },
        categories: {
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
        }
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
}

// Helper function to read data
function readData() {
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading data file:', error);
        return { expenses: [], income: [], budget: { monthlyBudget: 0 }, categories: { expense: [], income: [] } };
    }
}

// Helper function to write data
function writeData(data) {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error('Error writing data file:', error);
        return false;
    }
}

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Budget Tracker API is running' });
});

// Get all expenses
app.get('/api/expenses', (req, res) => {
    const data = readData();
    res.json(data.expenses);
});

// Add new expense
app.post('/api/expenses', (req, res) => {
    const data = readData();
    const newExpense = {
        id: Date.now(), // Simple ID generation
        ...req.body,
        createdAt: new Date().toISOString()
    };
    
    data.expenses.push(newExpense);
    
    if (writeData(data)) {
        res.status(201).json(newExpense);
    } else {
        res.status(500).json({ error: 'Failed to save expense' });
    }
});

// Delete expense
app.delete('/api/expenses/:id', (req, res) => {
    const data = readData();
    const expenseId = parseInt(req.params.id);
    
    data.expenses = data.expenses.filter(expense => expense.id !== expenseId);
    
    if (writeData(data)) {
        res.json({ message: 'Expense deleted successfully' });
    } else {
        res.status(500).json({ error: 'Failed to delete expense' });
    }
});

// Get all income
app.get('/api/income', (req, res) => {
    const data = readData();
    res.json(data.income);
});

// Add new income
app.post('/api/income', (req, res) => {
    const data = readData();
    const newIncome = {
        id: Date.now(), // Simple ID generation
        ...req.body,
        createdAt: new Date().toISOString()
    };
    
    data.income.push(newIncome);
    
    if (writeData(data)) {
        res.status(201).json(newIncome);
    } else {
        res.status(500).json({ error: 'Failed to save income' });
    }
});

// Delete income
app.delete('/api/income/:id', (req, res) => {
    const data = readData();
    const incomeId = parseInt(req.params.id);
    
    data.income = data.income.filter(income => income.id !== incomeId);
    
    if (writeData(data)) {
        res.json({ message: 'Income deleted successfully' });
    } else {
        res.status(500).json({ error: 'Failed to delete income' });
    }
});

// Get budget
app.get('/api/budget', (req, res) => {
    const data = readData();
    res.json(data.budget);
});

// Update budget
app.post('/api/budget', (req, res) => {
    const data = readData();
    data.budget = { ...data.budget, ...req.body };
    
    if (writeData(data)) {
        res.json(data.budget);
    } else {
        res.status(500).json({ error: 'Failed to save budget' });
    }
});

// Get categories
app.get('/api/categories', (req, res) => {
    const data = readData();
    res.json(data.categories);
});

// Add category
app.post('/api/categories', (req, res) => {
    const data = readData();
    const { type, name } = req.body;
    
    if (!data.categories[type]) {
        data.categories[type] = [];
    }
    
    if (!data.categories[type].includes(name)) {
        data.categories[type].push(name);
        
        if (writeData(data)) {
            res.json({ message: 'Category added successfully' });
        } else {
            res.status(500).json({ error: 'Failed to save category' });
        }
    } else {
        res.status(400).json({ error: 'Category already exists' });
    }
});

// Delete category
app.delete('/api/categories', (req, res) => {
    const data = readData();
    const { type, name } = req.body;
    
    if (data.categories[type]) {
        data.categories[type] = data.categories[type].filter(cat => cat !== name);
        
        if (writeData(data)) {
            res.json({ message: 'Category deleted successfully' });
        } else {
            res.status(500).json({ error: 'Failed to delete category' });
        }
    } else {
        res.status(404).json({ error: 'Category type not found' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Budget Tracker API server running on http://localhost:${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log(`Data file: ${path.resolve(DATA_FILE)}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\nShutting down server...');
    process.exit(0);
});
