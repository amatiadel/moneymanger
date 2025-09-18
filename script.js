// Budget Tracking Application
class BudgetTracker {
    constructor() {
        this.apiBaseUrl = 'http://localhost:5678';
        this.data = {
            expenses: [],
            income: [],
            monthlyBudget: 0,
            customDateRange: {
                from: null,
                to: null
            },
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
        
        this.currentSection = 'dashboard';
        this.charts = {};
        
        this.init();
    }

    async init() {
        try {
            await this.loadDataFromAPI();
            this.setupEventListeners();
            this.updateUI();
            this.initializeCharts();
            this.startAutoSync();
        } catch (error) {
            console.error('Failed to initialize with API:', error);
            this.showMessage('Cannot connect to database. Please start the backend server and refresh the page.', 'error');
            this.setupEventListeners();
            // Initialize with empty data
            this.data = {
                expenses: [],
                income: [],
                monthlyBudget: 0,
                customDateRange: {
                    from: null,
                    to: null
                },
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
            this.updateUI();
            this.initializeCharts();
        }
    }

    // Data Management
    async loadDataFromAPI() {
        try {
            // Check if API server is available
            const healthCheck = await fetch(`${this.apiBaseUrl}/health`, { 
                method: 'GET',
                timeout: 5000 
            });
            
            if (!healthCheck.ok) {
                throw new Error('API server is not available');
            }

            // Load expenses
            const expensesResponse = await fetch(`${this.apiBaseUrl}/api/expenses`);
            if (expensesResponse.ok) {
                const expenses = await expensesResponse.json();
                this.data.expenses = expenses.map(expense => ({
                    id: expense.id,
                    amount: expense.amount,
                    category: expense.category,
                    description: expense.description,
                    date: expense.date
                }));
            } else {
                throw new Error('Failed to load expenses from API');
            }

            // Load income
            const incomeResponse = await fetch(`${this.apiBaseUrl}/api/income`);
            if (incomeResponse.ok) {
                const income = await incomeResponse.json();
                this.data.income = income.map(inc => ({
                    id: inc.id,
                    amount: inc.amount,
                    category: inc.category,
                    description: inc.description,
                    date: inc.date
                }));
            } else {
                throw new Error('Failed to load income from API');
            }

            // Load budget from API
            const budgetResponse = await fetch(`${this.apiBaseUrl}/api/budget`);
            if (budgetResponse.ok) {
                const budgetData = await budgetResponse.json();
                this.data.monthlyBudget = budgetData.monthlyBudget || 0;
            } else {
                // If budget API fails, keep current budget or default to 0
                this.data.monthlyBudget = this.data.monthlyBudget || 0;
            }

            console.log('Data loaded successfully from API');

        } catch (error) {
            console.error('Error loading data from API:', error);
            this.showMessage('API server unavailable. Please ensure the backend server is running on port 5678', 'error');
            throw error;
        }
    }

    async saveExpenseToAPI(expense) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/api/expenses`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(expense)
            });
            
            if (!response.ok) {
                throw new Error('Failed to save expense');
            }
        } catch (error) {
            console.error('Error saving expense to API:', error);
            throw error;
        }
    }

    async saveIncomeToAPI(income) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/api/income`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(income)
            });
            
