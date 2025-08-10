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
        safe_withdrawal_rate: float = 0.04
    ):
        self.current_age = current_age
        self.retirement_age = retirement_age
        self.current_assets = current_assets
        self.monthly_income = monthly_income
        self.monthly_expenses = monthly_expenses
        self.monthly_savings = monthly_savings
        self.retirement_expenses = retirement_expenses
        self.investment_return_rate = investment_return_rate
        self.inflation_rate = inflation_rate
        self.safe_withdrawal_rate = safe_withdrawal_rate
        
        # Calculated properties
        self.years_to_retirement = retirement_age - current_age
        self.years_to_project = 90 - current_age  # Project to age 90
        self.annual_savings = monthly_savings * 12
        
    def calculate_fire_number(self) -> float:
        """
        Calculate the FIRE number - amount needed for full retirement
        Using the 4% rule (or user-specified safe withdrawal rate)
        """
        return self.retirement_expenses / self.safe_withdrawal_rate
    
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
        Project asset growth over time, similar to the original notebook logic
        Returns a DataFrame with year-by-year projections
        """
        years = range(self.years_to_project + 1)
        data = []
        
        current_assets = self.current_assets
        current_expenses = self.retirement_expenses
        age = self.current_age
        
        for year in years:
            # Calculate asset growth
            if age < self.retirement_age:
                # Still working and saving
                asset_growth = current_assets * self.investment_return_rate
                new_assets = current_assets + asset_growth + self.annual_savings
            else:
                # Retired, withdrawing from assets
                asset_growth = current_assets * self.investment_return_rate
                inflation_adjusted_expenses = current_expenses * ((1 + self.inflation_rate) ** (age - self.retirement_age))
                
                # Special logic for Social Security (similar to notebook)
                if age == 66:
                    inflation_adjusted_expenses = max(0, inflation_adjusted_expenses - 46524)
                
                new_assets = current_assets + asset_growth - inflation_adjusted_expenses
                current_expenses = inflation_adjusted_expenses
            
            # Coast FIRE milestone for this age
            years_left_to_retirement = max(0, self.retirement_age - age)
            if years_left_to_retirement > 0:
                real_return_rate = self.investment_return_rate - self.inflation_rate
                coast_fire_milestone = self.calculate_fire_number() / ((1 + real_return_rate) ** years_left_to_retirement)
            else:
                coast_fire_milestone = self.calculate_fire_number()
            
            data.append({
                'age': age,
                'year': year,
                'assets': current_assets,
                'asset_growth': asset_growth if 'asset_growth' in locals() else 0,
                'expenses': current_expenses if age >= self.retirement_age else self.monthly_expenses * 12,
                'coast_fire_milestone': coast_fire_milestone,
                'achieved_coast_fire': current_assets >= coast_fire_milestone,
                'achieved_fire': current_assets >= self.calculate_fire_number()
            })
            
            current_assets = new_assets
            age += 1
            
            # Stop if assets go negative
            if current_assets < 0:
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
            'assets': projection_df['assets'].tolist(),
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