# NeonLedger - Personal Finance Manager

A modern, neon-themed personal finance management system built with HTML, CSS, and JavaScript. NeonLedger helps you track your receivables, payables, and maintain a clear overview of your financial transactions.

## ✨ Features

### 🔐 Authentication System
- **User Registration**: Create new accounts with email and password
- **Secure Login**: Password-protected access to personal ledgers
- **User Isolation**: Each user has their own private ledger data
- **Session Management**: Automatic login persistence

### 💰 Ledger Management
- **Transaction Types**: Track money you're owed (Receivables) and money you owe (Payables)
- **Detailed Entries**: Record person/entity, amount, reason, date, and category
- **Real-time Statistics**: Live updates of total receivables, payables, and net balance
- **Data Persistence**: All data stored locally in browser storage

### 🎨 Modern Neon Theme
- **Cyberpunk Aesthetic**: Dark background with neon blue, pink, and green accents
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Smooth Animations**: Hover effects, transitions, and visual feedback
- **Glass Morphism**: Modern backdrop blur and transparency effects

### 🔍 Advanced Features
- **Smart Filtering**: Filter by transaction type, category, or search terms
- **Edit & Delete**: Modify or remove existing entries
- **Data Export**: Download your ledger data as JSON files
- **Data Import**: Import previously exported data
- **Toast Notifications**: Real-time feedback for all actions

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- No additional software installation required

### Installation
1. Clone or download this repository
2. Open `index.html` in your web browser
3. Start using NeonLedger immediately!

### First Time Setup
1. **Create Account**: Click "Sign Up" and fill in your details
2. **Verify Email**: Use a valid email format
3. **Set Password**: Minimum 6 characters required
4. **Start Tracking**: Begin adding your financial transactions

## 📱 Usage Guide

### Adding Transactions
1. **Select Type**: Choose "I Get (+)" for money owed to you, "I Owe (-)" for money you owe
2. **Enter Details**: Fill in person/entity name, amount, reason, and date
3. **Choose Category**: Select from Personal, Business, Loan, Rent, Utilities, or Other
4. **Submit**: Click "Add Entry" to save the transaction

### Managing Entries
- **Edit**: Click the edit button (pencil icon) to modify an entry
- **Delete**: Click the delete button (trash icon) to remove an entry
- **Filter**: Use the dropdown menus to view specific transaction types or categories
- **Search**: Type in the search box to find specific entries

### Understanding Your Dashboard
- **Total Receivable**: Sum of all money owed to you
- **Total Payable**: Sum of all money you owe
- **Net Balance**: Your current financial position (receivables minus payables)

## 🎨 Theme Customization

The neon theme uses CSS custom properties that can be easily modified:

```css
:root {
  --neon-blue: #00d4ff;      /* Primary neon blue */
  --neon-pink: #ff0080;      /* Neon pink for payables */
  --neon-green: #00ff88;     /* Neon green for receivables */
  --neon-purple: #8a2be2;    /* Secondary accent */
  --dark-bg: #0a0a0a;        /* Dark background */
  --card-bg: rgba(26, 26, 46, 0.8); /* Card background */
}
```

## 🔒 Data Security

- **Local Storage**: All data is stored locally in your browser
- **No Cloud Storage**: Your financial information never leaves your device
- **Password Hashing**: Passwords are hashed before storage
- **User Isolation**: Each user's data is completely separate

## 📊 Data Management

### Export Your Data
- All data can be exported as JSON files
- Includes transaction history and user information
- Perfect for backups or transferring to other systems

### Import Data
- Import previously exported JSON files
- Merge with existing data or start fresh
- Maintains data integrity and formatting

## 🛠️ Technical Details

### Built With
- **HTML5**: Semantic markup and modern structure
- **CSS3**: Advanced styling with CSS Grid, Flexbox, and custom properties
- **Vanilla JavaScript**: ES6+ features with class-based architecture
- **Font Awesome**: Icon library for enhanced UI
- **Local Storage API**: Client-side data persistence

### Browser Support
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

### Performance Features
- **Lazy Loading**: Data loaded only when needed
- **Efficient Rendering**: Optimized DOM manipulation
- **Responsive Design**: Mobile-first approach
- **Smooth Animations**: Hardware-accelerated transitions

## 🚧 Future Enhancements

- [ ] **Cloud Sync**: Optional cloud storage for data backup
- [ ] **Multi-Currency**: Support for different currencies
- [ ] **Charts & Analytics**: Visual representation of financial data
- [ ] **Recurring Transactions**: Set up automatic recurring entries
- [ ] **Budget Tracking**: Budget limits and spending alerts
- [ ] **Receipt Upload**: Attach receipt images to transactions
- [ ] **Export Formats**: PDF and Excel export options
- [ ] **Dark/Light Themes**: Multiple theme options

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues, feature requests, or pull requests.

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- **Font Awesome** for the beautiful icons
- **CSS Grid & Flexbox** for modern layout capabilities
- **Local Storage API** for client-side data persistence
- **Modern CSS** for the stunning neon effects

## 📞 Support

If you encounter any issues or have questions:
1. Check the browser console for error messages
2. Ensure you're using a modern browser
3. Clear browser cache and try again
4. Open an issue on the GitHub repository

---

**NeonLedger** - Illuminate your financial future with neon precision! ✨💰
