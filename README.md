# Budget Tracking Tool (Трекер Бюджета)

A comprehensive web-based budget tracking application built with HTML, CSS, and JavaScript. This application helps you manage your personal finances by tracking income, expenses, and providing detailed analytics and reports.

## Features

### 📊 Dashboard
- Real-time overview of total income, expenses, and savings
- Interactive charts showing expense categories and income vs expenses
- Monthly budget tracking with progress indicators
- Customizable date range filtering

### 💰 Income & Expense Management
- Add, edit, and delete income and expense entries
- Categorize transactions for better organization
- Search and filter functionality
- Date-based filtering options

### 📈 Reports & Analytics
- Monthly trend analysis with interactive charts
- Category-wise spending analysis
- Top expenses and income sources
- Custom date range reporting

### ⚙️ Settings & Data Management
- Customizable income and expense categories
- Data export/import functionality
- Complete data reset option
- Responsive design for all devices

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Charts**: Chart.js for data visualization
- **Icons**: Font Awesome
- **Storage**: Local Storage for data persistence
- **Styling**: Custom CSS with modern design principles

## Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- No additional software installation required

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/amatiadel/moneymanger.git
   ```

2. Navigate to the project directory:
   ```bash
   cd moneymanger
   ```

3. Open `index.html` in your web browser

### Usage
1. **Adding Transactions**: Click the "Add Income" or "Add Expense" buttons to record new transactions
2. **Viewing Data**: Use the navigation tabs to switch between Dashboard, Expenses, Income, and Reports
3. **Managing Categories**: Go to Settings to add or remove income/expense categories
4. **Exporting Data**: Use the Settings page to export your data as JSON for backup

## Live Demo

The application is deployed and available at: [https://amatiadel.github.io/moneymanger/](https://amatiadel.github.io/moneymanger/)

## Project Structure

```
moneymanger/
├── index.html          # Main application file
├── script.js           # JavaScript application logic
├── styles.css          # CSS styling
├── .gitignore          # Git ignore file
├── README.md           # Project documentation
└── Budget Tracking Tool/  # Additional HTML files (legacy)
    ├── resources/      # Static assets
    └── *.html         # Individual page files
```

## Features in Detail

### Dashboard
- **Real-time Statistics**: Shows total income, expenses, and calculated savings
- **Expense Categories Chart**: Doughnut chart displaying spending by category
- **Income vs Expenses**: Bar chart comparing monthly income and expenses
- **Budget Management**: Set monthly budget and track utilization

### Data Management
- **Local Storage**: All data is stored locally in your browser
- **Export/Import**: Backup and restore your data using JSON files
- **Category Management**: Customize income and expense categories
- **Data Filtering**: Filter transactions by date range, category, and search terms

### Responsive Design
- **Mobile-First**: Optimized for mobile devices
- **Tablet Support**: Responsive layout for tablet screens
- **Desktop Enhanced**: Full-featured experience on desktop

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

If you encounter any issues or have questions, please open an issue on GitHub.

## Changelog

### Version 1.0.0
- Initial release
- Complete budget tracking functionality
- Interactive charts and reports
- Responsive design
- Data export/import capabilities
