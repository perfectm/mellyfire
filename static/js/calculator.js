// FIRE Calculator JavaScript
class FireCalculator {
    constructor() {
        this.chart = null;
        this.currentResults = null;
        this.initializeEventListeners();
        this.updateVisibility();
        this.autoLoadRecentCalculation();
    }

    async autoLoadRecentCalculation() {
        // Auto-load most recent calculation for authenticated users
        if (authManager.isAuthenticated()) {
            // Don't auto-load if there are URL parameters (user might be coming from a specific link)
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.toString()) {
                console.log('Skipping auto-load due to URL parameters');
                return;
            }
            
            try {
                const loaded = await authManager.loadMostRecentCalculation();
                if (loaded) {
                    console.log('Auto-loaded most recent calculation');
                    // Show a subtle success message
                    this.showSuccessToast('Previous calculation loaded');
                }
            } catch (error) {
                console.error('Error auto-loading recent calculation:', error);
            }
        }
    }

    showSuccessToast(message) {
        // Create a temporary toast notification
        const toast = document.createElement('div');
        toast.className = 'alert alert-success position-fixed';
        toast.style.cssText = 'top: 20px; right: 20px; z-index: 9999; opacity: 0.9;';
        toast.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
        
        document.body.appendChild(toast);
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
            toast.style.transition = 'opacity 0.5s';
            toast.style.opacity = '0';
            setTimeout(() => {
                if (document.body.contains(toast)) {
                    document.body.removeChild(toast);
                }
            }, 500);
        }, 3000);
    }

    initializeEventListeners() {
        const form = document.getElementById('fire-form');
        if (form) {
            form.addEventListener('submit', (e) => this.handleFormSubmit(e));
            
            // Add real-time calculation on input change
            form.addEventListener('input', () => this.debounce(() => this.calculateGuest(), 500));
            
            // Add number formatting to financial input fields
            this.initializeNumberFormatting();
            
            // Initialize advanced mode and Social Security toggles
            this.initializeToggleHandlers();
            
            // Initialize retirement year calculation
            this.initializeRetirementYearCalculation();
        }

        const saveButton = document.getElementById('save-calculation');
        if (saveButton) {
            saveButton.addEventListener('click', () => this.saveCalculation());
        }
    }

    initializeToggleHandlers() {
        // Advanced mode toggle
        const advancedToggle = document.getElementById('advanced_mode');
        if (advancedToggle) {
            advancedToggle.addEventListener('change', (e) => this.toggleAdvancedMode(e.target.checked));
        }
        
        // Social Security toggle
        const socialSecurityToggle = document.getElementById('social_security_enabled');
        if (socialSecurityToggle) {
            socialSecurityToggle.addEventListener('change', (e) => this.toggleSocialSecurity(e.target.checked));
        }
        
        // Spouse toggle
        const spouseToggle = document.getElementById('spouse_enabled');
        if (spouseToggle) {
            spouseToggle.addEventListener('change', (e) => this.toggleSpouse(e.target.checked));
        }
        
        // Spouse Social Security toggle
        const spouseSocialSecurityToggle = document.getElementById('spouse_social_security_enabled');
        if (spouseSocialSecurityToggle) {
            spouseSocialSecurityToggle.addEventListener('change', (e) => this.toggleSpouseSocialSecurity(e.target.checked));
        }
    }

    toggleAdvancedMode(enabled) {
        const basicAssets = document.getElementById('basic-assets');
        const advancedAssets = document.getElementById('advanced-assets');
        const advancedBreakdown = document.getElementById('advanced-breakdown');
        
        if (enabled) {
            basicAssets.classList.add('d-none');
            advancedAssets.classList.remove('d-none');
            if (advancedBreakdown) advancedBreakdown.classList.remove('d-none');
            
            // Copy current assets value to the two separate fields
            const currentAssetsValue = document.getElementById('current_assets').value.replace(/,/g, '');
            const totalAssets = parseFloat(currentAssetsValue) || 100000;
            
            // Split 60/40 between retirement/taxable as default
            document.getElementById('retirement_accounts').value = this.formatNumberWithCommas(totalAssets * 0.6);
            document.getElementById('taxable_accounts').value = this.formatNumberWithCommas(totalAssets * 0.4);
        } else {
            basicAssets.classList.remove('d-none');
            advancedAssets.classList.add('d-none');
            if (advancedBreakdown) advancedBreakdown.classList.add('d-none');
            
            // Combine the two separate fields back into current assets
            const retirementValue = parseFloat(document.getElementById('retirement_accounts').value.replace(/,/g, '') || '0');
            const taxableValue = parseFloat(document.getElementById('taxable_accounts').value.replace(/,/g, '') || '0');
            
            document.getElementById('current_assets').value = this.formatNumberWithCommas(retirementValue + taxableValue);
        }
    }

    toggleSocialSecurity(enabled) {
        const socialSecurityOptions = document.getElementById('social-security-options');
        const socialSecurityInfo = document.getElementById('social-security-info');
        
        if (enabled) {
            socialSecurityOptions.classList.remove('d-none');
            if (socialSecurityInfo) socialSecurityInfo.classList.remove('d-none');
        } else {
            socialSecurityOptions.classList.add('d-none');
            if (socialSecurityInfo) socialSecurityInfo.classList.add('d-none');
        }
    }

    toggleSpouse(enabled) {
        const spouseOptions = document.getElementById('spouse-options');
        const spouseInfo = document.getElementById('spouse-info');
        
        if (enabled) {
            spouseOptions.classList.remove('d-none');
            if (spouseInfo) spouseInfo.classList.remove('d-none');
        } else {
            spouseOptions.classList.add('d-none');
            if (spouseInfo) spouseInfo.classList.add('d-none');
            
            // Also hide spouse Social Security if spouse is disabled
            document.getElementById('spouse_social_security_enabled').checked = false;
            this.toggleSpouseSocialSecurity(false);
        }
    }

    toggleSpouseSocialSecurity(enabled) {
        const spouseSocialSecurityOptions = document.getElementById('spouse-social-security-options');
        const spouseSsDisplay = document.getElementById('spouse-ss-display');
        
        if (enabled) {
            spouseSocialSecurityOptions.classList.remove('d-none');
            if (spouseSsDisplay) spouseSsDisplay.classList.remove('d-none');
        } else {
            spouseSocialSecurityOptions.classList.add('d-none');
            if (spouseSsDisplay) spouseSsDisplay.classList.add('d-none');
        }
    }

    initializeNumberFormatting() {
        // Financial fields that should have comma formatting
        const financialFields = [
            'current_assets',
            'monthly_income', 
            'monthly_expenses',
            'monthly_savings',
            'retirement_expenses',
            'retirement_accounts',
            'taxable_accounts',
            'social_security_monthly_benefit',
            'spouse_social_security_monthly_benefit'
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

    initializeRetirementYearCalculation() {
        const currentAgeField = document.getElementById('current_age');
        const retirementAgeField = document.getElementById('retirement_age');
        const retirementYearDisplay = document.getElementById('retirement-year-display');
        const retirementAgeDisplay = document.getElementById('retirement-age-display');
        
        this.updateRetirementYear = () => {
            if (currentAgeField && retirementAgeField && retirementYearDisplay) {
                const currentAge = parseInt(currentAgeField.value) || 30;
                const retirementAge = parseInt(retirementAgeField.value) || 65;
                const currentYear = new Date().getFullYear();
                const yearsUntilRetirement = retirementAge - currentAge;
                const retirementYear = currentYear + yearsUntilRetirement;
                
                // Update the age display badge
                if (retirementAgeDisplay) {
                    retirementAgeDisplay.textContent = retirementAge;
                }
                
                if (yearsUntilRetirement >= 0) {
                    retirementYearDisplay.textContent = `(${retirementYear})`;
                    retirementYearDisplay.style.display = 'inline';
                } else {
                    retirementYearDisplay.textContent = '(Past retirement age)';
                    retirementYearDisplay.style.display = 'inline';
                }
            }
        };
        
        // Update on page load
        this.updateRetirementYear();
        
        // Update when either field changes
        if (currentAgeField) {
            currentAgeField.addEventListener('input', this.updateRetirementYear);
        }
        if (retirementAgeField) {
            retirementAgeField.addEventListener('input', this.updateRetirementYear);
        }
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
        
        const advancedMode = formData.get('advanced_mode') === 'on';
        const socialSecurityEnabled = formData.get('social_security_enabled') === 'on';
        const spouseEnabled = formData.get('spouse_enabled') === 'on';
        const spouseSocialSecurityEnabled = formData.get('spouse_social_security_enabled') === 'on';
        
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
            safe_withdrawal_rate: parseFloat(formData.get('safe_withdrawal_rate')),
            
            // Advanced mode parameters
            advanced_mode: advancedMode,
            retirement_accounts: advancedMode ? parseNumber(formData.get('retirement_accounts')) : 0,
            taxable_accounts: advancedMode ? parseNumber(formData.get('taxable_accounts')) : 0,
            retirement_account_return_rate: advancedMode ? parseFloat(formData.get('retirement_account_return_rate') || '7') : 7,
            
            // Social Security parameters
            social_security_enabled: socialSecurityEnabled,
            social_security_start_age: socialSecurityEnabled ? parseInt(formData.get('social_security_start_age') || '65') : 65,
            social_security_monthly_benefit: socialSecurityEnabled ? parseNumber(formData.get('social_security_monthly_benefit')) : 0,
            
            // Spouse parameters
            spouse_enabled: spouseEnabled,
            spouse_age: spouseEnabled ? parseInt(formData.get('spouse_age') || '30') : 30,
            spouse_social_security_enabled: spouseEnabled && spouseSocialSecurityEnabled,
            spouse_social_security_start_age: (spouseEnabled && spouseSocialSecurityEnabled) ? parseInt(formData.get('spouse_social_security_start_age') || '65') : 65,
            spouse_social_security_monthly_benefit: (spouseEnabled && spouseSocialSecurityEnabled) ? parseNumber(formData.get('spouse_social_security_monthly_benefit')) : 0,
            
            // 401K contribution parameters
            contribution_401k_percentage: parseFloat(formData.get('contribution_401k_percentage') || '6'),
            employer_match_percentage: parseFloat(formData.get('employer_match_percentage') || '50')
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
        
        // Calculate 401K contributions
        const monthly401k = data.monthly_income * (data.contribution_401k_percentage / 100);
        const monthlyEmployerMatch = monthly401k * (data.employer_match_percentage / 100);
        const annual401k = monthly401k * 12;
        const annualEmployerMatch = monthlyEmployerMatch * 12;
        
        // Calculate years to FIRE
        let yearsToFire = null;
        const annualSavings = data.monthly_savings * 12;
        const totalAnnualSavings = annualSavings + annual401k + annualEmployerMatch;
        const returnRate = data.investment_return_rate / 100;
        
        if (totalAnnualSavings > 0 && returnRate > 0) {
            const numerator = Math.log((fireNumber * returnRate + totalAnnualSavings) / (data.current_assets * returnRate + totalAnnualSavings));
            const denominator = Math.log(1 + returnRate);
            yearsToFire = Math.max(0, numerator / denominator);
        }
        
        // Calculate years to Coast FIRE
        let yearsToCoastFire = null;
        if (data.current_assets >= coastFireNumber) {
            yearsToCoastFire = 0;
        } else if (totalAnnualSavings > 0 && returnRate > 0) {
            const numerator = Math.log((coastFireNumber * returnRate + totalAnnualSavings) / (data.current_assets * returnRate + totalAnnualSavings));
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
            current_fire_status: data.current_assets >= fireNumber,
            monte_carlo_stats: null  // No Monte Carlo stats in client-side calculation
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
        const monthly401k = data.monthly_income * (data.contribution_401k_percentage / 100);
        const monthlyEmployerMatch = monthly401k * (data.employer_match_percentage / 100);
        const annual401k = monthly401k * 12;
        const annualEmployerMatch = monthlyEmployerMatch * 12;
        const totalAnnualSavings = annualSavings + annual401k + annualEmployerMatch;
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
                currentAssets = currentAssets * (1 + returnRate) + totalAnnualSavings;
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
        
        // Update advanced mode displays
        this.updateAdvancedModeDisplays(results);
        
        // Update Social Security displays
        this.updateSocialSecurityDisplays(results);
        
        // Update spouse displays
        this.updateSpouseDisplays(results);
        
        // Update 401K displays
        this.update401kDisplays(results);
        
        // Update Monte Carlo statistics
        this.updateMonteCarloDisplays(results);
        
        // Update status indicators
        this.updateStatusIndicators(results);
        
        // Update chart
        this.updateChart(results);
        
        // Update analysis
        this.updateAnalysis(results);
    }

    updateAdvancedModeDisplays(results) {
        const data = this.getFormData();
        
        if (data.advanced_mode) {
            // Show current asset breakdown
            const currentRetirementEl = document.getElementById('current-retirement-accounts');
            const currentTaxableEl = document.getElementById('current-taxable-accounts');
            const totalAssetsEl = document.getElementById('total-assets');
            
            if (currentRetirementEl) {
                currentRetirementEl.textContent = this.formatCurrency(data.retirement_accounts);
            }
            if (currentTaxableEl) {
                currentTaxableEl.textContent = this.formatCurrency(data.taxable_accounts);
            }
            if (totalAssetsEl) {
                totalAssetsEl.textContent = this.formatCurrency(data.retirement_accounts + data.taxable_accounts);
            }
        }
    }

    updateSocialSecurityDisplays(results) {
        const data = this.getFormData();
        
        if (data.social_security_enabled) {
            const monthlyBenefitEl = document.getElementById('ss-monthly-benefit');
            const startAgeEl = document.getElementById('ss-start-age');
            
            if (monthlyBenefitEl) {
                monthlyBenefitEl.textContent = this.formatCurrency(data.social_security_monthly_benefit);
            }
            if (startAgeEl) {
                startAgeEl.textContent = data.social_security_start_age;
            }
        }
        
        // Update spouse Social Security displays
        if (data.spouse_enabled && data.spouse_social_security_enabled) {
            const spouseMonthlyBenefitEl = document.getElementById('spouse-ss-monthly-benefit');
            const spouseStartAgeEl = document.getElementById('spouse-ss-start-age');
            
            if (spouseMonthlyBenefitEl) {
                spouseMonthlyBenefitEl.textContent = this.formatCurrency(data.spouse_social_security_monthly_benefit);
            }
            if (spouseStartAgeEl) {
                spouseStartAgeEl.textContent = data.spouse_social_security_start_age;
            }
        }
        
        // Update combined Social Security displays
        if (data.social_security_enabled || (data.spouse_enabled && data.spouse_social_security_enabled)) {
            const totalAnnualEl = document.getElementById('total-ss-annual-benefit');
            const fireReductionEl = document.getElementById('fire-reduction-amount');
            
            let totalAnnual = 0;
            if (data.social_security_enabled) {
                totalAnnual += data.social_security_monthly_benefit * 12;
            }
            if (data.spouse_enabled && data.spouse_social_security_enabled) {
                totalAnnual += data.spouse_social_security_monthly_benefit * 12;
            }
            
            if (totalAnnualEl) {
                totalAnnualEl.textContent = this.formatCurrency(totalAnnual);
            }
            if (fireReductionEl) {
                fireReductionEl.textContent = this.formatCurrency(totalAnnual / (data.safe_withdrawal_rate / 100));
            }
        }
    }

    updateSpouseDisplays(results) {
        const data = this.getFormData();
        
        if (data.spouse_enabled) {
            const spouseAgeEl = document.getElementById('spouse-current-age');
            const ageGapEl = document.getElementById('age-gap');
            
            if (spouseAgeEl) {
                spouseAgeEl.textContent = data.spouse_age;
            }
            
            if (ageGapEl) {
                const ageDiff = data.current_age - data.spouse_age;
                if (ageDiff > 0) {
                    ageGapEl.textContent = `${ageDiff} years younger`;
                } else if (ageDiff < 0) {
                    ageGapEl.textContent = `${Math.abs(ageDiff)} years older`;
                } else {
                    ageGapEl.textContent = 'Same age';
                }
            }
        }
    }

    update401kDisplays(results) {
        const data = this.getFormData();
        
        const monthly401k = data.monthly_income * (data.contribution_401k_percentage / 100);
        const monthlyEmployerMatch = monthly401k * (data.employer_match_percentage / 100);
        const totalMonthly401k = monthly401k + monthlyEmployerMatch;
        const totalAnnual401k = totalMonthly401k * 12;
        
        const employee401kEl = document.getElementById('employee-401k-monthly');
        const employerMatchEl = document.getElementById('employer-match-monthly');
        const totalMonthlyEl = document.getElementById('total-401k-monthly');
        const totalAnnualEl = document.getElementById('total-401k-annual');
        const employeePercentageEl = document.getElementById('employee-401k-percentage');
        const matchPercentageEl = document.getElementById('employer-match-percentage');
        
        if (employee401kEl) {
            employee401kEl.textContent = this.formatCurrency(monthly401k);
        }
        if (employerMatchEl) {
            employerMatchEl.textContent = this.formatCurrency(monthlyEmployerMatch);
        }
        if (totalMonthlyEl) {
            totalMonthlyEl.textContent = this.formatCurrency(totalMonthly401k);
        }
        if (totalAnnualEl) {
            totalAnnualEl.textContent = this.formatCurrency(totalAnnual401k);
        }
        if (employeePercentageEl) {
            employeePercentageEl.textContent = data.contribution_401k_percentage;
        }
        if (matchPercentageEl) {
            matchPercentageEl.textContent = data.employer_match_percentage;
        }
    }

    updateMonteCarloDisplays(results) {
        const monteCarloSection = document.getElementById('monte-carlo-stats');
        
        if (results.monte_carlo_stats && results.monte_carlo_stats !== null) {
            // Show Monte Carlo statistics
            monteCarloSection.classList.remove('d-none');
            
            const stats = results.monte_carlo_stats;
            
            // Update success rate
            const successRateEl = document.getElementById('mc-success-rate');
            if (successRateEl) {
                const successPercent = (stats.success_rate * 100).toFixed(1);
                successRateEl.textContent = `${successPercent}%`;
                
                // Color code based on success rate
                successRateEl.className = 'text-success'; // Default green
                if (stats.success_rate < 0.85) {
                    successRateEl.className = 'text-warning'; // Yellow for < 85%
                }
                if (stats.success_rate < 0.75) {
                    successRateEl.className = 'text-danger'; // Red for < 75%
                }
            }
            
            // Update retirement years
            const retirementYearsEl = document.getElementById('mc-retirement-years');
            if (retirementYearsEl) {
                retirementYearsEl.textContent = Math.round(stats.retirement_years);
            }
            
            // Update life expectancy
            const lifeExpectancyEl = document.getElementById('mc-life-expectancy');
            if (lifeExpectancyEl) {
                lifeExpectancyEl.textContent = stats.life_expectancy;
            }
            
            // Update simulations count
            const simulationsEl = document.getElementById('mc-simulations');
            if (simulationsEl) {
                simulationsEl.textContent = stats.simulations_run.toLocaleString();
            }
        } else {
            // Hide Monte Carlo statistics if not available
            monteCarloSection.classList.add('d-none');
        }
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
        this.showSuccessToast(message);
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