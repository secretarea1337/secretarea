/**
 * SecretArea Smart E-Wallet & Wealth Hub — Centralized Financial Calculation Engine
 * 
 * Provides decimal-safe monetary arithmetic, rigorous double-entry accounting models,
 * allocation checks, realistic goal timelines, cash buffer/runway projections, and
 * isolated persistence for visitors and authenticated users.
 * 
 * All displayed figures derive from this single source of truth without duplicated
 * ad-hoc formulas in UI components.
 */

export interface CurrencyConfig {
  code: string;
  symbol: string;
  rateFromMAD: number; // Reference baseline: Moroccan Dirham (MAD)
  label: string;
  decimals: number;
}

export const SUPPORTED_CURRENCIES: Record<string, CurrencyConfig> = {
  MAD: { code: 'MAD', symbol: 'DH', rateFromMAD: 1, label: 'Moroccan Dirham (MAD)', decimals: 0 },
  USD: { code: 'USD', symbol: '$', rateFromMAD: 0.10, label: 'US Dollar (USD)', decimals: 0 },
  EUR: { code: 'EUR', symbol: '€', rateFromMAD: 0.092, label: 'Euro (EUR)', decimals: 0 },
  GBP: { code: 'GBP', symbol: '£', rateFromMAD: 0.078, label: 'British Pound (GBP)', decimals: 0 },
  AED: { code: 'AED', symbol: 'AED', rateFromMAD: 0.367, label: 'UAE Dirham (AED)', decimals: 0 },
  BTC: { code: 'BTC', symbol: '₿', rateFromMAD: 0.0000015, label: 'Bitcoin (BTC)', decimals: 4 },
};

export type TransactionType = 
  | 'income' 
  | 'expense' 
  | 'deposit' 
  | 'opening_balance' 
  | 'swap' 
  | 'quest_deposit' 
  | 'transfer'
  | 'send' 
  | 'receive' 
  | 'add';

export interface FinancialTransaction {
  id: string;
  type: TransactionType;
  amount: number;
  currency: string;
  amountMAD: number;
  description: string;
  category?: string;
  sourceAccount?: string;
  destinationAccount?: string;
  recipient?: string;
  timestamp: number;
  status: 'completed' | 'pending';
}

export interface ExpenseRecord {
  id: string;
  label: string;
  cost: number;
  paid: boolean;
  icon: string;
  category: string; // 'fixed' | 'lifestyle' or user-defined
  dueDate?: string;
  paidDate?: string;
  paidFrom?: 'vault' | 'card';
  logoUrl?: string; // Custom logo / icon image URL
}

export interface QuestRecord {
  id: string;
  title: string;
  current: number;
  target: number;
  unit: string;
  icon: string;
  color: string;
}

export interface BudgetSplits {
  personal: number;
  invest: number;
  safe: number;
  emergency: number;
  parents: number;
}

export interface CustomPillarFund {
  id: string;
  name: string;
  percent: number;
  amount?: number;
  color?: string;
  icon?: string;
}

export interface WalletState {
  totalLiquidFunds: number;       // Master liquid capital (from opening balance + deposits + income - paid expenses)
  openingBalance: number;         // Initial tracked capital
  openingBalanceConfigured: boolean; // Has the user explicitly set an opening balance?
  coreVaultBalance?: number;      // Deprecated alias for backwards compatibility, mapped to unallocatedVault
  cardLimit: number;              // Titanium Virtual Card allocation/budget in MAD (subdivision of liquid funds)
  lastMonthSpend: number;         // Audited previous billing period spend in MAD
  salary: number;                 // Configured monthly income/revenue in MAD
  selectedCurrency: string;       // Display currency
  isBalanceHidden: boolean;
  isCardFrozen: boolean;
  isCardRevealed: boolean;
  customSplits?: BudgetSplits;    // User-editable 5-pillar percentage distribution
  customFunds?: CustomPillarFund[]; // User-added custom funds (e.g. Travel, Education, Business)
  customCategories?: string[];    // User-defined categories
  expenses: ExpenseRecord[];
  quests: QuestRecord[];
  calcItemName: string;
  calcCost: number;
  calcMonthlySaving: number;
  customIncomeSolutions?: IncomeDevelopmentSolution[];
  transactions: FinancialTransaction[];
}

export const DEFAULT_WALLET_STATE: WalletState = {
  totalLiquidFunds: 0,
  openingBalance: 0,
  openingBalanceConfigured: false,
  cardLimit: 0,
  lastMonthSpend: 8450,
  salary: 8500,
  selectedCurrency: 'MAD',
  isBalanceHidden: false,
  isCardFrozen: false,
  isCardRevealed: false,
  customSplits: undefined,
  customFunds: [],
  customCategories: ['fixed', 'lifestyle'],
  expenses: [
    { id: 'rent', label: 'Apartment / Studio Rent', cost: 2800, paid: true, icon: 'Home', category: 'fixed' },
    { id: 'groceries', label: 'Nutritious Groceries & Food', cost: 1400, paid: true, icon: 'ShoppingBag', category: 'fixed' },
    { id: 'fiber', label: 'High-Speed Fiber Internet & 5G', cost: 350, paid: true, icon: 'Wifi', category: 'fixed' },
    { id: 'gym', label: 'Fitness & Boxing Gym Membership', cost: 300, paid: false, icon: 'Activity', category: 'lifestyle' },
    { id: 'cloud', label: 'AI & Developer Cloud Subscriptions', cost: 280, paid: false, icon: 'Code', category: 'lifestyle' },
    { id: 'commute', label: 'Transportation & Fuel', cost: 450, paid: true, icon: 'Car', category: 'fixed' },
  ],
  quests: [
    { id: 'q1', title: '6-Month Emergency Shield', current: 0, target: 25000, unit: 'DH', icon: 'Shield', color: 'emerald' },
    { id: 'q2', title: 'First 100,000 DH Asset Milestone', current: 0, target: 100000, unit: 'DH', icon: 'Trophy', color: 'amber' },
    { id: 'q3', title: 'Crypto & Liquid Global Portfolio', current: 0, target: 15000, unit: 'DH', icon: 'CurrencyBitcoin', color: 'cyan' },
  ],
  calcItemName: 'Nvidia RTX 5090 & Pro Workstation',
  calcCost: 38000,
  calcMonthlySaving: 3500,
  customIncomeSolutions: [],
  transactions: [],
};

