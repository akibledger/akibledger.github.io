// Akib Ledger - Personal Finance Manager
class AkibLedger {
  constructor() {
    this.isEditingEnabled = false;
    this.accessKey = 'akib2024'; // Default access key - change this to your preferred key
    this.entries = [];
    this.filteredEntries = [];
    
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.loadEntries();
    this.setCurrentDate();
    this.checkAccessKey();
  }

  setupEventListeners() {
    // Access key form
    document.getElementById('access-key-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleAccessKey();
    });

    // View only button
    document.getElementById('view-only-btn').addEventListener('click', () => {
      this.enableViewOnly();
    });

    // Lock editing button
    document.getElementById('lock-btn').addEventListener('click', () => {
      this.lockEditing();
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

  setCurrentDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('date').value = today;
  }

  checkAccessKey() {
    // Check if access key is stored in session storage
    const storedKey = sessionStorage.getItem('akibLedgerAccessKey');
    if (storedKey === this.accessKey) {
      this.enableEditing();
    } else {
      this.showApp();
    }
  }

  handleAccessKey() {
    const inputKey = document.getElementById('access-key').value.trim();
    
    if (inputKey === this.accessKey) {
      sessionStorage.setItem('akibLedgerAccessKey', inputKey);
      this.enableEditing();
      this.showToast('Access granted! Editing is now enabled.', 'success');
    } else if (inputKey === '') {
      this.enableViewOnly();
    } else {
      this.showToast('Invalid access key!', 'error');
      document.getElementById('access-key').value = '';
    }
  }

  enableViewOnly() {
    this.isEditingEnabled = false;
    sessionStorage.removeItem('akibLedgerAccessKey');
    this.showApp();
    this.showToast('Viewing in read-only mode.', 'success');
  }

  enableEditing() {
    this.isEditingEnabled = true;
    this.showApp();
    this.showToast('Editing mode enabled!', 'success');
  }

  lockEditing() {
    this.isEditingEnabled = false;
    sessionStorage.removeItem('akibLedgerAccessKey');
    document.getElementById('access-key-container').classList.remove('hidden');
    document.getElementById('app-container').classList.add('hidden');
    document.getElementById('access-key').value = '';
    this.showToast('Editing locked. Enter access key to unlock.', 'success');
  }

  showApp() {
    document.getElementById('access-key-container').classList.add('hidden');
    document.getElementById('app-container').classList.remove('hidden');
    
    // Update UI based on editing mode
    this.updateEditingUI();
    this.updateStats();
    this.renderEntries();
  }

  updateEditingUI() {
    const accessStatus = document.getElementById('access-status');
    const entryFormContainer = document.getElementById('entry-form-container');
    const appContainer = document.getElementById('app-container');
    
    if (this.isEditingEnabled) {
      accessStatus.textContent = 'Editing Enabled';
      accessStatus.className = '';
      entryFormContainer.classList.remove('hidden');
      appContainer.classList.remove('view-only');
    } else {
      accessStatus.textContent = 'View Only';
      accessStatus.className = 'locked';
      entryFormContainer.classList.add('hidden');
      appContainer.classList.add('view-only');
    }
  }

  loadEntries() {
    const storedEntries = localStorage.getItem('akibLedgerEntries');
    this.entries = storedEntries ? JSON.parse(storedEntries) : [];
    this.filteredEntries = [...this.entries];
  }

  saveEntries() {
    localStorage.setItem('akibLedgerEntries', JSON.stringify(this.entries));
  }

  addEntry() {
    if (!this.isEditingEnabled) {
      this.showToast('Access denied! Enter access key to edit.', 'error');
      return;
    }

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
    this.saveEntries();
    this.updateStats();
    this.filterEntries();
    this.renderEntries();

    // Clear form
    document.getElementById('entry-form').reset();
    this.setCurrentDate();
    
    this.showToast('Entry added successfully!', 'success');
  }

  deleteEntry(entryId) {
    if (!this.isEditingEnabled) {
      this.showToast('Access denied! Enter access key to edit.', 'error');
      return;
    }

    if (confirm('Are you sure you want to delete this entry?')) {
      this.entries = this.entries.filter(entry => entry.id !== entryId);
      this.saveEntries();
      this.updateStats();
      this.filterEntries();
      this.renderEntries();
      this.showToast('Entry deleted successfully!', 'success');
    }
  }

  editEntry(entryId) {
    if (!this.isEditingEnabled) {
      this.showToast('Access denied! Enter access key to edit.', 'error');
      return;
    }

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
        <div class="entry-actions ${!this.isEditingEnabled ? 'hidden' : ''}">
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
    if (!this.isEditingEnabled) {
      this.showToast('Access denied! Enter access key to export data.', 'error');
      return;
    }

    const data = {
      entries: this.entries,
      exportDate: new Date().toISOString(),
      totalReceivables: this.entries.filter(e => e.type === 'get').reduce((sum, e) => sum + e.amount, 0),
      totalPayables: this.entries.filter(e => e.type === 'owe').reduce((sum, e) => sum + e.amount, 0)
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `akibledger_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    this.showToast('Data exported successfully!', 'success');
  }

  // Import functionality
  importData(file) {
    if (!this.isEditingEnabled) {
      this.showToast('Access denied! Enter access key to import data.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (data.entries && Array.isArray(data.entries)) {
          this.entries = [...this.entries, ...data.entries];
          this.saveEntries();
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

  // Change access key (admin function)
  changeAccessKey(newKey) {
    if (newKey && newKey.length >= 4) {
      this.accessKey = newKey;
      this.showToast('Access key changed successfully!', 'success');
      return true;
    } else {
      this.showToast('Access key must be at least 4 characters!', 'error');
      return false;
    }
  }
}

// Initialize the application
let ledger;
document.addEventListener('DOMContentLoaded', () => {
  ledger = new AkibLedger();
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