            if (!response.ok) {
                throw new Error('Failed to save income');
            }
        } catch (error) {
            console.error('Error saving income to API:', error);
            throw error;
        }
    }

    startAutoSync() {
        // Auto-sync every 5 seconds for real-time updates
        setInterval(async () => {
            try {
                await this.loadDataFromAPI();
                this.updateUI();
            } catch (error) {
                console.error('Auto-sync error:', error);
                // Don't show error message on every sync failure
            }
        }, 5000);
    }


    // Event Listeners
    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const section = e.currentTarget.dataset.section;
                this.showSection(section);
            });
        });

        // Bottom Navigation (Mobile)
        document.querySelectorAll('.bottom-nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const section = e.currentTarget.dataset.section;
                this.showSection(section);
            });
        });

        // Add buttons
        document.getElementById('addExpenseBtn').addEventListener('click', () => {
            this.showModal('expenseModal');
        });

        document.getElementById('addIncomeBtn').addEventListener('click', () => {
            this.showModal('incomeModal');
        });

        // Modal close buttons
        document.querySelectorAll('.close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.hideModal(e.target.closest('.modal'));
            });
        });

        // Form submissions
        document.getElementById('expenseForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addExpense();
        });

        document.getElementById('incomeForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addIncome();
        });

        document.getElementById('categoryForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addCategory();
        });

        // Cancel buttons
        document.getElementById('cancelExpenseBtn').addEventListener('click', () => {
            this.hideModal(document.getElementById('expenseModal'));
        });

        document.getElementById('cancelIncomeBtn').addEventListener('click', () => {
            this.hideModal(document.getElementById('incomeModal'));
        });

        document.getElementById('cancelCategoryBtn').addEventListener('click', () => {
            this.hideModal(document.getElementById('categoryModal'));
        });

        // Add category buttons
        document.getElementById('addExpenseCategoryBtn').addEventListener('click', () => {
            document.getElementById('categoryType').value = 'expense';
            this.showModal('categoryModal');
        });

        document.getElementById('addIncomeCategoryBtn').addEventListener('click', () => {
            document.getElementById('categoryType').value = 'income';
            this.showModal('categoryModal');
        });

        // Filters
        document.getElementById('expenseSearch').addEventListener('input', () => {
            this.filterExpenses();
        });

        document.getElementById('expenseCategoryFilter').addEventListener('change', () => {
            this.filterExpenses();
        });

        document.getElementById('expenseDateFrom').addEventListener('change', () => {
            this.filterExpenses();
        });

        document.getElementById('expenseDateTo').addEventListener('change', () => {
            this.filterExpenses();
        });

        document.getElementById('incomeSearch').addEventListener('input', () => {
            this.filterIncome();
        });

        document.getElementById('incomeCategoryFilter').addEventListener('change', () => {
            this.filterIncome();
        });

        document.getElementById('incomeDateFrom').addEventListener('change', () => {
            this.filterIncome();
        });

        document.getElementById('incomeDateTo').addEventListener('change', () => {
            this.filterIncome();
        });

        // Period selector
        document.getElementById('periodSelect').addEventListener('change', (e) => {
            this.handlePeriodChange(e.target.value);
        });

        // Custom date range
        document.getElementById('applyCustomRange').addEventListener('click', () => {
            this.applyCustomDateRange();
        });

        // Report period selector
        document.getElementById('reportPeriod').addEventListener('change', (e) => {
            this.handleReportPeriodChange(e.target.value);
        });

        // Data management
        document.getElementById('exportDataBtn').addEventListener('click', () => {
            this.exportData();
        });

        document.getElementById('importDataBtn').addEventListener('click', () => {
            this.importData();
        });

        document.getElementById('clearDataBtn').addEventListener('click', () => {
            this.clearData();
        });

        // Budget management
        document.getElementById('setBudgetBtn').addEventListener('click', () => {
            this.setMonthlyBudget();
        });

        // Reports
        document.getElementById('generateReportBtn').addEventListener('click', () => {
            this.generateReports();
        });

        // Set default dates
        this.setDefaultDates();
    }

    setDefaultDates() {
        const today = new Date();
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        
        document.getElementById('expenseDate').value = today.toISOString().split('T')[0];
        document.getElementById('incomeDate').value = today.toISOString().split('T')[0];
        document.getElementById('expenseDateFrom').value = firstDay.toISOString().split('T')[0];
        document.getElementById('expenseDateTo').value = today.toISOString().split('T')[0];
        document.getElementById('incomeDateFrom').value = firstDay.toISOString().split('T')[0];
        document.getElementById('incomeDateTo').value = today.toISOString().split('T')[0];
    }

    // UI Management
    showSection(sectionName) {
        // Hide all sections
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });

        // Remove active class from all nav buttons (both top and bottom)
        document.querySelectorAll('.nav-btn, .bottom-nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        // Show selected section
        document.getElementById(sectionName).classList.add('active');
        
        // Add active class to both top and bottom nav buttons for the selected section
        document.querySelectorAll(`[data-section="${sectionName}"]`).forEach(btn => {
            btn.classList.add('active');
        });

        this.currentSection = sectionName;

        // Update section-specific content
        if (sectionName === 'dashboard') {
            this.updateDashboard();
        } else if (sectionName === 'expenses') {
            this.updateExpensesTable();
        } else if (sectionName === 'income') {
            this.updateIncomeTable();
        } else if (sectionName === 'reports') {
            this.updateReports();
        } else if (sectionName === 'settings') {
            this.updateSettings();
        }
    }

    showModal(modalId) {
        document.getElementById(modalId).style.display = 'block';
        this.populateCategorySelects();
    }

    hideModal(modal) {
        modal.style.display = 'none';
        this.clearForms();
    }

    clearForms() {
        document.getElementById('expenseForm').reset();
        document.getElementById('incomeForm').reset();
        document.getElementById('categoryForm').reset();
        this.setDefaultDates();
    }

    // Data Operations
    async addExpense() {
        const expense = {
            date: document.getElementById('expenseDate').value,
            category: document.getElementById('expenseCategory').value,
            description: document.getElementById('expenseDescription').value,
            amount: parseFloat(document.getElementById('expenseAmount').value)
        };

        try {
            await this.saveExpenseToAPI(expense);
            // Reload data from API to get the latest data
            await this.loadDataFromAPI();
            this.updateUI();
            this.hideModal(document.getElementById('expenseModal'));
            this.showMessage('Expense added successfully!', 'success');
        } catch (error) {
            this.showMessage('Error adding expense. Please try again.', 'error');
        }
    }

    async addIncome() {
        const income = {
            date: document.getElementById('incomeDate').value,
            category: document.getElementById('incomeCategory').value,
            description: document.getElementById('incomeDescription').value,
            amount: parseFloat(document.getElementById('incomeAmount').value)
        };

        try {
            await this.saveIncomeToAPI(income);
            // Reload data from API to get the latest data
            await this.loadDataFromAPI();
            this.updateUI();
            this.hideModal(document.getElementById('incomeModal'));
            this.showMessage('Income added successfully!', 'success');
        } catch (error) {
            this.showMessage('Error adding income. Please try again.', 'error');
        }
    }

    async addCategory() {
        const type = document.getElementById('categoryType').value;
        const name = document.getElementById('categoryName').value;

        if (!this.data.categories[type].includes(name)) {
            try {
                // Save category to API
                const response = await fetch(`${this.apiBaseUrl}/api/categories`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ type, name })
                });
                
                if (response.ok) {
                    this.data.categories[type].push(name);
                    this.updateUI();
                    this.hideModal(document.getElementById('categoryModal'));
                    this.showMessage('Category added successfully!', 'success');
                } else {
                    throw new Error('Failed to save category to database');
                }
            } catch (error) {
                console.error('Error saving category:', error);
                this.showMessage('Error saving category. Please check your connection.', 'error');
            }
        } else {
            this.showMessage('Category already exists!', 'error');
        }
    }

    async deleteExpense(id) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/api/expenses/${id}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                this.data.expenses = this.data.expenses.filter(expense => expense.id !== id);
                this.updateUI();
                this.showMessage('Expense deleted successfully!', 'success');
            } else {
                throw new Error('Failed to delete expense from database');
            }
        } catch (error) {
            console.error('Error deleting expense:', error);
            this.showMessage('Error deleting expense. Please check your connection.', 'error');
        }
    }

    async deleteIncome(id) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/api/income/${id}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                this.data.income = this.data.income.filter(income => income.id !== id);
                this.updateUI();
                this.showMessage('Income deleted successfully!', 'success');
            } else {
                throw new Error('Failed to delete income from database');
            }
        } catch (error) {
            console.error('Error deleting income:', error);
            this.showMessage('Error deleting income. Please check your connection.', 'error');
        }
    }

    // UI Updates
    updateUI() {
        this.updateHeaderStats();
        this.updateMonthlySummary();
        this.populateCategorySelects();
        this.updateExpensesTable();
        this.updateIncomeTable();
        this.updateSettings();
    }

    updateHeaderStats() {
        const { expenses, income } = this.getFilteredData();
        
        const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
        const totalIncome = income.reduce((sum, income) => sum + income.amount, 0);
        const savings = totalIncome - totalExpenses;

        document.getElementById('totalIncome').textContent = this.formatCurrency(totalIncome);
        document.getElementById('totalExpenses').textContent = this.formatCurrency(totalExpenses);
        document.getElementById('totalSavings').textContent = this.formatCurrency(savings);

        // Update savings color
        const savingsElement = document.getElementById('totalSavings');
        savingsElement.className = savings >= 0 ? 'stat-value savings' : 'stat-value expense';
    }

    getFilteredData() {
        let expenses = [...this.data.expenses];
        let income = [...this.data.income];

        // Apply custom date range if set
        if (this.data.customDateRange.from && this.data.customDateRange.to) {
            const fromDate = new Date(this.data.customDateRange.from);
            const toDate = new Date(this.data.customDateRange.to);
            
            expenses = expenses.filter(expense => {
                const expenseDate = new Date(expense.date);
                return expenseDate >= fromDate && expenseDate <= toDate;
            });
            
            income = income.filter(income => {
                const incomeDate = new Date(income.date);
                return incomeDate >= fromDate && incomeDate <= toDate;
            });
        } else {
            // Use current month as default
            const currentMonth = new Date().getMonth();
            const currentYear = new Date().getFullYear();
            
            expenses = expenses.filter(expense => {
                const expenseDate = new Date(expense.date);
                return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
            });
            
            income = income.filter(income => {
                const incomeDate = new Date(income.date);
                return incomeDate.getMonth() === currentMonth && incomeDate.getFullYear() === currentYear;
            });
        }

        return { expenses, income };
    }

    updateMonthlySummary() {
        const { expenses, income } = this.getFilteredData();
        
        const monthlyExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
        const monthlyIncome = income.reduce((sum, income) => sum + income.amount, 0);

        const monthlyBudget = this.data.monthlyBudget || 0;
        
        // Update budget input
        document.getElementById('monthlyBudget').value = monthlyBudget;

        // Calculate budget utilization
        const budgetUtilization = monthlyBudget > 0 ? (monthlyExpenses / monthlyBudget) * 100 : 0;
        const budgetProgress = Math.min(budgetUtilization, 100);
        
        // Update progress bar
        document.getElementById('budgetProgress').style.width = `${budgetProgress}%`;
        document.getElementById('budgetPercentage').textContent = `${budgetUtilization.toFixed(1)}%`;
        
        // Update progress bar color based on utilization
        const progressBar = document.getElementById('budgetProgress');
        if (budgetUtilization > 100) {
            progressBar.style.background = 'linear-gradient(90deg, #e74c3c, #c0392b)';
        } else if (budgetUtilization > 80) {
            progressBar.style.background = 'linear-gradient(90deg, #f39c12, #e67e22)';
        } else {
            progressBar.style.background = 'linear-gradient(90deg, #3498db, #2980b9)';
        }

        // Calculate savings rate
        const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100 : 0;
        document.getElementById('savingsRate').textContent = `${savingsRate.toFixed(1)}%`;
        
        // Update savings rate color
        const savingsRateElement = document.getElementById('savingsRate');
        savingsRateElement.className = savingsRate >= 0 ? 'value' : 'value expense';

        // Calculate remaining budget
        const remainingBudget = monthlyBudget - monthlyExpenses;
        document.getElementById('remainingBudget').textContent = this.formatCurrency(remainingBudget);
        
        // Update remaining budget color
        const remainingBudgetElement = document.getElementById('remainingBudget');
        remainingBudgetElement.className = remainingBudget >= 0 ? 'value' : 'value expense';
    }

    async setMonthlyBudget() {
        const budget = parseFloat(document.getElementById('monthlyBudget').value);
        if (budget >= 0) {
            try {
                // Save budget to API
                const response = await fetch(`${this.apiBaseUrl}/api/budget`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ monthlyBudget: budget })
                });
                
                if (response.ok) {
                    this.data.monthlyBudget = budget;
                    this.updateMonthlySummary();
                    this.showMessage('Monthly budget updated successfully!', 'success');
                } else {
                    throw new Error('Failed to save budget to database');
                }
            } catch (error) {
                console.error('Error saving budget:', error);
                this.showMessage('Error saving budget. Please check your connection.', 'error');
            }
        } else {
            this.showMessage('Please enter a valid budget amount.', 'error');
        }
    }

    populateCategorySelects() {
        // Populate expense category selects
        const expenseSelects = ['expenseCategory', 'expenseCategoryFilter'];
        expenseSelects.forEach(selectId => {
            const select = document.getElementById(selectId);
            const currentValue = select.value;
            select.innerHTML = '<option value="">Select Category</option>';
            
            this.data.categories.expense.forEach(category => {
                const option = document.createElement('option');
                option.value = category;
                option.textContent = category;
                select.appendChild(option);
            });
            
            if (selectId === 'expenseCategoryFilter') {
                select.insertAdjacentHTML('afterbegin', '<option value="">All Categories</option>');
            }
            
            select.value = currentValue;
        });

        // Populate income category selects
        const incomeSelects = ['incomeCategory', 'incomeCategoryFilter'];
        incomeSelects.forEach(selectId => {
            const select = document.getElementById(selectId);
            const currentValue = select.value;
            select.innerHTML = '<option value="">Select Category</option>';
            
            this.data.categories.income.forEach(category => {
                const option = document.createElement('option');
                option.value = category;
                option.textContent = category;
                select.appendChild(option);
            });
            
            if (selectId === 'incomeCategoryFilter') {
                select.insertAdjacentHTML('afterbegin', '<option value="">All Categories</option>');
            }
            
            select.value = currentValue;
        });
    }

    updateExpensesTable() {
        const tbody = document.getElementById('expensesTableBody');
        const filteredExpenses = this.getFilteredExpenses();
        
        if (filteredExpenses.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="empty-state">
                        <i class="fas fa-receipt"></i>
                        <h3>No expenses found</h3>
                        <p>Add your first expense to get started!</p>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = filteredExpenses.map(expense => `
            <tr>
                <td>${this.formatDate(expense.date)}</td>
                <td>${expense.category}</td>
                <td>${expense.description || '-'}</td>
                <td class="expense-amount">${this.formatCurrency(expense.amount)}</td>
                <td>
                    <button class="btn btn-danger btn-sm" onclick="budgetTracker.deleteExpense(${expense.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    updateIncomeTable() {
        const tbody = document.getElementById('incomeTableBody');
        const filteredIncome = this.getFilteredIncome();
        
        if (filteredIncome.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="empty-state">
                        <i class="fas fa-money-bill-wave"></i>
                        <h3>No income found</h3>
                        <p>Add your first income entry to get started!</p>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = filteredIncome.map(income => `
            <tr>
                <td>${this.formatDate(income.date)}</td>
                <td>${income.category}</td>
                <td>${income.description || '-'}</td>
                <td class="income-amount">${this.formatCurrency(income.amount)}</td>
                <td>
                    <button class="btn btn-danger btn-sm" onclick="budgetTracker.deleteIncome(${income.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    updateSettings() {
        this.updateCategoryLists();
    }

    updateCategoryLists() {
        // Update expense categories
        const expenseCategoriesList = document.getElementById('expenseCategoriesList');
        expenseCategoriesList.innerHTML = this.data.categories.expense.map(category => `
            <div class="category-item">
                ${category}
                <button class="remove-btn" onclick="budgetTracker.removeCategory('expense', '${category}')">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');

        // Update income categories
        const incomeCategoriesList = document.getElementById('incomeCategoriesList');
        incomeCategoriesList.innerHTML = this.data.categories.income.map(category => `
            <div class="category-item">
                ${category}
                <button class="remove-btn" onclick="budgetTracker.removeCategory('income', '${category}')">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');
    }

    async removeCategory(type, category) {
        if (confirm(`Are you sure you want to remove the category "${category}"?`)) {
            try {
                const response = await fetch(`${this.apiBaseUrl}/api/categories`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ type, name: category })
                });
                
                if (response.ok) {
                    this.data.categories[type] = this.data.categories[type].filter(cat => cat !== category);
                    this.updateUI();
                    this.showMessage('Category removed successfully!', 'success');
                } else {
                    throw new Error('Failed to remove category from database');
                }
            } catch (error) {
                console.error('Error removing category:', error);
                this.showMessage('Error removing category. Please check your connection.', 'error');
            }
        }
    }

    // Filtering
    getFilteredExpenses() {
        let filtered = [...this.data.expenses];

        const search = document.getElementById('expenseSearch').value.toLowerCase();
        const category = document.getElementById('expenseCategoryFilter').value;
        const dateFrom = document.getElementById('expenseDateFrom').value;
        const dateTo = document.getElementById('expenseDateTo').value;

        if (search) {
            filtered = filtered.filter(expense => 
                expense.description.toLowerCase().includes(search) ||
                expense.category.toLowerCase().includes(search)
            );
        }

        if (category) {
            filtered = filtered.filter(expense => expense.category === category);
        }

        if (dateFrom) {
            filtered = filtered.filter(expense => expense.date >= dateFrom);
        }

        if (dateTo) {
            filtered = filtered.filter(expense => expense.date <= dateTo);
        }

        return filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    getFilteredIncome() {
        let filtered = [...this.data.income];

        const search = document.getElementById('incomeSearch').value.toLowerCase();
        const category = document.getElementById('incomeCategoryFilter').value;
        const dateFrom = document.getElementById('incomeDateFrom').value;
        const dateTo = document.getElementById('incomeDateTo').value;

        if (search) {
            filtered = filtered.filter(income => 
                income.description.toLowerCase().includes(search) ||
                income.category.toLowerCase().includes(search)
            );
        }

        if (category) {
            filtered = filtered.filter(income => income.category === category);
        }

        if (dateFrom) {
            filtered = filtered.filter(income => income.date >= dateFrom);
        }

        if (dateTo) {
            filtered = filtered.filter(income => income.date <= dateTo);
        }

        return filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    filterExpenses() {
        this.updateExpensesTable();
    }

    filterIncome() {
        this.updateIncomeTable();
    }

    // Dashboard
    updateDashboard() {
        this.updateHeaderStats();
        this.updateCharts();
    }

    handlePeriodChange(period) {
        const customDateRange = document.getElementById('customDateRange');
        
        if (period === 'custom') {
            customDateRange.style.display = 'flex';
            // Set default dates
            const today = new Date();
            const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
            document.getElementById('customDateFrom').value = firstDay.toISOString().split('T')[0];
            document.getElementById('customDateTo').value = today.toISOString().split('T')[0];
        } else {
            customDateRange.style.display = 'none';
            this.data.customDateRange = { from: null, to: null };
            this.updateDashboard();
        }
    }

    applyCustomDateRange() {
        const fromDate = document.getElementById('customDateFrom').value;
        const toDate = document.getElementById('customDateTo').value;
        
        if (!fromDate || !toDate) {
            this.showMessage('Please select both start and end dates.', 'error');
            return;
        }
        
        if (new Date(fromDate) > new Date(toDate)) {
            this.showMessage('Start date must be before end date.', 'error');
            return;
        }
        
        this.data.customDateRange = { from: fromDate, to: toDate };
        this.updateDashboard();
        this.showMessage('Custom date range applied successfully!', 'success');
    }

    handleReportPeriodChange(period) {
        const customDateRange = document.getElementById('reportCustomDateRange');
        
        if (period === 'custom') {
            customDateRange.style.display = 'flex';
            // Set default dates
            const today = new Date();
            const threeMonthsAgo = new Date();
            threeMonthsAgo.setMonth(today.getMonth() - 3);
            document.getElementById('reportCustomDateFrom').value = threeMonthsAgo.toISOString().split('T')[0];
            document.getElementById('reportCustomDateTo').value = today.toISOString().split('T')[0];
        } else {
            customDateRange.style.display = 'none';
            this.generateReports();
        }
    }

    initializeCharts() {
        this.createExpensesChart();
        this.createIncomeExpensesChart();
    }

    updateCharts() {
        if (this.charts.expenses) {
            this.charts.expenses.destroy();
        }
        if (this.charts.incomeExpenses) {
            this.charts.incomeExpenses.destroy();
        }
        
        this.createExpensesChart();
        this.createIncomeExpensesChart();
    }

    createExpensesChart() {
        const ctx = document.getElementById('expensesChart').getContext('2d');
        const { expenses } = this.getFilteredData();

        // Destroy existing chart if it exists
        if (this.charts.expenses) {
            this.charts.expenses.destroy();
            this.charts.expenses = null;
        }

        const categoryTotals = {};
        expenses.forEach(expense => {
            categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
        });

        const labels = Object.keys(categoryTotals);
        const data = Object.values(categoryTotals);

        this.charts.expenses = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: [
                        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
                        '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0', '#FF6384'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                aspectRatio: 1,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            boxWidth: 12,
                            padding: 10
                        }
                    }
                }
            }
        });
    }

    createIncomeExpensesChart() {
        const ctx = document.getElementById('incomeExpensesChart').getContext('2d');
        const { expenses, income } = this.getFilteredData();

        // Destroy existing chart if it exists
        if (this.charts.incomeExpenses) {
            this.charts.incomeExpenses.destroy();
            this.charts.incomeExpenses = null;
        }

        const monthlyIncome = income.reduce((sum, income) => sum + income.amount, 0);
        const monthlyExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

        this.charts.incomeExpenses = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Income', 'Expenses'],
                datasets: [{
                    data: [monthlyIncome, monthlyExpenses],
                    backgroundColor: ['#27ae60', '#e74c3c'],
                    borderColor: ['#27ae60', '#e74c3c'],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                aspectRatio: 1.5,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0,0,0,0.1)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }

    updateReports() {
        this.generateReports();
    }

    generateReports() {
        const period = document.getElementById('reportPeriod').value;
        
        if (period === 'custom') {
            const fromDate = document.getElementById('reportCustomDateFrom').value;
            const toDate = document.getElementById('reportCustomDateTo').value;
            
            if (!fromDate || !toDate) {
                this.showMessage('Please select both start and end dates for custom range.', 'error');
                return;
            }
            
            if (new Date(fromDate) > new Date(toDate)) {
                this.showMessage('Start date must be before end date.', 'error');
                return;
            }
            
            this.createCustomMonthlyTrendsChart(fromDate, toDate);
            this.createCustomCategoryAnalysisChart(fromDate, toDate);
            this.updateCustomTopExpenses(fromDate, toDate);
            this.updateCustomTopIncome(fromDate, toDate);
        } else {
            const months = parseInt(period);
            this.createMonthlyTrendsChart(months);
            this.createCategoryAnalysisChart(months);
            this.updateTopExpenses(months);
            this.updateTopIncome(months);
        }
    }

    createMonthlyTrendsChart(months) {
        const ctx = document.getElementById('monthlyTrendsChart').getContext('2d');
        
        if (this.charts.monthlyTrends) {
            this.charts.monthlyTrends.destroy();
        }

        const data = this.getMonthlyData(months);
        
        this.charts.monthlyTrends = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [
                    {
                        label: 'Income',
                        data: data.income,
                        borderColor: '#27ae60',
                        backgroundColor: 'rgba(39, 174, 96, 0.1)',
                        tension: 0.4
                    },
                    {
                        label: 'Expenses',
                        data: data.expenses,
                        borderColor: '#e74c3c',
                        backgroundColor: 'rgba(231, 76, 60, 0.1)',
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                aspectRatio: 1.5,
                plugins: {
                    legend: {
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0,0,0,0.1)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }

    createCategoryAnalysisChart(months) {
        const ctx = document.getElementById('categoryAnalysisChart').getContext('2d');
        
        if (this.charts.categoryAnalysis) {
            this.charts.categoryAnalysis.destroy();
        }

        const data = this.getCategoryData(months);
        
        this.charts.categoryAnalysis = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'Amount',
                    data: data.amounts,
                    backgroundColor: [
                        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
                        '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0', '#FF6384'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                aspectRatio: 1.5,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0,0,0,0.1)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }

    getMonthlyData(months) {
        const data = {
            labels: [],
            income: [],
            expenses: []
        };

        for (let i = months - 1; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            
            const monthName = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
            data.labels.push(monthName);

            const monthExpenses = this.data.expenses
                .filter(expense => {
                    const expenseDate = new Date(expense.date);
                    return expenseDate.getMonth() === date.getMonth() && 
                           expenseDate.getFullYear() === date.getFullYear();
                })
                .reduce((sum, expense) => sum + expense.amount, 0);

            const monthIncome = this.data.income
                .filter(income => {
                    const incomeDate = new Date(income.date);
                    return incomeDate.getMonth() === date.getMonth() && 
                           incomeDate.getFullYear() === date.getFullYear();
                })
                .reduce((sum, income) => sum + income.amount, 0);

            data.expenses.push(monthExpenses);
            data.income.push(monthIncome);
        }

        return data;
    }

    getCategoryData(months) {
        const categoryTotals = {};
        const cutoffDate = new Date();
        cutoffDate.setMonth(cutoffDate.getMonth() - months);

        this.data.expenses
            .filter(expense => new Date(expense.date) >= cutoffDate)
            .forEach(expense => {
                categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
            });

        const sortedCategories = Object.entries(categoryTotals)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10);

        return {
            labels: sortedCategories.map(([category]) => category),
            amounts: sortedCategories.map(([, amount]) => amount)
        };
    }

    updateTopExpenses(months) {
        const cutoffDate = new Date();
        cutoffDate.setMonth(cutoffDate.getMonth() - months);

        const categoryTotals = {};
        this.data.expenses
            .filter(expense => new Date(expense.date) >= cutoffDate)
            .forEach(expense => {
                categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
            });

        const totalExpenses = Object.values(categoryTotals).reduce((sum, amount) => sum + amount, 0);
        const sortedCategories = Object.entries(categoryTotals)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5);

        const listElement = document.getElementById('topExpensesList');
        listElement.innerHTML = sortedCategories.map(([category, amount]) => {
            const percentage = totalExpenses > 0 ? ((amount / totalExpenses) * 100).toFixed(1) : 0;
            return `
                <div class="top-list-item">
                    <span class="category">${category}</span>
                    <div>
                        <span class="amount">${this.formatCurrency(amount)}</span>
                        <span class="percentage">${percentage}%</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    updateTopIncome(months) {
        const cutoffDate = new Date();
        cutoffDate.setMonth(cutoffDate.getMonth() - months);

        const categoryTotals = {};
        this.data.income
            .filter(income => new Date(income.date) >= cutoffDate)
            .forEach(income => {
                categoryTotals[income.category] = (categoryTotals[income.category] || 0) + income.amount;
            });

        const totalIncome = Object.values(categoryTotals).reduce((sum, amount) => sum + amount, 0);
        const sortedCategories = Object.entries(categoryTotals)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5);

        const listElement = document.getElementById('topIncomeList');
        listElement.innerHTML = sortedCategories.map(([category, amount]) => {
            const percentage = totalIncome > 0 ? ((amount / totalIncome) * 100).toFixed(1) : 0;
            return `
                <div class="top-list-item">
                    <span class="category">${category}</span>
                    <div>
                        <span class="amount">${this.formatCurrency(amount)}</span>
                        <span class="percentage">${percentage}%</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Custom date range methods for reports
    createCustomMonthlyTrendsChart(fromDate, toDate) {
        const ctx = document.getElementById('monthlyTrendsChart').getContext('2d');
        
        if (this.charts.monthlyTrends) {
            this.charts.monthlyTrends.destroy();
        }

        const data = this.getCustomMonthlyData(fromDate, toDate);
        
        this.charts.monthlyTrends = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [
                    {
                        label: 'Income',
                        data: data.income,
                        borderColor: '#27ae60',
                        backgroundColor: 'rgba(39, 174, 96, 0.1)',
                        tension: 0.4
                    },
                    {
                        label: 'Expenses',
                        data: data.expenses,
                        borderColor: '#e74c3c',
                        backgroundColor: 'rgba(231, 76, 60, 0.1)',
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                aspectRatio: 1.5,
                plugins: {
                    legend: {
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0,0,0,0.1)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }

    createCustomCategoryAnalysisChart(fromDate, toDate) {
        const ctx = document.getElementById('categoryAnalysisChart').getContext('2d');
        
        if (this.charts.categoryAnalysis) {
            this.charts.categoryAnalysis.destroy();
        }

        const data = this.getCustomCategoryData(fromDate, toDate);
        
        this.charts.categoryAnalysis = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'Amount',
                    data: data.amounts,
                    backgroundColor: [
                        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
                        '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0', '#FF6384'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                aspectRatio: 1.5,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0,0,0,0.1)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }

    getCustomMonthlyData(fromDate, toDate) {
        const data = {
            labels: [],
            income: [],
            expenses: []
        };

        const startDate = new Date(fromDate);
        const endDate = new Date(toDate);
        
        // Generate monthly data points
        const currentDate = new Date(startDate);
        while (currentDate <= endDate) {
            const monthName = currentDate.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
            data.labels.push(monthName);

            const monthExpenses = this.data.expenses
                .filter(expense => {
                    const expenseDate = new Date(expense.date);
                    return expenseDate.getMonth() === currentDate.getMonth() && 
                           expenseDate.getFullYear() === currentDate.getFullYear();
                })
                .reduce((sum, expense) => sum + expense.amount, 0);

            const monthIncome = this.data.income
                .filter(income => {
                    const incomeDate = new Date(income.date);
                    return incomeDate.getMonth() === currentDate.getMonth() && 
                           incomeDate.getFullYear() === currentDate.getFullYear();
                })
                .reduce((sum, income) => sum + income.amount, 0);

            data.expenses.push(monthExpenses);
            data.income.push(monthIncome);
            
            currentDate.setMonth(currentDate.getMonth() + 1);
        }

        return data;
    }

    getCustomCategoryData(fromDate, toDate) {
        const categoryTotals = {};
        const startDate = new Date(fromDate);
        const endDate = new Date(toDate);

        this.data.expenses
            .filter(expense => {
                const expenseDate = new Date(expense.date);
                return expenseDate >= startDate && expenseDate <= endDate;
            })
            .forEach(expense => {
                categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
            });

        const sortedCategories = Object.entries(categoryTotals)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10);

        return {
            labels: sortedCategories.map(([category]) => category),
            amounts: sortedCategories.map(([, amount]) => amount)
        };
    }

    updateCustomTopExpenses(fromDate, toDate) {
        const startDate = new Date(fromDate);
        const endDate = new Date(toDate);

        const categoryTotals = {};
        this.data.expenses
            .filter(expense => {
                const expenseDate = new Date(expense.date);
                return expenseDate >= startDate && expenseDate <= endDate;
            })
            .forEach(expense => {
                categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
            });

        const totalExpenses = Object.values(categoryTotals).reduce((sum, amount) => sum + amount, 0);
        const sortedCategories = Object.entries(categoryTotals)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5);

        const listElement = document.getElementById('topExpensesList');
        listElement.innerHTML = sortedCategories.map(([category, amount]) => {
            const percentage = totalExpenses > 0 ? ((amount / totalExpenses) * 100).toFixed(1) : 0;
            return `
                <div class="top-list-item">
                    <span class="category">${category}</span>
                    <div>
                        <span class="amount">${this.formatCurrency(amount)}</span>
                        <span class="percentage">${percentage}%</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    updateCustomTopIncome(fromDate, toDate) {
        const startDate = new Date(fromDate);
        const endDate = new Date(toDate);

        const categoryTotals = {};
        this.data.income
            .filter(income => {
                const incomeDate = new Date(income.date);
                return incomeDate >= startDate && incomeDate <= endDate;
            })
            .forEach(income => {
                categoryTotals[income.category] = (categoryTotals[income.category] || 0) + income.amount;
            });

        const totalIncome = Object.values(categoryTotals).reduce((sum, amount) => sum + amount, 0);
        const sortedCategories = Object.entries(categoryTotals)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5);

        const listElement = document.getElementById('topIncomeList');
        listElement.innerHTML = sortedCategories.map(([category, amount]) => {
            const percentage = totalIncome > 0 ? ((amount / totalIncome) * 100).toFixed(1) : 0;
            return `
                <div class="top-list-item">
                    <span class="category">${category}</span>
                    <div>
                        <span class="amount">${this.formatCurrency(amount)}</span>
                        <span class="percentage">${percentage}%</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Data Export/Import
    exportData() {
        const dataStr = JSON.stringify(this.data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `budget-data-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
        this.showMessage('Data exported successfully!', 'success');
    }

    importData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const importedData = JSON.parse(e.target.result);
                        this.data = { ...this.data, ...importedData };
                        // Note: Import functionality disabled when using shared database
                        this.showMessage('Import functionality not available with shared database. Please add data through the interface.', 'error');
                    } catch (error) {
                        this.showMessage('Error importing data. Please check the file format.', 'error');
                    }
                };
                reader.readAsText(file);
            }
        };
        
        input.click();
    }

    clearData() {
        if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
            this.data = {
                expenses: [],
                income: [],
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
            // Note: Clear data functionality disabled when using shared database
            this.showMessage('Clear data functionality not available with shared database. Please contact administrator.', 'error');
        }
    }

    // Utility Functions
    formatCurrency(amount) {
        return new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: 'RUB'
        }).format(amount);
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    showMessage(message, type) {
        // Remove existing messages
        const existingMessages = document.querySelectorAll('.message');
        existingMessages.forEach(msg => msg.remove());

        // Create new message
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.textContent = message;

        // Insert at the top of main content
        const mainContent = document.querySelector('.main-content');
        mainContent.insertBefore(messageDiv, mainContent.firstChild);

        // Auto remove after 5 seconds
        setTimeout(() => {
            messageDiv.remove();
        }, 5000);
    }
}

// Initialize the application
const budgetTracker = new BudgetTracker();
