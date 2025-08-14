// NeonLedger - Personal Finance Manager
class NeonLedger {
  constructor() {
    this.currentUser = null;
    this.users = JSON.parse(localStorage.getItem('users') || '[]');
    this.entries = [];
    this.filteredEntries = [];
    
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.checkAuthStatus();
    this.setCurrentDate();
  }

  setupEventListeners() {
    // Auth form switches
    document.getElementById('show-signup').addEventListener('click', (e) => {
      e.preventDefault();
      this.showForm('signup');
    });

    document.getElementById('show-login').addEventListener('click', (e) => {
      e.preventDefault();
      this.showForm('login');
    });

    // Auth form submissions
    document.getElementById('login-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleLogin();
    });

    document.getElementById('signup-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSignup();
    });

    // Logout
    document.getElementById('logout-btn').addEventListener('click', () => {
      this.logout();
    });

    // Entry form
    document.getElementById('entry-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.addEntry();
    });

    // Filters
    document.getElementById('filter-type').addEventListener('change', () => this.filterEntries());
    document.getElementById('filter-category').addEventListener('change', () => this.filterEntries());
    document.getElementById('search-entries').addEventListener('input', () => this.filterEntries());
  }

  showForm(formType) {
    document.querySelectorAll('.auth-form').forEach(form => {
      form.classList.remove('active');
    });
    
    if (formType === 'signup') {
      document.getElementById('signup-form').classList.add('active');
    } else {
      document.getElementById('login-form').classList.add('active');
    }
  }

  setCurrentDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('date').value = today;
  }

  checkAuthStatus() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser) {
      this.currentUser = currentUser;
      this.loadUserEntries();
      this.showApp();
    } else {
      this.showAuth();
    }
  }

  showAuth() {
    document.getElementById('auth-container').classList.remove('hidden');
    document.getElementById('app-container').classList.add('hidden');
  }

  showApp() {
    document.getElementById('auth-container').classList.add('hidden');
    document.getElementById('app-container').classList.remove('hidden');
    document.getElementById('user-name').textContent = this.currentUser.name;
    this.updateStats();
    this.renderEntries();
  }

  handleSignup() {
    const name = document.getElementById('signup-name').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm').value;

    if (password !== confirmPassword) {
      this.showToast('Passwords do not match!', 'error');
      return;
    }

    if (password.length < 6) {
      this.showToast('Password must be at least 6 characters!', 'error');
      return;
    }

    if (this.users.find(user => user.email === email)) {
      this.showToast('User already exists!', 'error');
      return;
    }

    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      password: this.hashPassword(password),
      createdAt: new Date().toISOString()
    };

    this.users.push(newUser);
    localStorage.setItem('users', JSON.stringify(this.users));
    
    this.showToast('Account created successfully!', 'success');
    this.showForm('login');
    
    // Clear form
    document.getElementById('signup-form').reset();
  }

  handleLogin() {
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    const user = this.users.find(u => u.email === email && u.password === this.hashPassword(password));
    
    if (user) {
      this.currentUser = { id: user.id, name: user.name, email: user.email };
      localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
      this.loadUserEntries();
      this.showApp();
      this.showToast(`Welcome back, ${user.name}!`, 'success');
    } else {
      this.showToast('Invalid credentials!', 'error');
    }
  }

  logout() {
    this.currentUser = null;
    localStorage.removeItem('currentUser');
    this.entries = [];
    this.showAuth();
    this.showToast('Logged out successfully!', 'success');
  }

  hashPassword(password) {
    // Simple hash for demo purposes - in production, use proper hashing
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString();
  }

  loadUserEntries() {
    const userEntries = JSON.parse(localStorage.getItem(`entries_${this.currentUser.id}`) || '[]');
    this.entries = userEntries;
    this.filteredEntries = [...this.entries];
  }

  saveUserEntries() {
    localStorage.setItem(`entries_${this.currentUser.id}`, JSON.stringify(this.entries));
  }

  addEntry() {
    const type = document.getElementById('type').value;
    const name = document.getElementById('name').value.trim();
    const amount = parseFloat(document.getElementById('amount').value);
    const reason = document.getElementById('reason').value.trim();
    const date = document.getElementById('date').value;
    const category = document.getElementById('category').value;

    if (!name || !amount || !reason || !date) {
      this.showToast('Please fill all required fields!', 'error');
      return;
    }

    const entry = {
      id: Date.now().toString(),
      type,
      name,
      amount,
      reason,
      date,
      category,
      createdAt: new Date().toISOString()
    };

    this.entries.unshift(entry);
    this.saveUserEntries();
    this.updateStats();
    this.filterEntries();
    this.renderEntries();

    // Clear form
    document.getElementById('entry-form').reset();
    this.setCurrentDate();
    
    this.showToast('Entry added successfully!', 'success');
  }

  deleteEntry(entryId) {
    if (confirm('Are you sure you want to delete this entry?')) {
      this.entries = this.entries.filter(entry => entry.id !== entryId);
      this.saveUserEntries();
      this.updateStats();
      this.filterEntries();
      this.renderEntries();
      this.showToast('Entry deleted successfully!', 'success');
    }
  }

  editEntry(entryId) {
    const entry = this.entries.find(e => e.id === entryId);
    if (!entry) return;

    // For now, we'll just delete and let user recreate
    // In a full app, you'd have an edit modal
    this.deleteEntry(entryId);
    
    // Pre-fill the form
    document.getElementById('type').value = entry.type;
    document.getElementById('name').value = entry.name;
    document.getElementById('amount').value = entry.amount;
    document.getElementById('reason').value = entry.reason;
    document.getElementById('date').value = entry.date;
    document.getElementById('category').value = entry.category;
    
    this.showToast('Entry loaded for editing. Update and submit to save.', 'success');
  }

  filterEntries() {
    const typeFilter = document.getElementById('filter-type').value;
    const categoryFilter = document.getElementById('filter-category').value;
    const searchTerm = document.getElementById('search-entries').value.toLowerCase();

    this.filteredEntries = this.entries.filter(entry => {
      const typeMatch = typeFilter === 'all' || entry.type === typeFilter;
      const categoryMatch = categoryFilter === 'all' || entry.category === categoryFilter;
      const searchMatch = entry.name.toLowerCase().includes(searchTerm) || 
                         entry.reason.toLowerCase().includes(searchTerm);

      return typeMatch && categoryMatch && searchMatch;
    });

    this.renderEntries();
  }

  renderEntries() {
    const entriesContainer = document.getElementById('entries');
    entriesContainer.innerHTML = '';

    if (this.filteredEntries.length === 0) {
      entriesContainer.innerHTML = `
        <div class="no-entries">
          <i class="fas fa-inbox"></i>
          <p>No entries found</p>
        </div>
      `;
      return;
    }

    this.filteredEntries.forEach(entry => {
      const entryElement = document.createElement('div');
      entryElement.className = `entry-item ${entry.type}`;
      
      const formattedAmount = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(entry.amount);

      const formattedDate = new Date(entry.date).toLocaleDateString();

      entryElement.innerHTML = `
        <div class="entry-details">
          <h4>${entry.name}</h4>
          <p>${entry.reason}</p>
          <small>${formattedDate}</small>
        </div>
        <div class="entry-amount ${entry.type}">
          ${entry.type === 'get' ? '+' : '-'}${formattedAmount}
        </div>
        <div class="entry-category">
          ${entry.category}
        </div>
        <div class="entry-actions">
          <button class="btn-edit" onclick="ledger.editEntry('${entry.id}')" title="Edit">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn-delete" onclick="ledger.deleteEntry('${entry.id}')" title="Delete">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      `;

      entriesContainer.appendChild(entryElement);
    });
  }

  updateStats() {
    const receivables = this.entries
      .filter(entry => entry.type === 'get')
      .reduce((sum, entry) => sum + entry.amount, 0);

    const payables = this.entries
      .filter(entry => entry.type === 'owe')
      .reduce((sum, entry) => sum + entry.amount, 0);

    const netBalance = receivables - payables;

    document.getElementById('total-receivable').textContent = 
      new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(receivables);
    
    document.getElementById('total-payable').textContent = 
      new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(payables);
    
    document.getElementById('net-balance').textContent = 
      new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(netBalance);

    // Update net balance color
    const netBalanceEl = document.getElementById('net-balance');
    netBalanceEl.className = 'stat-amount';
    if (netBalance > 0) {
      netBalanceEl.classList.add('positive');
    } else if (netBalance < 0) {
      netBalanceEl.classList.add('negative');
    }
  }

  showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.remove('hidden');
    
    // Show animation
    setTimeout(() => {
      toast.classList.add('show');
    }, 100);

    // Hide after 3 seconds
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        toast.classList.add('hidden');
      }, 300);
    }, 3000);
  }

  // Export functionality
  exportData() {
    const data = {
      user: this.currentUser,
      entries: this.entries,
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `neonledger_${this.currentUser.name}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    this.showToast('Data exported successfully!', 'success');
  }

  // Import functionality
  importData(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (data.entries && Array.isArray(data.entries)) {
          this.entries = [...this.entries, ...data.entries];
          this.saveUserEntries();
          this.updateStats();
          this.filterEntries();
          this.renderEntries();
          this.showToast('Data imported successfully!', 'success');
        } else {
          this.showToast('Invalid file format!', 'error');
        }
      } catch (error) {
        this.showToast('Error reading file!', 'error');
      }
    };
    reader.readAsText(file);
  }
}

// Initialize the application
let ledger;
document.addEventListener('DOMContentLoaded', () => {
  ledger = new NeonLedger();
});

// Add some CSS for the no-entries state
const style = document.createElement('style');
style.textContent = `
  .no-entries {
    text-align: center;
    padding: 3rem;
    color: rgba(255, 255, 255, 0.6);
  }
  
  .no-entries i {
    font-size: 3rem;
    margin-bottom: 1rem;
    color: var(--neon-blue);
  }
`;
document.head.appendChild(style);
