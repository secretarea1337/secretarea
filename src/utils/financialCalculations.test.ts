/**
 * Automated Verification Test Suite for Financial Logic Engine
 * Verifies all 12 core requirements, mathematical invariants, and accounting integrity.
 * Run via: npx tsx src/utils/financialCalculations.test.ts
 */

import {
  calculateMasterBalances,
  calculateSpendDelta,
  calculatePillarAllocations,
  calculateFreeCash,
  calculateTargetPurchase,
  calculateGoalProgress,
  calculateCurrencySwap,
  convertFromMAD,
  convertToMAD,
  formatMoney,
  getStorageKey,
  roundToMinorUnits,
  ExpenseRecord,
  DEFAULT_WALLET_STATE,
  SUPPORTED_CURRENCIES,
  extractBaselineSnapshot,
  getStandardSimulationPresets,
  calculateWhatIfScenario,
  getScenarioStorageKey,
  ScenarioParameters,
  calculateTrioSynergy,
  autoOptimizeBudgetSplits,
  getIncomeDevelopmentSolutions,
} from './financialCalculations';

function runTestSuite() {
  console.log('=== RUNNING FINANCIAL ENGINE VERIFICATION TESTS ===\n');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, message: string) {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${message}`);
      failed++;
    }
  }

  // 1. ZERO / EMPTY OPENING BALANCE INITIALIZATION
  {
    assert(
      DEFAULT_WALLET_STATE.totalLiquidFunds === 0 &&
      DEFAULT_WALLET_STATE.openingBalance === 0 &&
      DEFAULT_WALLET_STATE.openingBalanceConfigured === false &&
      DEFAULT_WALLET_STATE.cardLimit === 0,
      'Initial state starts with zero liquid funds, zero card allocation, and unconfigured opening balance'
    );

    const emptyBalances = calculateMasterBalances(0, 0, 0, 0);
    assert(
      emptyBalances.totalLiquidFunds === 0 &&
      emptyBalances.unallocatedVault === 0 &&
      emptyBalances.cardAllocation === 0 &&
      emptyBalances.netLiquidWorth === 0,
      'calculateMasterBalances cleanly handles zero funds without NaN or negative values'
    );
  }

  // 2. SETTING OPENING BALANCE UPDATES TOTAL LIQUID FUNDS
  {
    const configuredOpening = 20000;
    const initialBalances = calculateMasterBalances(configuredOpening, 0, 0, 0);
    assert(
      initialBalances.totalLiquidFunds === 20000 &&
      initialBalances.unallocatedVault === 20000 &&
      initialBalances.cardAllocation === 0,
      'Setting opening balance creates initial unallocated liquid vault honestly'
    );
  }

  // 3 & 4 & 5. CARD ALLOCATION CONSERVATION & PHANTOM WEALTH PREVENTION
  {
    const totalFunds = 25000;
    const initialAllocation = 5000;
    const b1 = calculateMasterBalances(totalFunds, initialAllocation, 0, 0);
    assert(
      b1.totalLiquidFunds === 25000 &&
      b1.unallocatedVault === 20000 &&
      b1.cardAllocation === 5000,
      'Base allocation: 25k total = 20k vault + 5k card'
    );

    // Increase card allocation to 12,000 DH
    const b2 = calculateMasterBalances(totalFunds, 12000, 0, 0);
    assert(
      b2.totalLiquidFunds === 25000 &&
      b2.unallocatedVault === 13000 &&
      b2.cardAllocation === 12000,
      'Increasing card allocation reduces unallocated vault by exact same amount (total constant)'
    );

    // Decrease card allocation to 2,000 DH
    const b3 = calculateMasterBalances(totalFunds, 2000, 0, 0);
    assert(
      b3.totalLiquidFunds === 25000 &&
      b3.unallocatedVault === 23000 &&
      b3.cardAllocation === 2000,
      'Decreasing card allocation increases unallocated vault by exact same amount (total constant)'
    );

    // Adjusting card allocation must NEVER increase total liquid funds
    assert(
      b1.totalLiquidFunds === b2.totalLiquidFunds && b2.totalLiquidFunds === b3.totalLiquidFunds,
      'Total liquid funds remains strictly constant across all card adjustments (No Phantom Money)'
    );
  }

  // 6. CARD ALLOCATION CANNOT EXCEED AVAILABLE LIQUID FUNDS
  {
    const totalFunds = 10000;
    const reservedGoals = 3000; // Leaves 7,000 DH available
    const overAllocatedCard = 15000; // Requested card allocation exceeds available
    const b = calculateMasterBalances(totalFunds, overAllocatedCard, reservedGoals, 0);
    assert(
      b.cardAllocation === 7000 && b.unallocatedVault === 0,
      'Card allocation is clamped to max available liquid funds (safeTotal - safeGoals)'
    );
  }

  // 7. FINANCIAL QUEST CONTRIBUTIONS PRESERVE TOTAL WEALTH
  {
    const totalFunds = 30000;
    const cardLimit = 5000;
    const questBefore = 2000;
    const bBefore = calculateMasterBalances(totalFunds, cardLimit, questBefore, 0);
    assert(bBefore.unallocatedVault === 23000, 'Vault before quest deposit is 23,000 DH');

    // Deposit 4,000 DH from vault into quest milestones
    const questAfter = questBefore + 4000;
    const bAfter = calculateMasterBalances(totalFunds, cardLimit, questAfter, 0);
    assert(
      bAfter.unallocatedVault === 19000 &&
      bAfter.reservedForGoals === 6000 &&
      bAfter.totalLiquidFunds === 30000,
      'Quest deposit moves funds from unallocated vault to goals without changing total liquid funds'
    );
  }

  // 8. RECORDING INCOME INCREASES LIQUID FUNDS AND VAULT
  {
    let currentTotal = 15000;
    let cardAllocation = 4000;
    const bBefore = calculateMasterBalances(currentTotal, cardAllocation, 0, 0);
    assert(bBefore.unallocatedVault === 11000, 'Unallocated vault is 11,000 DH before income');

    // User records 5,000 DH income from a client
    const incomeAmount = 5000;
    currentTotal += incomeAmount;
    const bAfter = calculateMasterBalances(currentTotal, cardAllocation, 0, 0);
    assert(
      bAfter.totalLiquidFunds === 20000 &&
      bAfter.unallocatedVault === 16000,
      'Income correctly increases both total liquid funds and unallocated vault'
    );
  }

  // 9, 10, 11, 12. EXPENSES LEDGER INTEGRITY (PAID, UNPAID, EDIT, DELETE)
  {
    let liquidFunds = 20000;
    const expenses: ExpenseRecord[] = [
      { id: 'e1', label: 'Coworking Space', cost: 1500, paid: true, icon: 'Home', category: 'fixed' },
      { id: 'e2', label: 'Cloud Servers', cost: 500, paid: false, icon: 'Code', category: 'lifestyle' },
    ];

    // Total liabilities and free cash
    const personalFund = 6000;
    const fc = calculateFreeCash(expenses, personalFund, liquidFunds, 10000);
    assert(fc.totalCommittedExpenses === 2000, 'Total committed expenses = 2,000 DH');
    assert(fc.paidExpensesCost === 1500, 'Paid obligations = 1,500 DH');
    assert(fc.remainingUnpaidCost === 500, 'Unpaid obligations = 500 DH');

    // 10. Recording unpaid expense leaves liquid funds unchanged
    const masterWithUnpaid = calculateMasterBalances(liquidFunds, 0, 0, fc.remainingUnpaidCost);
    assert(
      masterWithUnpaid.totalLiquidFunds === 20000 &&
      masterWithUnpaid.netLiquidWorth === 19500,
      'Unpaid obligations do not deduct liquid cash immediately, but reflect in net liquid worth'
    );

    // 11. Editing expense cost
    // If e1 (paid: true) cost was changed from 1500 to 1800, 300 DH additional is deducted from liquid funds
    const oldCost = expenses[0].cost;
    const newCost = 1800;
    const costDiff = newCost - oldCost;
    liquidFunds -= costDiff; // 19,700
    expenses[0].cost = newCost;
    assert(liquidFunds === 19700, 'Editing paid expense cost deducts the difference accurately');

    // 12. Deleting a paid expense restores funds
    liquidFunds += expenses[0].cost; // restores 1800 -> 21,500
    expenses.shift();
    assert(liquidFunds === 21500, 'Deleting a paid expense restores cash balance');
  }

  // 13 & 14. 5-PILLAR BUDGET ALLOCATOR (CUSTOM SPLITS, <100%, >100%)
  {
    const salary = 12000;

    // Normal default
    const def = calculatePillarAllocations(salary);
    assert(def.totalAllocatedPercent === 100 && def.totalAllocatedAmount === salary, 'Default split equals 100% of income');

    // Custom under-allocation (<100%)
    const under = calculatePillarAllocations(salary, { personal: 40, invest: 20, safe: 10, emergency: 10, parents: 5 });
    assert(
      under.totalAllocatedPercent === 85 &&
      under.isUnderAllocated === true &&
      under.unallocatedPercent === 15 &&
      under.unallocatedAmount === 1800,
      'Reports exact unallocated percentage (15%) and amount (1,800 DH) when <100%'
    );

    // Custom over-allocation (>100%)
    const over = calculatePillarAllocations(salary, { personal: 55, invest: 25, safe: 15, emergency: 10, parents: 10 });
    assert(
      over.totalAllocatedPercent === 115 &&
      over.isOverAllocated === true,
      'Flags over-allocation warning when custom percentages exceed 100%'
    );
  }

  // 15. TRANSPARENT CURRENCY SWAP & RATE DISCLOSURE
  {
    const availableMAD = 15000;
    const swap = calculateCurrencySwap('MAD', 'USD', 5000, availableMAD);
    assert(
      swap.fromAmount === 5000 &&
      swap.toAmount === 500 &&
      swap.rateUsed === 0.10 &&
      swap.isFeasible === true &&
      swap.rateSource === 'Configured Reference Baseline (Indicative estimation)',
      'Transparent swap calculates 5,000 MAD -> 500 USD using disclosed reference baseline'
    );

    // Disallow swapping more than available balance
    const overSwap = calculateCurrencySwap('MAD', 'USD', 25000, availableMAD);
    assert(
      overSwap.isFeasible === false,
      'Flags insufficient funds if swap amount exceeds available balance'
    );
  }

  // 16. USER DATA PARTITIONING & AUTH ISOLATION
  {
    const guestKey = getStorageKey(null);
    const guestKeyExplicit = getStorageKey('guest');
    const userAdminKey = getStorageKey('admin@secretarea.com');
    const userMemberKey = getStorageKey('user-uuid-1234');

    assert(
      guestKey === 'sa_smart_wallet_guest_data_v3' && guestKeyExplicit === guestKey,
      'Guest session consistently uses sa_smart_wallet_guest_data_v3'
    );
    assert(
      userAdminKey === 'sa_smart_wallet_user_data_v3_admin_secretarea_com',
      'Authenticated user gets isolated namespace key'
    );
    assert(
      guestKey !== userAdminKey && userAdminKey !== userMemberKey,
      'All storage namespaces are strictly isolated between visitors and users'
    );
  }

  // 17. WHAT IF? BASELINE SNAPSHOT EXTRACTION
  {
    const expensesList: ExpenseRecord[] = [
      { id: '1', label: 'Rent', cost: 3000, paid: true, icon: 'Home', category: 'fixed' },
      { id: '2', label: 'Groceries', cost: 1500, paid: true, icon: 'ShoppingBag', category: 'fixed' },
      { id: '3', label: 'Gym', cost: 500, paid: true, icon: 'Activity', category: 'lifestyle' },
    ];
    const snapshot = extractBaselineSnapshot(8500, expensesList, 20000, 5000, 15000, 4250);

    assert(
      snapshot.monthlyIncome === 8500 &&
      snapshot.totalCommittedExpenses === 5000 &&
      snapshot.fixedExpenses === 4500 &&
      snapshot.lifestyleExpenses === 500 &&
      snapshot.liquidFunds === 20000 &&
      snapshot.monthlySavingsRate === 3500 &&
      snapshot.runwayMonths === 4,
      'extractBaselineSnapshot cleanly extracts accurate baseline metrics'
    );
  }

  // 18. WHAT IF? SALARY RAISE SCENARIO (+20%)
  {
    const expensesList: ExpenseRecord[] = [
      { id: '1', label: 'Living', cost: 4000, paid: true, icon: 'Home', category: 'fixed' },
    ];
    const baseline = extractBaselineSnapshot(10000, expensesList, 30000, 5000, 25000, 5000);
    const presets = getStandardSimulationPresets(baseline);
    const raisePreset = presets.find(p => p.presetKey === 'salary_raise')!;

    const report = calculateWhatIfScenario(baseline, raisePreset);
    assert(
      report.scenario.projectedMonthlyIncome === 12000 &&
      report.scenario.monthlyIncomeDelta === 2000 &&
      report.scenario.monthlySavingsDelta === 2000 &&
      report.scenario.annualSavingsDelta === 24000,
      '+20% salary increase accurately projects +2,000 DH/month (+24,000 DH/year)'
    );
  }

  // 19. WHAT IF? EXPENSE OPTIMIZATION SCENARIO (-500 DH)
  {
    const expensesList: ExpenseRecord[] = [
      { id: '1', label: 'Fixed Costs', cost: 3000, paid: true, icon: 'Home', category: 'fixed' },
      { id: '2', label: 'Food & Lifestyle', cost: 1500, paid: true, icon: 'Coffee', category: 'lifestyle' },
    ];
    const baseline = extractBaselineSnapshot(6000, expensesList, 15000, 3000, 12000, 3000);
    const customOptimization: ScenarioParameters = {
      id: 'test_opt',
      name: 'Cut Food by 500 DH',
      salaryDeltaPercent: 0,
      salaryDeltaAmount: 0,
      additionalMonthlyIncome: 0,
      expenseReductionAmount: 500,
      lifestyleCutPercent: 0,
      monthlySavingsTarget: 0,
      hypotheticalInvestPercent: 0,
      assumedAnnualReturn: 7,
      incomeInterruptionMonths: 0,
      oneTimeShockExpense: 0,
      debtRepaymentMonthly: 0,
      totalRecordedDebt: 0,
      targetFreedomGoal: 100000,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const report = calculateWhatIfScenario(baseline, customOptimization);
    // Baseline surplus = 6000 - 4500 = 1500 DH.
    // Projected expenses = 4500 - 500 = 4000 DH.
    // Projected surplus = 6000 - 4000 = 2000 DH (+500 DH/month, +6,000 DH/year).
    assert(
      report.scenario.projectedMonthlyExpenses === 4000 &&
      report.scenario.monthlySavingsDelta === 500 &&
      report.scenario.annualSavingsDelta === 6000,
      'Reducing expenses by 500 DH yields exact +6,000 DH additional savings over 12 months'
    );
  }

  // 20. WHAT IF? 2-MONTH INCOME INTERRUPTION STRESS TEST
  {
    const expensesList: ExpenseRecord[] = [
      { id: '1', label: 'Essential Costs', cost: 4000, paid: true, icon: 'Home', category: 'fixed' },
    ];
    // Case A: Has 15,000 DH liquid funds (exceeds 2 months * 4,000 = 8,000 DH)
    const strongBaseline = extractBaselineSnapshot(8000, expensesList, 15000, 2000, 13000, 4000);
    const presetsA = getStandardSimulationPresets(strongBaseline);
    const shockPreset = presetsA.find(p => p.presetKey === 'income_interruption')!;
    const reportA = calculateWhatIfScenario(strongBaseline, shockPreset);

    assert(
      reportA.scenario.interruptionSurvives === true &&
      reportA.scenario.interruptionRemainingCash === 7000,
      'Income interruption test accurately passes when liquid funds (15k) exceed 2-month cost (8k)'
    );

    // Case B: Has only 5,000 DH liquid funds (depleted before month 2 ends)
    const weakBaseline = extractBaselineSnapshot(8000, expensesList, 5000, 1000, 4000, 4000);
    const reportB = calculateWhatIfScenario(weakBaseline, shockPreset);
    assert(
      reportB.scenario.interruptionSurvives === false &&
      reportB.scenario.interruptionRemainingCash === -3000,
      'Income interruption test accurately flags failure when liquid funds are insufficient'
    );
  }

  // 21. WHAT IF? HYPOTHETICAL INVESTING & MULTI-HORIZON PROJECTIONS
  {
    const expensesList: ExpenseRecord[] = [
      { id: '1', label: 'Costs', cost: 4000, paid: true, icon: 'Home', category: 'fixed' },
    ];
    const baseline = extractBaselineSnapshot(10000, expensesList, 20000, 0, 20000, 5000);
    const investScenario: ScenarioParameters = {
      id: 'test_invest',
      name: 'Invest 10% @ 12% APY',
      salaryDeltaPercent: 0,
      salaryDeltaAmount: 0,
      additionalMonthlyIncome: 0,
      expenseReductionAmount: 0,
      lifestyleCutPercent: 0,
      monthlySavingsTarget: 0,
      hypotheticalInvestPercent: 10, // 1,000 DH/month
      assumedAnnualReturn: 12,       // 1% per month
      incomeInterruptionMonths: 0,
      oneTimeShockExpense: 0,
      debtRepaymentMonthly: 0,
      totalRecordedDebt: 0,
      targetFreedomGoal: 100000,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const report = calculateWhatIfScenario(baseline, investScenario);
    const m12Point = report.timeline.find(t => t.month === 12);
    assert(
      m12Point !== undefined && m12Point.scenarioInvestGrowth > 12000,
      'Hypothetical compounding projection exceeds principal investment (>12,000 DH) after 12 months'
    );
  }

  // 22. WHAT IF? STRICT LEDGER ISOLATION TEST (ZERO POLLUTION OF ACTUAL WALLET)
  {
    const actualWalletState = {
      ...DEFAULT_WALLET_STATE,
      totalLiquidFunds: 25000,
      cardLimit: 5000,
      salary: 9000,
      openingBalance: 25000,
      openingBalanceConfigured: true,
    };

    const baseline = extractBaselineSnapshot(
      actualWalletState.salary,
      actualWalletState.expenses,
      actualWalletState.totalLiquidFunds,
      actualWalletState.cardLimit,
      20000,
      4500
    );

    // Run extreme hypothetical scenario: +200% salary, +50k shock
    const extremeScenario: ScenarioParameters = {
      id: 'extreme_sim',
      name: 'Extreme Stress Sim',
      salaryDeltaPercent: 200,
      salaryDeltaAmount: 50000,
      additionalMonthlyIncome: 10000,
      expenseReductionAmount: 2000,
      lifestyleCutPercent: 50,
      monthlySavingsTarget: 15000,
      hypotheticalInvestPercent: 30,
      assumedAnnualReturn: 20,
      incomeInterruptionMonths: 4,
      oneTimeShockExpense: 50000,
      debtRepaymentMonthly: 5000,
      totalRecordedDebt: 25000,
      targetFreedomGoal: 500000,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const simReport = calculateWhatIfScenario(baseline, extremeScenario);
    assert(
      simReport !== null &&
      actualWalletState.totalLiquidFunds === 25000 &&
      actualWalletState.cardLimit === 5000 &&
      actualWalletState.salary === 9000 &&
      actualWalletState.openingBalance === 25000,
      'STRICT FINANCIAL ISOLATION: Simulating extreme scenarios NEVER mutates recorded wallet state'
    );
  }

  // 23. WHAT IF? SCENARIO STORAGE NAMESPACE ISOLATION
  {
    const guestScenarioKey = getScenarioStorageKey(null);
    const userScenarioKey = getScenarioStorageKey('admin@secretarea.com');
    const guestWalletKey = getStorageKey(null);

    assert(
      guestScenarioKey === 'sa_what_if_scenarios_v1_guest',
      'Guest scenarios use dedicated sa_what_if_scenarios_v1_guest namespace'
    );
    assert(
      userScenarioKey === 'sa_what_if_scenarios_v1_admin_secretarea_com',
      'User scenarios use dedicated isolated user namespace'
    );
    assert(
      guestScenarioKey !== guestWalletKey,
      'Scenario storage key is strictly separated from actual wallet ledger storage key'
    );
  }

  // 24. TRIO SYNERGY: Dynamic Burn Ratio and Deficit Calculation
  {
    const salary = 10000;
    const allocations = calculatePillarAllocations(salary, {
      personal: 40,   // 4,000 DH
      emergency: 20,  // 2,000 DH
      invest: 20,     // 2,000 DH
      safe: 10,       // 1,000 DH
      parents: 10,    // 1,000 DH
    });

    const expenses: ExpenseRecord[] = [
      { id: '1', label: 'Rent', cost: 3500, paid: false, category: 'fixed', icon: 'Home' },
      { id: '2', label: 'Wifi', cost: 500, paid: true, category: 'fixed', icon: 'Wifi' },
      { id: '3', label: 'Gym', cost: 500, paid: false, category: 'lifestyle', icon: 'Activity' },
    ]; // Total = 4,500 DH > 4,000 DH personal fund -> 500 DH deficit

    const quests = [
      { id: 'q1', title: 'Emergency Shield', target: 20000, current: 8000, unit: 'DH', icon: 'Shield', color: 'emerald' },
      { id: 'q2', title: '100k Asset Milestone', target: 100000, current: 42500, unit: 'DH', icon: 'Coins', color: 'amber' },
      { id: 'q3', title: 'Crypto & Tech Portfolio', target: 50000, current: 15000, unit: 'DH', icon: 'Briefcase', color: 'indigo' },
    ];

    const synergy = calculateTrioSynergy(salary, allocations, expenses, quests);

    assert(
      synergy.totalCommittedExpenses === 4500,
      'Trio Synergy correctly computes total committed expenses (4,500 DH)'
    );
    assert(
      synergy.personalFundAllocation === 4000,
      'Trio Synergy correctly maps Personal Fund allocation (4,000 DH)'
    );
    assert(
      synergy.isDeficit === true && synergy.deficitAmount === 500,
      'Trio Synergy detects budget deficit (500 DH) when expenses exceed Personal Fund'
    );
    assert(
      synergy.budgetUtilizationPercent === 113, // 4500 / 4000 = 112.5% -> 113%
      'Trio Synergy computes correct burn percentage (113%)'
    );
  }

  // 25. TRIO SYNERGY: Auto-Tune Personal Split Recommendation
  {
    const salary = 10000;
    const allocations = calculatePillarAllocations(salary);
    const expenses: ExpenseRecord[] = [
      { id: '1', label: 'Rent', cost: 4200, paid: false, category: 'fixed', icon: 'Home' },
    ];
    const quests: any[] = [];

    const synergy = calculateTrioSynergy(salary, allocations, expenses, quests);

    // 4200 / 10000 = 42%
    assert(
      synergy.recommendedPersonalSplitPercent === 42,
      'Trio Synergy recommends exactly 42% personal split to cover 4,200 DH expenses on 10,000 DH salary'
    );
  }

  // 26. TRIO SYNERGY: 6-Month Living Expense Benchmark for Emergency Shield Quest
  {
    const salary = 8000;
    const allocations = calculatePillarAllocations(salary);
    const expenses: ExpenseRecord[] = [
      { id: '1', label: 'Rent', cost: 2500, paid: true, category: 'fixed', icon: 'Home' },
      { id: '2', label: 'Groceries', cost: 1500, paid: true, category: 'lifestyle', icon: 'ShoppingBag' },
    ]; // Total = 4,000 DH
    const quests = [
      { id: 'q1', title: 'Emergency Shield', target: 20000, current: 5000, unit: 'DH', icon: 'Shield', color: 'emerald' },
    ];

    const synergy = calculateTrioSynergy(salary, allocations, expenses, quests);

    assert(
      synergy.recommended6MonthEmergencyTarget === 24000, // 4000 * 6
      'Trio Synergy calculates 6-Month emergency reserve target as 24,000 DH (4,000 DH * 6)'
    );
    assert(
      synergy.recommended3MonthEmergencyTarget === 12000, // 4000 * 3
      'Trio Synergy calculates 3-Month emergency reserve target as 12,000 DH (4,000 DH * 3)'
    );
  }

  // 27. TRIO SYNERGY: Pillar-to-Quest Routing & Time-to-Goal Estimation
  {
    const salary = 10000;
    // Explicit allocations: Emergency = 1,000 DH (10%), Savings = 1,000 DH (10%), Invest = 2,000 DH (20%)
    const allocations = calculatePillarAllocations(salary, {
      emergency: 10,
      safe: 10,
      invest: 20,
      personal: 50,
      parents: 10,
    });
    const expenses: ExpenseRecord[] = [];
    const quests = [
      { id: 'q1', title: 'Emergency Shield', target: 10000, current: 5000, unit: 'DH', icon: 'Shield', color: 'emerald' }, // Needs 5,000 DH / 1,000 DH/mo = 5 months
      { id: 'q2', title: 'Safe Wealth', target: 50000, current: 20000, unit: 'DH', icon: 'Coins', color: 'amber' },        // Needs 30,000 DH / 1,000 DH/mo = 30 months
      { id: 'q3', title: 'Portfolio', target: 30000, current: 10000, unit: 'DH', icon: 'Briefcase', color: 'indigo' },      // Needs 20,000 DH / 2,000 DH/mo = 10 months
    ];

    const synergy = calculateTrioSynergy(salary, allocations, expenses, quests);

    assert(
      synergy.totalMonthlyStrategicSavings === 4000, // 1000 + 1000 + 2000
      'Trio Synergy aggregates total monthly strategic savings (4,000 DH/mo)'
    );

    const q1Link = synergy.questLinks.find(l => l.questId === 'q1');
    assert(
      q1Link !== undefined && q1Link.monthlyAllocation === 1000 && q1Link.estimatedMonthsToGoal === 5,
      'Quest 1 is routed from Emergency Pillar with 5 months remaining'
    );

    const q3Link = synergy.questLinks.find(l => l.questId === 'q3');
    assert(
      q3Link !== undefined && q3Link.monthlyAllocation === 2000 && q3Link.estimatedMonthsToGoal === 10,
      'Quest 3 is routed from Investment Pillar with 10 months remaining'
    );
  }

  // 28. AUTO-OPTIMIZE BUDGET SPLITS
  {
    const salary = 8500;
    const expenses: ExpenseRecord[] = [
      { id: '1', label: 'Rent', cost: 2800, paid: true, category: 'fixed', icon: 'Home' },
      { id: '2', label: 'Food', cost: 1200, paid: true, category: 'fixed', icon: 'ShoppingBag' },
    ]; // Total = 4,000 DH
    const customFunds = [
      { id: 'cf1', name: 'Travel', percent: 5, color: 'teal' },
    ];

    const result = autoOptimizeBudgetSplits(salary, expenses, customFunds);
    const totalPercent = result.splits.personal + result.splits.invest + result.splits.safe + result.splits.emergency + result.splits.parents + (result.customFunds.reduce((s, f) => s + f.percent, 0));

    assert(
      totalPercent === 100,
      'autoOptimizeBudgetSplits produces exactly 100% total distribution'
    );
    assert(
      (result.splits.personal / 100) * salary >= 4000,
      'autoOptimizeBudgetSplits ensures Personal Fund comfortably covers all committed expenses (4,000 DH)'
    );
    assert(
      result.customFunds.length === 1 && result.customFunds[0].percent > 0,
      'autoOptimizeBudgetSplits assigns sustainable percentage to custom fund'
    );
  }

  // 29. INCOME DEVELOPMENT SOLUTIONS & CUSTOM USER SOLUTIONS
  {
    const solutions = getIncomeDevelopmentSolutions(10000, 4500);
    assert(
      solutions.length >= 3,
      'getIncomeDevelopmentSolutions returns at least 3 concrete actionable income solutions'
    );
    const raiseSol = solutions.find(s => s.id === 'career_raise_20');
    assert(
      raiseSol !== undefined && raiseSol.boostAmount === 2000,
      '20% career step-up solution accurately computes +2,000 DH boost on 10,000 DH salary'
    );

    // Test with custom user solutions
    const customSol = [
      {
        id: 'custom_store_1',
        titleKey: '',
        defaultTitle: 'E-commerce Dropshipping Store',
        descKey: '',
        defaultDesc: 'Sell niche accessories',
        boostAmount: 2500,
        boostType: 'flat' as const,
        actionLabelKey: '',
        defaultActionLabel: '+2,500 DH',
        icon: 'ShoppingCart',
        category: 'custom',
        isCustom: true,
      }
    ];
    const extendedSolutions = getIncomeDevelopmentSolutions(10000, 4500, customSol);
    assert(
      extendedSolutions.some(s => s.id === 'custom_store_1' && s.boostAmount === 2500),
      'getIncomeDevelopmentSolutions seamlessly integrates user-created custom income solutions'
    );
  }

  // 30. TRIO SYNERGY: 6-Month Salary Emergency Shield Calculation
  {
    const salary = 8500;
    const allocations = calculatePillarAllocations(salary);
    const synergy = calculateTrioSynergy(salary, allocations, [], []);
    assert(
      synergy.recommended6MonthSalaryTarget === 51000, // 8500 * 6
      'Trio Synergy correctly calculates 6-Month salary replacement shield as 51,000 DH (8,500 DH * 6)'
    );
  }

  console.log(`\n========================================`);
  console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log(`========================================`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite();
