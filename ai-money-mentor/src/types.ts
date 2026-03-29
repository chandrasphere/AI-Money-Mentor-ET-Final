export interface UserFinancialData {
  age: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  currentSavings: number;
  investments: {
    equity: number;
    debt: number;
    gold: number;
    realEstate: number;
  };
  liabilities: number;
  insurance: {
    health: boolean;
    life: boolean;
  };
  goals: FinancialGoal[];
}

export interface FinancialGoal {
  id: string;
  name: string;
  targetAmount: number;
  targetYear: number;
}

export interface MoneyHealthScore {
  overall: number;
  dimensions: {
    emergency: number;
    insurance: number;
    diversification: number;
    debt: number;
    tax: number;
    retirement: number;
  };
  recommendations: string[];
}

export interface TaxRegimeComparison {
  oldRegimeTax: number;
  newRegimeTax: number;
  recommendedRegime: 'old' | 'new';
  potentialSavings: number;
}
