// Authentication management
class AuthManager {
    constructor() {
        this.token = localStorage.getItem('access_token');
        this.userId = localStorage.getItem('user_id');
        this.username = localStorage.getItem('username');
        this.updateNavigation();
    }

    isAuthenticated() {
        return !!this.token;
    }

    getAuthHeaders() {
        return {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
        };
    }

    logout() {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_id');
        localStorage.removeItem('username');
        this.token = null;
        this.userId = null;
        this.username = null;
        this.updateNavigation();
        window.location.href = '/';
    }

    updateNavigation() {
        const authNav = document.getElementById('auth-nav');
        if (!authNav) return;

        if (this.isAuthenticated()) {
            authNav.innerHTML = `
                <li class="nav-item dropdown">
                    <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown">
                        <i class="fas fa-user"></i> ${this.username}
                    </a>
                    <ul class="dropdown-menu">
                        <li><a class="dropdown-item" href="/calculator">
                            <i class="fas fa-calculator"></i> Calculator
                        </a></li>
                        <li><a class="dropdown-item" href="#" onclick="authManager.showSavedCalculations()">
                            <i class="fas fa-history"></i> Saved Calculations
                        </a></li>
                        <li><hr class="dropdown-divider"></li>
                        <li><a class="dropdown-item" href="#" onclick="authManager.logout()">
                            <i class="fas fa-sign-out-alt"></i> Logout
                        </a></li>
                    </ul>
                </li>
            `;
        } else {
            authNav.innerHTML = `
                <li class="nav-item">
                    <a class="nav-link" href="/login">
                        <i class="fas fa-sign-in-alt"></i> Login
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="/register">
                        <i class="fas fa-user-plus"></i> Register
                    </a>
                </li>
            `;
        }
    }

    async showSavedCalculations() {
        if (!this.isAuthenticated()) {
            window.location.href = '/login';
            return;
        }

        try {
            const response = await fetch('/api/calculations', {
                headers: this.getAuthHeaders()
            });

            if (response.ok) {
                const calculations = await response.json();
                this.displaySavedCalculations(calculations);
            } else if (response.status === 401) {
                this.logout();
            } else {
                console.error('Failed to load calculations');
            }
        } catch (error) {
            console.error('Error loading calculations:', error);
        }
    }

    displaySavedCalculations(calculations) {
        const modal = new bootstrap.Modal(document.getElementById('savedCalculationsModal'));
        const list = document.getElementById('saved-calculations-list');
        
        if (calculations.length === 0) {
            list.innerHTML = '<p class="text-muted text-center">No saved calculations yet.</p>';
        } else {
            list.innerHTML = calculations.map(calc => `
                <div class="card mb-3">
                    <div class="card-body">
                        <div class="row align-items-center">
                            <div class="col-md-8">
                                <h6 class="card-title">
                                    Age ${calc.current_age} → ${calc.retirement_age} 
                                    <small class="text-muted">(${new Date(calc.created_at).toLocaleDateString()})</small>
                                </h6>
                                <p class="card-text small mb-1">
                                    <strong>Assets:</strong> $${calc.current_assets.toLocaleString()} | 
                                    <strong>FIRE:</strong> $${calc.fire_number.toLocaleString()} | 
                                    <strong>Coast FIRE:</strong> $${calc.coast_fire_number.toLocaleString()}
                                </p>
                                ${calc.years_to_coast_fire ? 
                                    `<small class="text-success">Coast FIRE in ${calc.years_to_coast_fire.toFixed(1)} years</small>` :
                                    '<small class="text-success">Coast FIRE achieved!</small>'
                                }
                            </div>
                            <div class="col-md-4 text-end">
                                <button class="btn btn-sm btn-outline-primary me-2" onclick="authManager.loadCalculation(${calc.id})">
                                    <i class="fas fa-download"></i> Load
                                </button>
                                <button class="btn btn-sm btn-outline-danger" onclick="authManager.deleteCalculation(${calc.id})">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('');
        }
        
        modal.show();
    }

    async loadCalculation(calculationId) {
        // This would load a specific calculation into the form
        // Implementation depends on the calculator.js structure
        console.log('Loading calculation:', calculationId);
    }

    async deleteCalculation(calculationId) {
        if (!confirm('Are you sure you want to delete this calculation?')) {
            return;
        }

        try {
            const response = await fetch(`/api/calculations/${calculationId}`, {
                method: 'DELETE',
                headers: this.getAuthHeaders()
            });

            if (response.ok) {
                // Refresh the list
                this.showSavedCalculations();
            } else {
                console.error('Failed to delete calculation');
            }
        } catch (error) {
            console.error('Error deleting calculation:', error);
        }
    }
}

// Initialize auth manager
const authManager = new AuthManager();