import pandas as pd
import numpy as np
from typing import Dict, List, Any
import math

class FireCalculator:
    """
    Comprehensive FIRE calculator based on the existing notebook logic
    with added Coast FIRE functionality inspired by WalletBurst calculator
    """
    
    def __init__(
        self,
        current_age: int,
        retirement_age: int,
        current_assets: float,
        monthly_income: float,
        monthly_expenses: float,
        monthly_savings: float,
        retirement_expenses: float,
        investment_return_rate: float = 0.07,
        inflation_rate: float = 0.03,
        safe_withdrawal_rate: float = 0.04,
        # Advanced mode parameters
        advanced_mode: bool = False,
        retirement_accounts: float = 0.0,
        taxable_accounts: float = 0.0,
        retirement_account_return_rate: float = 0.07,
        # Social Security parameters
        social_security_enabled: bool = False,
        social_security_start_age: int = 65,
        social_security_monthly_benefit: float = 0.0,
        # Spouse parameters
        spouse_enabled: bool = False,
        spouse_age: int = 30,
        spouse_social_security_enabled: bool = False,
        spouse_social_security_start_age: int = 65,
        spouse_social_security_monthly_benefit: float = 0.0
    ):
        self.current_age = current_age
        self.retirement_age = retirement_age
        self.monthly_income = monthly_income
        self.monthly_expenses = monthly_expenses
        self.monthly_savings = monthly_savings
        self.retirement_expenses = retirement_expenses
        self.investment_return_rate = investment_return_rate
        self.inflation_rate = inflation_rate
        self.safe_withdrawal_rate = safe_withdrawal_rate
        
        # Advanced mode setup
        self.advanced_mode = advanced_mode
        if advanced_mode:
            self.retirement_accounts = retirement_accounts
            self.taxable_accounts = taxable_accounts
            self.current_assets = retirement_accounts + taxable_accounts  # Total assets
            self.retirement_account_return_rate = retirement_account_return_rate
        else:
            self.current_assets = current_assets
            self.retirement_accounts = 0.0
            self.taxable_accounts = current_assets
            self.retirement_account_return_rate = investment_return_rate
        
        # Social Security setup
        self.social_security_enabled = social_security_enabled
        self.social_security_start_age = social_security_start_age
        self.social_security_monthly_benefit = social_security_monthly_benefit
        self.social_security_annual_benefit = social_security_monthly_benefit * 12
        
        # Spouse setup
        self.spouse_enabled = spouse_enabled
        self.spouse_age = spouse_age
        self.spouse_social_security_enabled = spouse_social_security_enabled
        self.spouse_social_security_start_age = spouse_social_security_start_age
        self.spouse_social_security_monthly_benefit = spouse_social_security_monthly_benefit
        self.spouse_social_security_annual_benefit = spouse_social_security_monthly_benefit * 12
        
        # Calculated properties
        self.years_to_retirement = retirement_age - current_age
        self.years_to_project = 90 - current_age  # Project to age 90
        self.annual_savings = monthly_savings * 12
        
    def calculate_fire_number(self) -> float:
        """
        Calculate the FIRE number - amount needed for full retirement
        Using the 4% rule (or user-specified safe withdrawal rate)
        Accounts for Social Security benefits (user + spouse) if enabled
        """
        total_ss_benefits = 0
        
        # Add primary Social Security benefits
        if self.social_security_enabled:
            total_ss_benefits += self.social_security_annual_benefit
            
        # Add spouse Social Security benefits
        if self.spouse_enabled and self.spouse_social_security_enabled:
            total_ss_benefits += self.spouse_social_security_annual_benefit
        
        # Reduce expenses by total Social Security benefits
        net_retirement_expenses = max(0, self.retirement_expenses - total_ss_benefits)
        return net_retirement_expenses / self.safe_withdrawal_rate
    
    def calculate_coast_fire_number(self) -> float:
        """
        Calculate Coast FIRE number - amount needed today to coast to FIRE
        Formula: Coast FIRE = FIRE Number / (1 + real_return_rate)^years_to_retirement
        """
        fire_number = self.calculate_fire_number()
        real_return_rate = self.investment_return_rate - self.inflation_rate
        
        coast_fire_number = fire_number / ((1 + real_return_rate) ** self.years_to_retirement)
        return coast_fire_number
    
    def calculate_years_to_fire(self) -> float:
        """
        Calculate years to reach FIRE with current savings rate
        Uses the formula for compound interest with regular contributions
        """
        fire_number = self.calculate_fire_number()
        
        if self.annual_savings <= 0:
            # No savings, will never reach FIRE
            return float('inf')
        
        # Formula: FV = PV(1+r)^t + PMT[((1+r)^t - 1)/r]
        # Solving for t when FV = fire_number
        r = self.investment_return_rate
        pv = self.current_assets
        pmt = self.annual_savings
        fv = fire_number
        
        if r == 0:
            # Simple case: no growth
            if pmt == 0:
                return float('inf')
            return (fv - pv) / pmt
        
        # Use logarithmic formula for compound interest with payments
        try:
            numerator = math.log((fv * r + pmt) / (pv * r + pmt))
            denominator = math.log(1 + r)
            years = numerator / denominator
            return max(0, years)
        except (ValueError, ZeroDivisionError):
            return float('inf')
    
    def calculate_years_to_coast_fire(self) -> float:
        """
        Calculate years to reach Coast FIRE
        """
        coast_fire_number = self.calculate_coast_fire_number()
        
        if self.current_assets >= coast_fire_number:
            return 0  # Already achieved Coast FIRE
        
        if self.annual_savings <= 0:
            return float('inf')
        
        r = self.investment_return_rate
        pv = self.current_assets
        pmt = self.annual_savings
        fv = coast_fire_number
        
        if r == 0:
            if pmt == 0:
                return float('inf')
            return (fv - pv) / pmt
        
        try:
            numerator = math.log((fv * r + pmt) / (pv * r + pmt))
            denominator = math.log(1 + r)
            years = numerator / denominator
            return max(0, years)
        except (ValueError, ZeroDivisionError):
            return float('inf')
    
    def project_assets_over_time(self) -> pd.DataFrame:
        """
        Project asset growth over time with advanced mode support
        Returns a DataFrame with year-by-year projections
        """
        years = range(self.years_to_project + 1)
        data = []
        
        # Initialize assets
        if self.advanced_mode:
            current_retirement_accounts = self.retirement_accounts
            current_taxable_accounts = self.taxable_accounts
            current_assets = current_retirement_accounts + current_taxable_accounts
        else:
            current_retirement_accounts = 0.0
            current_taxable_accounts = self.current_assets
            current_assets = self.current_assets
        
        current_expenses = self.retirement_expenses
        age = self.current_age
        
        for year in years:
            if age < self.retirement_age:
                # Still working and saving
                if self.advanced_mode:
                    # Grow retirement and taxable accounts separately
                    retirement_growth = current_retirement_accounts * self.retirement_account_return_rate
                    taxable_growth = current_taxable_accounts * self.investment_return_rate
                    
                    # Assume savings split equally between retirement and taxable (could be made configurable)
                    retirement_contribution = self.annual_savings * 0.5
                    taxable_contribution = self.annual_savings * 0.5
                    
                    current_retirement_accounts += retirement_growth + retirement_contribution
                    current_taxable_accounts += taxable_growth + taxable_contribution
                    current_assets = current_retirement_accounts + current_taxable_accounts
                else:
                    # Simple growth
                    asset_growth = current_assets * self.investment_return_rate
                    current_assets = current_assets + asset_growth + self.annual_savings
                
            else:
                # Retired, need to withdraw from assets
                inflation_adjusted_expenses = current_expenses * ((1 + self.inflation_rate) ** (age - self.retirement_age))
                
                # Apply Social Security benefits if enabled and age appropriate
                net_expenses = inflation_adjusted_expenses
                total_social_security_benefit = 0
                
                # Primary Social Security
                if self.social_security_enabled and age >= self.social_security_start_age:
                    total_social_security_benefit += self.social_security_annual_benefit
                
                # Spouse Social Security (based on spouse's age, not primary age)
                if self.spouse_enabled and self.spouse_social_security_enabled:
                    spouse_current_age = self.spouse_age + (age - self.current_age)  # Calculate spouse's age at this point
                    if spouse_current_age >= self.spouse_social_security_start_age:
                        total_social_security_benefit += self.spouse_social_security_annual_benefit
                
                net_expenses = max(0, inflation_adjusted_expenses - total_social_security_benefit)
                
                if self.advanced_mode:
                    # Grow accounts
                    retirement_growth = current_retirement_accounts * self.retirement_account_return_rate
                    taxable_growth = current_taxable_accounts * self.investment_return_rate
                    current_retirement_accounts += retirement_growth
                    current_taxable_accounts += taxable_growth
                    
                    # Withdrawal strategy: taxable first until age 65, then retirement accounts
                    if age < 65:
                        # Can only withdraw from taxable accounts
                        current_taxable_accounts = max(0, current_taxable_accounts - net_expenses)
                    else:
                        # Can withdraw from retirement accounts
                        if current_taxable_accounts >= net_expenses:
                            # Use taxable first if available
                            current_taxable_accounts -= net_expenses
                        else:
                            # Use taxable then retirement
                            remaining_needed = net_expenses - current_taxable_accounts
                            current_taxable_accounts = 0
                            current_retirement_accounts = max(0, current_retirement_accounts - remaining_needed)
                    
                    current_assets = current_retirement_accounts + current_taxable_accounts
                else:
                    # Simple withdrawal
                    asset_growth = current_assets * self.investment_return_rate
                    current_assets = current_assets + asset_growth - net_expenses
                
                current_expenses = net_expenses + total_social_security_benefit  # Total expenses covered
            
            # Coast FIRE milestone for this age
            years_left_to_retirement = max(0, self.retirement_age - age)
            if years_left_to_retirement > 0:
                real_return_rate = self.investment_return_rate - self.inflation_rate
                coast_fire_milestone = self.calculate_fire_number() / ((1 + real_return_rate) ** years_left_to_retirement)
            else:
                coast_fire_milestone = self.calculate_fire_number()
            
            # Calculate accessible assets (for early retirement scenarios)
            if self.advanced_mode and age < 65:
                accessible_assets = current_taxable_accounts  # Only taxable accessible before 65
            else:
                accessible_assets = current_assets  # All assets accessible
            
            data.append({
                'age': age,
                'year': year,
                'total_assets': current_assets,
                'retirement_accounts': current_retirement_accounts if self.advanced_mode else 0,
                'taxable_accounts': current_taxable_accounts if self.advanced_mode else current_assets,
                'accessible_assets': accessible_assets,
                'expenses': current_expenses if age >= self.retirement_age else self.monthly_expenses * 12,
                'social_security_benefit': total_social_security_benefit if age >= self.retirement_age else 0,
                'coast_fire_milestone': coast_fire_milestone,
                'achieved_coast_fire': accessible_assets >= coast_fire_milestone,
                'achieved_fire': accessible_assets >= self.calculate_fire_number()
            })
            
            age += 1
            
            # Stop if total assets go negative or we can't meet expenses
            if current_assets <= 0 or (age >= self.retirement_age and accessible_assets <= 0 and not self.social_security_enabled):
                break
        
        return pd.DataFrame(data)
    
    def calculate_all(self) -> Dict[str, Any]:
        """
        Perform all FIRE calculations and return comprehensive results
        """
        fire_number = self.calculate_fire_number()
        coast_fire_number = self.calculate_coast_fire_number()
        years_to_fire = self.calculate_years_to_fire()
        years_to_coast_fire = self.calculate_years_to_coast_fire()
        
        # Calculate Coast FIRE age
        coast_fire_age = None
        if years_to_coast_fire != float('inf'):
            coast_fire_age = self.current_age + years_to_coast_fire
        
        # Generate projection data
        projection_df = self.project_assets_over_time()
        projection_data = {
            'years': projection_df['year'].tolist(),
            'ages': projection_df['age'].tolist(),
            'total_assets': projection_df['total_assets'].tolist(),
            'retirement_accounts': projection_df['retirement_accounts'].tolist() if self.advanced_mode else [],
            'taxable_accounts': projection_df['taxable_accounts'].tolist(),
            'accessible_assets': projection_df['accessible_assets'].tolist(),
            'social_security_benefits': projection_df['social_security_benefit'].tolist() if self.social_security_enabled else [],
            'coast_fire_milestones': projection_df['coast_fire_milestone'].tolist(),
            'achieved_coast_fire': projection_df['achieved_coast_fire'].tolist(),
            'achieved_fire': projection_df['achieved_fire'].tolist()
        }
        
        return {
            'fire_number': fire_number,
            'coast_fire_number': coast_fire_number,
            'years_to_fire': years_to_fire if years_to_fire != float('inf') else None,
            'years_to_coast_fire': years_to_coast_fire if years_to_coast_fire != float('inf') else None,
            'coast_fire_age': coast_fire_age,
            'projection_data': projection_data,
            'current_coast_fire_status': self.current_assets >= coast_fire_number,
            'current_fire_status': self.current_assets >= fire_number,
            'monthly_shortfall': max(0, (fire_number - self.current_assets) / years_to_fire / 12) if years_to_fire and years_to_fire != float('inf') else 0
        }