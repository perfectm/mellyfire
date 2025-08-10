// FIRE Calculator JavaScript
class FireCalculator {
    constructor() {
        this.chart = null;
        this.currentResults = null;
        this.initializeEventListeners();
        this.updateVisibility();
    }

    initializeEventListeners() {
        const form = document.getElementById('fire-form');
        if (form) {
            form.addEventListener('submit', (e) => this.handleFormSubmit(e));
            
            // Add real-time calculation on input change
            form.addEventListener('input', () => this.debounce(() => this.calculateGuest(), 500));
            
            // Add number formatting to financial input fields
            this.initializeNumberFormatting();
        }

        const saveButton = document.getElementById('save-calculation');
        if (saveButton) {
            saveButton.addEventListener('click', () => this.saveCalculation());
        }
    }

    initializeNumberFormatting() {
        // Financial fields that should have comma formatting
        const financialFields = [
            'current_assets',
            'monthly_income', 
            'monthly_expenses',
            'monthly_savings',
            'retirement_expenses'
        ];

        financialFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                // Format on input
                field.addEventListener('input', (e) => this.formatNumberInput(e));
                // Format on focus out
                field.addEventListener('blur', (e) => this.formatNumberInput(e));
                // Remove formatting on focus for easier editing
                field.addEventListener('focus', (e) => this.removeNumberFormatting(e));
                
                // Format initial value if it exists
                if (field.value) {
                    this.formatNumberInput({ target: field });
                }
            }
        });
    }

    formatNumberInput(event) {
        const input = event.target;
        let value = input.value.replace(/,/g, ''); // Remove existing commas
        
        // Only format if it's a valid number
        if (value && !isNaN(value)) {
            const number = parseFloat(value);
            input.value = this.formatNumberWithCommas(number);
        }
    }

    removeNumberFormatting(event) {
        const input = event.target;
        let value = input.value.replace(/,/g, ''); // Remove commas for easier editing
        input.value = value;
    }

    formatNumberWithCommas(number) {
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(number);
    }

    updateVisibility() {
        const resultsSection = document.getElementById('results-section');
        const loginPrompt = document.getElementById('login-prompt');
        
        if (authManager.isAuthenticated()) {
            if (loginPrompt) loginPrompt.style.display = 'none';
        } else {
            if (resultsSection) resultsSection.classList.add('d-none');
        }
    }

    async handleFormSubmit(e) {
        e.preventDefault();
        
        if (authManager.isAuthenticated()) {
            await this.calculateWithSave();
        } else {
            this.calculateGuest();
        }
    }

    getFormData() {
        const form = document.getElementById('fire-form');
        const formData = new FormData(form);
        
        // Helper function to parse numbers that may have commas
        const parseNumber = (value) => {
            return parseFloat(String(value).replace(/,/g, '') || '0');
        };
        
        return {
            current_age: parseInt(formData.get('current_age')),
            retirement_age: parseInt(formData.get('retirement_age')),
            current_assets: parseNumber(formData.get('current_assets')),
            monthly_income: parseNumber(formData.get('monthly_income')),
            monthly_expenses: parseNumber(formData.get('monthly_expenses')),
            monthly_savings: parseNumber(formData.get('monthly_savings')),
            retirement_expenses: parseNumber(formData.get('retirement_expenses')),
            investment_return_rate: parseFloat(formData.get('investment_return_rate')),
            inflation_rate: parseFloat(formData.get('inflation_rate')),
            safe_withdrawal_rate: parseFloat(formData.get('safe_withdrawal_rate'))
        };
    }

    async calculateWithSave() {
        const data = this.getFormData();
        
        try {
            const response = await fetch('/api/calculate', {
                method: 'POST',
                headers: authManager.getAuthHeaders(),
                body: JSON.stringify(data)
            });

            if (response.ok) {
                const results = await response.json();
                this.displayResults(results);
                this.currentResults = results;
                
                // Show save button
                const saveButton = document.getElementById('save-calculation');
                if (saveButton) {
                    saveButton.style.display = 'none'; // Already saved
                }
            } else if (response.status === 401) {
                authManager.logout();
            } else {
                const error = await response.json();
                this.showError(error.detail || 'Calculation failed');
            }
        } catch (error) {
            this.showError('Network error. Please try again.');
        }
    }

    calculateGuest() {
        const data = this.getFormData();
        
        // Perform client-side calculation for guest users
        const results = this.performCalculation(data);
        this.displayResults(results);
        this.currentResults = results;
        
        // Show save button for logged-in users
        const saveButton = document.getElementById('save-calculation');
        if (saveButton && authManager.isAuthenticated()) {
            saveButton.style.display = 'block';
        }
    }

    performCalculation(data) {
        // Client-side implementation of FIRE calculations
        const fireNumber = data.retirement_expenses / (data.safe_withdrawal_rate / 100);
        const realReturnRate = (data.investment_return_rate - data.inflation_rate) / 100;
        const yearsToRetirement = data.retirement_age - data.current_age;
        const coastFireNumber = fireNumber / Math.pow(1 + realReturnRate, yearsToRetirement);
        
        // Calculate years to FIRE
        let yearsToFire = null;
        const annualSavings = data.monthly_savings * 12;
        const returnRate = data.investment_return_rate / 100;
        
        if (annualSavings > 0 && returnRate > 0) {
            const numerator = Math.log((fireNumber * returnRate + annualSavings) / (data.current_assets * returnRate + annualSavings));
            const denominator = Math.log(1 + returnRate);
            yearsToFire = Math.max(0, numerator / denominator);
        }
        
        // Calculate years to Coast FIRE
        let yearsToCoastFire = null;
        if (data.current_assets >= coastFireNumber) {
            yearsToCoastFire = 0;
        } else if (annualSavings > 0 && returnRate > 0) {
            const numerator = Math.log((coastFireNumber * returnRate + annualSavings) / (data.current_assets * returnRate + annualSavings));
            const denominator = Math.log(1 + returnRate);
            yearsToCoastFire = Math.max(0, numerator / denominator);
        }
        
        // Generate projection data
        const projectionData = this.generateProjectionData(data, fireNumber, coastFireNumber);
        
        return {
            fire_number: fireNumber,
            coast_fire_number: coastFireNumber,
            years_to_fire: yearsToFire,
            years_to_coast_fire: yearsToCoastFire,
            coast_fire_age: yearsToCoastFire ? data.current_age + yearsToCoastFire : null,
            projection_data: projectionData,
            current_coast_fire_status: data.current_assets >= coastFireNumber,
            current_fire_status: data.current_assets >= fireNumber
        };
    }

    generateProjectionData(data, fireNumber, coastFireNumber) {
        const years = [];
        const ages = [];
        const assets = [];
        const coastFireMilestones = [];
        const achievedCoastFire = [];
        const achievedFire = [];
        
        let currentAssets = data.current_assets;
        const annualSavings = data.monthly_savings * 12;
        const returnRate = data.investment_return_rate / 100;
        const realReturnRate = (data.investment_return_rate - data.inflation_rate) / 100;
        
        for (let year = 0; year <= 40; year++) {
            const age = data.current_age + year;
            
            years.push(year);
            ages.push(age);
            assets.push(currentAssets);
            
            // Calculate Coast FIRE milestone for this age
            const yearsLeft = Math.max(0, data.retirement_age - age);
            const milestone = yearsLeft > 0 ? fireNumber / Math.pow(1 + realReturnRate, yearsLeft) : fireNumber;
            coastFireMilestones.push(milestone);
            
            achievedCoastFire.push(currentAssets >= milestone);
            achievedFire.push(currentAssets >= fireNumber);
            
            // Update assets for next year
            if (age < data.retirement_age) {
                currentAssets = currentAssets * (1 + returnRate) + annualSavings;
            } else {
                const inflationAdjustedExpenses = data.retirement_expenses * Math.pow(1 + data.inflation_rate / 100, age - data.retirement_age);
                currentAssets = currentAssets * (1 + returnRate) - inflationAdjustedExpenses;
            }
            
            if (currentAssets < 0) break;
        }
        
        return {
            years,
            ages,
            assets,
            coast_fire_milestones: coastFireMilestones,
            achieved_coast_fire: achievedCoastFire,
            achieved_fire: achievedFire
        };
    }

    displayResults(results) {
        // Show results section
        const resultsSection = document.getElementById('results-section');
        resultsSection.classList.remove('d-none');
        
        // Update key metrics
        document.getElementById('fire-number').textContent = this.formatCurrency(results.fire_number);
        document.getElementById('coast-fire-number').textContent = this.formatCurrency(results.coast_fire_number);
        
        if (results.years_to_fire) {
            document.getElementById('years-to-fire').textContent = results.years_to_fire.toFixed(1);
        } else {
            document.getElementById('years-to-fire').textContent = '∞';
        }
        
        if (results.coast_fire_age) {
            document.getElementById('coast-fire-age').textContent = results.coast_fire_age.toFixed(0);
        } else {
            document.getElementById('coast-fire-age').textContent = 'Now!';
        }
        
        // Update status indicators
        this.updateStatusIndicators(results);
        
        // Update chart
        this.updateChart(results);
        
        // Update analysis
        this.updateAnalysis(results);
    }

    updateStatusIndicators(results) {
        const container = document.getElementById('status-indicators');
        const coastFireStatus = results.current_coast_fire_status;
        const fireStatus = results.current_fire_status;
        
        let statusHtml = '<div class="row">';
        
        // Coast FIRE Status
        statusHtml += `
            <div class="col-md-6">
                <div class="alert ${coastFireStatus ? 'alert-success' : 'alert-warning'} mb-2">
                    <i class="fas ${coastFireStatus ? 'fa-check-circle' : 'fa-clock'}"></i>
                    <strong>Coast FIRE:</strong> 
                    ${coastFireStatus ? 'Achieved!' : 'Not yet achieved'}
                </div>
            </div>
        `;
        
        // FIRE Status
        statusHtml += `
            <div class="col-md-6">
                <div class="alert ${fireStatus ? 'alert-success' : 'alert-info'} mb-2">
                    <i class="fas ${fireStatus ? 'fa-check-circle' : 'fa-target'}"></i>
                    <strong>Full FIRE:</strong> 
                    ${fireStatus ? 'Achieved!' : 'In progress'}
                </div>
            </div>
        `;
        
        statusHtml += '</div>';
        container.innerHTML = statusHtml;
    }

    updateChart(results) {
        const ctx = document.getElementById('projection-chart');
        if (!ctx) return;
        
        if (this.chart) {
            this.chart.destroy();
        }
        
        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: results.projection_data.ages,
                datasets: [
                    {
                        label: 'Your Assets',
                        data: results.projection_data.assets,
                        borderColor: 'rgb(54, 162, 235)',
                        backgroundColor: 'rgba(54, 162, 235, 0.1)',
                        borderWidth: 3,
                        fill: false
                    },
                    {
                        label: 'Coast FIRE Milestone',
                        data: results.projection_data.coast_fire_milestones,
                        borderColor: 'rgb(75, 192, 192)',
                        backgroundColor: 'rgba(75, 192, 192, 0.1)',
                        borderWidth: 2,
                        borderDash: [5, 5],
                        fill: false
                    },
                    {
                        label: 'FIRE Number',
                        data: new Array(results.projection_data.ages.length).fill(results.fire_number),
                        borderColor: 'rgb(255, 99, 132)',
                        backgroundColor: 'rgba(255, 99, 132, 0.1)',
                        borderWidth: 2,
                        borderDash: [10, 5],
                        fill: false
                    }
                ]
            },
            options: {
                responsive: true,
                scales: {
                    x: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Age'
                        }
                    },
                    y: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Assets ($)'
                        },
                        ticks: {
                            callback: function(value) {
                                return '$' + (value / 1000000).toFixed(1) + 'M';
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.dataset.label + ': $' + context.parsed.y.toLocaleString();
                            }
                        }
                    }
                }
            }
        });
    }

    updateAnalysis(results) {
        const container = document.getElementById('analysis-content');
        let analysisHtml = '';
        
        if (results.current_coast_fire_status) {
            analysisHtml += `
                <div class="alert alert-success">
                    <h6><i class="fas fa-trophy"></i> Congratulations!</h6>
                    <p>You've achieved Coast FIRE! You can now coast to retirement without additional savings.</p>
                </div>
            `;
        } else if (results.years_to_coast_fire) {
            analysisHtml += `
                <div class="alert alert-info">
                    <h6><i class="fas fa-target"></i> Coast FIRE Plan</h6>
                    <p>At your current savings rate, you'll achieve Coast FIRE in <strong>${results.years_to_coast_fire.toFixed(1)} years</strong> at age <strong>${results.coast_fire_age.toFixed(0)}</strong>.</p>
                </div>
            `;
        }
        
        // Add recommendations
        analysisHtml += '<h6>Key Insights:</h6><ul>';
        
        if (results.years_to_fire && results.years_to_fire < results.years_to_coast_fire * 2) {
            analysisHtml += '<li>Your aggressive savings rate puts you on track for full FIRE relatively quickly!</li>';
        }
        
        if (results.years_to_coast_fire && results.years_to_coast_fire > 20) {
            analysisHtml += '<li>Consider increasing your savings rate to reach Coast FIRE sooner.</li>';
        }
        
        const savingsRate = (this.getFormData().monthly_savings * 12) / (this.getFormData().monthly_income * 12) * 100;
        if (savingsRate > 50) {
            analysisHtml += '<li>Excellent! Your high savings rate will accelerate your FIRE journey.</li>';
        } else if (savingsRate < 20) {
            analysisHtml += '<li>Consider increasing your savings rate to 20% or higher for faster progress.</li>';
        }
        
        analysisHtml += '</ul>';
        container.innerHTML = analysisHtml;
    }

    async saveCalculation() {
        if (!authManager.isAuthenticated() || !this.currentResults) {
            return;
        }
        
        const data = this.getFormData();
        
        try {
            const response = await fetch('/api/calculate', {
                method: 'POST',
                headers: authManager.getAuthHeaders(),
                body: JSON.stringify(data)
            });
            
            if (response.ok) {
                document.getElementById('save-calculation').style.display = 'none';
                this.showSuccess('Calculation saved successfully!');
            }
        } catch (error) {
            this.showError('Failed to save calculation');
        }
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }

    debounce(func, wait) {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(func, wait);
    }

    showError(message) {
        // Show error toast or alert
        console.error(message);
    }

    showSuccess(message) {
        // Show success toast or alert
        console.log(message);
    }
}

// Global functions
function showGuestCalculator() {
    document.getElementById('login-prompt').style.display = 'none';
    calculator.updateVisibility();
    calculator.calculateGuest();
}

// Initialize calculator when page loads
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('fire-form')) {
        window.calculator = new FireCalculator();
    }
});