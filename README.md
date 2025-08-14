# Akib Ledger - Personal Finance Manager

A modern, neon-themed personal finance management system built with HTML, CSS, and JavaScript. Track your receivables, payables, and maintain a clear overview of your financial transactions.

## Features

### Authentication System
- User registration and login with email and password
- Secure password-protected access to personal ledgers
- User data isolation and session management

### Ledger Management
- Track money you're owed (Receivables) and money you owe (Payables)
- Record detailed entries with person, amount, reason, date, and category
- Real-time statistics showing totals and net balance
- Local data storage for privacy and security

### Modern Neon Theme
- Dark background with neon blue, pink, and green accents
- Responsive design for all devices
- Smooth animations and visual feedback
- Glass morphism effects with backdrop blur

### Advanced Features
- Filter transactions by type, category, or search terms
- Edit and delete existing entries
- Export and import data as JSON files
- Toast notifications for user feedback

## Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- No additional software installation required

### Installation
1. Clone or download this repository
2. Open `index.html` in your web browser
3. Start using NeonLedger immediately!

### First Time Setup
1. Click "Sign Up" and fill in your details
2. Use a valid email format
3. Set password (minimum 6 characters)
4. Begin adding your financial transactions

## Usage Guide

### Adding Transactions
1. Select transaction type: "I Get (+)" for money owed to you, "I Owe (-)" for money you owe
2. Enter person/entity name, amount, reason, and date
3. Choose category from Personal, Business, Loan, Rent, Utilities, or Other
4. Click "Add Entry" to save

### Managing Entries
- Edit: Click the edit button to modify an entry
- Delete: Click the delete button to remove an entry
- Filter: Use dropdown menus for transaction types or categories
- Search: Type in search box to find specific entries

### Dashboard Overview
- Total Receivable: Sum of all money owed to you
- Total Payable: Sum of all money you owe
- Net Balance: Your current financial position

## Theme Customization

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

## Data Security

- All data stored locally in your browser
- No cloud storage - your information never leaves your device
- Passwords are hashed before storage
- Each user's data is completely separate

## Data Management

### Export Data
- Export all data as JSON files
- Includes transaction history and user information
- Perfect for backups or transferring to other systems

### Import Data
- Import previously exported JSON files
- Merge with existing data or start fresh
- Maintains data integrity and formatting

## Technical Details

### Built With
- HTML5: Semantic markup and modern structure
- CSS3: Advanced styling with Grid, Flexbox, and custom properties
- Vanilla JavaScript: ES6+ features with class-based architecture
- Font Awesome: Icon library for enhanced UI
- Local Storage API: Client-side data persistence

### Browser Support
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Future Enhancements

- Cloud sync for data backup
- Multi-currency support
- Charts and analytics
- Recurring transactions
- Budget tracking
- Receipt upload
- PDF and Excel export options
- Multiple theme options

## Contributing

Contributions are welcome! Please submit issues, feature requests, or pull requests.

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.

## Support

If you encounter issues:
1. Check browser console for error messages
2. Ensure you're using a modern browser
3. Clear browser cache and try again
4. Open an issue on the GitHub repository

---

**Akib Ledger** - Illuminate your financial future with neon precision!
