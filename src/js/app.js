// Wallet Connection
class WalletManager {
    constructor() {
        this.wallet = null;
        this.publicKey = null;
        this.balance = 0;
        this.connection = new solanaWeb3.Connection("https://api.mainnet-beta.solana.com");
    }

    async connect() {
        try {
            if (!window.solana || !window.solana.isPhantom) {
                throw new Error("Phantom wallet not installed");
            }

            const resp = await window.solana.connect();
            this.wallet = window.solana;
            this.publicKey = resp.publicKey.toString();
            await this.updateBalance();
            
            this.wallet.on('disconnect', () => this.handleDisconnect());
            this.wallet.on('accountChanged', () => this.handleAccountChanged());

            return {
                success: true,
                publicKey: this.publicKey,
                balance: this.balance
            };
        } catch (error) {
            console.error('Wallet connection error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async updateBalance() {
        try {
            const balance = await this.connection.getBalance(new solanaWeb3.PublicKey(this.publicKey));
            this.balance = balance / solanaWeb3.LAMPORTS_PER_SOL;
            return this.balance;
        } catch (error) {
            console.error('Balance update error:', error);
            throw error;
        }
    }

    handleDisconnect() {
        this.wallet = null;
        this.publicKey = null;
        this.balance = 0;
        this.updateUI({ connected: false });
    }

    async handleAccountChanged() {
        if (this.wallet && this.wallet.publicKey) {
            this.publicKey = this.wallet.publicKey.toString();
            await this.updateBalance();
            this.updateUI({ connected: true, publicKey: this.publicKey, balance: this.balance });
        }
    }

    updateUI({ connected, publicKey, balance }) {
        const walletBtn = document.getElementById('walletBtn');
        const startBot = document.getElementById('startBot');
        
        if (connected) {
            walletBtn.innerHTML = `
                <div class="flex flex-col items-center">
                    <div class="flex items-center">
                        <i class="fas fa-wallet mr-2"></i>
                        ${publicKey.slice(0, 4)}...${publicKey.slice(-4)}
                    </div>
                    <div class="text-sm mt-1">${balance.toFixed(2)} SOL</div>
                </div>
            `;
            walletBtn.classList.remove('bg-blue-500', 'hover:bg-blue-600');
            walletBtn.classList.add('bg-green-500', 'hover:bg-green-600', 'neon-border');
            
            if (startBot) {
                startBot.disabled = false;
                startBot.classList.remove('opacity-50', 'cursor-not-allowed');
            }
        } else {
            walletBtn.innerHTML = `
                <i class="fas fa-wallet mr-2"></i>
                Connect Wallet
            `;
            walletBtn.classList.remove('bg-green-500', 'hover:bg-green-600', 'neon-border');
            walletBtn.classList.add('bg-blue-500', 'hover:bg-blue-600');
            
            if (startBot) {
                startBot.disabled = true;
                startBot.classList.add('opacity-50', 'cursor-not-allowed');
            }
        }
    }
}

// Toast Notifications
class ToastManager {
    show(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type} translate-y-full`;
        toast.innerHTML = message;
        
        document.body.appendChild(toast);
        
        // Trigger animation
        setTimeout(() => {
            toast.classList.remove('translate-y-full');
        }, 100);
        
        // Remove toast
        setTimeout(() => {
            toast.classList.add('translate-y-full');
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }
}

// Loading Spinner
class LoadingManager {
    show() {
        const overlay = document.createElement('div');
        overlay.className = 'loading-overlay';
        overlay.innerHTML = '<div class="loading-spinner"></div>';
        document.body.appendChild(overlay);
    }
    
    hide() {
        const overlay = document.querySelector('.loading-overlay');
        if (overlay) {
            overlay.remove();
        }
    }
}

// Chart Initialization
function initializeCharts() {
    const charts = {
        profit: null,
        markets: null
    };

    // Profit History Chart
    const profitChart = document.getElementById('profitChart');
    if (profitChart) {
        charts.profit = new Chart(profitChart.getContext('2d'), {
            type: 'line',
            data: {
                labels: ['1h', '2h', '3h', '4h', '5h', '6h'],
                datasets: [{
                    label: 'Profit (SOL)',
                    data: [0, 0.1, 0.15, 0.2, 0.18, 0.25],
                    borderColor: '#14F195',
                    backgroundColor: 'rgba(20, 241, 149, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#888'
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#888'
                        }
                    }
                }
            }
        });
    }

    // Markets Distribution Chart
    const marketsChart = document.getElementById('marketsChart');
    if (marketsChart) {
        charts.markets = new Chart(marketsChart.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: ['Raydium', 'Orca', 'Meteora'],
                datasets: [{
                    data: [40, 35, 25],
                    backgroundColor: ['#14F195', '#00F0FF', '#FF00FF'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            color: '#888'
                        }
                    }
                }
            }
        });
    }

    return charts;
}

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    const walletManager = new WalletManager();
    const toastManager = new ToastManager();
    const loadingManager = new LoadingManager();
    const charts = initializeCharts();

    // Wallet Connection
    const walletBtn = document.getElementById('walletBtn');
    if (walletBtn) {
        walletBtn.addEventListener('click', async () => {
            loadingManager.show();
            const result = await walletManager.connect();
            loadingManager.hide();
            
            if (result.success) {
                toastManager.show('Wallet connected successfully');
            } else {
                toastManager.show(result.error, 'error');
            }
        });
    }

    // Bot Controls
    const startBtn = document.getElementById('startBot');
    const stopBtn = document.getElementById('stopBot');
    
    if (startBtn && stopBtn) {
        startBtn.addEventListener('click', () => {
            startBtn.disabled = true;
            stopBtn.disabled = false;
            startBtn.classList.add('opacity-50', 'cursor-not-allowed');
            stopBtn.classList.remove('opacity-50', 'cursor-not-allowed');
            toastManager.show('Bot started successfully');
        });

        stopBtn.addEventListener('click', () => {
            stopBtn.disabled = true;
            startBtn.disabled = false;
            stopBtn.classList.add('opacity-50', 'cursor-not-allowed');
            startBtn.classList.remove('opacity-50', 'cursor-not-allowed');
            toastManager.show('Bot stopped successfully');
        });
    }

    // Settings Page
    const saveSettingsBtn = document.querySelector('.settings-save-btn');
    if (saveSettingsBtn) {
        saveSettingsBtn.addEventListener('click', () => {
            loadingManager.show();
            setTimeout(() => {
                loadingManager.hide();
                toastManager.show('Settings saved successfully');
            }, 1000);
        });
    }
});