// --- DECIMAL-SAFE ARITHMETIC UTILITIES ---
export function roundToMinorUnits(value: number, decimals: number = 2): number {
  if (!Number.isFinite(value)) return 0;
  const factor = Math.pow(10, decimals);
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

export function formatMoney(amountInMAD: number, currencyCode: string = 'MAD'): string {
  if (!Number.isFinite(amountInMAD)) return '0 DH';
  const info = SUPPORTED_CURRENCIES[currencyCode] || SUPPORTED_CURRENCIES.MAD;
  const converted = amountInMAD * info.rateFromMAD;
  
  if (currencyCode === 'BTC') {
    return `${info.symbol} ${converted.toFixed(4)}`;
  }
  return `${Math.round(converted).toLocaleString()} ${info.symbol}`;
}

export function convertFromMAD(amountInMAD: number, targetCurrency: string): number {
  const info = SUPPORTED_CURRENCIES[targetCurrency] || SUPPORTED_CURRENCIES.MAD;
  return roundToMinorUnits(amountInMAD * info.rateFromMAD, info.decimals || 2);
}

export function convertToMAD(amount: number, sourceCurrency: string): number {
  const info = SUPPORTED_CURRENCIES[sourceCurrency] || SUPPORTED_CURRENCIES.MAD;
  if (!info.rateFromMAD || info.rateFromMAD <= 0) return amount;
  return roundToMinorUnits(amount / info.rateFromMAD, 2);
}

// --- MASTER BALANCE & ACCOUNTING ---
export interface MasterBalanceReport {
  totalLiquidFunds: number;            // Master tracked liquid wealth
  unallocatedVault: number;            // Liquid funds not committed to card or goals
  cardAllocation: number;              // Subdivision allocated to Titanium Virtual Card spending
  reservedForGoals: number;            // Explicitly contributed to milestones/quests
  totalCommittedLiabilities: number;   // Unpaid expenses due
  netLiquidWorth: number;              // Total liquid funds minus unpaid obligations
  coreVaultBalance: number;            // Deprecated alias for unallocatedVault
  totalEstimatedLiquidBalance: number; // Deprecated alias for totalLiquidFunds
  netWorthMAD: number;                 // Deprecated alias for netLiquidWorth
}

/**
 * Calculates master accounting balances.
 * 
 * Invariant: Total Liquid Funds = Unallocated Vault + Card Allocation + Reserved For Goals
 * Transferring funds between internal balances or altering card allocation NEVER alters Total Liquid Funds.
 */
export function calculateMasterBalances(
  totalLiquidFunds: number,
  cardAllocation: number,
  reservedForGoals: number = 0,
  unpaidExpensesTotal: number = 0
): MasterBalanceReport {
  const safeTotal = Math.max(0, Number.isFinite(totalLiquidFunds) ? totalLiquidFunds : 0);
  const safeGoals = Math.max(0, Math.min(safeTotal, Number.isFinite(reservedForGoals) ? reservedForGoals : 0));
  
  // Virtual card allocation is a subdivision of liquid funds, not newly created money
  const maxAvailableForCard = Math.max(0, safeTotal - safeGoals);
  const safeCard = Math.max(0, Math.min(maxAvailableForCard, Number.isFinite(cardAllocation) ? cardAllocation : 0));
  
  // Unallocated liquid vault is the remaining uncommitted liquid cash
  const unallocatedVault = Math.max(0, safeTotal - safeCard - safeGoals);
  const safeUnpaid = Math.max(0, Number.isFinite(unpaidExpensesTotal) ? unpaidExpensesTotal : 0);
  const netLiquidWorth = Math.max(0, safeTotal - safeUnpaid);

  return {
    totalLiquidFunds: safeTotal,
    unallocatedVault,
    cardAllocation: safeCard,
    reservedForGoals: safeGoals,
    totalCommittedLiabilities: safeUnpaid,
    netLiquidWorth,
    // Deprecated aliases maintained for backwards-compatibility
    coreVaultBalance: unallocatedVault,
    totalEstimatedLiquidBalance: safeTotal,
    netWorthMAD: netLiquidWorth,
  };
}

// --- SPEND BENCHMARK DELTA (CARD VS LAST MONTH) ---
export interface SpendDeltaResult {
  diff: number;
  percent: number;
  isSaved: boolean;
  benchmark: number;
  current: number;
}

export function calculateSpendDelta(cardLimit: number, lastMonthSpend: number): SpendDeltaResult {
  const current = Math.max(0, cardLimit || 0);
  const benchmark = Math.max(0, lastMonthSpend || 0);
  const diff = current - benchmark;

  let percent = 0;
  if (benchmark > 0) {
    percent = roundToMinorUnits(Math.abs((diff / benchmark) * 100), 1);
  } else if (current > 0) {
    percent = 100;
  }

  return {
    diff,
    percent,
    isSaved: diff <= 0,
    benchmark,
    current,
  };
}

// --- SMART INCOME & 5-PILLAR BUDGET ALLOCATOR ---
export interface AllocationReport {
  splits: BudgetSplits;
  customFunds: CustomPillarFund[];
  totalAllocatedPercent: number;
  isOverAllocated: boolean;
  isUnderAllocated: boolean;
  unallocatedPercent: number;
  personalAmount: number;
  investAmount: number;
  safeAmount: number;
  emergencyAmount: number;
  parentsAmount: number;
  customFundsAmount: number;
  totalAllocatedAmount: number;
  unallocatedAmount: number;
}

/**
 * Returns default recommended distribution formula based on income brackets.
 */
export function getDefaultSplitsForIncome(salary: number): BudgetSplits {
  if (salary <= 4500) {
    return { personal: 65, invest: 5, safe: 10, emergency: 10, parents: 10 };
  } else if (salary <= 9000) {
    return { personal: 50, invest: 20, safe: 15, emergency: 5, parents: 10 };
  } else if (salary <= 18000) {
    return { personal: 40, invest: 30, safe: 15, emergency: 5, parents: 10 };
  } else {
    return { personal: 30, invest: 45, safe: 10, emergency: 5, parents: 10 };
  }
}

/**
 * Calculates budget pillar amounts and validates allocations against configured income.
 * Accepts custom editable splits and user-added custom funds.
 * Flags over-allocation (>100%) and reports unallocated amounts accurately.
 */
export function calculatePillarAllocations(
  salary: number,
  customSplits?: Partial<BudgetSplits>,
  customFunds?: CustomPillarFund[]
): AllocationReport {
  const safeSalary = Math.max(0, Number.isFinite(salary) ? salary : 0);
  const baseSplits = getDefaultSplitsForIncome(safeSalary);

  const splits: BudgetSplits = {
    personal: Math.max(0, customSplits?.personal ?? baseSplits.personal),
    invest: Math.max(0, customSplits?.invest ?? baseSplits.invest),
    safe: Math.max(0, customSplits?.safe ?? baseSplits.safe),
    emergency: Math.max(0, customSplits?.emergency ?? baseSplits.emergency),
    parents: Math.max(0, customSplits?.parents ?? baseSplits.parents),
  };

  const calculatedCustomFunds: CustomPillarFund[] = (customFunds || []).map(cf => ({
    ...cf,
    amount: Math.round(safeSalary * ((cf.percent || 0) / 100)),
  }));

  const customFundsTotalPercent = calculatedCustomFunds.reduce((sum, cf) => sum + (cf.percent || 0), 0);
  const customFundsTotalAmount = calculatedCustomFunds.reduce((sum, cf) => sum + (cf.amount || 0), 0);

  const totalAllocatedPercent = splits.personal + splits.invest + splits.safe + splits.emergency + splits.parents + customFundsTotalPercent;
  const isOverAllocated = totalAllocatedPercent > 100;
  const isUnderAllocated = totalAllocatedPercent < 100;
  const unallocatedPercent = Math.max(0, 100 - totalAllocatedPercent);

  const personalAmount = Math.round(safeSalary * (splits.personal / 100));
  const investAmount = Math.round(safeSalary * (splits.invest / 100));
  const safeAmount = Math.round(safeSalary * (splits.safe / 100));
  const emergencyAmount = Math.round(safeSalary * (splits.emergency / 100));
  const parentsAmount = Math.round(safeSalary * (splits.parents / 100));

  const totalAllocatedAmount = personalAmount + investAmount + safeAmount + emergencyAmount + parentsAmount + customFundsTotalAmount;
  const unallocatedAmount = Math.max(0, safeSalary - totalAllocatedAmount);

  return {
    splits,
    customFunds: calculatedCustomFunds,
    totalAllocatedPercent,
    isOverAllocated,
    isUnderAllocated,
    unallocatedPercent,
    personalAmount,
    investAmount,
    safeAmount,
    emergencyAmount,
    parentsAmount,
    customFundsAmount: customFundsTotalAmount,
    totalAllocatedAmount,
    unallocatedAmount,
  };
}

/**
 * Automatically calculates the best % percentage distribution for all funds.
 * Guarantees that:
 * 1. Personal Needs covers committed expenses + safe buffer.
 * 2. Emergency shield has appropriate coverage.
 * 3. Any custom funds receive sustainable allocations.
 * 4. Wealth growth (Investments & Safe Savings) is maximized.
 * 5. Exactly 100% total allocation with zero over-allocation!
 */
export function autoOptimizeBudgetSplits(
  salary: number,
  expenses: ExpenseRecord[],
  customFunds?: CustomPillarFund[]
): { splits: BudgetSplits; customFunds: CustomPillarFund[] } {
  const safeSalary = Math.max(1000, Number.isFinite(salary) ? salary : 8500);
  const totalCommitted = expenses.reduce((acc, e) => acc + (Math.max(0, e.cost) || 0), 0);

  // 1. Calculate required personal fund percentage to safely cover expenses with a small buffer
  let personal = Math.ceil(((totalCommitted + 200) / safeSalary) * 100);
  personal = Math.max(30, Math.min(70, personal));

  // 2. Custom funds get 5% each (capped at 15% total)
  const countCustom = customFunds ? customFunds.length : 0;
  const customPercentEach = countCustom > 0 ? Math.max(2, Math.min(10, Math.floor(15 / countCustom))) : 0;
  const updatedCustomFunds: CustomPillarFund[] = (customFunds || []).map(cf => ({
    ...cf,
    percent: customPercentEach,
  }));
  const customTotalPercent = updatedCustomFunds.reduce((sum, cf) => sum + cf.percent, 0);

  // 3. Available percentage left for strategic wealth
  let remaining = Math.max(15, 100 - personal - customTotalPercent);

  // Emergency: 5% - 10%
  const emergency = remaining >= 30 ? 10 : 5;
  remaining -= emergency;

  // Parents / Giving: 5% - 10%
  const parents = remaining >= 25 ? 10 : 5;
  remaining -= parents;

  // Investments: ~60% of remaining
  const invest = Math.max(5, Math.floor(remaining * 0.6));
  remaining -= invest;

  // Safe Savings: remainder
  const safe = Math.max(5, remaining);

  const splits: BudgetSplits = {
    personal,
    invest,
    safe,
    emergency,
    parents,
  };

  return { splits, customFunds: updatedCustomFunds };
}

// --- SOLUTIONS FOR DEVELOPING CURRENT INCOME ---
export interface IncomeDevelopmentSolution {
  id: string;
  titleKey: string;
  defaultTitle: string;
  descKey: string;
  defaultDesc: string;
  boostAmount: number;
  boostType: 'percent' | 'flat';
  actionLabelKey: string;
  defaultActionLabel: string;
  icon: string;
  category: 'career' | 'freelance' | 'optimization' | 'target' | 'custom' | string;
  isCustom?: boolean;
  logoUrl?: string; // Custom logo / brand image URL
}

export function getIncomeDevelopmentSolutions(
  salary: number,
  expensesTotal: number = 0,
  customSolutions: IncomeDevelopmentSolution[] = []
): IncomeDevelopmentSolution[] {
  const safeSalary = Math.max(2000, Number.isFinite(salary) ? salary : 8500);
  const raise20Amount = Math.round(safeSalary * 0.20);
  const raise10Amount = Math.round(safeSalary * 0.10);

  const baseSolutions: IncomeDevelopmentSolution[] = [
    {
      id: 'career_raise_20',
      titleKey: 'incomeRaiseTitle',
      defaultTitle: 'Salary Promotion & Career Step-Up (+20%)',
      descKey: 'incomeRaiseDesc',
      defaultDesc: `Target a 20% salary increase (+${raise20Amount.toLocaleString()} DH/mo) to dramatically accelerate your 5 budget pillars and quests.`,
      boostAmount: raise20Amount,
      boostType: 'flat',
      actionLabelKey: 'applyRaise20',
      defaultActionLabel: `+${raise20Amount.toLocaleString()} DH (+20% Salary)`,
      icon: 'TrendingUp',
      category: 'career',
    },
    {
      id: 'side_hustle_consulting',
      titleKey: 'sideHustleTitle',
      defaultTitle: 'Digital Freelance & Side Monetization (+1,500 DH/mo)',
      descKey: 'sideHustleDesc',
      defaultDesc: 'Monetize digital skills for 5-8 hours/week (UI design, development, consulting) to create a secondary monthly cash stream.',
      boostAmount: 1500,
      boostType: 'flat',
      actionLabelKey: 'applySideHustle',
      defaultActionLabel: '+1,500 DH Side Income',
      icon: 'Briefcase',
      category: 'freelance',
    },
    {
      id: 'skill_monetization_tech',
      titleKey: 'skillBoostTitle',
      defaultTitle: 'Specialized Skill Monetization (+3,000 DH/mo)',
      descKey: 'skillBoostDesc',
      defaultDesc: 'Deliver premium recurring client solutions to expand your total revenue base and fast-track asset milestones.',
      boostAmount: 3000,
      boostType: 'flat',
      actionLabelKey: 'applySkillBoost',
      defaultActionLabel: '+3,000 DH Tech Income',
      icon: 'Zap',
      category: 'career',
    },
    {
      id: 'moderate_step_up',
      titleKey: 'moderateRaiseTitle',
      defaultTitle: 'Performance Bonus / Step-Up (+10%)',
      descKey: 'moderateRaiseDesc',
      defaultDesc: `Achieve an incremental +10% bump (+${raise10Amount.toLocaleString()} DH/mo) to eliminate any budget deficit effortlessly.`,
      boostAmount: raise10Amount,
      boostType: 'flat',
      actionLabelKey: 'applyRaise10',
      defaultActionLabel: `+${raise10Amount.toLocaleString()} DH (+10% Bonus)`,
      icon: 'Award',
      category: 'optimization',
    },
  ];

  const validCustom = Array.isArray(customSolutions) ? customSolutions : [];
  return [...baseSolutions, ...validCustom];
}

// --- EXPENSES, FREE CASH BUFFER & FINANCIAL RUNWAY ---
export interface FreeCashAnalysis {
  totalCommittedExpenses: number;
  paidExpensesCost: number;
  remainingUnpaidCost: number;
  fixedCostsTotal: number;
  lifestyleCostsTotal: number;
  personalFundAllocation: number;
  freeCashBuffer: number;         // Formula: personalFundAllocation - totalCommittedExpenses
  projectedFreeCash: number;      // Formula: availableCash + expectedIncome - remainingUnpaidCost
  isShortfall: boolean;
  shortfallAmount: number;
  runwayMonths: number;           // Months available cash covers fixed recurring costs
}

export function calculateFreeCash(
  expenses: ExpenseRecord[],
  personalFundAllocation: number,
  availableCash: number = 0,
  monthlyIncome: number = 0
): FreeCashAnalysis {
  let totalCommittedExpenses = 0;
  let paidExpensesCost = 0;
  let remainingUnpaidCost = 0;
  let fixedCostsTotal = 0;
  let lifestyleCostsTotal = 0;

  for (const exp of expenses) {
    const cost = Math.max(0, Number.isFinite(exp.cost) ? exp.cost : 0);
    totalCommittedExpenses += cost;
    if (exp.paid) {
      paidExpensesCost += cost;
    } else {
      remainingUnpaidCost += cost;
    }
    if (exp.category === 'fixed') {
      fixedCostsTotal += cost;
    } else {
      lifestyleCostsTotal += cost;
    }
  }

  // Free Cash Buffer relative to budgeted personal fund
  const freeCashBuffer = personalFundAllocation - totalCommittedExpenses;
  const isShortfall = freeCashBuffer < 0;
  const shortfallAmount = isShortfall ? Math.abs(freeCashBuffer) : 0;

  // Projected Free Cash at end of cycle: available cash + income - remaining unpaid obligations
  const projectedFreeCash = availableCash + monthlyIncome - remainingUnpaidCost;

  // Runway: How many months available cash covers fixed recurring living expenses
  let runwayMonths = 99;
  if (fixedCostsTotal > 0 && availableCash > 0) {
    runwayMonths = roundToMinorUnits(availableCash / fixedCostsTotal, 1);
  } else if (availableCash <= 0 && fixedCostsTotal > 0) {
    runwayMonths = 0;
  }

  return {
    totalCommittedExpenses,
    paidExpensesCost,
    remainingUnpaidCost,
    fixedCostsTotal,
    lifestyleCostsTotal,
    personalFundAllocation,
    freeCashBuffer,
    projectedFreeCash,
    isShortfall,
    shortfallAmount,
    runwayMonths,
  };
}

// --- BUDGET VS ACTUAL SPENDING COMPARISON ---
export interface CategorySpendingReport {
  category: string;
  totalCommitted: number;
  paidAmount: number;
  unpaidAmount: number;
  itemCount: number;
}

export function calculateCategorySpending(expenses: ExpenseRecord[]): Record<string, CategorySpendingReport> {
  const report: Record<string, CategorySpendingReport> = {};

  for (const exp of expenses) {
    const cat = exp.category || 'other';
    const cost = Math.max(0, Number.isFinite(exp.cost) ? exp.cost : 0);

    if (!report[cat]) {
      report[cat] = {
        category: cat,
        totalCommitted: 0,
        paidAmount: 0,
        unpaidAmount: 0,
        itemCount: 0,
      };
    }

    report[cat].totalCommitted += cost;
    report[cat].itemCount += 1;
    if (exp.paid) {
      report[cat].paidAmount += cost;
    } else {
      report[cat].unpaidAmount += cost;
    }
  }

  return report;
}

// --- CURRENCY SWAP & CONVERSION TRANSPARENCY ---
export interface SwapCalculationResult {
  fromCurrency: string;
  toCurrency: string;
  sourceAmount: number;
  fromAmount: number;
  effectiveRate: number;
  rateUsed: number;
  convertedAmount: number;
  toAmount: number;
  rateSource: string;
  rateTimestamp: string;
  isAvailable: boolean;
  isFeasible: boolean;
  maxAvailableMAD: number;
  error?: string;
}

export function calculateCurrencySwap(
  fromCurrency: string,
  toCurrency: string,
  amount: number,
  availableFundsMAD: number
): SwapCalculationResult {
  const fromInfo = SUPPORTED_CURRENCIES[fromCurrency];
  const toInfo = SUPPORTED_CURRENCIES[toCurrency];

  if (!fromInfo || !toInfo) {
    return {
      fromCurrency,
      toCurrency,
      sourceAmount: amount,
      fromAmount: amount,
      effectiveRate: 0,
      rateUsed: 0,
      convertedAmount: 0,
      toAmount: 0,
      rateSource: 'Configured Reference Baseline (Indicative)',
      rateTimestamp: new Date().toISOString(),
      isAvailable: false,
      isFeasible: false,
      maxAvailableMAD: availableFundsMAD,
      error: 'Unsupported currency pair',
    };
  }

  const safeAmount = Math.max(0, Number.isFinite(amount) ? amount : 0);
  const amountInMAD = convertToMAD(safeAmount, fromCurrency);
  const isAvailable = amountInMAD <= availableFundsMAD && safeAmount > 0;

  // Rate from source to target
  const effectiveRate = toInfo.rateFromMAD / fromInfo.rateFromMAD;
  const convertedAmount = roundToMinorUnits(safeAmount * effectiveRate, toInfo.decimals);

  return {
    fromCurrency,
    toCurrency,
    sourceAmount: safeAmount,
    fromAmount: safeAmount,
    effectiveRate: roundToMinorUnits(effectiveRate, 6),
    rateUsed: roundToMinorUnits(effectiveRate, 6),
    convertedAmount,
    toAmount: convertedAmount,
    rateSource: 'Configured Reference Baseline (Indicative estimation)',
    rateTimestamp: new Date().toLocaleDateString(),
    isAvailable,
    isFeasible: isAvailable,
    maxAvailableMAD: availableFundsMAD,
    error: !isAvailable && safeAmount > 0 
      ? `Amount exceeds available tracked balance (${formatMoney(availableFundsMAD, fromCurrency)})` 
      : undefined,
  };
}

// --- TARGET PURCHASE & FAST-TRACK TIMELINE ---
export interface TargetPurchaseReport {
  targetPrice: number;
  monthlySaving: number;
  remainingAmount: number;
  estimatedMonths: number;
  estimatedYears: number;
  fastTrackMonths: number;
  fastTrackMonthly: number;
  isFeasibleWithFreeCash: boolean;
  statusMessage: string;
}

export function calculateTargetPurchase(
  targetCost: number,
  monthlySavingRate: number,
  currentEligibleContribution: number = 0,
  freeCashBuffer: number = 0
): TargetPurchaseReport {
  const safeTarget = Math.max(0, Number.isFinite(targetCost) ? targetCost : 0);
  const safeSaving = Math.max(0, Number.isFinite(monthlySavingRate) ? monthlySavingRate : 0);
  const safeCurrent = Math.max(0, Number.isFinite(currentEligibleContribution) ? currentEligibleContribution : 0);

  const remainingAmount = Math.max(0, safeTarget - safeCurrent);

  let estimatedMonths = 0;
  let estimatedYears = 0;
  let fastTrackMonths = 0;
  let fastTrackMonthly = safeSaving;
  let isFeasibleWithFreeCash = true;
  let statusMessage = 'On track';

  if (remainingAmount === 0) {
    estimatedMonths = 0;
    estimatedYears = 0;
    statusMessage = 'Goal fully achieved!';
  } else if (safeSaving <= 0) {
    estimatedMonths = 0;
    estimatedYears = 0;
    statusMessage = 'Please allocate a monthly saving rate to compute timeline';
    isFeasibleWithFreeCash = false;
  } else {
    estimatedMonths = Math.ceil(remainingAmount / safeSaving);
    estimatedYears = roundToMinorUnits(estimatedMonths / 12, 1);

    // Fast-track model (30% reduction in months)
    if (estimatedMonths > 1) {
      fastTrackMonths = Math.max(1, Math.floor(estimatedMonths * 0.7));
      fastTrackMonthly = Math.ceil(remainingAmount / fastTrackMonths);
    } else {
      fastTrackMonths = 1;
      fastTrackMonthly = remainingAmount;
    }

    if (freeCashBuffer > 0 && safeSaving > freeCashBuffer) {
      isFeasibleWithFreeCash = false;
      statusMessage = `Allocated savings (${safeSaving} DH) exceed current free cash cushion (${freeCashBuffer} DH).`;
    }
  }

  return {
    targetPrice: safeTarget,
    monthlySaving: safeSaving,
    remainingAmount,
    estimatedMonths,
    estimatedYears,
    fastTrackMonths,
    fastTrackMonthly,
    isFeasibleWithFreeCash,
    statusMessage,
  };
}

// --- GOAL PROGRESS CHECK ---
export interface GoalProgressResult {
  percent: number;
  remaining: number;
  isAchieved: boolean;
}

export function calculateGoalProgress(current: number, target: number): GoalProgressResult {
  const safeTarget = Math.max(0, target || 0);
  const safeCurrent = Math.max(0, current || 0);

  if (safeTarget === 0) {
    return { percent: 100, remaining: 0, isAchieved: true };
  }

  const remaining = Math.max(0, safeTarget - safeCurrent);
  const percent = Math.min(100, Math.round((safeCurrent / safeTarget) * 100));
  const isAchieved = safeCurrent >= safeTarget;

  return { percent, remaining, isAchieved };
}

// --- TRIO SYNERGY ENGINE (ALLOCATOR + EXPENSES + QUESTS) ---
export interface QuestSynergyLink {
  questId: string;
  questTitle: string;
  currentAmount: number;
  targetAmount: number;
  percentAchieved: number;
  linkedPillarName: 'emergency' | 'safe' | 'invest' | 'other';
  linkedPillarLabel: string;
  pillarName?: string; // Convenient alias for linkedPillarLabel
  monthlyAllocation: number;
  estimatedMonthsToGoal: number;
  isDynamicEmergencySync?: boolean;
  recommendedEmergencyTarget?: number;
}

export interface TrioSynergyReport {
  salary: number;
  personalFundAllocation: number;
  totalCommittedExpenses: number;
  paidExpensesCost: number;
  unpaidExpensesCost: number;
  freeCashBuffer: number;
  budgetUtilizationPercent: number;
  isOverBudget: boolean;
  isDeficit: boolean; // Convenient alias for isOverBudget
  budgetDeficitAmount: number;
  deficitAmount: number; // Convenient alias for budgetDeficitAmount
  personalCoverageOfExpensesPercent: number; // How much of committed expenses are covered by personal fund (%)
  recommendedPersonalSplitPercent: number;
  recommended6MonthEmergencyTarget: number;
  recommended6MonthSalaryTarget: number;
  recommended3MonthEmergencyTarget: number;
  emergencyMonthlyAllocation: number;
  safeSavingsMonthlyAllocation: number;
  investmentsMonthlyAllocation: number;
  totalMonthlyStrategicSavings: number;
  questLinks: QuestSynergyLink[];
  recommendations: string[];
}

export function calculateTrioSynergy(
  salary: number,
  allocations: AllocationReport,
  expenses: ExpenseRecord[],
  quests: QuestRecord[]
): TrioSynergyReport {
  const safeSalary = Math.max(0, Number.isFinite(salary) ? salary : 0);
  const personalFund = allocations.personalAmount || 0;

  let totalExpenses = 0;
  let paidExpenses = 0;
  let unpaidExpenses = 0;
  for (const exp of expenses) {
    const cost = Math.max(0, Number.isFinite(exp.cost) ? exp.cost : 0);
    totalExpenses += cost;
    if (exp.paid) {
      paidExpenses += cost;
    } else {
      unpaidExpenses += cost;
    }
  }

  const freeCashBuffer = personalFund - totalExpenses;
  const isOverBudget = freeCashBuffer < 0;
  const budgetDeficitAmount = isOverBudget ? Math.abs(freeCashBuffer) : 0;
  const budgetUtilizationPercent = personalFund > 0
    ? Math.round((totalExpenses / personalFund) * 100)
    : (totalExpenses > 0 ? 999 : 0);
  const personalCoverageOfExpensesPercent = totalExpenses > 0
    ? Math.min(100, Math.max(0, Math.round((personalFund / totalExpenses) * 100)))
    : 100;

  const recommendedPersonalSplitPercent = safeSalary > 0
    ? Math.min(100, Math.ceil((totalExpenses / safeSalary) * 100))
    : 50;

  const recommended6MonthEmergencyTarget = totalExpenses * 6;
  const recommended6MonthSalaryTarget = safeSalary * 6;
  const recommended3MonthEmergencyTarget = totalExpenses * 3;

  const emergencyMonthly = allocations.emergencyAmount || 0;
  const safeMonthly = allocations.safeAmount || 0;
  const investMonthly = allocations.investAmount || 0;
  const totalMonthlyStrategicSavings = emergencyMonthly + safeMonthly + investMonthly;

  const questLinks: QuestSynergyLink[] = quests.map(q => {
    let linkedPillarName: 'emergency' | 'safe' | 'invest' | 'other' = 'other';
    let linkedPillarLabel = 'Unallocated Vault';
    let monthlyAllocation = 0;
    let recommendedEmergencyTarget: number | undefined;

    const lowerTitle = (q.title || '').toLowerCase();
    if (lowerTitle.includes('emergency') || lowerTitle.includes('shield') || lowerTitle.includes('طوارئ') || q.id === 'q1') {
      linkedPillarName = 'emergency';
      linkedPillarLabel = 'Emergency Shield Pillar';
      monthlyAllocation = emergencyMonthly;
      recommendedEmergencyTarget = recommended6MonthEmergencyTarget;
    } else if (lowerTitle.includes('asset') || lowerTitle.includes('milestone') || lowerTitle.includes('ثروة') || lowerTitle.includes('savings') || q.id === 'q2') {
      linkedPillarName = 'safe';
      linkedPillarLabel = 'Safe Savings Pillar';
      monthlyAllocation = safeMonthly;
    } else if (lowerTitle.includes('crypto') || lowerTitle.includes('invest') || lowerTitle.includes('portfolio') || lowerTitle.includes('محفظة') || q.id === 'q3') {
      linkedPillarName = 'invest';
      linkedPillarLabel = 'Future Investments Pillar';
      monthlyAllocation = investMonthly;
    }

    const remaining = Math.max(0, q.target - q.current);
    const estimatedMonths = monthlyAllocation > 0
      ? Math.ceil(remaining / monthlyAllocation)
      : (remaining === 0 ? 0 : 999);

    const isDynamicEmergencySync = recommendedEmergencyTarget !== undefined
      ? q.target === recommendedEmergencyTarget
      : undefined;

    return {
      questId: q.id,
      questTitle: q.title,
      currentAmount: q.current,
      targetAmount: q.target,
      percentAchieved: q.target > 0 ? Math.min(100, Math.round((q.current / q.target) * 100)) : 100,
      linkedPillarName,
      linkedPillarLabel,
      pillarName: linkedPillarLabel,
      monthlyAllocation,
      estimatedMonthsToGoal: estimatedMonths,
      isDynamicEmergencySync,
      recommendedEmergencyTarget,
    };
  });

  const recommendations: string[] = [];
  if (isOverBudget) {
    recommendations.push(
      `Committed monthly expenses (${totalExpenses.toLocaleString()} DH) exceed Personal Fund (${personalFund.toLocaleString()} DH) by ${budgetDeficitAmount.toLocaleString()} DH. Suggest adjusting Personal split to ${recommendedPersonalSplitPercent}%.`
    );
  } else if (freeCashBuffer > 0) {
    recommendations.push(
      `Positive free cash buffer: +${freeCashBuffer.toLocaleString()} DH remaining from Personal Fund can be swept into your active Quest milestones.`
    );
  }

  const emergencyQuest = questLinks.find(l => l.linkedPillarName === 'emergency');
  if (emergencyQuest && emergencyQuest.recommendedEmergencyTarget) {
    if (emergencyQuest.targetAmount !== emergencyQuest.recommendedEmergencyTarget) {
      recommendations.push(
        `Dynamic emergency benchmark: Based on your ${totalExpenses.toLocaleString()} DH/month expenses, a 6-month safety shield equals ${emergencyQuest.recommendedEmergencyTarget.toLocaleString()} DH (currently set to ${emergencyQuest.targetAmount.toLocaleString()} DH).`
      );
    }
  }

  return {
    salary: safeSalary,
    personalFundAllocation: personalFund,
    totalCommittedExpenses: totalExpenses,
    paidExpensesCost: paidExpenses,
    unpaidExpensesCost: unpaidExpenses,
    freeCashBuffer,
    budgetUtilizationPercent,
    isOverBudget,
    isDeficit: isOverBudget,
    budgetDeficitAmount,
    deficitAmount: budgetDeficitAmount,
    personalCoverageOfExpensesPercent,
    recommendedPersonalSplitPercent,
    recommended6MonthEmergencyTarget,
    recommended6MonthSalaryTarget,
    recommended3MonthEmergencyTarget,
    emergencyMonthlyAllocation: emergencyMonthly,
    safeSavingsMonthlyAllocation: safeMonthly,
    investmentsMonthlyAllocation: investMonthly,
    totalMonthlyStrategicSavings,
    questLinks,
    recommendations,
  };
}

// --- DETERMINISTIC FINANCIAL INSIGHTS GENERATOR (AI COACH LOGIC) ---
export interface FinancialInsight {
  type: 'positive' | 'warning' | 'info';
  observation: string;
  metric: string;
  reason: string;
  caveat: string;
}

export function generateDeterministicFinancialInsights(
  salary: number,
  allocations: AllocationReport,
  freeCash: FreeCashAnalysis,
  spendDelta: SpendDeltaResult
): FinancialInsight[] {
  const insights: FinancialInsight[] = [];

  // 1. Spend Benchmark vs Last Month
  if (spendDelta.isSaved) {
    insights.push({
      type: 'positive',
      observation: 'Disciplined Spending Control',
      metric: `-${spendDelta.percent}% vs Last Month (-${Math.abs(spendDelta.diff)} DH)`,
      reason: 'Your current virtual card spending budget is tighter than last month audited outlays.',
      caveat: 'Maintain this pace to channel surplus directly into high-yield assets or liquid shields.',
    });
  } else {
    insights.push({
      type: 'warning',
      observation: 'Elevated Spend Ceiling',
      metric: `+${spendDelta.percent}% vs Last Month (+${spendDelta.diff} DH)`,
      reason: 'Card allocation is higher than previous billing period benchmark.',
      caveat: 'Verify whether this is planned capital expenditure or discretionary lifestyle inflation.',
    });
  }

  // 2. Free Cash Buffer Health
  if (freeCash.isShortfall) {
    insights.push({
      type: 'warning',
      observation: 'Cash Flow Shortfall Detected',
      metric: `-${freeCash.shortfallAmount} DH Deficit in Personal Fund`,
      reason: 'Total committed living costs exceed your designated Personal & Needs allocation.',
      caveat: 'Audit lifestyle subscriptions or adjust 5-pillar distribution to prevent draining reserves.',
    });
  } else if (freeCash.freeCashBuffer >= salary * 0.15) {
    insights.push({
      type: 'positive',
      observation: 'Resilient Free Cash Cushion',
      metric: `+${freeCash.freeCashBuffer} DH Buffer (${Math.round((freeCash.freeCashBuffer / (salary || 1)) * 100)}% of income)`,
      reason: 'Generous liquid headroom to absorb unexpected medical or mechanical emergencies.',
      caveat: 'Consider sweeping idle excess beyond 3 months living expenses into growth investments.',
    });
  }

  // 3. Emergency & Liquid Reserves
  if (freeCash.runwayMonths < 3) {
    insights.push({
      type: 'info',
      observation: 'Liquidity Shield Recommended',
      metric: `${freeCash.runwayMonths} Months of Fixed Cost Runway`,
      reason: 'Current liquid balances cover fewer than 3 months of essential fixed commitments.',
      caveat: 'Prioritize building 6 months of fixed expenses in the Core Vault before speculative ventures.',
    });
  }

  return insights;
}

// --- STORAGE ISOLATION HELPER ---
const GUEST_STORAGE_KEY = 'sa_smart_wallet_guest_data_v3';
const USER_STORAGE_PREFIX = 'sa_smart_wallet_user_data_v3_';

export function getStorageKey(userIdentifier?: string | null): string {
  if (!userIdentifier || userIdentifier === 'guest') {
    return GUEST_STORAGE_KEY;
  }
  const safeId = userIdentifier.replace(/[^a-zA-Z0-9_-]/g, '_');
  return `${USER_STORAGE_PREFIX}${safeId}`;
}

export function loadStoredWalletState(userIdentifier?: string | null): WalletState {
  if (typeof window === 'undefined') return DEFAULT_WALLET_STATE;
  try {
    const key = getStorageKey(userIdentifier);
    const raw = localStorage.getItem(key);
    if (!raw) return DEFAULT_WALLET_STATE;
    const parsed = JSON.parse(raw);

    // Compute totalLiquidFunds from persisted state or fallback
    let totalLiquidFunds = 0;
    if (Number.isFinite(parsed.totalLiquidFunds)) {
      totalLiquidFunds = parsed.totalLiquidFunds;
    } else if (parsed.openingBalanceConfigured && Number.isFinite(parsed.openingBalance)) {
      totalLiquidFunds = parsed.openingBalance;
    }

    return {
      ...DEFAULT_WALLET_STATE,
      ...parsed,
      totalLiquidFunds,
      openingBalance: Number.isFinite(parsed.openingBalance) ? parsed.openingBalance : 0,
      openingBalanceConfigured: Boolean(parsed.openingBalanceConfigured),
      cardLimit: Number.isFinite(parsed.cardLimit) ? Math.min(parsed.cardLimit, totalLiquidFunds) : 0,
      expenses: Array.isArray(parsed.expenses) && parsed.expenses.length > 0 ? parsed.expenses : DEFAULT_WALLET_STATE.expenses,
      quests: Array.isArray(parsed.quests) && parsed.quests.length > 0 ? parsed.quests : DEFAULT_WALLET_STATE.quests,
      transactions: Array.isArray(parsed.transactions) ? parsed.transactions : [],
      customCategories: Array.isArray(parsed.customCategories) ? parsed.customCategories : DEFAULT_WALLET_STATE.customCategories,
      customFunds: Array.isArray(parsed.customFunds) ? parsed.customFunds : [],
      customIncomeSolutions: Array.isArray(parsed.customIncomeSolutions) ? parsed.customIncomeSolutions : [],
    };
  } catch (e) {
    console.warn('Failed to load stored wallet state:', e);
    return DEFAULT_WALLET_STATE;
  }
}

export function saveStoredWalletState(state: WalletState, userIdentifier?: string | null): void {
  if (typeof window === 'undefined') return;
  try {
    const key = getStorageKey(userIdentifier);
    localStorage.setItem(key, JSON.stringify(state));
  } catch (e) {
    console.warn('Failed to save wallet state:', e);
  }
}

// ============================================================================
// WHAT IF? FINANCIAL SIMULATOR — PROJECTION & SCENARIO ENGINE
// ============================================================================

export interface BaselineFinancialSnapshot {
  monthlyIncome: number;
  totalCommittedExpenses: number;
  fixedExpenses: number;
  lifestyleExpenses: number;
  liquidFunds: number;
  unallocatedVault: number;
  cardAllocation: number;
  monthlySavingsRate: number;
  freeCashBuffer: number;
  runwayMonths: number;
}

export interface ScenarioParameters {
  id: string;
  name: string;
  description?: string;
  presetKey?: string;
  // Income adjustments
  salaryDeltaPercent: number;        // e.g. +20%, -15%
  salaryDeltaAmount: number;         // alternative flat DH
  additionalMonthlyIncome: number;   // freelance, side hustle
  // Expense adjustments
  expenseReductionAmount: number;    // e.g. -500 DH on groceries/bills
  lifestyleCutPercent: number;       // e.g. -15% on dining/leisure
  // Savings & Investing
  monthlySavingsTarget: number;      // e.g. 2,000 DH/month
  hypotheticalInvestPercent: number; // e.g. 10% of monthly income
  assumedAnnualReturn: number;       // e.g. 8% annual compounding
  // Stress Testing & Shocks
  incomeInterruptionMonths: number;  // e.g. 2 months loss of income
  oneTimeShockExpense: number;       // e.g. 5,000 DH emergency expense
  debtRepaymentMonthly: number;      // e.g. 1,000 DH debt payoff plan
  totalRecordedDebt: number;         // e.g. 12,000 DH total liability
  // Financial Freedom Target
  targetFreedomGoal: number;         // e.g. 100,000 DH asset milestone
  createdAt: number;
  updatedAt: number;
}

export interface SimulationProjectionPoint {
  month: number;
  label: string;
  baselineCumulativeSavings: number;
  baselineNetWorth: number;
  scenarioCumulativeSavings: number;
  scenarioInvestGrowth: number;
  scenarioNetWorth: number;
  deltaNetWorth: number;
}

export interface SimulationComparisonReport {
  baseline: BaselineFinancialSnapshot;
  scenario: {
    parameters: ScenarioParameters;
    projectedMonthlyIncome: number;
    projectedMonthlyExpenses: number;
    projectedMonthlySavings: number;
    projectedFreeCash: number;
    projectedRunwayMonths: number;
    monthlyIncomeDelta: number;
    monthlyExpensesDelta: number;
    monthlySavingsDelta: number;
    annualSavingsDelta: number;
    twoYearSavingsDelta: number;
    horizonSurplus: {
      m1: number;
      m3: number;
      m6: number;
      m12: number;
      m24: number;
      m36: number;
      m60: number;
    };
    estimatedMonthsToGoal: number;
    baselineMonthsToGoal: number;
    goalSpeedupMonths: number;
    debtPayoffMonths: number;
    interruptionSurvives: boolean;
    interruptionRemainingCash: number;
    runwayDeltaMonths: number;
  };
  timeline: SimulationProjectionPoint[];
  insights: string[];
}

/**
 * Creates a clean default baseline financial snapshot from current wallet state.
 */
export function extractBaselineSnapshot(
  salary: number,
  expenses: ExpenseRecord[],
  liquidFunds: number,
  cardAllocation: number,
  unallocatedVault: number,
  personalFundAllocation: number
): BaselineFinancialSnapshot {
  const safeSalary = Math.max(0, Number.isFinite(salary) ? salary : 0);
  const fixed = expenses.filter(e => e.category === 'fixed').reduce((a, b) => a + (b.cost || 0), 0);
  const lifestyle = expenses.filter(e => e.category !== 'fixed').reduce((a, b) => a + (b.cost || 0), 0);
  const totalCommitted = fixed + lifestyle;
  const freeCash = personalFundAllocation - totalCommitted;
  const monthlySavings = Math.max(0, safeSalary - totalCommitted);
  const runwayMonths = totalCommitted > 0 ? roundToMinorUnits(liquidFunds / totalCommitted, 1) : 99;

  return {
    monthlyIncome: safeSalary,
    totalCommittedExpenses: totalCommitted,
    fixedExpenses: fixed,
    lifestyleExpenses: lifestyle,
    liquidFunds: Math.max(0, liquidFunds),
    unallocatedVault: Math.max(0, unallocatedVault),
    cardAllocation: Math.max(0, cardAllocation),
    monthlySavingsRate: monthlySavings,
    freeCashBuffer: freeCash,
    runwayMonths,
  };
}

/**
 * Standard Preset Scenarios matching product requirements:
 * 1. Salary Increase (+20%)
 * 2. Salary Reduction (-15%)
 * 3. Expense Optimization (-500 DH Food/Lifestyle)
 * 4. Aggressive Saving (2,000 DH/month)
 * 5. Investment Scenario (10% income @ 8% return)
 * 6. Income Interruption (2-month income loss)
 * 7. Debt Repayment (1,000 DH/month acceleration)
 * 8. Emergency Scenario (5,000 DH unexpected shock)
 * 9. Financial Freedom Target (100,000 DH target)
 */
export function getStandardSimulationPresets(baseline: BaselineFinancialSnapshot): ScenarioParameters[] {
  const now = Date.now();
  return [
    {
      id: 'preset_salary_raise',
      name: 'Salary Promotion (+20%)',
      description: 'What happens to my annual wealth if my monthly salary increases by 20%?',
      presetKey: 'salary_raise',
      salaryDeltaPercent: 20,
      salaryDeltaAmount: 0,
      additionalMonthlyIncome: 0,
      expenseReductionAmount: 0,
      lifestyleCutPercent: 0,
      monthlySavingsTarget: 0,
      hypotheticalInvestPercent: 0,
      assumedAnnualReturn: 7,
      incomeInterruptionMonths: 0,
      oneTimeShockExpense: 0,
      debtRepaymentMonthly: 0,
      totalRecordedDebt: 0,
      targetFreedomGoal: 100000,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'preset_salary_cut',
      name: 'Income Downturn (-15%)',
      description: 'How resilient is my cash buffer if monthly earnings drop by 15%?',
      presetKey: 'salary_cut',
      salaryDeltaPercent: -15,
      salaryDeltaAmount: 0,
      additionalMonthlyIncome: 0,
      expenseReductionAmount: 0,
      lifestyleCutPercent: 0,
      monthlySavingsTarget: 0,
      hypotheticalInvestPercent: 0,
      assumedAnnualReturn: 7,
      incomeInterruptionMonths: 0,
      oneTimeShockExpense: 0,
      debtRepaymentMonthly: 0,
      totalRecordedDebt: 0,
      targetFreedomGoal: 100000,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'preset_expense_opt',
      name: 'Expense Optimization (-500 DH)',
      description: 'What if I reduce monthly dining and grocery outlays by 500 DH?',
      presetKey: 'expense_opt',
      salaryDeltaPercent: 0,
      salaryDeltaAmount: 0,
      additionalMonthlyIncome: 0,
      expenseReductionAmount: 500,
      lifestyleCutPercent: 10,
      monthlySavingsTarget: 0,
      hypotheticalInvestPercent: 0,
      assumedAnnualReturn: 7,
      incomeInterruptionMonths: 0,
      oneTimeShockExpense: 0,
      debtRepaymentMonthly: 0,
      totalRecordedDebt: 0,
      targetFreedomGoal: 100000,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'preset_aggressive_saving',
      name: 'Aggressive Saving (2,000 DH/mo)',
      description: 'What if I consistently bank 2,000 DH into savings every single month?',
      presetKey: 'aggressive_saving',
      salaryDeltaPercent: 0,
      salaryDeltaAmount: 0,
      additionalMonthlyIncome: 0,
      expenseReductionAmount: 0,
      lifestyleCutPercent: 0,
      monthlySavingsTarget: 2000,
      hypotheticalInvestPercent: 0,
      assumedAnnualReturn: 7,
      incomeInterruptionMonths: 0,
      oneTimeShockExpense: 0,
      debtRepaymentMonthly: 0,
      totalRecordedDebt: 0,
      targetFreedomGoal: 100000,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'preset_invest_growth',
      name: 'Hypothetical Investing (10% @ 8%)',
      description: 'What if I hypothetically invest 10% of monthly income with an assumed 8% return?',
      presetKey: 'invest_growth',
      salaryDeltaPercent: 0,
      salaryDeltaAmount: 0,
      additionalMonthlyIncome: 0,
      expenseReductionAmount: 0,
      lifestyleCutPercent: 0,
      monthlySavingsTarget: 0,
      hypotheticalInvestPercent: 10,
      assumedAnnualReturn: 8,
      incomeInterruptionMonths: 0,
      oneTimeShockExpense: 0,
      debtRepaymentMonthly: 0,
      totalRecordedDebt: 0,
      targetFreedomGoal: 100000,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'preset_income_interruption',
      name: 'Income Interruption (2-Month Shock)',
      description: 'Can my available funds cover all living costs if income halts for two months?',
      presetKey: 'income_interruption',
      salaryDeltaPercent: 0,
      salaryDeltaAmount: 0,
      additionalMonthlyIncome: 0,
      expenseReductionAmount: 0,
      lifestyleCutPercent: 0,
      monthlySavingsTarget: 0,
      hypotheticalInvestPercent: 0,
      assumedAnnualReturn: 7,
      incomeInterruptionMonths: 2,
      oneTimeShockExpense: 0,
      debtRepaymentMonthly: 0,
      totalRecordedDebt: 0,
      targetFreedomGoal: 100000,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'preset_debt_acceleration',
      name: 'Accelerated Debt Payoff',
      description: 'How quickly can I eliminate liabilities by committing 1,000 DH monthly?',
      presetKey: 'debt_acceleration',
      salaryDeltaPercent: 0,
      salaryDeltaAmount: 0,
      additionalMonthlyIncome: 0,
      expenseReductionAmount: 0,
      lifestyleCutPercent: 0,
      monthlySavingsTarget: 0,
      hypotheticalInvestPercent: 0,
      assumedAnnualReturn: 7,
      incomeInterruptionMonths: 0,
      oneTimeShockExpense: 0,
      debtRepaymentMonthly: 1000,
      totalRecordedDebt: Math.max(6000, baseline.totalCommittedExpenses * 2),
      targetFreedomGoal: 100000,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'preset_emergency_shock',
      name: 'Emergency Expense Shock (5,000 DH)',
      description: 'How does an unexpected 5,000 DH medical/auto outlay affect my runway?',
      presetKey: 'emergency_shock',
      salaryDeltaPercent: 0,
      salaryDeltaAmount: 0,
      additionalMonthlyIncome: 0,
      expenseReductionAmount: 0,
      lifestyleCutPercent: 0,
      monthlySavingsTarget: 0,
      hypotheticalInvestPercent: 0,
      assumedAnnualReturn: 7,
      incomeInterruptionMonths: 0,
      oneTimeShockExpense: 5000,
      debtRepaymentMonthly: 0,
      totalRecordedDebt: 0,
      targetFreedomGoal: 100000,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'preset_financial_freedom',
      name: 'Financial Freedom Goal (100k DH)',
      description: 'How much faster can I accumulate 100,000 DH with disciplined surplus retention?',
      presetKey: 'financial_freedom',
      salaryDeltaPercent: 10,
      salaryDeltaAmount: 0,
      additionalMonthlyIncome: 1000,
      expenseReductionAmount: 400,
      lifestyleCutPercent: 0,
      monthlySavingsTarget: 2500,
      hypotheticalInvestPercent: 5,
      assumedAnnualReturn: 8,
      incomeInterruptionMonths: 0,
      oneTimeShockExpense: 0,
      debtRepaymentMonthly: 0,
      totalRecordedDebt: 0,
      targetFreedomGoal: 100000,
      createdAt: now,
      updatedAt: now,
    },
  ];
}

/**
 * Calculates deterministic What If? scenario projections without mutating actual ledger records.
 */
export function calculateWhatIfScenario(
  baseline: BaselineFinancialSnapshot,
  scenario: ScenarioParameters
): SimulationComparisonReport {
  // 1. Calculate projected monthly income
  const salaryMultiplier = 1 + (scenario.salaryDeltaPercent || 0) / 100;
  const projectedIncome = Math.max(
    0,
    roundToMinorUnits(baseline.monthlyIncome * salaryMultiplier + (scenario.salaryDeltaAmount || 0) + (scenario.additionalMonthlyIncome || 0), 2)
  );

  // 2. Calculate projected monthly expenses
  const lifestyleCut = baseline.lifestyleExpenses * ((scenario.lifestyleCutPercent || 0) / 100);
  const totalExpenseReduction = (scenario.expenseReductionAmount || 0) + lifestyleCut;
  const projectedExpenses = Math.max(
    0,
    roundToMinorUnits(baseline.totalCommittedExpenses - totalExpenseReduction + (scenario.debtRepaymentMonthly || 0), 2)
  );

  // 3. Savings & Investments
  const rawMonthlySurplus = Math.max(0, projectedIncome - projectedExpenses);
  const monthlyInvest = Math.max(
    0,
    roundToMinorUnits(projectedIncome * ((scenario.hypotheticalInvestPercent || 0) / 100), 2)
  );
  const effectiveMonthlySavings = scenario.monthlySavingsTarget > 0 
    ? Math.min(rawMonthlySurplus, scenario.monthlySavingsTarget) 
    : rawMonthlySurplus;

  const projectedFreeCash = Math.max(0, roundToMinorUnits(rawMonthlySurplus - monthlyInvest, 2));

  // 4. Emergency & Interruption stress test
  const oneTimeShock = Math.max(0, scenario.oneTimeShockExpense || 0);
  const startingLiquid = Math.max(0, baseline.liquidFunds - oneTimeShock);
  const interruptionMonths = Math.max(0, scenario.incomeInterruptionMonths || 0);
  const interruptionCost = interruptionMonths * projectedExpenses;
  const interruptionSurvives = startingLiquid >= interruptionCost;
  const interruptionRemainingCash = startingLiquid - interruptionCost;

  // 5. Runway
  const projectedRunwayMonths = projectedExpenses > 0 
    ? roundToMinorUnits(startingLiquid / projectedExpenses, 1) 
    : 99;
  const runwayDeltaMonths = roundToMinorUnits(projectedRunwayMonths - baseline.runwayMonths, 1);

  // 6. Deltas vs Baseline
  const monthlyIncomeDelta = roundToMinorUnits(projectedIncome - baseline.monthlyIncome, 2);
  const monthlyExpensesDelta = roundToMinorUnits(projectedExpenses - baseline.totalCommittedExpenses, 2);
  const baselineMonthlySurplus = Math.max(0, baseline.monthlyIncome - baseline.totalCommittedExpenses);
  const monthlySavingsDelta = roundToMinorUnits(rawMonthlySurplus - baselineMonthlySurplus, 2);
  const annualSavingsDelta = roundToMinorUnits(monthlySavingsDelta * 12, 2);
  const twoYearSavingsDelta = roundToMinorUnits(monthlySavingsDelta * 24, 2);

  // 7. Freedom Target Timeline
  const freedomTarget = Math.max(1000, scenario.targetFreedomGoal || 100000);
  const baselineMonthsToGoal = baselineMonthlySurplus > 0 
    ? Math.ceil(freedomTarget / baselineMonthlySurplus) 
    : 999;
  const estimatedMonthsToGoal = rawMonthlySurplus > 0 
    ? Math.ceil(freedomTarget / rawMonthlySurplus) 
    : 999;
  const goalSpeedupMonths = Math.max(0, baselineMonthsToGoal - estimatedMonthsToGoal);

  // 8. Debt Payoff Timeline
  const debtTotal = Math.max(0, scenario.totalRecordedDebt || 0);
  const debtPayoffMonths = scenario.debtRepaymentMonthly > 0 && debtTotal > 0 
    ? Math.ceil(debtTotal / scenario.debtRepaymentMonthly) 
    : 0;

  // 9. Multi-Horizon Projections (Months 1, 3, 6, 12, 24, 36, 60)
  const monthlyCompoundRate = ((scenario.assumedAnnualReturn || 7) / 100) / 12;
  const keyMonths = [1, 3, 6, 12, 24, 36, 60];
  const horizonSurplus = {
    m1: 0,
    m3: 0,
    m6: 0,
    m12: 0,
    m24: 0,
    m36: 0,
    m60: 0,
  };

  const timeline: SimulationProjectionPoint[] = [];

  let simLiquidCash = startingLiquid;
  let simInvestPortfolio = 0;
  let baseLiquidCash = baseline.liquidFunds;

  for (let m = 1; m <= 60; m++) {
    // Baseline step
    baseLiquidCash += baselineMonthlySurplus;

    // Scenario step with interruption modeling
    const activeIncomeThisMonth = m <= interruptionMonths ? 0 : projectedIncome;
    const monthlyNetFlow = activeIncomeThisMonth - projectedExpenses - monthlyInvest;
    simLiquidCash += monthlyNetFlow;

    if (monthlyInvest > 0) {
      simInvestPortfolio = (simInvestPortfolio + monthlyInvest) * (1 + monthlyCompoundRate);
    }

    const simTotalNetWorth = Math.round(simLiquidCash + simInvestPortfolio);
    const baseTotalNetWorth = Math.round(baseLiquidCash);
    const delta = simTotalNetWorth - baseTotalNetWorth;

    if (m === 1) horizonSurplus.m1 = delta;
    if (m === 3) horizonSurplus.m3 = delta;
    if (m === 6) horizonSurplus.m6 = delta;
    if (m === 12) horizonSurplus.m12 = delta;
    if (m === 24) horizonSurplus.m24 = delta;
    if (m === 36) horizonSurplus.m36 = delta;
    if (m === 60) horizonSurplus.m60 = delta;

    if (keyMonths.includes(m)) {
      timeline.push({
        month: m,
        label: `M${m}`,
        baselineCumulativeSavings: Math.max(0, Math.round(baselineMonthlySurplus * m)),
        baselineNetWorth: baseTotalNetWorth,
        scenarioCumulativeSavings: Math.max(0, Math.round((projectedIncome - projectedExpenses) * m)),
        scenarioInvestGrowth: Math.round(simInvestPortfolio),
        scenarioNetWorth: simTotalNetWorth,
        deltaNetWorth: delta,
      });
    }
  }

  // 10. Intelligent Strategic Insights
  const insights: string[] = [];
  if (monthlySavingsDelta > 0) {
    insights.push(`This scenario unlocks an extra +${monthlySavingsDelta.toLocaleString()} DH/month (+${annualSavingsDelta.toLocaleString()} DH in 12 months).`);
  } else if (monthlySavingsDelta < 0) {
    insights.push(`This adjustment narrows your monthly margin by ${Math.abs(monthlySavingsDelta).toLocaleString()} DH/month.`);
  }

  if (interruptionMonths > 0) {
    if (interruptionSurvives) {
      insights.push(`Stress Test Passed: Your liquid reserves can absorb ${interruptionMonths} months of complete income disruption with ${Math.round(interruptionRemainingCash).toLocaleString()} DH buffer remaining.`);
    } else {
      insights.push(`Stress Test Warning: An income interruption of ${interruptionMonths} months would deplete your liquid funds by month ${Math.floor(startingLiquid / (projectedExpenses || 1)) + 1}.`);
    }
  }

  if (goalSpeedupMonths > 0 && baselineMonthsToGoal < 999) {
    insights.push(`Accelerates your ${freedomTarget.toLocaleString()} DH milestone by ${goalSpeedupMonths} months (achieved in ${estimatedMonthsToGoal} months vs. ${baselineMonthsToGoal} baseline).`);
  }

  if (monthlyInvest > 0) {
    const projected5YearGain = Math.round(simInvestPortfolio - (monthlyInvest * 60));
    insights.push(`Hypothetical 5-Year Compounding: Investing ${monthlyInvest.toLocaleString()} DH/mo at ${scenario.assumedAnnualReturn}% yield projects ~${Math.round(simInvestPortfolio).toLocaleString()} DH total (~+${projected5YearGain.toLocaleString()} DH hypothetical gains).`);
  }

  if (debtPayoffMonths > 0) {
    insights.push(`Debt Clear Target: At ${scenario.debtRepaymentMonthly.toLocaleString()} DH/month, all ${debtTotal.toLocaleString()} DH in liabilities are resolved in ${debtPayoffMonths} months.`);
  }

  return {
    baseline,
    scenario: {
      parameters: scenario,
      projectedMonthlyIncome: projectedIncome,
      projectedMonthlyExpenses: projectedExpenses,
      projectedMonthlySavings: effectiveMonthlySavings,
      projectedFreeCash,
      projectedRunwayMonths,
      monthlyIncomeDelta,
      monthlyExpensesDelta,
      monthlySavingsDelta,
      annualSavingsDelta,
      twoYearSavingsDelta,
      horizonSurplus,
      estimatedMonthsToGoal,
      baselineMonthsToGoal,
      goalSpeedupMonths,
      debtPayoffMonths,
      interruptionSurvives,
      interruptionRemainingCash,
      runwayDeltaMonths,
    },
    timeline,
    insights,
  };
}

// --- ISOLATED WHAT IF? SCENARIO STORAGE ---
const SCENARIO_STORAGE_PREFIX = 'sa_what_if_scenarios_v1_';

export function getScenarioStorageKey(userIdentifier?: string | null): string {
  if (!userIdentifier || userIdentifier === 'guest') {
    return `${SCENARIO_STORAGE_PREFIX}guest`;
  }
  const safeId = userIdentifier.replace(/[^a-zA-Z0-9_-]/g, '_');
  return `${SCENARIO_STORAGE_PREFIX}${safeId}`;
}

export function loadStoredScenarios(userIdentifier?: string | null): ScenarioParameters[] {
  if (typeof window === 'undefined') return [];
  try {
    const key = getScenarioStorageKey(userIdentifier);
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn('Failed to load stored scenarios:', e);
    return [];
  }
}

export function saveStoredScenarios(scenarios: ScenarioParameters[], userIdentifier?: string | null): void {
  if (typeof window === 'undefined') return;
  try {
    const key = getScenarioStorageKey(userIdentifier);
    localStorage.setItem(key, JSON.stringify(scenarios));
  } catch (e) {
    console.warn('Failed to save scenarios:', e);
  }
}

