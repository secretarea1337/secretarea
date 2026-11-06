import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from './Icon';
import { useLanguage, Language } from '../src/contexts/LanguageContext';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { auth } from '../src/firebase';
import {
  SUPPORTED_CURRENCIES,
  formatMoney,
  convertFromMAD,
  convertToMAD,
  calculateMasterBalances,
  calculateSpendDelta,
  calculatePillarAllocations,
  calculateFreeCash,
  calculateTargetPurchase,
  calculateGoalProgress,
  calculateCurrencySwap,
  calculateCategorySpending,
  calculateTrioSynergy,
  TrioSynergyReport,
  QuestSynergyLink,
  getDefaultSplitsForIncome,
  autoOptimizeBudgetSplits,
  getIncomeDevelopmentSolutions,
  IncomeDevelopmentSolution,
  CustomPillarFund,
  loadStoredWalletState,
  saveStoredWalletState,
  WalletState,
  ExpenseRecord,
  QuestRecord,
  FinancialTransaction,
  BudgetSplits
} from '../src/utils/financialCalculations';

// --- MULTI-LANGUAGE DICTIONARY FOR EXECUTIVE PDF WEALTH BLUEPRINT (EN, FR, ES, AR) ---
const PDF_I18N: Record<string, Record<Language, string>> = {
  blueprintTitle: {
    en: 'SECRETAREA | SMART WEALTH & BUDGET BLUEPRINT',
    fr: 'SECRETAREA | PLAN BUDGÉTAIRE ET PATRIMONIAL INTELLIGENT',
    es: 'SECRETAREA | PLAN FINANCIERO Y PATRIMONIAL INTELIGENTE',
    ar: 'سيكريت آريا | المخطط المالي واستراتيجية تنمية الثروة الذكية',
  },
  blueprintSubtitle: {
    en: 'Certified Wealth Protocol • 5-Pillar Income Allocation & Fast-Track Roadmap',
    fr: 'Protocole Financier Certifié • Répartition en 5 Piliers & Plan d\'Accélération',
    es: 'Protocolo Financiero Certificado • Distribución en 5 Pilares y Plan Acelerado',
    ar: 'بروتوكول مالي معتمد • تقسيم الدخل خماسي الأركان وخطة تحقيق الأهداف السريعة',
  },
  docRef: {
    en: 'Document Ref',
    fr: 'Réf. Document',
    es: 'Ref. Documento',
    ar: 'مرجع الوثيقة',
  },
  generatedOn: {
    en: 'Generated',
    fr: 'Généré le',
    es: 'Generado',
    ar: 'تاريخ الإصدار',
  },
  baseCurrency: {
    en: 'Base Currency',
    fr: 'Devise de Référence',
    es: 'Moneda Base',
    ar: 'العملة الأساسية',
  },
  page1Title: {
    en: '1. MASTER BALANCE & LIQUIDITY AUDIT',
    fr: '1. AUDIT DU SOLDE PRINCIPAL ET DES LIQUIDITÉS',
    es: '1. AUDITORÍA DE SALDO PRINCIPAL Y LIQUIDEZ',
    ar: '١. التدقيق المالي للرصيد الإجمالي ومستوى السيولة',
  },
  totalEstimatedBalance: {
    en: 'Total Estimated Balance',
    fr: 'Solde Total Estimé',
    es: 'Saldo Total Estimado',
    ar: 'إجمالي الرصيد التقديري',
  },
  vaultVsCard: {
    en: 'Vault vs Titanium Card',
    fr: 'Coffre Principal vs Carte Titane',
    es: 'Bóveda Principal vs Tarjeta Titanio',
    ar: 'الخزينة النقدية مقابل بطاقة التيتانيوم',
  },
  vaultLabel: {
    en: 'Vault',
    fr: 'Coffre',
    es: 'Bóveda',
    ar: 'الخزينة',
  },
  cardLimitLabel: {
    en: 'Card Limit',
    fr: 'Plafond Carte',
    es: 'Límite Tarjeta',
    ar: 'سقف البطاقة',
  },
  spendingDeltaRunway: {
    en: 'Spend Delta & Runway',
    fr: 'Écart de Dépenses & Autonomie',
    es: 'Diferencia de Gasto y Autonomía',
    ar: 'مقارنة الصرف والأمان المعيشي',
  },
  spendDelta: {
    en: 'Spend Delta',
    fr: 'Écart de Dépenses',
    es: 'Diferencia de Gasto',
    ar: 'مقارنة الصرف',
  },
  runway: {
    en: 'Runway',
    fr: 'Autonomie',
    es: 'Autonomía',
    ar: 'الأمان المالي',
  },
  months: {
    en: 'Months',
    fr: 'Mois',
    es: 'Meses',
    ar: 'أشهر',
  },
  overBenchmark: {
    en: 'Over Benchmark',
    fr: 'Au-dessus de la Référence',
    es: 'Superior al Mes Anterior',
    ar: 'أعلى من الشهر الماضي',
  },
  savedBenchmark: {
    en: 'Saved vs Benchmark',
    fr: 'Économisé vs Référence',
    es: 'Ahorrado vs Mes Anterior',
    ar: 'توفير عن الشهر الماضي',
  },
  allocMatrixTitle: {
    en: '2. 5-PILLAR SMART ALLOCATION MATRIX (MONTHLY INFLOW)',
    fr: '2. MATRICE DE RÉPARTITION EN 5 PILIERS (FLUX MENSUEL)',
    es: '2. MATRIZ DE ASIGNACIÓN EN 5 PILARES (FLUJO MENSUAL)',
    ar: '٢. مصفوفة التوزيع الذكي خماسية الأركان (للدخل الشهري)',
  },
  colPillar: {
    en: 'PILLAR / STRATEGIC FUND',
    fr: 'PILIER / FONDS STRATÉGIQUE',
    es: 'PILAR / FONDO ESTRATÉGICO',
    ar: 'الركن / الصندوق المالي',
  },
  colShare: {
    en: 'SHARE %',
    fr: 'PART %',
    es: 'CUOTA %',
    ar: 'النسبة %',
  },
  colMonthly: {
    en: 'MONTHLY ALLOCATION',
    fr: 'ALLOCATION MENSUELLE',
    es: 'ASIGNACIÓN MENSUAL',
    ar: 'المخصص الشهري',
  },
  colObjective: {
    en: 'PRIMARY OBJECTIVE',
    fr: 'OBJECTIF PRINCIPAL',
    es: 'OBJETIVO PRINCIPAL',
    ar: 'الهدف الاستراتيجي',
  },
  pillar1Name: {
    en: '1. Essentials & Living (Personal Fund)',
    fr: '1. Besoins Vitaux & Charges (Fonds Perso)',
    es: '1. Necesidades Vitales (Fondo Personal)',
    ar: '١. المعيشة والاحتياجات الأساسية (المصروف الشخصي)',
  },
  pillar2Name: {
    en: '2. Wealth & Future Growth (Invest)',
    fr: '2. Investissement & Avenir (Croissance)',
    es: '2. Inversión y Crecimiento Futuro',
    ar: '٢. الاستثمار وبناء الأصول المستقبلية',
  },
  pillar3Name: {
    en: '3. Safe Liquid Savings (Vault)',
    fr: '3. Épargne Sécurisée Liquide (Coffre)',
    es: '3. Ahorro Seguro y Líquido (Bóveda)',
    ar: '٣. التوفير السائل الآمن (خزينة الطوارئ القريبة)',
  },
  pillar4Name: {
    en: '4. Emergency Protection Shield',
    fr: '4. Bouclier de Protection d\'Urgence',
    es: '4. Escudo de Protección de Emergencia',
    ar: '٤. درع الحماية وصندوق الطوارئ لـ 6 أشهر',
  },
  pillar5Name: {
    en: '5. Parents & Family Generosity',
    fr: '5. Solidarité Familiale & Parents',
    es: '5. Solidaridad Familiar y Padres',
    ar: '٥. بر الوالدين ودعم العائلة والصدقات',
  },
  pillar1Obj: {
    en: 'Fixed rent, groceries, utility bills',
    fr: 'Loyer, alimentation, charges courantes',
    es: 'Alquiler, alimentación, servicios',
    ar: 'الإيجار، الغذاء، والفواتير والالتزامات الثابتة',
  },
  pillar2Obj: {
    en: 'Long-term equity & compound assets',
    fr: 'Actifs composés & valorisation de long terme',
    es: 'Activos compuestos y crecimiento a largo plazo',
    ar: 'أصول استثمارية تراكمية ومحافظ طويلة الأجل',
  },
  pillar3Obj: {
    en: 'Capital buffer & planned cash expenses',
    fr: 'Coussin de sécurité & dépenses planifiées',
    es: 'Colchón de capital y gastos previstos',
    ar: 'احتياطي نقدي للمصاريف المخططة والفرص',
  },
  pillar4Obj: {
    en: '6-month income resilience cushion',
    fr: 'Réserve de résilience de 6 mois de charges',
    es: 'Colchón de 6 meses de protección',
    ar: 'صمام أمان يعادل 6 أشهر لحماية الاستقرار المالي',
  },
  pillar5Obj: {
    en: 'Family support, blessings & zakat',
    fr: 'Soutien aux proches, bénédictions & dons',
    es: 'Apoyo familiar, bendición y generosidad',
    ar: 'صلة الرحم، التكافل الأسري، والبركة',
  },
  customFundObj: {
    en: 'Custom user wealth target',
    fr: 'Objectif patrimonial personnalisé',
    es: 'Meta de ahorro personalizada',
    ar: 'هدف مالي مخصص من المستخدم',
  },
  allocMonthlyBase: {
    en: 'Monthly Income Base',
    fr: 'Revenu Mensuel de Base',
    es: 'Ingreso Mensual Base',
    ar: 'إجمالي الدخل الشهري',
  },
  totalAllocatedBalanced: {
    en: 'Total Allocated: 100% Balanced',
    fr: 'Total Alloué : 100% Équilibré',
    es: 'Total Asignado: 100% Equilibrado',
    ar: 'المجموع الموزع: 100% متوازن بدقة',
  },
  livingExpensesTitle: {
    en: '3. LIVING EXPENSES & CASHFLOW RUNWAY AUDIT',
    fr: '3. CHARGES MENSUELLES ET AUTONOMIE DE TRÉSORERIE',
    es: '3. GASTOS MENSUALES Y AUTONOMÍA DE FLUJO DE CAJA',
    ar: '٣. تدقيق المصاريف المعيشية ومؤشر الفائض النقدي',
  },
  totalCommittedCosts: {
    en: 'Total Committed Living Costs',
    fr: 'Total des Charges Engagées',
    es: 'Total de Gastos Comprometidos',
    ar: 'إجمالي تكاليف المعيشة الملزمة',
  },
  ofSalaryCommitted: {
    en: 'of salary committed',
    fr: 'du salaire engagé',
    es: 'del salario comprometido',
    ar: 'من إجمالي الراتب',
  },
  coveredByPersonal: {
    en: 'Covered by Personal Fund',
    fr: 'Couvert par le Fonds Perso',
    es: 'Cubierto por Fondo Personal',
    ar: 'مغطى من صندوق المصاريف',
  },
  unpaidDueThisPeriod: {
    en: 'Unpaid Due This Period',
    fr: 'Restant Dû Cette Période',
    es: 'Pendiente Este Período',
    ar: 'المتبقي المستحق هذه الفترة',
  },
  freeCashBuffer: {
    en: 'Free Cash Buffer',
    fr: 'Marge Libre de Trésorerie',
    es: 'Margen de Efectivo Libre',
    ar: 'الفائض المالي المتبقي',
  },
  surplusCushion: {
    en: 'Surplus Cushion (+)',
    fr: 'Marge Positive (+)',
    es: 'Superávit Saludable (+)',
    ar: 'فائض أمان إيجابي (+)',
  },
  deficitAlert: {
    en: 'Deficit Alert (-)',
    fr: 'Alerte Déficit (-)',
    es: 'Alerta de Déficit (-)',
    ar: 'تنبيه عجز مالي (-)',
  },
  livingRunwayCosts: {
    en: 'Months of fixed costs',
    fr: 'Mois de charges fixes couverts',
    es: 'Meses de gastos fijos cubiertos',
    ar: 'أشهر مصاريف ثابتة مغطاة',
  },
  colCommitmentItem: {
    en: 'COMMITMENT ITEM',
    fr: 'POSTE DE DÉPENSE',
    es: 'CONCEPTO DE GASTO',
    ar: 'بند المصروف / الالتزام',
  },
  colCategory: {
    en: 'CATEGORY',
    fr: 'CATÉGORIE',
    es: 'CATEGORÍA',
    ar: 'التصنيف',
  },
  colStatus: {
    en: 'STATUS',
    fr: 'STATUT',
    es: 'ESTADO',
    ar: 'الحالة',
  },
  colMonthlyCost: {
    en: 'MONTHLY COST',
    fr: 'COÛT MENSUEL',
    es: 'COSTE MENSUAL',
    ar: 'المبلغ الشهري',
  },
  fixedNeeds: {
    en: 'Fixed Needs',
    fr: 'Besoins Fixes',
    es: 'Gastos Fijos',
    ar: 'احتياجات أساسية',
  },
  lifestyleTools: {
    en: 'Lifestyle & Tools',
    fr: 'Style de Vie & Outils',
    es: 'Estilo de Vida y Herramientas',
    ar: 'نمط المعيشة والأدوات',
  },
  paidStatus: {
    en: 'PAID',
    fr: 'PAYÉ',
    es: 'PAGADO',
    ar: 'تم السداد',
  },
  dueStatus: {
    en: 'DUE',
    fr: 'DÛ',
    es: 'PENDIENTE',
    ar: 'مستحق',
  },
  page1Footer: {
    en: 'SecretArea Wealth Management System • Page 1 of 2 • Strictly Confidential',
    fr: 'Système de Gestion Patrimoniale SecretArea • Page 1 sur 2 • Strictement Confidentiel',
    es: 'Sistema de Gestión Patrimonial SecretArea • Página 1 de 2 • Estrictamente Confidencial',
    ar: 'نظام سيكريت آريا لإدارة الثروات • صفحة ١ من ٢ • وثيقة سرية خاصة',
  },
  page2Header: {
    en: 'SECRETAREA WEALTH BLUEPRINT • STRATEGIC MILESTONES & ACCELERATION',
    fr: 'SECRETAREA • OBJECTIFS STRATÉGIQUES ET ACCÉLÉRATION',
    es: 'SECRETAREA • METAS ESTRATÉGICAS Y ACELERACIÓN',
    ar: 'سيكريت آريا | الأهداف الاستراتيجية والتسريع المالي',
  },
  shieldSectionTitle: {
    en: '4. 6-MONTH EMERGENCY PROTECTION SHIELD',
    fr: '4. BOUCLIER DE PROTECTION D\'URGENCE 6 MOIS',
    es: '4. ESCUDO DE PROTECCIÓN DE EMERGENCIA DE 6 MESES',
    ar: '٤. صندوق الأمان والحماية للطوارئ (٦ أشهر)',
  },
  protectionTarget: {
    en: 'Protection Target',
    fr: 'Objectif de Protection',
    es: 'Meta de Protección',
    ar: 'المبلغ المستهدف للحماية',
  },
  sixMonthsBaselineReserve: {
    en: '6 Months Baseline Reserve',
    fr: 'Réserve de 6 Mois',
    es: 'Reserva de 6 Meses',
    ar: 'احتياطي 6 أشهر كاملة',
  },
  currentAccumulatedReserve: {
    en: 'Current Accumulated Reserve',
    fr: 'Réserve Actuelle Cumulée',
    es: 'Reserva Acumulada Actual',
    ar: 'الرصيد التراكمي المحقق',
  },
  achieved: {
    en: 'Achieved',
    fr: 'Atteint',
    es: 'Logrado',
    ar: 'مكتمل',
  },
  monthlyAutoFeedInflow: {
    en: 'Monthly Auto-Feed Inflow',
    fr: 'Apport Mensuel Automatique',
    es: 'Aporte Mensual Automático',
    ar: 'التدفق الشهري التلقائي',
  },
  fromEmergencyPillar: {
    en: 'from Emergency Pillar',
    fr: 'du Pilier d\'Urgence',
    es: 'del Pilar de Emergencia',
    ar: 'من ركن الطوارئ',
  },
  estimatedCompletionPace: {
    en: 'Estimated Completion Pace',
    fr: 'Délai d\'Achèvement Estimé',
    es: 'Plazo Estimado de Cumplimiento',
    ar: 'المدة المقدرة للإنجاز',
  },
  monthsToInvulnerability: {
    en: 'Months to total financial invulnerability at current inflow',
    fr: 'Mois pour atteindre l\'invulnérabilité financière totale',
    es: 'Meses para lograr invulnerabilidad financiera total',
    ar: 'أشهر للوصول إلى الأمان المالي الكامل بالوتيرة الحالية',
  },
  incomePortfolioTitle: {
    en: '5. STRATEGIC INCOME DEVELOPMENT PORTFOLIO',
    fr: '5. PORTEFEUILLE DE DÉVELOPPEMENT DU REVENU',
    es: '5. CARTERA DE DESARROLLO DE INGRESOS',
    ar: '٥. استراتيجيات تنمية وتطوير الدخل الشهري',
  },
  colStrategyLever: {
    en: 'STRATEGY / INCOME LEVER',
    fr: 'STRATÉGIE / LEVIER DE REVENU',
    es: 'ESTRATEGIA / PALANCA DE INGRESOS',
    ar: 'الاستراتيجية / مصدر الدخل',
  },
  colMonthlyBoost: {
    en: 'MONTHLY BOOST',
    fr: 'AUGMENTATION MENSUELLE',
    es: 'AUMENTO MENSUAL',
    ar: 'الزيادة الشهرية',
  },
  targetRoadmapTitle: {
    en: '6. TARGET PURCHASE & FAST-TRACK ACQUISITION ROADMAP',
    fr: '6. PLAN D\'ACQUISITION ET ACCÉLÉRATEUR DE PROJET',
    es: '6. PLAN DE COMPRA Y ACELERADOR DE METAS',
    ar: '٦. خطة شراء الهدف الكبير والمسار فائق السرعة',
  },
  targetAsset: {
    en: 'Target Asset',
    fr: 'Objectif d\'Acquisition',
    es: 'Objetivo de Compra',
    ar: 'الهدف المراد شراؤه',
  },
  targetAssetPrice: {
    en: 'Target Asset Price',
    fr: 'Prix de l\'Objectif',
    es: 'Precio del Objetivo',
    ar: 'سعر الهدف',
  },
  dedicatedMonthlySavings: {
    en: 'Dedicated Monthly Savings Allocation',
    fr: 'Épargne Mensuelle Dédiée',
    es: 'Ahorro Mensual Dedicado',
    ar: 'المخصص الشهري للتوفير',
  },
  standardTimeline: {
    en: 'Standard Timeline',
    fr: 'Délai Standard',
    es: 'Plazo Estándar',
    ar: 'المدة الطبيعية',
  },
  yearsToDebtFree: {
    en: 'Years to debt-free purchase',
    fr: 'Ans sans aucun endettement',
    es: 'Años sin endeudamiento',
    ar: 'سنة للشراء بدون ديون',
  },
  aiFastTrackTitle: {
    en: 'AI FAST-TRACK ACCELERATION',
    fr: 'ACCÉLÉRATEUR INTELLIGENT RAPIDE',
    es: 'ACELERADOR INTELIGENTE RÁPIDO',
    ar: 'التسريع الذكي فائق السرعة',
  },
  boostedSavings: {
    en: 'Boosted Savings',
    fr: 'Épargne Accélérée',
    es: 'Ahorro Acelerado',
    ar: 'التوفير المكثف المقترح',
  },
  targetAchievedIn: {
    en: 'Target Achieved in',
    fr: 'Objectif Atteint en',
    es: 'Meta Lograda en',
    ar: 'يتحقق الهدف خلال',
  },
  timeSavedEarlier: {
    en: 'Time Saved',
    fr: 'Temps Gagné',
    es: 'Tiempo Ahorrado',
    ar: 'وفر زمني',
  },
  monthsEarlier: {
    en: 'Months Earlier!',
    fr: 'Mois d\'Avance !',
    es: '¡Meses Antes!',
    ar: 'أشهر أسرع!',
  },
  wealthQuote1: {
    en: '"Automated micro-deposits build bulletproof reserves over time.',
    fr: '"Les micro-dépôts automatisés bâtissent des réserves invulnérables.',
    es: '"Los microdepósitos automatizados construyen reservas invulnerables.',
    ar: '"الادخار التراكمي المنظم يبني صروح الأمان المالي بمرور الوقت.',
  },
  wealthQuote2: {
    en: 'Discipline is the bridge between financial goals and lasting freedom."',
    fr: 'La discipline est le pont entre vos objectifs et la liberté financière."',
    es: 'La disciplina es el puente entre las metas y la libertad financiera."',
    ar: 'والانضباط هو الجسر المتين نحو الحرية المالية الحقيقية."',
  },
  verifiedStatus: {
    en: 'STATUS: VERIFIED AUTOMATED BLUEPRINT • SECRETAREA ENCRYPTED PROTOCOL',
    fr: 'STATUT : PLAN AUTOMATISÉ VÉRIFIÉ • PROTOCOLE CHIFFRÉ SECRETAREA',
    es: 'ESTADO: PLAN AUTOMATIZADO VERIFICADO • PROTOCOLO CIFRADO SECRETAREA',
    ar: 'الحالة: وثيقة مالية معتمدة آلياً • بروتوكول سيكريت آريا الآمن',
  },
  page2Footer: {
    en: 'SecretArea Wealth Management System • Page 2 of 2 • Strictly Confidential',
    fr: 'Système de Gestion Patrimoniale SecretArea • Page 2 sur 2 • Strictement Confidentiel',
    es: 'Sistema de Gestión Patrimonial SecretArea • Página 2 de 2 • Estrictamente Confidencial',
    ar: 'نظام سيكريت آريا لإدارة الثروات • صفحة ٢ من ٢ • وثيقة سرية خاصة',
  },
  generatingPdf: {
    en: 'Generating PDF...',
    fr: 'Génération du PDF...',
    es: 'Generando PDF...',
    ar: 'جارٍ إنشاء ملف PDF...',
  },
  pdfReadySuccess: {
    en: 'PDF Blueprint generated successfully!',
    fr: 'Plan PDF généré avec succès !',
    es: '¡Plan PDF generado con éxito!',
    ar: 'تم إنشاء وحفظ المخطط المالي بنجاح!',
  },
  chooseLanguage: {
    en: 'Download PDF In',
    fr: 'Télécharger le PDF en',
    es: 'Descargar PDF en',
    ar: 'تحميل ملف PDF بلغة',
  },
  connectedAudit: {
    en: 'Real-Time Synergy Audit',
    fr: 'Audit de Synergie en Temps Réel',
    es: 'Auditoría de Sinergia en Tiempo Real',
    ar: 'تدقيق التوافق المالي المباشر',
  },
  spendDeltaLabel: {
    en: 'Monthly Delta',
    fr: 'Écart Mensuel',
    es: 'Diferencia Mensual',
    ar: 'فارق الصرف الشهري',
  },
  monthsLabel: {
    en: 'Months',
    fr: 'Mois',
    es: 'Meses',
    ar: 'أشهر',
  },
  actionableGrowthStrategies: {
    en: 'Actionable Boost Levers',
    fr: 'Leviers d\'Accélération Concrets',
    es: 'Palancas de Aceleración Prácticas',
    ar: 'استراتيجيات عملية لزيادة الدخل',
  },
  zeroDebtProtocol: {
    en: 'Zero-Debt Acquisition Protocol',
    fr: 'Protocole d\'Acquisition Sans Dette',
    es: 'Protocolo de Adquisición Sin Deuda',
    ar: 'بروتوكول الشراء الذاتي بدون ديون',
  },
  currencyMAD: {
    en: 'DH',
    fr: 'DH',
    es: 'DH',
    ar: 'درهم',
  },
  page1Of2: {
    en: 'Page 1 of 2',
    fr: 'Page 1 sur 2',
    es: 'Página 1 de 2',
    ar: 'صفحة ١ من ٢',
  },
  page2Of2: {
    en: 'Page 2 of 2',
    fr: 'Page 2 sur 2',
    es: 'Página 2 de 2',
    ar: 'صفحة ٢ من ٢',
  },
  confidentialDoc: {
    en: 'SecretArea Wealth Management System • Strictly Confidential',
    fr: 'Système de Gestion Patrimoniale SecretArea • Strictement Confidentiel',
    es: 'Sistema de Gestión Patrimonial SecretArea • Estrictamente Confidencial',
    ar: 'نظام سيكريت آريا لإدارة الثروات • وثيقة سرية خاصة للمستخدم',
  },
  verifiedSeal: {
    en: 'CERTIFIED WEALTH DOSSIER • SECRETAREA ENCRYPTED PROTOCOL',
    fr: 'DOSSIER PATRIMONIAL CERTIFIÉ • PROTOCOLE CHIFFRÉ SECRETAREA',
    es: 'EXPEDIENTE FINANCIERO CERTIFICADO • PROTOCOLO CIFRADO SECRETAREA',
    ar: 'وثيقة مالية معتمدة وموثقة • بروتوكول سيكريت آريا الآمن والمشفر',
  },
  shieldStatusActive: {
    en: 'Active & Building Reserve',
    fr: 'Actif & En Cours de Constitution',
    es: 'Activo y en Construcción',
    ar: 'نشط وجارٍ بناء الاحتياطي',
  },
};

// --- COMPREHENSIVE TRANSLATIONS DICTIONARY FOR E-WALLET (EN, FR, ES, AR) ---
const WALLET_I18N: Record<string, Record<Language, string>> = {
  // Navigation & Header
  walletTitle: {
    en: 'Smart E-Wallet & Wealth Hub',
    fr: 'Portefeuille Électronique Intelligent',
    es: 'Billetera Digital Inteligente',
    ar: 'المحفظة الإلكترونية الذكية ومركز الثروة'
  },
  walletSubtitle: {
    en: 'Track multi-currency assets, link your virtual card limit, compare monthly spend, and automate your financial freedom.',
    fr: 'Gérez vos actifs multi-devises, associez votre carte virtuelle, comparez vos dépenses et automatisez votre liberté financière.',
    es: 'Rastrea activos multimoneda, vincula tu tarjeta virtual, compara gastos mensuales y automatiza tu libertad financiera.',
    ar: 'تتبع أصولك بمختلف العملات، واربط رصيد بطاقتك الافتراضية، وقارن مصاريف الشهر الماضي، وخطط للحرية المالية.'
  },
  activeVaultBadge: {
    en: 'Active Vault 2.0',
    fr: 'Coffre Actif 2.0',
    es: 'Bóveda Activa 2.0',
    ar: 'الخزنة النشطة 2.0'
  },
  interactiveGuideBtn: {
    en: 'Interactive Guide',
    fr: 'Guide Interactif',
    es: 'Guía Interactiva',
    ar: 'دليل الاستخدام'
  },
  guideStepsBadge: {
    en: 'Graphic Steps',
    fr: 'Étapes Visuelles',
    es: 'Pasos Gráficos',
    ar: 'خطوات مصورة'
  },
  visualPointersBtn: {
    en: 'Visual Pointers',
    fr: 'Pointeurs Graphiques',
    es: 'Punteros Visuales',
    ar: 'الأسهم التوضيحية'
  },
  downloadPlan: {
    en: 'Save PDF Plan',
    fr: 'Exporter Plan PDF',
    es: 'Descargar Plan PDF',
    ar: 'حفظ الخطة PDF'
  },
  onState: { en: 'ON', fr: 'ACTIF', es: 'ON', ar: 'مفعل' },
  offState: { en: 'OFF', fr: 'INACTIF', es: 'OFF', ar: 'معطل' },

  // Balances & Currency
  totalBalance: {
    en: 'Total Estimated Balance',
    fr: 'Solde Total Estimé',
    es: 'Saldo Total Estimado',
    ar: 'إجمالي الرصيد التقديري'
  },
  vaultBalanceLabel: {
    en: 'Core Liquid Vault',
    fr: 'Coffre Liquide Principal',
    es: 'Bóveda Líquida Principal',
    ar: 'الخزينة النقدية الأساسية'
  },
  cardAllocationLabel: {
    en: 'Virtual Card Allocation',
    fr: 'Allocation Carte Virtuelle',
    es: 'Asignación Tarjeta Virtual',
    ar: 'تخصيص البطاقة الافتراضية'
  },
  monthlyGrowth: {
    en: '+14.8% vs last month',
    fr: '+14.8% vs mois dernier',
    es: '+14.8% vs mes anterior',
    ar: '+14.8% نمو عن الشهر السابق'
  },
  hideBalance: { en: 'Hide Balance', fr: 'Masquer Solde', es: 'Ocultar Saldo', ar: 'إخفاء الرصيد' },
  showBalance: { en: 'Show Balance', fr: 'Afficher Solde', es: 'Mostrar Saldo', ar: 'إظهار الرصيد' },
  equivalentLabel: { en: 'Equivalent', fr: 'Équivalent', es: 'Equivalente', ar: 'ما يعادله' },

  // Last Month Spend & Comparison
  lastMonthSpendTitle: {
    en: 'Last Month Spend',
    fr: 'Dépenses du Mois Dernier',
    es: 'Gasto del Mes Anterior',
    ar: 'مصاريف الشهر الماضي'
  },
  currentCardBudget: {
    en: 'Current Card Budget',
    fr: 'Budget Carte Actuel',
    es: 'Presupuesto de Tarjeta',
    ar: 'ميزانية البطاقة الحالية'
  },
  spendComparisonSaved: {
    en: 'Saved vs Last Month',
    fr: 'Économisé vs Mois Dernier',
    es: 'Ahorrado vs Mes Anterior',
    ar: 'توفير مقارنة بالشهر الماضي'
  },
  spendComparisonOver: {
    en: 'Higher vs Last Month',
    fr: 'Plus élevé vs Mois Dernier',
    es: 'Mayor vs Mes Anterior',
    ar: 'زيادة مقارنة بالشهر الماضي'
  },
  editSpend: { en: 'Adjust Benchmark', fr: 'Ajuster Référence', es: 'Ajustar Referencia', ar: 'تعديل المعيار' },
  benchmarkNotice: {
    en: 'Comparison based on previous audited billing period',
    fr: 'Comparaison basée sur la période de facturation précédente',
    es: 'Comparación basada en el período de facturación anterior',
    ar: 'المقارنة مبنية على إجمالي فواتير الفترة السابقة'
  },
  editBalanceTooltip: { en: 'Click to edit total balance', fr: 'Cliquer pour modifier le solde', es: 'Clic para editar saldo', ar: 'اضغط لتعديل الرصيد الإجمالي' },
  saveBalance: { en: 'Save', fr: 'Enregistrer', es: 'Guardar', ar: 'حفظ' },
  adjustBalanceDirectly: { en: 'Direct Balance Input & Modifiers', fr: 'Saisie Directe & Ajustements', es: 'Entrada Directa de Saldo', ar: 'إدخال وتعديل الرصيد المباشر' },
  quickAdd: { en: 'Quick Add to Balance', fr: 'Ajout Rapide au Solde', es: 'Añadir Rápido al Saldo', ar: 'إضافة سريعة للرصيد' },
  connectedToAllocator: { en: 'Live Connected to Smart Allocator', fr: 'Connecté en Direct au Répartiteur', es: 'Conectado en Vivo al Distribuidor', ar: 'متصل مباشرة بمخصص الميزانية' },
  syncBalanceToSalary: { en: 'Sync Allocator to Balance', fr: 'Synchroniser avec le Solde', es: 'Sincronizar con el Saldo', ar: 'مزامنة الميزانية مع الرصيد' },
  financialRunway: { en: 'Financial Runway', fr: 'Autonomie Financière', es: 'Autonomía Financiera', ar: 'الاستقلالية المالية والوقاية' },
  runwayMonthsText: { en: 'months of living costs covered', fr: 'mois de dépenses couverts', es: 'meses de gastos cubiertos', ar: 'أشهر مصاريف مغطاة بالكامل' },
  monthlyBurnRate: { en: 'Monthly Burn Rate', fr: 'Taux de Consommation', es: 'Tasa de Consumo Mensual', ar: 'معدل الصرف الشهري' },
  netMonthlySurplus: { en: 'Net Monthly Savings', fr: 'Épargne Mensuelle Nette', es: 'Ahorro Mensual Neto', ar: 'صافي التوفير الشهري' },
  syncWithExpenses: { en: 'Match Actual Expenses', fr: 'Aligner sur Dépenses Réelles', es: 'Igualar a Gastos Reales', ar: 'مطابقة المصاريف الحقيقية' },
  alignPersonalFund: { en: 'Align Personal Fund to Last Month Spend', fr: 'Ajuster Besoins sur Dépenses Dernier Mois', es: 'Ajustar Fondo Personal al Gasto Anterior', ar: 'موازنة المصاريف مع صرف الشهر الماضي' },
  titaniumVipCard: { en: 'SecretArea Titanium VIP', fr: 'SecretArea Titane VIP', es: 'SecretArea Titanio VIP', ar: 'سيكريت آريا تيتانيوم VIP' },
  tapToCopy: { en: 'Tap number to copy', fr: 'Cliquer pour copier', es: 'Tocar para copiar', ar: 'اضغط للنسخ' },
  numberCopied: { en: 'Card Number Copied!', fr: 'Numéro de Carte Copié !', es: '¡Número Copiado!', ar: 'تم نسخ رقم البطاقة!' },
  autoSyncAllocatorToggle: { en: 'Auto-sync changes to Allocator', fr: 'Synchro auto vers le Répartiteur', es: 'Sincronizar auto con Distribuidor', ar: 'مزامنة تلقائية مع المخصص' },
  connectedTotalBalanceBadge: { en: 'Connected Total Liquid Balance', fr: 'Solde Total Liquide Connecté', es: 'Saldo Líquido Total Conectado', ar: 'الرصيد الإجمالي السائل المتصل' },

  // Virtual Card
  virtualCardTitle: {
    en: 'SecretArea Titanium Virtual Card',
    fr: 'Carte Virtuelle SecretArea Titane',
    es: 'Tarjeta Virtual SecretArea Titanio',
    ar: 'بطاقة سيكريت آريا التيتانيوم الافتراضية'
  },
  cardHolder: { en: 'CARDHOLDER', fr: 'TITULAIRE', es: 'TITULAR', ar: 'اسم الحامل' },
  expires: { en: 'EXPIRES', fr: 'EXPIRE', es: 'VENCE', ar: 'صالحة حتى' },
  revealCard: { en: 'Reveal Details', fr: 'Afficher Détails', es: 'Mostrar Detalles', ar: 'كشف الأرقام' },
  hideCard: { en: 'Mask Details', fr: 'Masquer Détails', es: 'Ocultar Detalles', ar: 'حجب الأرقام' },
  freezeCard: { en: 'Freeze Card', fr: 'Bloquer Carte', es: 'Congelar Tarjeta', ar: 'تجميد البطاقة' },
  unfreezeCard: { en: 'Unfreeze Card', fr: 'Débloquer Carte', es: 'Descongelar Tarjeta', ar: 'إلغاء التجميد' },
  statusActive: { en: 'ACTIVE', fr: 'ACTIVE', es: 'ACTIVA', ar: 'نشطة' },
  statusFrozen: { en: 'FROZEN', fr: 'VERROUILLÉE', es: 'CONGELADA', ar: 'مجمدة' },
  cardFrozenNotice: {
    en: 'Card is temporarily locked for security',
    fr: 'Carte temporairement bloquée par sécurité',
    es: 'Tarjeta bloqueada temporalmente por seguridad',
    ar: 'البطاقة مقفلة ومؤمنة مؤقتاً'
  },
  cardActiveNotice: {
    en: 'Connected to live balance. Spending adjusts your estimated total in real-time.',
    fr: 'Connectée au solde en direct. Vos dépenses ajustent le total estimé en temps réel.',
    es: 'Conectada al saldo en vivo. Ajusta tu total estimado en tiempo real.',
    ar: 'متصلة بالرصيد المباشر. تغيير سقف البطاقة يحدث إجمالي الرصيد فورياً.'
  },
  cardLimitSliderLabel: {
    en: 'Card Spending Allocation / Limit',
    fr: 'Plafond & Allocation Carte',
    es: 'Asignación / Límite de Tarjeta',
    ar: 'تخصيص وسقف صرف البطاقة'
  },
  quickLimitPresets: {
    en: 'Quick Presets',
    fr: 'Préréglages Rapides',
    es: 'Ajustes Rápidos',
    ar: 'قيم سريعة'
  },

  // Quick Action Buttons
  sendMoney: { en: 'Send Money', fr: 'Envoyer', es: 'Enviar Dinero', ar: 'إرسال أموال' },
  receiveMoney: { en: 'Receive (QR)', fr: 'Recevoir (QR)', es: 'Recibir (QR)', ar: 'استلام (QR)' },
  addFunds: { en: 'Add Funds', fr: 'Recharger', es: 'Recargar', ar: 'شحن رصيد' },
  swapCurrencies: { en: 'Swap & Convert', fr: 'Convertir', es: 'Intercambiar', ar: 'تحويل العملات' },

  // Smart Allocator Section
  allocatorTitle: {
    en: 'Smart Income & Budget Allocator',
    fr: 'Répartiteur Budgétaire Intelligent',
    es: 'Distribuidor Inteligente de Ingresos',
    ar: 'المخصص الذكي للدخل والميزانية'
  },
  allocatorDesc: {
    en: 'Dynamically balances your income between essentials, investments, safety cushion, and family support.',
    fr: 'Équilibre dynamiquement vos revenus entre besoins vitaux, investissements, épargne de sécurité et famille.',
    es: 'Equilibra dinámicamente tus ingresos entre lo esencial, inversiones, fondo de emergencia y apoyo familiar.',
    ar: 'يوزع دخلك تلقائياً وبدقة مدروسة بين المصاريف الأساسية، الاستثمار، صمام الأمان، ودعم العائلة.'
  },
  monthlySalaryInput: {
    en: 'Monthly Income / Revenue',
    fr: 'Revenu Mensuel',
    es: 'Ingreso Mensual',
    ar: 'الدخل أو الراتب الشهري'
  },
  presets: { en: 'Income Presets', fr: 'Profils Prédéfinis', es: 'Perfiles Predefinidos', ar: 'نماذج دخل جاهزة' },
  pillarDistributionTitle: {
    en: 'Automated 5-Pillar Distribution',
    fr: 'Répartition Automatisée en 5 Piliers',
    es: 'Distribución Automatizada en 5 Pilares',
    ar: 'التوزيع الذكي خماسي الأركان'
  },
  allocated100: { en: '100% Allocated', fr: '100% Alloué', es: '100% Asignado', ar: '١٠٠٪ موزع بالكامل' },

  // Fund cards
  personalFund: { en: 'Personal & Needs', fr: 'Besoins Personnels', es: 'Básicos y Necesidades', ar: 'المصاريف الأساسية والشخصية' },
  investFund: { en: 'Future Investments', fr: 'Investissements Futurs', es: 'Inversiones Futuras', ar: 'الاستثمارات وبناء الثروة' },
  savingsFund: { en: 'Safe Liquid Savings', fr: 'Épargne Liquide', es: 'Ahorro Seguro', ar: 'المدخرات النقدية الآمنة' },
  emergencyFund: { en: 'Emergency Shield', fr: 'Bouclier d\'Urgence', es: 'Escudo de Emergencia', ar: 'صندوق الطوارئ الوقائي' },
  parentsFund: { en: 'Family & Generosity', fr: 'Famille & Solidarité', es: 'Familia y Donaciones', ar: 'دعم العائلة والصدقة' },

  // Expenses Section
  expensesTitle: {
    en: 'Expenses & Monthly Subscriptions',
    fr: 'Dépenses & Abonnements Mensuels',
    es: 'Gastos y Suscripciones Mensuales',
    ar: 'المصاريف والاشتراكات الشهرية'
  },
  fixedCosts: { en: 'Fixed Needs', fr: 'Frais Fixes', es: 'Costos Fijos', ar: 'التزامات أساسية' },
  lifestyleCosts: { en: 'Lifestyle & Tools', fr: 'Style de Vie & Outils', es: 'Estilo de Vida y Herramientas', ar: 'أدوات وأسلوب حياة' },
  addExpenseBtn: { en: '+ Add Expense', fr: '+ Ajouter Dépense', es: '+ Añadir Gasto', ar: '+ إضافة مصروف' },
  newExpensePlaceholder: {
    en: 'Expense or service name (e.g. Studio Rent, Fiber WiFi, Gym)',
    fr: 'Nom de la dépense (ex: Loyer Studio, Fibre WiFi, Salle de sport)',
    es: 'Nombre del gasto (ej. Alquiler, Fibra WiFi, Gimnasio)',
    ar: 'اسم المصروف أو الخدمة (مثال: إيجار الشقة، انترنت الألياف، الجيم)'
  },
  costPlaceholder: { en: 'Amount (DH)', fr: 'Montant (DH)', es: 'Monto (DH)', ar: 'المبلغ (درهم)' },
  totalCommitted: { en: 'Total Committed', fr: 'Total Engagé', es: 'Total Comprometido', ar: 'إجمالي الالتزامات' },
  paidStatus: { en: 'Paid this Month', fr: 'Payé ce mois', es: 'Pagado este mes', ar: 'تم السداد' },
  dueStatus: { en: 'Due / Unpaid', fr: 'À Payer', es: 'Pendiente', ar: 'مستحق للدفع' },
  freeCashLeft: { en: 'Free Cash Buffer', fr: 'Trésorerie Disponible', es: 'Efectivo Disponible', ar: 'الفائض النقدي المتبقي' },
  filterAll: { en: 'All', fr: 'Tous', es: 'Todos', ar: 'الكل' },
  filterDue: { en: 'Due / Unpaid', fr: 'À Payer', es: 'Pendientes', ar: 'المستحقة' },
  filterPaid: { en: 'Paid', fr: 'Payés', es: 'Pagados', ar: 'المدفوعة' },
  recurringMonthly: { en: 'Monthly Recurring', fr: 'Récurrent Mensuel', es: 'Recurrente Mensual', ar: 'التزام شهري دوري' },
  healthyBurnRatio: { en: 'Healthy Burn', fr: 'Consommation Saine', es: 'Consumo Saludable', ar: 'معدل استهلاك آمن' },
  highBurnRatio: { en: 'High Burn', fr: 'Consommation Élevée', es: 'Consumo Alto', ar: 'معدل استهلاك مرتفع' },
  noExpensesMatch: { en: 'No expenses found in this filter', fr: 'Aucune dépense trouvée dans ce filtre', es: 'No hay gastos en este filtro', ar: 'لا توجد مصاريف مطابقة في هذا القسم' },
  syncedWithAllocator: { en: 'Synced with Smart Allocator', fr: 'Synchronisé avec le Répartiteur', es: 'Sincronizado con Distribuidor', ar: 'مرتبط بالمخصص الذكي' },
  runwayLabel: { en: 'Runway', fr: 'Autonomie', es: 'Autonomía', ar: 'فترة الأمان' },
  runwayMonthsUnit: { en: 'months of living costs covered', fr: 'mois de charges fixes couvertes', es: 'meses de gastos fijos cubiertos', ar: 'أشهر مصاريف معيشية مغطاة' },
  autoTuneCoverDeficit: { en: 'Auto-Tune Personal Fund to Cover Deficit', fr: 'Ajuster automatiquement pour combler le déficit', es: 'Autoajustar Fondo para cubrir déficit', ar: 'موازنة فورية لتغطية العجز بالكامل' },
  addNewExpenseSectionTitle: { en: 'Add Monthly Expense / Subscription', fr: 'Ajouter une Dépense / Abonnement', es: 'Agregar Gasto / Suscripción', ar: 'إضافة مصروف أو اشتراك شهري جديد' },
  coverageFull: { en: '100% Covered by Personal Fund', fr: '100% Couvert par le Fonds Personnel', es: '100% Cubierto por Fondo Personal', ar: 'مغطى 100% من مخصص المصاريف' },
  coveragePartial: { en: 'Covers only', fr: 'Couvre seulement', es: 'Cubre solo el', ar: 'يغطي فقط' },

  // Financial Quests
  questsTitle: {
    en: 'Financial Quests & Milestones',
    fr: 'Quêtes Financières & Objectifs',
    es: 'Misiones Financieras y Metas',
    ar: 'المهام المالية والمحطات الكبرى'
  },
  depositToQuest: { en: '+ Contribute', fr: '+ Contribuer', es: '+ Aportar', ar: '+ إيداع' },
  achievedLabel: { en: 'Achieved', fr: 'Atteint', es: 'Logrado', ar: 'مكتمل' },
  questsQuote: {
    en: 'Automated micro-deposits build bulletproof reserves over time.',
    fr: 'Les micro-dépôts automatisés construisent des réserves solides avec le temps.',
    es: 'Los microdepósitos automatizados construyen reservas sólidas con el tiempo.',
    ar: 'الإيداعات الدورية المنضبطة تصنع أماناً مالياً صامداً للمستقبل.'
  },

  // Fast-Track Buying Calculator
  calculatorTitle: {
    en: 'Target Purchase & Fast-Track Planner',
    fr: 'Planificateur d\'Achat Accéléré',
    es: 'Calculadora de Compras y Aceleración',
    ar: 'حاسبة الشراء المستهدف والتسريع الذكي'
  },
  calculatorSubtitle: {
    en: 'Calculate precisely when you can afford major acquisitions without high-interest debt.',
    fr: 'Calculez précisément quand réaliser de gros achats sans recourir au crédit.',
    es: 'Calcula con precisión cuándo puedes permitirte grandes compras sin deudas.',
    ar: 'احسب بدقة متى تستطيع شراء أهدافك الكبرى نقداً بدون ديون مرهقة.'
  },
  targetObjectiveLabel: {
    en: 'Target Objective / Acquisition Item',
    fr: 'Objectif / Article d\'Acquisition',
    es: 'Objetivo / Artículo de Compra',
    ar: 'الهدف المطلوب شراؤه'
  },
  calcTargetPlaceholder: {
    en: 'e.g., RTX 5090 Rig, M-Series Studio, Car, Down payment',
    fr: 'ex: PC RTX 5090, MacBook Pro, Voiture, Apport',
    es: 'ej. PC RTX 5090, MacBook Pro, Vehículo, Entrada',
    ar: 'مثلاً: جهاز كمبيوتر فائق، سيارة، دفعة أولى'
  },
  targetPrice: { en: 'Target Asset Price', fr: 'Prix de l\'Objectif', es: 'Precio del Objetivo', ar: 'سعر الهدف المطلوب' },
  monthlySavingRate: {
    en: 'Dedicated Monthly Savings',
    fr: 'Capacité d\'Épargne Mensuelle',
    es: 'Ahorro Mensual Dedicado',
    ar: 'الادخار الشهري المخصص للهدف'
  },
  estimatedDuration: { en: 'Estimated Timeline', fr: 'Délai Estimé', es: 'Tiempo Estimado', ar: 'المدة الزمنية المتوقعة' },
  monthsLabel: { en: 'Months', fr: 'Mois', es: 'Meses', ar: 'أشهر' },
  yearsLabel: { en: 'Years', fr: 'Ans', es: 'Años', ar: 'سنوات' },
  fastTrackTipTitle: { en: 'AI Fast-Track Boost', fr: 'Accélérateur Intelligent', es: 'Acelerador Inteligente', ar: 'تسريع الإنجاز الذكي' },
  fastTrackMsg: {
    en: 'Save {amount} DH/month to achieve this goal in just {months} months!',
    fr: 'Épargnez {amount} DH/mois pour atteindre cet objectif en seulement {months} mois !',
    es: '¡Ahorra {amount} DH/mes para alcanzar esta meta en solo {months} meses!',
    ar: 'ادخر {amount} درهم شهرياً لتحقيق هذا الهدف في غضون {months} أشهر فقط!'
  },

  // Guide Dialog & Steps
  guideTourTitle: {
    en: 'Interactive Graphic Step-by-Step Guide',
    fr: 'Guide Graphique Interactif Étape par Étape',
    es: 'Guía Gráfica Interactiva Paso a Paso',
    ar: 'الدليل المصور التفاعلي خطوة بخطوة'
  },
  guideTourSubtitle: {
    en: 'Explore every capability of your Smart E-Wallet with direct visual marker pointers.',
    fr: 'Découvrez chaque fonctionnalité avec des flèches graphiques directes.',
    es: 'Descubre cada función de tu billetera con flechas curvas directas.',
    ar: 'تعرف على كل مزايا محفظتك الذكية مع أسهم توجيهية مرسومة ومباشرة.'
  },
  stepOf: { en: 'Step', fr: 'Étape', es: 'Paso', ar: 'الخطوة' },
  nextStep: { en: 'Next Step', fr: 'Étape Suivante', es: 'Siguiente', ar: 'الخطوة التالية' },
  prevStep: { en: 'Previous', fr: 'Précédent', es: 'Anterior', ar: 'السابق' },
  finishGuide: { en: 'Got It! Start Using', fr: 'J\'ai Compris !', es: '¡Entendido! Comenzar', ar: 'فهمت! ابدأ الآن' },
  blueprintView: {
    en: 'Visual Blueprint (All Pointers)',
    fr: 'Schéma Global (Tous les pointeurs)',
    es: 'Esquema Global (Todos los punteros)',
    ar: 'المخطط الشامل (جميع الأسهم)'
  },
  stepByStepView: {
    en: 'Guided Step-by-Step Tour',
    fr: 'Visite Guidée Étape par Étape',
    es: 'Recorrido Paso a Paso',
    ar: 'جولة موجهة خطوة بخطوة'
  },
  keepArrowsBtn: {
    en: 'Show Pointers on Page',
    fr: 'Garder les Flèches à l\'Écran',
    es: 'Mostrar Punteros en Pantalla',
    ar: 'إبقاء الأسهم على الشاشة'
  },
  enablePointersDashboard: {
    en: 'Enable Visual Pointers on Dashboard',
    fr: 'Activer les Pointeurs sur le Tableau',
    es: 'Activar Punteros en el Panel',
    ar: 'تفعيل الأسهم التوضيحية على الصفحة'
  },

  // Smart Section Pointers (Dynamic In-Section Intelligence)
  pointerBadge: {
    en: 'SMART POINTER',
    fr: 'POINTEUR INTELLIGENT',
    es: 'PUNTERO INTELIGENTE',
    ar: 'مؤشر ذكي'
  },
  pointer1Title: {
    en: 'Master Liquidity Radar & Balance Sync',
    fr: 'Radar de Liquidités & Synchronisation du Solde',
    es: 'Radar de Liquidez y Sincronización de Saldo',
    ar: 'رادار السيولة الإجمالية ومزامنة الرصيد'
  },
  pointer1Desc: {
    en: 'Real-time overview of your combined capital across liquid vault and virtual card. Editing the balance here dynamically calibrates your Smart Allocator and cashflow runway.',
    fr: 'Vue en temps réel de votre capital entre coffre et carte virtuelle. Toute modification ici se répercute directement sur le Répartiteur et votre autonomie.',
    es: 'Visión en tiempo real de tu capital entre bóveda y tarjeta virtual. Cualquier cambio se sincroniza con el Distribuidor y tu autonomía.',
    ar: 'نظرة شاملة ولحظية لأموالك بين الخزينة النقدية والبطاقة الافتراضية. أي تعديل هنا يزامن ميزانيتك تلقائياً ويوضح مؤشر الأمان المالي.'
  },
  pointer2Title: {
    en: 'Titanium Card Budget & Spending Ceiling',
    fr: 'Plafond Carte Titane & Maîtrise des Dépenses',
    es: 'Límite Tarjeta Titanio y Control de Gastos',
    ar: 'ميزانية بطاقة التيتانيوم وسقف الصرف'
  },
  pointer2Desc: {
    en: 'Isolates daily discretionary spending from long-term reserves. Compares with last month\'s spend to prevent lifestyle creep.',
    fr: 'Isole vos dépenses courantes de vos réserves de long terme. Compare avec le mois dernier pour éviter toute dérive budgétaire.',
    es: 'Aísla los gastos diarios de tus reservas a largo plazo. Compara con el mes anterior para mantener el control.',
    ar: 'عزل مصاريفك اليومية عن مدخراتك طويلة الأجل. يقارن الصرف مع الشهر الماضي لحمايتك من الاستهلاك الزائد.'
  },
  pointer3Title: {
    en: 'Instant Financial Operations Hub',
    fr: 'Opérations Instantanées & Centre de Liquidité',
    es: 'Operaciones Instantáneas y Centro de Liquidez',
    ar: 'العمليات الفورية ومركز إدارة السيولة'
  },
  pointer3Desc: {
    en: 'Log immediate expenses, record income deposits, top up funds via bank/card/crypto, or perform live currency conversions with zero friction.',
    fr: 'Enregistrez dépenses, revenus, rechargez par virement/carte/crypto ou convertissez vos devises au taux réel en un clic.',
    es: 'Registra gastos, ingresos, recarga por banco/tarjeta/crypto o realiza cambios de divisa al instante.',
    ar: 'سجل المصاريف والإيرادات فورياً، واشحن رصيدك عبر البنك أو البطاقة أو العملات الرقمية، أو حوّل بين العملات مباشرة.'
  },
  pointer4Title: {
    en: '5-Pillar Wealth Engine & Custom Funds',
    fr: 'Moteur de Richesse en 5 Piliers & Fonds Personnalisés',
    es: 'Motor de Riqueza en 5 Pilares y Fondos Propios',
    ar: 'المحرك المالي خماسي الأركان والصناديق المخصصة'
  },
  pointer4Desc: {
    en: 'Disciplined wealth allocation dividing income into essentials, investments, safe buffer, emergency shield, and custom wealth targets.',
    fr: 'Répartition rigoureuse des revenus : besoins vitaux, investissements, épargne sécurisée, bouclier d\'urgence et fonds sur-mesure.',
    es: 'Distribución rigurosa: necesidades vitales, inversión, ahorro seguro, fondo de emergencia y metas personalizadas.',
    ar: 'توزيع مالي منضبط يقسم دخلك بين الأساسيات، الاستثمارات، التوفير الآمن، صندوق الطوارئ، وأهدافك المخصصة.'
  },
  pointer5Title: {
    en: 'Committed Living Costs & Cashflow Runway',
    fr: 'Charges Mensuelles Engagées & Autonomie Financière',
    es: 'Gastos Comprometidos y Autonomía Financiera',
    ar: 'تكاليف المعيشة الملزمة ومؤشر الأمان المالي'
  },
  pointer5Desc: {
    en: 'Monitors fixed bills and subscriptions against your Personal Fund. Keeps your free cash buffer positive and protects your survival runway.',
    fr: 'Suit factures et abonnements face à votre Fonds Personnel. Maintient un coussin positif et garantit votre indépendance.',
    es: 'Monitorea facturas y suscripciones frente a tu Fondo Personal. Mantiene un colchón positivo y protege tu autonomía.',
    ar: 'يتابع الفواتير والاشتراكات الشهرية مقابل صندوق المصاريف لضمان بقاء الفائض المالي إيجابياً وتأمين استقرارك المعيشي.'
  },
  pointer6Title: {
    en: '6-Month Emergency Shield & Protection Quests',
    fr: 'Bouclier d\'Urgence 6 Mois & Quêtes Financières',
    es: 'Escudo de Emergencia 6 Meses y Metas de Protección',
    ar: 'صندوق أمان 6 أشهر والأهداف الوقائية'
  },
  pointer6Desc: {
    en: 'Auto-fed monthly by your Emergency Pillar to build 6 months of living costs or salary reserves, shielding your investments from shocks.',
    fr: 'Alimenté mensuellement par votre Pilier d\'Urgence pour bâtir 6 mois de charges ou de salaire et immuniser vos placements.',
    es: 'Alimentado mensualmente por tu Pilar de Emergencia para acumular 6 meses de gastos o salario y blindar tu patrimonio.',
    ar: 'يتم تمويله تلقائياً كل شهر من ركن الطوارئ لتكوين احتياطي 6 أشهر كاملة من المعيشة أو الراتب، مما يحمي استثماراتك من أي طارئ.'
  },
  pointer7Title: {
    en: 'Income Development & Revenue Multipliers',
    fr: 'Développement du Revenu & Stratégies Multiplicatrices',
    es: 'Desarrollo de Ingresos y Multiplicadores de Ganancias',
    ar: 'حلول تطوير الدخل ومضاعفة الأرباح'
  },
  pointer7Desc: {
    en: 'Accelerate your entire financial roadmap by upgrading your salary in the Smart Allocator with promotions, digital freelancing, or specialized skills.',
    fr: 'Accélérez votre plan en augmentant votre revenu dans le Répartiteur grâce aux promotions, freelancing ou compétences expertes.',
    es: 'Acelera tu plan aumentando tus ingresos en el Distribuidor con ascensos, freelancing digital o consultoría especializada.',
    ar: 'سرّع وتيرة أهدافك برفع دخلك في المخصص الذكي عبر الترقيات الوظيفية، العمل الحر الرقمي، أو الاستشارات التخصصية.'
  },
  pointer8Title: {
    en: 'Target Acquisition Roadmap & Executive PDF Blueprint',
    fr: 'Plan d\'Acquisition & Plan Exécutif PDF',
    es: 'Plan de Compra y Exportación Ejecutiva PDF',
    ar: 'خطة الشراء الكبرى والتقرير التنفيذي PDF'
  },
  pointer8Desc: {
    en: 'Model high-value acquisitions without high-interest debt. Use AI Fast-Track to save months, and download an executive 2-page wealth blueprint.',
    fr: 'Planifiez vos gros achats sans dette coûteuse. Utilisez l\'accélérateur pour gagner des mois et exportez votre plan de 2 pages en PDF.',
    es: 'Planifica compras importantes sin endeudamiento. Usa el acelerador para ganar meses y descarga tu plan ejecutivo de 2 páginas en PDF.',
    ar: 'خطط للمشتريات الكبرى بدون قروض أو فوائد، واختصر الشهور بالتسريع الذكي، واحفظ وثيقة الثروة التنفيذية المكونة من صفحتين بصيغة PDF.'
  },
  pointer1: {
    en: 'Master Balance & Dynamic Calculation',
    fr: 'Solde Principal & Calcul Dynamique',
    es: 'Saldo Principal y Cálculo Dinámico',
    ar: 'الرصيد الإجمالي والحساب المباشر'
  },
  pointer2: {
    en: 'Titanium Card & Spending Allocation',
    fr: 'Carte Titane & Allocation des Dépenses',
    es: 'Tarjeta Titanio y Asignación de Gastos',
    ar: 'بطاقة التيتانيوم وتخصيص الصرف'
  },
  pointer3: {
    en: 'Instant Actions: Send, QR & Swap',
    fr: 'Actions Rapides : Envoi, QR & Change',
    es: 'Acciones Rápidas: Enviar, QR y Cambio',
    ar: 'العمليات السريعة: إرسال، QR وتحويل'
  },
  pointer4: {
    en: '5-Pillar Budget Allocator',
    fr: 'Répartiteur Budgétaire en 5 Piliers',
    es: 'Distribuidor de Presupuesto en 5 Pilares',
    ar: 'المخصص الذكي خماسي الأركان'
  },
  pointer5: {
    en: 'Live Bills & Subscription Checklist',
    fr: 'Suivi des Factures & Abonnements',
    es: 'Control de Facturas y Suscripciones',
    ar: 'متابعة الفواتير والاشتراكات الدورية'
  },
  pointer6: {
    en: 'Target Purchase Fast-Track Plan',
    fr: 'Plan d\'Acquisition Rapide & PDF',
    es: 'Plan de Compra Acelerada y PDF',
    ar: 'حاسبة الهدف الكبير وحفظ الخطة'
  },

  // Steps Explanations
  step1Title: {
    en: '1. Master Balance & Multi-Currency',
    fr: '1. Solde Principal & Multi-Devises',
    es: '1. Saldo Principal y Multimoneda',
    ar: '١. الرصيد الإجمالي والعملات المتعددة'
  },
  step1Desc: {
    en: 'Your total estimated net worth dynamically updates whenever you adjust your Titanium Virtual Card budget. Switch seamlessly between MAD, USD, EUR, GBP, AED, and BTC.',
    fr: 'Votre solde total s\'ajuste dynamiquement lorsque vous modifiez le budget de votre carte virtuelle Titane. Basculez facilement entre MAD, USD, EUR, GBP, AED et BTC.',
    es: 'Tu saldo total se actualiza dinámicamente cuando ajustas el presupuesto de tu tarjeta virtual Titanio. Cambia entre MAD, USD, EUR, GBP, AED y BTC.',
    ar: 'يتم احتساب إجمالي رصيدك التقديري تلقائياً فور تعديل مخصصات بطاقة التيتانيوم. بدّل بين الدرهم، الدولار، اليورو، والعملات الرقمية بنقرة واحدة.'
  },
  step2Title: {
    en: '2. Titanium Card & Spend Benchmark',
    fr: '2. Carte Virtuelle Titane & Dépenses',
    es: '2. Tarjeta Titanio y Gasto Comparado',
    ar: '٢. بطاقة التيتانيوم ومقارنة المصاريف'
  },
  step2Desc: {
    en: 'Adjust card allocation to immediately project overall funds. Compare your live budget with Last Month Spend to maintain positive cash savings.',
    fr: 'Ajustez l\'allocation de la carte pour projeter votre solde global. Comparez votre budget actuel avec le mois dernier pour préserver votre épargne.',
    es: 'Ajusta la asignación de la tarjeta para proyectar tus fondos. Compara tu presupuesto con el mes anterior para mantener ahorros saludables.',
    ar: 'حدد سقف صرف البطاقة لتراه ينعكس مباشرة في إجمالي الرصيد. قارن ميزانيتك مع مصاريف الشهر الماضي لضمان وفر مالي دائم.'
  },
  step3Title: {
    en: '3. Instant Transaction Hub',
    fr: '3. Centre d\'Actions Rapides',
    es: '3. Centro de Transacciones Rápidas',
    ar: '٣. مركز العمليات والتحويل الفوري'
  },
  step3Desc: {
    en: 'Send money, display your custom QR code for receiving funds, top up via bank/card/crypto, or perform live currency swaps with zero latency.',
    fr: 'Envoyez de l\'argent, affichez votre QR code de réception, rechargez par virement/carte/crypto ou convertissez vos devises instantanément.',
    es: 'Envía dinero, muestra tu código QR para cobrar, recarga por banco/tarjeta/crypto o haz cambios de divisa al instante.',
    ar: 'حوّل الأموال، واعرض كود QR لاستلام الدفعات، واشحن رصيدك عبر البنك أو البطاقة أو الكريبتو بسهولة.'
  },
  step4Title: {
    en: '4. Smart Income & Budget Allocator',
    fr: '4. Répartition Budgétaire Automatisée',
    es: '4. Asignación Inteligente de Ingresos',
    ar: '٤. المخصص الذكي للدخل والميزانية'
  },
  step4Desc: {
    en: 'Input your monthly revenue to instantly deploy mathematical distributions across personal essentials, wealth compounding, safe buffer, and family support.',
    fr: 'Saisissez vos revenus pour déployer une répartition rigoureuse entre dépenses vitales, investissements, épargne et solidarité familiale.',
    es: 'Ingresa tus ingresos para distribuir fondos automáticamente entre necesidades básicas, inversiones, seguridad y familia.',
    ar: 'أدخل راتبك الشهري لتوزيع المال بنسب دقيقة بين المعيشة، الاستثمار، صمام الأمان، ودعم الوالدين.'
  },
  step5Title: {
    en: '5. Bills & Subscription Tracker',
    fr: '5. Suivi des Dépenses & Abonnements',
    es: '5. Rastreador de Gastos y Suscripciones',
    ar: '٥. متتبع الفواتير والاشتراكات الدورية'
  },
  step5Desc: {
    en: 'Mark rent, utilities, and digital subscriptions as paid to monitor your live cash cushion. Add custom recurring expenses with one click.',
    fr: 'Cochez loyer, factures et abonnements payés pour visualiser votre marge de sécurité. Ajoutez vos dépenses en un clic.',
    es: 'Marca alquiler, servicios y suscripciones como pagados para ver tu margen de efectivo libre en tiempo real.',
    ar: 'حدد ما دفعته من إيجار واشتراكات وشاهد الفائض النقدي المتبقي لحظة بلحظة مع إمكانية إضافة أي مصروف إضافي.'
  },
  step6Title: {
    en: '6. Target Purchase & Export PDF',
    fr: '6. Plan d\'Achat Accéléré & Export PDF',
    es: '6. Plan de Compra Acelerada y PDF',
    ar: '٦. حاسبة الأهداف الكبرى وحفظ الخطة'
  },
  step6Desc: {
    en: 'Model high-value acquisitions (workstation, setup, vehicle, property) and export your complete roadmap as a clean PDF blueprint.',
    fr: 'Simulez vos gros investissements (workstation, setup, véhicule, immobilier) et téléchargez votre plan complet au format PDF.',
    es: 'Simula grandes adquisiciones (estación de trabajo, vehículo, inmueble) y descarga tu plan financiero completo en PDF.',
    ar: 'خطط لشراء التجهيزات الكبرى (كمبيوتر قوي، سيارة، إلخ) بدون فوائد، واحفظ ملف التخطيط بصيغة PDF بنقرة واحدة.'
  },

  // Modals text
  transferSubtitle: { en: 'Transfer funds instantly to any recipient', fr: 'Transférez des fonds instantanément', es: 'Transfiere fondos al instante', ar: 'حوّل أموالك فورياً لأي مستلم' },
  recipientLabel: { en: 'Recipient Handle or IBAN', fr: 'Destinataire ou IBAN', es: 'Destinatario o IBAN', ar: 'معرف المستلم أو رقم الحساب البنكي' },
  amountLabel: { en: 'Amount (DH)', fr: 'Montant (DH)', es: 'Monto (DH)', ar: 'المبلغ (بالدرهم)' },
  availableBalance: { en: 'Available', fr: 'Disponible', es: 'Disponible', ar: 'الرصيد المتاح' },
  confirmTransfer: { en: 'Confirm Transfer', fr: 'Confirmer Transfert', es: 'Confirmar Transferencia', ar: 'تأكيد التحويل' },
  transferDone: { en: 'Done', fr: 'Terminé', es: 'Listo', ar: 'تم الانتهاء' },
  scanQrSubtitle: { en: 'Scan QR code or share your unique payment address', fr: 'Scannez le code QR ou partagez votre identifiant', es: 'Escanea el código QR o comparte tu dirección', ar: 'امسح الباركود أو انسخ معرف الاستلام الخاص بك' },
  copyBtn: { en: 'Copy', fr: 'Copier', es: 'Copiar', ar: 'نسخ' },
  copiedBtn: { en: 'Copied!', fr: 'Copié !', es: '¡Copiado!', ar: 'تم النسخ!' },
  addFundsSubtitle: { en: 'Instantly deposit via Bank, Card, or Crypto', fr: 'Rechargez instantanément par Banque, Carte ou Crypto', es: 'Deposita al instante por Banco, Tarjeta o Cripto', ar: 'شحن فوري عبر البنك، البطاقة، أو العملات الرقمية' },
  methodBank: { en: 'Bank Wire / CIH / Attijariwafa', fr: 'Virement Bancaire (CIH / Attijariwafa)', es: 'Transferencia Bancaria (CIH / Attijariwafa)', ar: 'تحويل بنكي / CIH / التجاري وفا' },
  methodCard: { en: 'Credit / Debit Card (Visa, Mastercard)', fr: 'Carte Bancaire (Visa, Mastercard)', es: 'Tarjeta de Crédito/Débito (Visa, Mastercard)', ar: 'بطاقة بنكية (فيزا، ماستركارد)' },
  methodCrypto: { en: 'Crypto (USDT / BTC / ETH)', fr: 'Crypto (USDT / BTC / ETH)', es: 'Cripto (USDT / BTC / ETH)', ar: 'عملات رقمية (USDT / BTC / ETH)' },
  depositBtnText: { en: 'Deposit +2,500 DH', fr: 'Déposer +2 500 DH', es: 'Depositar +2.500 DH', ar: 'إيداع +2,500 درهم' },
  swapSubtitle: { en: 'Live conversion between supported assets', fr: 'Conversion en direct entre devises supportées', es: 'Conversión en vivo entre monedas compatibles', ar: 'تحويل مباشر وسلس بين العملات المدعومة' },
  fromLabel: { en: 'From', fr: 'De', es: 'Desde', ar: 'من' },
  toEstimatedLabel: { en: 'To (Estimated)', fr: 'Vers (Estimé)', es: 'Hacia (Estimado)', ar: 'إلى (تقديري)' },
  executeSwap: { en: 'Execute Swap', fr: 'Exécuter Conversion', es: 'Ejecutar Cambio', ar: 'تنفيذ التحويل' },

  // What If? Simulator Toolbar & Banner
  whatIfSimulatorBtn: { en: 'What If? Simulator', fr: 'Simulateur What If ?', es: 'Simulador What If ?', ar: 'محاكي السيناريوهات' },
  whatIfBackBtn: { en: 'Back to Live Wallet', fr: 'Retour au Portefeuille', es: 'Volver a la Billetera', ar: 'العودة للمحفظة' },
  whatIfSandboxBadge: { en: 'Sandbox', fr: 'Bac à sable', es: 'Simulación', ar: 'بيئة تجريبية' },
  whatIfBannerBadge: { en: 'Simulated • Non-Destructive Sandbox', fr: 'Simulé • Environnement Non Destructif', es: 'Simulado • Entorno No Destructivo', ar: 'محاكاة ذكية • بيئة معزولة بالكامل' },
  whatIfBannerTitle: { en: 'What If? Financial Decision Simulator', fr: 'Simulateur de Décisions Financières « What If ? »', es: 'Simulador de Decisiones Financieras « What If ? »', ar: 'محاكي القرارات والسيناريوهات المالية (ماذا لو؟)' },
  whatIfBannerDesc: {
    en: 'Test strategic financial decisions before making them. Simulate salary promotions (+20%), lifestyle optimizations (-500 DH), hypothetical investing (10% @ 8%), or stress-test income disruption without altering your recorded ledger balance.',
    fr: 'Testez des décisions financières stratégiques avant de les prendre. Simulez promotions (+20%), optimisations de dépenses (-500 DH), investissements (10% à 8%), ou interruptions de revenus sans altérer votre solde réel.',
    es: 'Prueba decisiones financieras estratégicas antes de tomarlas. Simula aumentos salariales (+20%), optimización de gastos (-500 DH), inversiones hipotéticas (10% al 8%) o caídas de ingresos sin alterar tu saldo registrado.',
    ar: 'اختبر قراراتك المالية الكبرى مسبقاً قبل الإقدام عليها. جرب زيادة الدخل (+20%)، تقليص المصاريف (-500 درهم)، استثمار جزء من الراتب، أو اختبار صدمات انقطاع الدخل بأمان تام دون التأثير على حساباتك الفعلية.'
  },
  whatIfLaunchBtn: { en: 'Launch Simulator', fr: 'Lancer le Simulateur', es: 'Iniciar Simulador', ar: 'تشغيل المحاكي' },
  markPaidTooltip: { en: 'Mark as Paid', fr: 'Marquer comme Payé', es: 'Marcar como Pagado', ar: 'تحديد كمدفوع' },
  markUnpaidTooltip: { en: 'Mark as Due (Unpaid)', fr: 'Marquer comme Non Payé', es: 'Marcar como Pendiente', ar: 'تحديد كمستحق (غير مدفوع)' },
  editExpenseTooltip: { en: 'Edit Expense', fr: 'Modifier la Dépense', es: 'Editar Gasto', ar: 'تعديل المصروف' },
  deleteExpenseTooltip: { en: 'Delete Expense', fr: 'Supprimer la Dépense', es: 'Eliminar Gasto', ar: 'حذف المصروف' },

  // Trio Synergy Engine (Allocator + Expenses + Quests)
  trioSynergyBadge: { en: 'Interconnected Financial Trio Engine', fr: 'Moteur Financier Tripartite Connecté', es: 'Motor Financiero Tripartito Conectado', ar: 'المحرك المالي الثلاثي المترابط لحظياً' },
  trioPipelineTitle: { en: 'Allocator -> Expenses -> Milestones Synergy', fr: 'Synergie : Répartiteur -> Dépenses -> Objectifs', es: 'Sinergia: Distribuidor -> Gastos -> Metas', ar: 'التكامل الحي: المخصص الذكي -> المصاريف -> أهداف الثروة' },
  trioPipelineDesc: {
    en: 'Real-time financial synergy: Income is divided into 5 funds, Personal Fund backs committed expenses, and remaining strategic funds power your Quests.',
    fr: 'Synergie en temps réel : Le revenu alimente 5 fonds, les dépenses sont adossées aux Besoins, et l\'épargne stratégique propulse vos Quêtes.',
    es: 'Sinergia en tiempo real: Los ingresos alimentan 5 fondos, los gastos se cubren con Necesidades y el ahorro estratégico impulsa tus Metas.',
    ar: 'ترابط مالي مباشر: يتم تقسيم دخلك إلى 5 أركان، يتكفل صندوق المصاريف بتغطية الفواتير، بينما تتدفق الأركان الادخارية والاستثمارية تلقائياً نحو أهدافك.'
  },
  trioPersonalCoverage: { en: 'Covered by Personal Fund', fr: 'Couvert par le Fonds Personnel', es: 'Cubierto por Fondo Personal', ar: 'مغطى من صندوق المصاريف الشخصية' },
  trioBurn: { en: 'Burn Ratio', fr: 'Consommation', es: 'Consumo', ar: 'نسبة الاستهلاك' },
  trioDeficitAlert: { en: 'Expenses exceed Personal Fund by', fr: 'Dépenses supérieures au fonds de', es: 'Gastos superan al fondo por', ar: 'المصاريف تفوق الميزانية بفارق' },
  trioSurplusCushion: { en: 'Free Cash Buffer', fr: 'Marge Libre Disponible', es: 'Colchón Disponible', ar: 'الفائض المالي المتبقي' },
  trioAutoTuneBtn: { en: 'Auto-Tune Fund to Cover Expenses', fr: 'Ajuster automatiquement pour couvrir les dépenses', es: 'Autoajustar fondo para cubrir gastos', ar: 'موازنة تلقائية لتغطية المصاريف بالكامل' },
  trioSweepSurplusBtn: { en: 'Sweep Buffer to Quests', fr: 'Verser l\'excédent dans les Quêtes', es: 'Traspasar excedente a Metas', ar: 'تحويل الفائض مباشرة إلى الأهداف' },
  trioDepositMonthlyPillar: { en: 'Deposit Monthly Pillar', fr: 'Déposer la Part Mensuelle', es: 'Depositar Cuota Mensual', ar: 'إيداع الحصة الشهرية' },
  trioDepositAllPillars: { en: 'Deposit All Monthly Allocations to Quests', fr: 'Verser Toutes les Allocations dans les Quêtes', es: 'Depositar Todas las Asignaciones en Metas', ar: 'إيداع كافة الحصص الشهرية في جميع الأهداف' },
  trioSync6MoBenchmark: { en: 'Sync with 6-Month Living Expenses', fr: 'Synchroniser avec 6 mois de dépenses', es: 'Sincronizar con 6 meses de gastos', ar: 'مطابقة الهدف مع 6 أشهر من المصاريف الحقيقية' },
  trioAutoFedBy: { en: 'Auto-fed monthly by', fr: 'Alimenté mensuellement par', es: 'Financiado mensualmente por', ar: 'تمويل شهري تلقائي من' },
  trioEstTimeline: { en: 'Est. Timeline', fr: 'Délai Estimé', es: 'Tiempo Estimado', ar: 'المدة المقدرة' },
  trioMonthsRemaining: { en: 'months at current pace', fr: 'mois au rythme actuel', es: 'meses al ritmo actual', ar: 'أشهر بالوتيرة الحالية' },
  trioMonthlyInflow: { en: 'Monthly Strategic Savings Inflow', fr: 'Apport Mensuel Stratégique aux Quêtes', es: 'Aporte Mensual Estratégico a Metas', ar: 'التدفق الشهري التراكمي نحو الأهداف' },

  // Custom Funds & Auto-Optimize % in Allocator
  addCustomFundBtn: { en: 'Add Fund', fr: 'Ajouter un Fonds', es: 'Agregar Fondo', ar: 'إضافة صندوق' },
  autoOptimizeSplitsBtn: { en: 'Auto-Optimize Best %', fr: 'Calculer Meilleure Répartition %', es: 'Calcular Mejor %', ar: 'احتساب أفضل توزيع للنسب %' },
  newFundModalTitle: { en: 'Add Custom Budget Fund', fr: 'Ajouter un Fonds Budgétaire', es: 'Agregar Fondo Personalizado', ar: 'إضافة صندوق مالي مخصص' },
  fundNamePlaceholder: { en: 'Fund name (e.g. Travel, Tech & Skills, Car, Side Business)', fr: 'Nom du fonds (ex: Voyage, Formation, Véhicule)', es: 'Nombre del fondo (ej. Viajes, Educación, Vehículo)', ar: 'اسم الصندوق (مثل: السفر، التعليم، سيارة، مشروع)' },
  fundShareLabel: { en: 'Target Percentage Share (%)', fr: 'Pourcentage Cible (%)', es: 'Porcentaje (%)', ar: 'النسبة المئوية المستهدفة (%)' },
  autoOptimalApplied: { en: 'Smart optimal percentage applied!', fr: 'Répartition optimale appliquée !', es: '¡Porcentaje óptimo aplicado!', ar: 'تم احتساب وتطبيق أفضل نسبة مئوية تلقائياً!' },
  removeFund: { en: 'Remove', fr: 'Supprimer', es: 'Eliminar', ar: 'حذف' },
  shareLabel: { en: 'Share', fr: 'Part', es: 'Cuota', ar: 'الحصة' },
  balancedStatus: { en: '100% Balanced', fr: '100% Équilibré', es: '100% Equilibrado', ar: 'موزع ومتوازن 100%' },
  stepDownLabel: { en: '-500 DH', fr: '-500 DH', es: '-500 DH', ar: '-500 درهم' },
  stepUpLabel: { en: '+500 DH', fr: '+500 DH', es: '+500 DH', ar: '+500 درهم' },

  // Expenses & Salary Connection
  monthlySalaryInflow: { en: 'Monthly Income / Salary', fr: 'Revenu / Salaire Mensuel', es: 'Ingreso / Salario Mensual', ar: 'الدخل / الراتب الشهري' },
  fromSmartAllocator: { en: 'From Smart Allocator', fr: 'Du Répartiteur Intelligent', es: 'من المخصص الذكي', ar: 'من المخصص الذكي' },
  committedOfSalary: { en: 'of total salary committed to living costs', fr: 'du salaire engagé dans les charges', es: 'del salario comprometido en gastos', ar: 'من إجمالي الراتب مخصص لتكاليف المعيشة' },
  projectedFreeCashBuffer: { en: 'Projected Free Cash Buffer', fr: 'Marge Libre Projetée', es: 'Margen Libre Proyectado', ar: 'الفائض المالي المتوقع' },
  bufferSurplusLabel: { en: 'Surplus Cushion (+)', fr: 'Marge Positive (+)', es: 'Superávit (+)', ar: 'فائض إيجابي (+)' },
  bufferDeficitLabel: { en: 'Deficit Alert (-)', fr: 'Alerte Déficit (-)', es: 'Alerta Déficit (-)', ar: 'تنبيه عجز (-)' },

  // Solutions for Developing Current Income in Allocator
  incomeSolutionsTitle: { en: 'Solutions for Developing Current Income', fr: 'Solutions de Développement du Revenu Actuel', es: 'Soluciones para Desarrollar Ingresos Actuales', ar: 'حلول ذكية لتطوير وتنمية الدخل الحالي' },
  incomeSolutionsSubtitle: {
    en: 'Actionable strategies to develop and boost monthly salary in your Allocator to expand funds and achieve milestones faster.',
    fr: 'Stratégies concrètes pour augmenter votre revenu mensuel dans le Répartiteur et accélérer vos objectifs financiers.',
    es: 'Estrategias prácticas para aumentar tus ingresos en el Distribuidor y acelerar tus metas financieras.',
    ar: 'استراتيجيات عملية لتنمية ورفع الراتب الشهري في المخصص الذكي لتوسيع ميزانيتك وتحقيق أهدافك بسرعة أكبر.'
  },
  applyIncomeBoost: { en: 'Apply to Allocator', fr: 'Appliquer au Répartiteur', es: 'Aplicar al Distribuidor', ar: 'تطبيق على المخصص' },
  customIncomeTargetLabel: { en: 'Custom Target Income Boost', fr: 'Objectif d\'Augmentation Personnalisé', es: 'Aumento de Ingresos Personalizado', ar: 'تحديد زيادة مخصصة في الدخل' },
  upgradeAllocatorSalary: { en: 'Upgrade Salary', fr: 'Augmenter le Revenu', es: 'Aumentar Ingreso', ar: 'ترقية الدخل' },
  incomeBoostedSuccess: { en: 'Monthly income upgraded in Smart Allocator!', fr: 'Revenu mensuel augmenté dans le Répartiteur !', es: '¡Ingreso mensual actualizado en el Distribuidor!', ar: 'تم تحديث وزيادة الدخل الشهري في المخصص الذكي بنجاح!' },

  // 6-Month Emergency from Salary
  sixMonthSalaryShield: { en: '6-Month Emergency Shield', fr: 'Bouclier d\'Urgence 6 Mois', es: 'Escudo de Emergencia 6 Meses', ar: 'صندوق أمان 6 أشهر (من الراتب)' },
  sixMonthSalaryDesc: {
    en: 'Bulletproof liquid cushion equal to 6 months of full salary replacement.',
    fr: 'Coussin de sécurité équivalent à 6 mois de salaire complet.',
    es: 'Colchón de seguridad equivalente a 6 meses de salario completo.',
    ar: 'صمام أمان نقدي يعادل 6 أشهر كاملة من الراتب لتأمين الاستقرار المالي التام.'
  },
  sixMoSalaryBenchmark: { en: '6-Mo Salary Reserve', fr: 'Réserve 6 Mois Salaire', es: 'Reserva 6 Meses Salario', ar: 'احتياطي 6 أشهر راتب' },
  sixMoExpenseBenchmark: { en: '6-Mo Living Expenses', fr: 'Charges 6 Mois Dépenses', es: 'Gastos 6 Meses', ar: 'تكاليف 6 أشهر معيشة' },
  sync6MoSalary: { en: 'Sync with 6-Mo Salary', fr: 'Synchroniser avec 6 mois de salaire', es: 'Sincronizar con 6 meses de salario', ar: 'مطابقة مع 6 أشهر من الراتب' },
  sync6MoExpenses: { en: 'Sync with 6-Mo Expenses', fr: 'Synchroniser avec 6 mois de charges', es: 'Sincronizar con 6 meses de gastos', ar: 'مطابقة مع 6 أشهر من المصاريف' },
  quickContributeLabel: { en: 'Quick Deposit', fr: 'Dépôt Rapide', es: 'Depósito Rápido', ar: 'إيداع سريع' },

  // Custom Income Solutions
  addCustomSolutionBtn: { en: '+ Add Custom Solution', fr: '+ Ajouter une Solution', es: '+ Agregar Solución Personalizada', ar: '+ إضافة حل مخصص' },
  addNewSolutionModalTitle: { en: 'Add Custom Income Development Strategy', fr: 'Ajouter une Stratégie de Revenu', es: 'Agregar Estrategia de Ingresos', ar: 'إضافة استراتيجية مخصصة لتنمية الدخل' },
  newSolutionTitleLabel: { en: 'Strategy Title / Source', fr: 'Titre de la Stratégie', es: 'Título de la Estrategia', ar: 'عنوان الاستراتيجية / المصدر' },
  newSolutionTitlePlaceholder: { en: 'e.g., Freelance Web Dev, E-commerce Store, Consulting', fr: 'ex: Dév Web Freelance, E-commerce, Conseil', es: 'ej. Freelance Web, Tienda Online, Consultoría', ar: 'مثال: برمجة مستقلة، متجر إلكتروني، استشارات' },
  newSolutionBoostLabel: { en: 'Monthly Income Boost (DH/month)', fr: 'Augmentation Mensuelle (DH/mois)', es: 'Aumento Mensual (DH/mes)', ar: 'مبلغ الزيادة الشهرية (درهم/شهر)' },
  newSolutionBoostPlaceholder: { en: 'Amount (e.g. 2500)', fr: 'Montant (ex: 2500)', es: 'Monto (ej. 2500)', ar: 'المبلغ (مثال: 2500)' },
  newSolutionCategoryLabel: { en: 'Category / Type', fr: 'Catégorie / Type', es: 'Categoría / Tipo', ar: 'التصنيف / النوع' },
  saveSolutionBtn: { en: 'Save Solution', fr: 'Enregistrer', es: 'Guardar Solución', ar: 'حفظ وإضافة الحل' },
  cancelBtn: { en: 'Cancel', fr: 'Annuler', es: 'Cancelar', ar: 'إلغاء' },
  customBadge: { en: 'Custom Strategy', fr: 'Stratégie Personnalisée', es: 'Personalizado', ar: 'حل مخصص' },
  deleteSolutionTooltip: { en: 'Delete custom solution', fr: 'Supprimer la solution', es: 'Eliminar solución', ar: 'حذف الحل المخصص' },
  appliedToSalaryTooltip: { en: 'Click to upgrade monthly salary by this amount', fr: 'Cliquer pour augmenter le salaire mensuel', es: 'Haz clic para aumentar el salario mensual', ar: 'انقر لترقية وزيادة الراتب الشهري بهذا المبلغ' },
  logoUrlLabel: { en: 'Logo / Icon Image URL (Optional)', fr: 'URL du Logo / Image (Optionnel)', es: 'URL del Logo / Imagen (Opcional)', ar: 'رابط الشعار أو الصورة (اختياري)' },
  logoUrlPlaceholder: { en: 'https://... (e.g. brand, icon or service logo)', fr: 'https://... (ex: logo marque ou service)', es: 'https://... (ej. logo de servicio)', ar: 'https://... (رابط شعار الخدمة أو الشعار)' },
  editSolutionTooltip: { en: 'Edit strategy details', fr: 'Modifier la stratégie', es: 'Editar estrategia', ar: 'تعديل تفاصيل الاستراتيجية' },
  editSolutionModalTitle: { en: 'Edit Income Strategy', fr: 'Modifier la Stratégie', es: 'Editar Estrategia', ar: 'تعديل استراتيجية الدخل' },
  saveChangesBtn: { en: 'Save Changes', fr: 'Enregistrer les Modifications', es: 'Guardar Cambios', ar: 'حفظ التغييرات' },

  // Built-in Solutions for Developing Income
  incomeRaiseTitle: {
    en: 'Salary Promotion & Career Step-Up (+20%)',
    fr: 'Promotion Salariale & Progression de Carrière (+20%)',
    es: 'Ascenso Salarial y Crecimiento Profesional (+20%)',
    ar: 'ترقية وظيفية وزيادة في الراتب (+20%)'
  },
  incomeRaiseDesc: {
    en: 'Target a 20% salary increase to dramatically accelerate your 5 budget pillars and quests.',
    fr: 'Visez une augmentation de salaire de 20% pour accélérer considérablement vos 5 piliers et objectifs.',
    es: 'Apunta a un aumento salarial del 20% para acelerar tus 5 pilares y metas.',
    ar: 'استهدف زيادة 20% في الراتب لتسريع أركان ميزانيتك الخمسة وأهدافك المالية.'
  },
  sideHustleTitle: {
    en: 'Digital Freelance & Side Monetization (+1,500 DH/mo)',
    fr: 'Freelance Digital & Activité Secondaire (+1 500 DH/mois)',
    es: 'Freelance Digital e Ingreso Secundario (+1.500 DH/mes)',
    ar: 'عمل حر رقمي ودخل جانبي (+1,500 درهم/شهر)'
  },
  sideHustleDesc: {
    en: 'Monetize digital skills for 5-8 hours/week (UI design, development, consulting) to create a secondary monthly cash stream.',
    fr: 'Monétisez vos compétences numériques 5-8 h/semaine (design, développement, conseil) pour un revenu d\'appoint.',
    es: 'Monetiza habilidades 5-8 h/semana (diseño, desarrollo, consultoría) para generar un flujo secundario.',
    ar: 'استثمر مهاراتك الرقمية لمدة 5-8 ساعات أسبوعياً لتوليد تدفق نقدي شهري إضافي.'
  },
  skillBoostTitle: {
    en: 'Specialized Skill Monetization (+3,000 DH/mo)',
    fr: 'Monétisation de Compétences Spécialisées (+3 000 DH/mois)',
    es: 'Monetización de Habilidades Especializadas (+3.000 DH/mes)',
    ar: 'استثمار المهارات التقنية التخصصية (+3,000 درهم/شهر)'
  },
  skillBoostDesc: {
    en: 'Deliver premium recurring client solutions to expand your total revenue base and fast-track asset milestones.',
    fr: 'Proposez des solutions récurrentes premium pour élargir vos revenus et accélérer vos acquisitions.',
    es: 'Ofrece soluciones recurrentes a clientes para ampliar tus ingresos y acelerar tus metas.',
    ar: 'قدم حلولاً واستشارات دورية عالية القيمة لتوسيع سقف دخلك وبناء ثروتك بأسرع وتيرة.'
  },
  moderateRaiseTitle: {
    en: 'Performance Bonus / Step-Up (+10%)',
    fr: 'Prime de Performance / Échelon (+10%)',
    es: 'Bono de Rendimiento / Incremento (+10%)',
    ar: 'مكافأة أداء أو علاوة دورية (+10%)'
  },
  moderateRaiseDesc: {
    en: 'Achieve an incremental +10% bump to eliminate any budget deficit effortlessly.',
    fr: 'Obtenez une prime ou une augmentation de +10% pour résorber tout déficit sans effort.',
    es: 'Logra un incremento del +10% para cubrir cualquier déficit presupuestario fácilmente.',
    ar: 'احصل على علاوة أو مكافأة أداء بنسبة +10% لتجاوز أي عجز مالي بسهولة تامة.'
  },
  strategicBoostsBadge: {
    en: 'Strategic Boosts',
    fr: 'Boosts Stratégiques',
    es: 'Aumentos Estratégicos',
    ar: 'محفزات استراتيجية'
  },
  strategySummaryLabel: {
    en: 'Strategy Summary / Execution Plan',
    fr: 'Résumé de la Stratégie / Plan d\'Exécution',
    es: 'Resumen de la Estrategia / Plan de Ejecución',
    ar: 'ملخص الخطة والتنفيذ'
  },
  strategySummaryPlaceholder: {
    en: 'Brief details (e.g. 5-8 hrs/week on evenings, recurring client retainer)...',
    fr: 'Détails brefs (ex: 5-8 h/semaine le soir, forfait récurrent)...',
    es: 'Detalles breves (ej. 5-8 h/semana por las tardes, cliente mensual)...',
    ar: 'تفاصيل موجزة (مثلاً: 5-8 ساعات أسبوعياً في المساء، عقد استشاري دوري)...'
  },
  customIncomeTargetDesc: {
    en: 'Boost monthly salary in Smart Allocator by any custom amount',
    fr: 'Augmentez le salaire mensuel dans le Répartiteur du montant de votre choix',
    es: 'Aumenta el salario mensual en el Distribuidor por el monto deseado',
    ar: 'ارفع الراتب الشهري في المخصص الذكي بأي مبلغ مخصص تريده'
  },
  savePdfPlan: {
    en: 'Save PDF Plan',
    fr: 'Enregistrer le Plan PDF',
    es: 'Guardar Plan en PDF',
    ar: 'حفظ الخطة بصيغة PDF'
  },
  syncWithSavingsPillar: {
    en: 'Sync with Safe Savings',
    fr: 'Synchroniser avec l\'Épargne Liquide',
    es: 'Sincronizar con Ahorro Seguro',
    ar: 'مطابقة مع ركن التوفير الآمن'
  },
  syncWithFreeBuffer: {
    en: 'Sync with Free Cash Buffer',
    fr: 'Synchroniser avec la Trésorerie Libre',
    es: 'Sincronizar con Colchón Libre',
    ar: 'مطابقة مع الفائض المالي'
  },
  catSideHustle: { en: 'Side Hustle', fr: 'Activité Secondaire', es: 'Proyecto Paralelo', ar: 'مشروع جانبي' },
  catFreelance: { en: 'Freelance', fr: 'Freelance', es: 'Freelance', ar: 'عمل حر' },
  catCareer: { en: 'Career Promotion', fr: 'Promotion Carrière', es: 'Ascenso Laboral', ar: 'ترقية وظيفية' },
  catPassive: { en: 'Passive Income', fr: 'Revenu Passif', es: 'Ingreso Pasivo', ar: 'دخل سلبي' },
  catConsulting: { en: 'Client Consulting', fr: 'Conseil Clients', es: 'Consultoría', ar: 'استشارات مهنية' },
  catDigital: { en: 'Digital Product', fr: 'Produit Numérique', es: 'Producto Digital', ar: 'منتج رقمي' },
};

// --- CURRENCIES & LIVE CONVERSION RATES (Base: MAD) ---
const CURRENCY_RATES: Record<string, { symbol: string; rateFromMAD: number; label: string }> = {
  MAD: { symbol: 'DH', rateFromMAD: 1, label: 'Moroccan Dirham (MAD)' },
  USD: { symbol: '$', rateFromMAD: 0.10, label: 'US Dollar (USD)' },
  EUR: { symbol: '€', rateFromMAD: 0.092, label: 'Euro (EUR)' },
  GBP: { symbol: '£', rateFromMAD: 0.078, label: 'British Pound (GBP)' },
  AED: { symbol: 'AED', rateFromMAD: 0.367, label: 'UAE Dirham (AED)' },
  BTC: { symbol: '₿', rateFromMAD: 0.0000015, label: 'Bitcoin (BTC)' },
};

export const ModernEWallet: React.FC = () => {
  const { language, dir } = useLanguage();
  const isArabic = language === 'ar';

  // Helper translation getter
  const tr = (key: string): string => {
    return WALLET_I18N[key]?.[language] || WALLET_I18N[key]?.en || key;
  };

  // User session identifier for isolated storage namespace (guest vs logged in user)
  const [userIdentifier, setUserIdentifier] = useState<string | null>(auth?.currentUser?.email || 'guest');

  useEffect(() => {
    if (!auth) return;
    const unsubscribe = auth.onAuthStateChanged((user: any) => {
      const nextId = user?.email || 'guest';
      setUserIdentifier(nextId);
      // Reload state for newly switched user account or guest session
      const loaded = loadStoredWalletState(nextId);
      setTotalLiquidFunds(loaded.totalLiquidFunds);
      setOpeningBalance(loaded.openingBalance);
      setOpeningBalanceConfigured(loaded.openingBalanceConfigured);
      setCardAllocation(loaded.cardLimit);
      setLastMonthSpend(loaded.lastMonthSpend);
      setSelectedCurrency(loaded.selectedCurrency);
      setIsBalanceHidden(loaded.isBalanceHidden);
      setIsCardRevealed(loaded.isCardRevealed);
      setIsCardFrozen(loaded.isCardFrozen);
      setSalary(loaded.salary);
      setCustomSplits(loaded.customSplits);
      setCustomFunds(loaded.customFunds || []);
      setCustomCategories(loaded.customCategories || ['fixed', 'lifestyle']);
      setExpenses(loaded.expenses);
      setQuests(loaded.quests);
      setCalcItemName(loaded.calcItemName);
      setCalcCost(loaded.calcCost);
      setCalcMonthlySaving(loaded.calcMonthlySaving);
      setTransactions(loaded.transactions);
      setCustomIncomeSolutions(loaded.customIncomeSolutions || []);
    });
    return () => unsubscribe();
  }, []);

  // Base state in Moroccan Dirhams (MAD) loaded from isolated storage
  const initialLoaded = useMemo(() => loadStoredWalletState(userIdentifier), []);
  const [totalLiquidFunds, setTotalLiquidFunds] = useState<number>(initialLoaded.totalLiquidFunds);
  const [openingBalance, setOpeningBalance] = useState<number>(initialLoaded.openingBalance);
  const [openingBalanceConfigured, setOpeningBalanceConfigured] = useState<boolean>(initialLoaded.openingBalanceConfigured);
  const [cardAllocation, setCardAllocation] = useState<number>(initialLoaded.cardLimit);
  const [lastMonthSpend, setLastMonthSpend] = useState<number>(initialLoaded.lastMonthSpend);
  const [isEditingLastMonth, setIsEditingLastMonth] = useState<boolean>(false);

  // Selected base currency for display
  const [selectedCurrency, setSelectedCurrency] = useState<string>(initialLoaded.selectedCurrency);
  const [isBalanceHidden, setIsBalanceHidden] = useState<boolean>(initialLoaded.isBalanceHidden);

  // Direct Balance Input & Editing State
  const [isEditingBalance, setIsEditingBalance] = useState<boolean>(false);
  const [editBalanceInput, setEditBalanceInput] = useState<string>('');
  const [autoSyncBalanceToAllocator, setAutoSyncBalanceToAllocator] = useState<boolean>(false);

  // Virtual Card States
  const [isCardRevealed, setIsCardRevealed] = useState<boolean>(initialLoaded.isCardRevealed);
  const [isCardFrozen, setIsCardFrozen] = useState<boolean>(initialLoaded.isCardFrozen);
  const [cardCopied, setCardCopied] = useState<boolean>(false);

  // Income Allocator
  const [salary, setSalary] = useState<number>(initialLoaded.salary);
  const [customSplits, setCustomSplits] = useState<BudgetSplits | undefined>(initialLoaded.customSplits);
  const [customFunds, setCustomFunds] = useState<CustomPillarFund[]>(initialLoaded.customFunds || []);
  const [showAddFundModal, setShowAddFundModal] = useState<boolean>(false);
  const [newFundName, setNewFundName] = useState<string>('');
  const [newFundPercent, setNewFundPercent] = useState<string>('5');
  const [customIncomeBoostInput, setCustomIncomeBoostInput] = useState<string>('2000');

  // Smart Visual Pointers State (Integrated in-section financial intelligence)
  const [showStickyAnnotations, setShowStickyAnnotations] = useState<boolean>(true);

  // Multi-Language PDF Generation State
  const [isGeneratingPDF, setIsGeneratingPDF] = useState<boolean>(false);
  const [pdfLanguage, setPdfLanguage] = useState<Language>(language);
  const [showPdfLangDropdown, setShowPdfLangDropdown] = useState<boolean>(false);

  useEffect(() => {
    setPdfLanguage(language);
  }, [language]);

  // Action Modals State
  const [activeActionModal, setActiveActionModal] = useState<'send' | 'receive' | 'add' | 'swap' | null>(null);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string>('');

  // Repurposed Send Modal State -> Record Expense
  const [sendExpenseLabel, setSendExpenseLabel] = useState<string>('');
  const [sendExpenseCost, setSendExpenseCost] = useState<string>('');
  const [sendExpenseCategory, setSendExpenseCategory] = useState<string>('fixed');
  const [sendExpensePaidFrom, setSendExpensePaidFrom] = useState<'card' | 'vault'>('card');
  const [sendExpensePaid, setSendExpensePaid] = useState<boolean>(true);

  // Repurposed Receive Modal State -> Record Income
  const [receiveIncomeSource, setReceiveIncomeSource] = useState<string>('');
  const [receiveIncomeAmount, setReceiveIncomeAmount] = useState<string>('');

  // Add Funds Modal State -> Manual Deposit / Opening Balance Setup
  const [depositAmountInput, setDepositAmountInput] = useState<string>('');
  const [depositMode, setDepositMode] = useState<'deposit' | 'opening_balance'>('deposit');

  // Swap Modal State
  const [swapFrom, setSwapFrom] = useState<string>('MAD');
  const [swapTo, setSwapTo] = useState<string>('USD');
  const [swapAmount, setSwapAmount] = useState<string>('1000');

  // Custom Expenses
  const [expenses, setExpenses] = useState<ExpenseRecord[]>(initialLoaded.expenses);
  const [customCategories, setCustomCategories] = useState<string[]>(initialLoaded.customCategories || ['fixed', 'lifestyle']);
  const [newExpenseLabel, setNewExpenseLabel] = useState('');
  const [newExpenseCost, setNewExpenseCost] = useState('');
  const [newExpenseCategory, setNewExpenseCategory] = useState<string>('fixed');
  const [newExpenseLogoUrl, setNewExpenseLogoUrl] = useState('');
  const [isCreatingNewCategory, setIsCreatingNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [expenseFilter, setExpenseFilter] = useState<'all' | 'due' | 'paid'>('all');
  const [expenseSearchQuery, setExpenseSearchQuery] = useState('');

  // Inline Expense Edit state
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [editExpenseLabel, setEditExpenseLabel] = useState('');
  const [editExpenseCost, setEditExpenseCost] = useState('');
  const [editExpenseCategory, setEditExpenseCategory] = useState('fixed');
  const [editExpenseLogoUrl, setEditExpenseLogoUrl] = useState('');

  // Financial Quests
  const [quests, setQuests] = useState<QuestRecord[]>(initialLoaded.quests);

  // Custom Income Solutions
  const [customIncomeSolutions, setCustomIncomeSolutions] = useState<IncomeDevelopmentSolution[]>(initialLoaded.customIncomeSolutions || []);
  const [showAddSolutionModal, setShowAddSolutionModal] = useState<boolean>(false);
  const [newSolutionTitle, setNewSolutionTitle] = useState<string>('');
  const [newSolutionBoost, setNewSolutionBoost] = useState<string>('');
  const [newSolutionCategory, setNewSolutionCategory] = useState<string>('Side Hustle');
  const [newSolutionDesc, setNewSolutionDesc] = useState<string>('');
  const [newSolutionIcon, setNewSolutionIcon] = useState<string>('TrendingUp');
  const [newSolutionLogoUrl, setNewSolutionLogoUrl] = useState<string>('');

  // Solution Edit state
  const [editingSolutionId, setEditingSolutionId] = useState<string | null>(null);
  const [editSolutionTitle, setEditSolutionTitle] = useState<string>('');
  const [editSolutionBoost, setEditSolutionBoost] = useState<string>('');
  const [editSolutionCategory, setEditSolutionCategory] = useState<string>('Side Hustle');
  const [editSolutionDesc, setEditSolutionDesc] = useState<string>('');
  const [editSolutionIcon, setEditSolutionIcon] = useState<string>('TrendingUp');
  const [editSolutionLogoUrl, setEditSolutionLogoUrl] = useState<string>('');
  const [deletedSolutionIds, setDeletedSolutionIds] = useState<string[]>([]);

  // Fast-Track Buying Calculator
  const [calcItemName, setCalcItemName] = useState<string>(initialLoaded.calcItemName);
  const [calcCost, setCalcCost] = useState<number>(initialLoaded.calcCost);
  const [calcMonthlySaving, setCalcMonthlySaving] = useState<number>(initialLoaded.calcMonthlySaving);
  const [transactions, setTransactions] = useState<FinancialTransaction[]>(initialLoaded.transactions);

  // Automatic Persistence to isolated user/guest storage
  useEffect(() => {
    saveStoredWalletState({
      totalLiquidFunds,
      openingBalance,
      openingBalanceConfigured,
      cardLimit: cardAllocation,
      lastMonthSpend,
      salary,
      selectedCurrency,
      isBalanceHidden,
      isCardFrozen,
      isCardRevealed,
      customSplits,
      customFunds,
      customCategories,
      expenses,
      quests,
      calcItemName,
      calcCost,
      calcMonthlySaving,
      customIncomeSolutions,
      transactions,
    }, userIdentifier);
  }, [
    totalLiquidFunds,
    openingBalance,
    openingBalanceConfigured,
    cardAllocation,
    lastMonthSpend,
    salary,
    selectedCurrency,
    isBalanceHidden,
    isCardFrozen,
    isCardRevealed,
    customSplits,
    customFunds,
    customCategories,
    expenses,
    quests,
    calcItemName,
    calcCost,
    calcMonthlySaving,
    customIncomeSolutions,
    transactions,
    userIdentifier
  ]);

  // --- SINGLE SOURCE OF TRUTH CALCULATIONS ---
  // Unpaid expenses committed liabilities
  const unpaidExpensesTotal = useMemo(() => {
    return expenses.filter(e => !e.paid).reduce((acc, curr) => acc + curr.cost, 0);
  }, [expenses]);

  // Funds explicitly reserved in milestones/quests
  const reservedForGoals = useMemo(() => {
    return quests.reduce((acc, q) => acc + (q.current || 0), 0);
  }, [quests]);

  // Master Balances: Total Liquid Funds = Unallocated Vault + Card Allocation + Reserved For Goals
  // Internal reallocations strictly preserve total liquid funds without phantom wealth creation.
  const masterBalances = useMemo(() => {
    return calculateMasterBalances(totalLiquidFunds, cardAllocation, reservedForGoals, unpaidExpensesTotal);
  }, [totalLiquidFunds, cardAllocation, reservedForGoals, unpaidExpensesTotal]);

  const totalEstimatedBalanceMAD = masterBalances.totalLiquidFunds;
  const unallocatedVault = masterBalances.unallocatedVault;
  const cardLimit = masterBalances.cardAllocation;

  // Spend Delta vs Audited Last Month Spend
  const spendDelta = useMemo(() => {
    return calculateSpendDelta(cardLimit, lastMonthSpend);
  }, [cardLimit, lastMonthSpend]);

  // Interconnected Metrics: Total Balance <-> Last Month Spend <-> Smart Allocator
  const financialRunwayMonths = useMemo(() => {
    const denom = lastMonthSpend > 0 ? lastMonthSpend : 1;
    return Number((totalEstimatedBalanceMAD / denom).toFixed(1));
  }, [totalEstimatedBalanceMAD, lastMonthSpend]);

  const monthlyBurnRatePercent = useMemo(() => {
    const denom = totalEstimatedBalanceMAD > 0 ? totalEstimatedBalanceMAD : 1;
    return Number(((lastMonthSpend / denom) * 100).toFixed(1));
  }, [lastMonthSpend, totalEstimatedBalanceMAD]);

  const netMonthlySurplusMAD = useMemo(() => {
    return salary - lastMonthSpend;
  }, [salary, lastMonthSpend]);

  // Convert raw value to selected currency
  const convertedDisplayBalance = useMemo(() => {
    if (isBalanceHidden) return '••••••••';
    return formatMoney(totalEstimatedBalanceMAD, selectedCurrency);
  }, [totalEstimatedBalanceMAD, selectedCurrency, isBalanceHidden]);

  // 5-Pillar Budget Allocator derived from salary, user-editable splits, and custom funds
  const allocations = useMemo(() => {
    return calculatePillarAllocations(salary, customSplits, customFunds);
  }, [salary, customSplits, customFunds]);

  // Expenses calculations and Free Cash Buffer
  const freeCashAnalysis = useMemo(() => {
    return calculateFreeCash(expenses, allocations.personalAmount, unallocatedVault, salary);
  }, [expenses, allocations.personalAmount, unallocatedVault, salary]);

  const totalExpensesCost = freeCashAnalysis.totalCommittedExpenses;
  const freeCashBuffer = freeCashAnalysis.freeCashBuffer;

  // Filtered and sorted expenses for the Expenses & Subscriptions section
  const dueExpensesCount = useMemo(() => expenses.filter(e => !e.paid).length, [expenses]);
  const paidExpensesCount = useMemo(() => expenses.filter(e => e.paid).length, [expenses]);
  const filteredExpenses = useMemo(() => {
    return expenses.filter(exp => {
      if (expenseFilter === 'due' && exp.paid) return false;
      if (expenseFilter === 'paid' && !exp.paid) return false;
      if (expenseSearchQuery.trim()) {
        const q = expenseSearchQuery.toLowerCase();
        return exp.label.toLowerCase().includes(q) || exp.category.toLowerCase().includes(q);
      }
      return true;
    });
  }, [expenses, expenseFilter, expenseSearchQuery]);

  // Interconnected Trio Synergy Engine (Allocator <-> Expenses <-> Quests)
  const trioSynergy: TrioSynergyReport = useMemo(() => {
    return calculateTrioSynergy(salary, allocations, expenses, quests);
  }, [salary, allocations, expenses, quests]);

  // Buying Calculator & Fast-Track Timeline
  const targetPurchase = useMemo(() => {
    return calculateTargetPurchase(calcCost, calcMonthlySaving, 0, freeCashBuffer);
  }, [calcCost, calcMonthlySaving, freeCashBuffer]);

  const calcMonths = targetPurchase.estimatedMonths;
  const fastTrackMonthly = targetPurchase.fastTrackMonthly;

  // Transparent Currency Swap Calculation
  const swapResult = useMemo(() => {
    return calculateCurrencySwap(swapFrom, swapTo, Number(swapAmount) || 0, totalEstimatedBalanceMAD);
  }, [swapFrom, swapTo, swapAmount, totalEstimatedBalanceMAD]);

  // Toggle Expense Paid status with consistent balance update
  const toggleExpensePaid = (id: string) => {
    setExpenses(prev =>
      prev.map(e => {
        if (e.id === id) {
          const nextPaid = !e.paid;
          if (nextPaid) {
            // Deduct cash when marked paid
            setTotalLiquidFunds(curr => Math.max(0, curr - e.cost));
            const newTx: FinancialTransaction = {
              id: `tx_${Date.now()}`,
              type: 'expense',
              amount: e.cost,
              currency: 'MAD',
              amountMAD: e.cost,
              description: `Paid: ${e.label}`,
              category: e.category,
              timestamp: Date.now(),
              status: 'completed',
            };
            setTransactions(t => [newTx, ...t]);
          } else {
            // Restore cash when marked unpaid
            setTotalLiquidFunds(curr => curr + e.cost);
          }
          return { ...e, paid: nextPaid };
        }
        return e;
      })
    );
  };

  // Start Inline Expense Edit
  const handleStartEditExpense = (exp: ExpenseRecord) => {
    setEditingExpenseId(exp.id);
    setEditExpenseLabel(exp.label);
    setEditExpenseCost(String(exp.cost));
    setEditExpenseCategory(exp.category);
    setEditExpenseLogoUrl(exp.logoUrl || '');
  };

  // Save Inline Expense Edit
  const handleSaveEditExpense = (id: string) => {
    const cost = Number(editExpenseCost);
    if (!editExpenseLabel.trim() || Number.isNaN(cost) || cost <= 0) return;

    setExpenses(prev =>
      prev.map(e => {
        if (e.id === id) {
          const oldCost = e.cost;
          const costDiff = cost - oldCost;
          if (e.paid && costDiff !== 0) {
            // If expense was paid, adjust liquid funds by the cost difference
            setTotalLiquidFunds(curr => Math.max(0, curr - costDiff));
          }
          return {
            ...e,
            label: editExpenseLabel.trim(),
            cost: Math.round(cost),
            category: editExpenseCategory,
            logoUrl: editExpenseLogoUrl.trim() || undefined,
          };
        }
        return e;
      })
    );
    setEditingExpenseId(null);
  };

  // Delete Expense
  const handleDeleteExpense = (id: string) => {
    const target = expenses.find(e => e.id === id);
    if (!target) return;

    if (target.paid) {
      // Restore funds to balance if a paid expense is removed
      setTotalLiquidFunds(curr => curr + target.cost);
    }
    setExpenses(prev => prev.filter(e => e.id !== id));
    if (editingExpenseId === id) setEditingExpenseId(null);
  };

  // Helper to detect suitable icon based on name and category
  const detectExpenseIcon = (label: string, category: string): string => {
    const l = label.toLowerCase();
    if (l.includes('rent') || l.includes('studio') || l.includes('house') || l.includes('flat') || l.includes('loyer') || l.includes('كراء') || l.includes('إيجار') || l.includes('منزل') || l.includes('شقة') || l.includes('alquiler') || l.includes('logement')) return 'Home';
    if (l.includes('food') || l.includes('grocer') || l.includes('supermarket') || l.includes('courses') || l.includes('nourriture') || l.includes('alimento') || l.includes('comida') || l.includes('طعام') || l.includes('تسوق') || l.includes('تغذية')) return 'ShoppingBag';
    if (l.includes('coffee') || l.includes('cafe') || l.includes('restaurant') || l.includes('starbucks') || l.includes('قهوة') || l.includes('مطعم')) return 'Coffee';
    if (l.includes('wifi') || l.includes('internet') || l.includes('fiber') || l.includes('fibre') || l.includes('5g') || l.includes('inwi') || l.includes('orange') || l.includes('iam') || l.includes('انترنت') || l.includes('واي فاي')) return 'Wifi';
    if (l.includes('netflix') || l.includes('disney') || l.includes('movie') || l.includes('tv') || l.includes('film') || l.includes('cinema') || l.includes('streaming') || l.includes('أفلام')) return 'Movie';
    if (l.includes('spotify') || l.includes('music') || l.includes('sound') || l.includes('deezer') || l.includes('موسيقى') || l.includes('صوت')) return 'Music';
    if (l.includes('gym') || l.includes('fitness') || l.includes('sport') || l.includes('box') || l.includes('workout') || l.includes('musculation') || l.includes('رياضة') || l.includes('جيم') || l.includes('ملاكمة')) return 'Activity';
    if (l.includes('car') || l.includes('fuel') || l.includes('gas') || l.includes('essence') || l.includes('commute') || l.includes('transport') || l.includes('uber') || l.includes('voiture') || l.includes('auto') || l.includes('وقود') || l.includes('سيارة')) return 'Car';
    if (l.includes('cloud') || l.includes('code') || l.includes('server') || l.includes('host') || l.includes('ai') || l.includes('aws') || l.includes('openai') || l.includes('github') || l.includes('سيرفر') || l.includes('برمجة')) return 'Code';
    if (l.includes('phone') || l.includes('mobile') || l.includes('telecom') || l.includes('recharge') || l.includes('هاتف') || l.includes('جوال')) return 'Smartphone';
    if (l.includes('health') || l.includes('medical') || l.includes('doctor') || l.includes('pharmacy') || l.includes('santé') || l.includes('salud') || l.includes('صحة') || l.includes('طبيب')) return 'Heart';
    if (l.includes('book') || l.includes('course') || l.includes('formation') || l.includes('udemy') || l.includes('school') || l.includes('تعلم') || l.includes('دراسة')) return 'Book';
    return category === 'fixed' ? 'Home' : 'Receipt';
  };

  // Add Expense with custom category support & custom logo URL
  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const cost = Number(newExpenseCost);
    if (!newExpenseLabel.trim() || Number.isNaN(cost) || cost <= 0) return;

    let finalCategory = newExpenseCategory;
    if (isCreatingNewCategory && newCategoryName.trim()) {
      finalCategory = newCategoryName.trim().toLowerCase();
      if (!customCategories.includes(finalCategory)) {
        setCustomCategories(c => [...c, finalCategory]);
      }
    }

    const newItem: ExpenseRecord = {
      id: `exp_${Date.now()}`,
      label: newExpenseLabel.trim(),
      cost: Math.round(cost),
      paid: false,
      icon: detectExpenseIcon(newExpenseLabel, finalCategory),
      category: finalCategory,
      logoUrl: newExpenseLogoUrl.trim() || undefined,
    };

    setExpenses(prev => [newItem, ...prev]);
    setNewExpenseLabel('');
    setNewExpenseCost('');
    setNewExpenseLogoUrl('');
    setIsCreatingNewCategory(false);
    setNewCategoryName('');
  };

  // Contribute to Quest with validation from unallocated vault
  const handleContributeQuest = (questId: string, amount: number) => {
    const safeAmount = Math.min(amount, unallocatedVault);
    if (safeAmount <= 0) return;

    setQuests(prev =>
      prev.map(q => {
        if (q.id === questId) {
          const nextVal = Math.min(q.current + safeAmount, q.target);
          return { ...q, current: nextVal };
        }
        return q;
      })
    );

    // Record internal transfer transaction
    const newTx: FinancialTransaction = {
      id: `tx_${Date.now()}`,
      type: 'quest_deposit',
      amount: safeAmount,
      currency: 'MAD',
      amountMAD: safeAmount,
      description: `Contribution to milestone from vault`,
      timestamp: Date.now(),
      status: 'completed',
    };
    setTransactions(prev => [newTx, ...prev]);
  };

  // 1. Auto-Tune Personal Fund to Cover Committed Expenses
  const handleAutoTunePersonalSplit = () => {
    if (salary <= 0) return;
    const neededPersonalPercent = trioSynergy.recommendedPersonalSplitPercent;
    const remainingPercent = Math.max(0, 100 - neededPersonalPercent);
    const newInvest = Math.round(remainingPercent * 0.3);
    const newSafe = Math.round(remainingPercent * 0.3);
    const newEmergency = Math.round(remainingPercent * 0.2);
    const newParents = Math.max(0, remainingPercent - (newInvest + newSafe + newEmergency));

    const updatedSplits: BudgetSplits = {
      personal: neededPersonalPercent,
      invest: newInvest,
      safe: newSafe,
      emergency: newEmergency,
      parents: newParents,
    };
    setCustomSplits(updatedSplits);
  };

  // 2. Sweep Free Cash Surplus to Active Quests
  const handleSweepBufferToQuests = () => {
    const buffer = trioSynergy.freeCashBuffer;
    const safeBuffer = Math.min(buffer, unallocatedVault);
    if (safeBuffer <= 0) return;

    // Direct into primary uncompleted quest
    const targetQuest = quests.find(q => q.current < q.target) || quests[0];
    if (!targetQuest) return;

    handleContributeQuest(targetQuest.id, safeBuffer);
  };

  // 3. Dynamic Emergency Shield 6-Month Sync (Salary or Living Expenses)
  const handleSyncEmergencySalaryTarget = () => {
    const targetSalary6Mo = salary * 6;
    if (targetSalary6Mo <= 0) return;
    setQuests(prev =>
      prev.map(q => {
        const isEmergency = q.id === 'q1' || q.title.toLowerCase().includes('emergency') || q.title.toLowerCase().includes('shield') || q.title.toLowerCase().includes('طوارئ');
        if (isEmergency) {
          return { ...q, target: targetSalary6Mo };
        }
        return q;
      })
    );
    setActionSuccessMessage(`6-Month salary shield synced: ${targetSalary6Mo.toLocaleString()} DH`);
    setTimeout(() => setActionSuccessMessage(''), 3000);
  };

  const handleSyncEmergencyTarget = () => {
    const recommended = trioSynergy.recommended6MonthEmergencyTarget;
    if (recommended <= 0) return;
    setQuests(prev =>
      prev.map(q => {
        const isEmergency = q.id === 'q1' || q.title.toLowerCase().includes('emergency') || q.title.toLowerCase().includes('shield') || q.title.toLowerCase().includes('طوارئ');
        if (isEmergency) {
          return { ...q, target: recommended };
        }
        return q;
      })
    );
    setActionSuccessMessage(`6-Month expenses shield synced: ${recommended.toLocaleString()} DH`);
    setTimeout(() => setActionSuccessMessage(''), 3000);
  };

  // 4. Deposit All Monthly Allocations from Pillars to Quests
  const handleDepositAllMonthlyPillars = () => {
    const totalNeeded = trioSynergy.totalMonthlyStrategicSavings;
    const available = unallocatedVault;
    if (available <= 0 || totalNeeded <= 0) return;

    const scale = available < totalNeeded ? available / totalNeeded : 1;

    setQuests(prev =>
      prev.map(q => {
        const link = trioSynergy.questLinks.find(l => l.questId === q.id);
        if (!link || link.monthlyAllocation <= 0) return q;
        const depositAmount = Math.min(Math.round(link.monthlyAllocation * scale), q.target - q.current);
        return { ...q, current: q.current + Math.max(0, depositAmount) };
      })
    );

    const actualDeposited = Math.min(available, totalNeeded);
    const newTx: FinancialTransaction = {
      id: `tx_${Date.now()}`,
      type: 'quest_deposit',
      amount: actualDeposited,
      currency: 'MAD',
      amountMAD: actualDeposited,
      description: `Monthly strategic allocation to Quests from Pillars`,
      timestamp: Date.now(),
      status: 'completed',
    };
    setTransactions(prev => [newTx, ...prev]);
  };

  // Flexible Splits Update
  const handleSplitChange = (pillar: keyof BudgetSplits, val: number) => {
    const safeVal = Math.max(0, Math.min(100, Math.round(val)));
    const current = customSplits || allocations.splits;
    setCustomSplits({
      ...current,
      [pillar]: safeVal,
    });
  };

  const handleResetSplits = () => {
    setCustomSplits(undefined);
    setCustomFunds([]);
  };

  // Memoized Income Growth Solutions based on current salary & expenses (including user custom solutions)
  const incomeSolutions = useMemo(() => {
    const list = getIncomeDevelopmentSolutions(salary, totalExpensesCost, customIncomeSolutions);
    return list.filter(s => !deletedSolutionIds.includes(s.id));
  }, [salary, totalExpensesCost, customIncomeSolutions, deletedSolutionIds]);

  // Handler: Add Custom Solution
  const handleAddCustomSolution = (e: React.FormEvent) => {
    e.preventDefault();
    const boost = Math.max(50, Math.round(Number(newSolutionBoost) || 0));
    if (!newSolutionTitle.trim() || boost <= 0) return;

    const newSol: IncomeDevelopmentSolution = {
      id: `sol_custom_${Date.now()}`,
      titleKey: '',
      defaultTitle: newSolutionTitle.trim(),
      descKey: '',
      defaultDesc: newSolutionDesc.trim() || `${newSolutionCategory} income stream to build long-term wealth`,
      boostAmount: boost,
      boostType: 'flat',
      actionLabelKey: '',
      defaultActionLabel: `+${boost.toLocaleString()} DH / mo`,
      icon: newSolutionIcon || 'TrendingUp',
      category: newSolutionCategory,
      logoUrl: newSolutionLogoUrl.trim() || undefined,
      isCustom: true,
    };

    setCustomIncomeSolutions(prev => [...prev, newSol]);
    setNewSolutionTitle('');
    setNewSolutionBoost('');
    setNewSolutionDesc('');
    setNewSolutionLogoUrl('');
    setShowAddSolutionModal(false);
    setActionSuccessMessage(`+${boost.toLocaleString()} DH ${tr('incomeBoostedSuccess')}`);
    setTimeout(() => setActionSuccessMessage(''), 3000);
  };

  // Handler: Start Editing Solution
  const handleStartEditSolution = (sol: IncomeDevelopmentSolution) => {
    setEditingSolutionId(sol.id);
    setEditSolutionTitle(sol.defaultTitle || '');
    setEditSolutionBoost(String(sol.boostAmount || ''));
    setEditSolutionCategory(sol.category || 'Side Hustle');
    setEditSolutionDesc(sol.defaultDesc || '');
    setEditSolutionIcon(sol.icon || 'TrendingUp');
    setEditSolutionLogoUrl(sol.logoUrl || '');
  };

  // Handler: Save Edited Solution
  const handleSaveEditSolution = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSolutionId) return;
    const boost = Math.max(50, Math.round(Number(editSolutionBoost) || 0));
    if (!editSolutionTitle.trim() || boost <= 0) return;

    const updatedSol: IncomeDevelopmentSolution = {
      id: editingSolutionId,
      titleKey: '',
      defaultTitle: editSolutionTitle.trim(),
      descKey: '',
      defaultDesc: editSolutionDesc.trim() || `${editSolutionCategory} strategy`,
      boostAmount: boost,
      boostType: 'flat',
      actionLabelKey: '',
      defaultActionLabel: `+${boost.toLocaleString()} DH / mo`,
      icon: editSolutionIcon || 'TrendingUp',
      category: editSolutionCategory,
      logoUrl: editSolutionLogoUrl.trim() || undefined,
      isCustom: true,
    };

    setCustomIncomeSolutions(prev => {
      const exists = prev.some(s => s.id === editingSolutionId);
      if (exists) {
        return prev.map(s => s.id === editingSolutionId ? updatedSol : s);
      }
      return [...prev, updatedSol];
    });

    if (!editingSolutionId.startsWith('sol_custom_')) {
      setDeletedSolutionIds(prev => [...prev, editingSolutionId]);
    }

    setEditingSolutionId(null);
    setActionSuccessMessage(tr('saveChangesBtn') || 'Solution updated successfully!');
    setTimeout(() => setActionSuccessMessage(''), 3000);
  };

  // Handler: Delete Solution (Supports both custom and default solutions)
  const handleDeleteSolution = (id: string) => {
    setCustomIncomeSolutions(prev => prev.filter(s => s.id !== id));
    setDeletedSolutionIds(prev => [...prev, id]);
    if (editingSolutionId === id) setEditingSolutionId(null);
  };

  // Handler: Apply Income Boost to Smart Allocator
  const handleApplyIncomeBoost = (boostAmount: number) => {
    if (boostAmount <= 0) return;
    const newSalary = salary + boostAmount;
    setSalary(newSalary);
    setActionSuccessMessage(`+${boostAmount.toLocaleString()} DH ${tr('incomeBoostedSuccess')}`);
    setTimeout(() => setActionSuccessMessage(''), 3500);
  };

  // Handler: Automatically calculate best % distribution across all funds
  const handleAutoOptimizeSplits = () => {
    const optimized = autoOptimizeBudgetSplits(salary, expenses, customFunds);
    setCustomSplits(optimized.splits);
    setCustomFunds(optimized.customFunds);
    setActionSuccessMessage(tr('autoOptimalApplied'));
    setTimeout(() => setActionSuccessMessage(''), 3000);
  };

  // Handler: Add Custom Fund with smooth proportional rebalancing
  const handleAddCustomFund = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFundName.trim()) return;
    const fundColors = ['teal', 'cyan', 'rose', 'indigo', 'orange', 'sky', 'emerald', 'violet'];
    const assignedColor = fundColors[customFunds.length % fundColors.length];
    const targetPercent = Math.max(1, Math.min(30, Math.round(Number(newFundPercent) || 5)));
    const newFund: CustomPillarFund = {
      id: `cf_${Date.now()}`,
      name: newFundName.trim(),
      percent: targetPercent,
      color: assignedColor,
      icon: 'FolderPlus',
    };

    // Smoothly rebalance standard pillars to accommodate the new fund
    const curSplits = customSplits || allocations.splits;
    const deductInvest = Math.min(Math.max(0, curSplits.invest - 5), Math.ceil(targetPercent * 0.6));
    const deductSafe = Math.min(Math.max(0, curSplits.safe - 5), targetPercent - deductInvest);
    const remainder = targetPercent - (deductInvest + deductSafe);
    const deductParents = Math.min(Math.max(0, curSplits.parents - 5), remainder);

    const updatedSplits: BudgetSplits = {
      personal: curSplits.personal,
      invest: Math.max(5, curSplits.invest - deductInvest),
      safe: Math.max(5, curSplits.safe - deductSafe),
      emergency: curSplits.emergency,
      parents: Math.max(5, curSplits.parents - deductParents),
    };

    const nextCustomFunds = [...customFunds, newFund];
    setCustomSplits(updatedSplits);
    setCustomFunds(nextCustomFunds);
    setNewFundName('');
    setNewFundPercent('5');
    setShowAddFundModal(false);
    setActionSuccessMessage(`Added "${newFund.name}" (${newFund.percent}%)!`);
    setTimeout(() => setActionSuccessMessage(''), 3500);
  };

  // Handler: Remove Custom Fund and restore share
  const handleRemoveCustomFund = (fundId: string) => {
    const removedFund = customFunds.find(f => f.id === fundId);
    const nextCustomFunds = customFunds.filter(f => f.id !== fundId);
    setCustomFunds(nextCustomFunds);
    if (removedFund) {
      const curSplits = customSplits || allocations.splits;
      setCustomSplits({
        ...curSplits,
        invest: Math.min(60, curSplits.invest + removedFund.percent),
      });
    }
  };

  // Handler: Edit Custom Fund Percentage Share
  const handleCustomFundPercentChange = (fundId: string, percent: number) => {
    const safePercent = Math.max(0, Math.min(100, Math.round(percent)));
    setCustomFunds(prev =>
      prev.map(f => (f.id === fundId ? { ...f, percent: safePercent } : f))
    );
  };

  // Handler: Directly update Total Estimated Balance & sync to Allocator if connected
  const handleUpdateTotalBalance = (newAmount: number) => {
    const cleanAmount = Math.max(0, Math.round(newAmount));
    setTotalLiquidFunds(cleanAmount);
    setOpeningBalance(cleanAmount);
    if (autoSyncBalanceToAllocator) {
      setSalary(Math.max(500, cleanAmount));
    }
    setIsEditingBalance(false);
    setActionSuccessMessage(`${tr('saveBalance')}: ${cleanAmount.toLocaleString()} DH`);
    setTimeout(() => setActionSuccessMessage(''), 3000);
  };

  // Handler: Quick Inflow Add to Total Balance
  const handleQuickAddBalance = (increment: number) => {
    setTotalLiquidFunds(prev => {
      const next = Math.max(0, prev + increment);
      setOpeningBalance(next);
      if (autoSyncBalanceToAllocator) {
        setSalary(Math.max(500, next));
      }
      return next;
    });
    setActionSuccessMessage(`+${increment.toLocaleString()} DH ${tr('quickAdd')}!`);
    setTimeout(() => setActionSuccessMessage(''), 3000);
  };

  // Handler: 1-Click Sync Balance to Smart Allocator
  const handleSyncBalanceToAllocator = () => {
    setSalary(Math.max(500, totalEstimatedBalanceMAD));
    setActionSuccessMessage(`${tr('connectedToAllocator')} (${totalEstimatedBalanceMAD.toLocaleString()} DH/mo)!`);
    setTimeout(() => setActionSuccessMessage(''), 3500);
  };

  // Handler: Align Personal Fund directly to Last Month Spend benchmark
  const handleAlignPersonalFundToSpend = () => {
    const neededPercent = Math.min(90, Math.max(10, Math.round((lastMonthSpend / (salary || 1)) * 100)));
    const remaining = 100 - neededPercent;
    const cur = customSplits || allocations.splits;
    const sumOthers = (cur.invest || 20) + (cur.safe || 10) + (cur.emergency || 10) + (cur.parents || 10);
    const factor = remaining / (sumOthers || 1);
    const inv = Math.max(2, Math.round((cur.invest || 20) * factor));
    const saf = Math.max(2, Math.round((cur.safe || 10) * factor));
    const emg = Math.max(2, Math.round((cur.emergency || 10) * factor));
    const par = Math.max(2, remaining - (inv + saf + emg));
    const newSplits: BudgetSplits = {
      personal: neededPercent,
      invest: inv,
      safe: saf,
      emergency: emg,
      parents: par,
    };
    setCustomSplits(newSplits);
    setActionSuccessMessage(`${tr('alignPersonalFund')} (${neededPercent}% = ${Math.round(salary * (neededPercent / 100)).toLocaleString()} DH)!`);
    setTimeout(() => setActionSuccessMessage(''), 3500);
  };

  // Handler: Sync Last Month Spend with Active Committed Expenses
  const handleSyncSpendWithExpenses = () => {
    setLastMonthSpend(totalExpensesCost);
    setActionSuccessMessage(`${tr('syncWithExpenses')} (${totalExpensesCost.toLocaleString()} DH)!`);
    setTimeout(() => setActionSuccessMessage(''), 3500);
  };

  // Handler: Copy Card Number with Toast
  const handleCopyCardNumber = () => {
    const fullNumber = '4532 8910 2341 1337';
    navigator.clipboard?.writeText(fullNumber);
    setCardCopied(true);
    setActionSuccessMessage(tr('numberCopied'));
    setTimeout(() => {
      setCardCopied(false);
      setActionSuccessMessage('');
    }, 2500);
  };

  // Multi-Language Helper for PDF Blueprint
  const ptr = (key: string, lang: Language = pdfLanguage): string => {
    return PDF_I18N[key]?.[lang] || PDF_I18N[key]?.en || key;
  };

  // Multi-Language Currency Formatter for PDF (Authentic Arabic and LTR formatting)
  const formatPdfAmount = (amount: number, lang: Language = pdfLanguage): string => {
    const formatted = Math.round(amount).toLocaleString(lang === 'ar' ? 'ar-MA' : 'en-US');
    return lang === 'ar' ? `${formatted} درهم` : `${formatted} DH`;
  };

  // Localized Vector Fallback in case html2canvas encounters issues
  const executeVectorPdfFallback = (targetLang: Language) => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 16;
    const contentWidth = pageWidth - margin * 2;

    // Header Banner
    doc.setFillColor(11, 19, 43);
    doc.rect(0, 0, pageWidth, 42, 'F');
    doc.setFillColor(245, 158, 11);
    doc.rect(0, 42, pageWidth, 2.5, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text(ptr('blueprintTitle', targetLang), margin, 18);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(203, 213, 225);
    doc.text(ptr('blueprintSubtitle', targetLang), margin, 26);

    const docId = `SA-${Math.abs(Math.round(salary * 31 + totalLiquidFunds)).toString(36).toUpperCase()}-${new Date().getFullYear()}`;
    doc.text(
      `${ptr('docRef', targetLang)}: ${docId}  |  ${ptr('generatedOn', targetLang)}: ${new Date().toLocaleDateString()}  |  ${ptr('baseCurrency', targetLang)}: ${selectedCurrency}`,
      margin,
      34
    );

    let y = 52;
    // Section 1
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(margin, y, contentWidth, 34, 3, 3, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, y, contentWidth, 34, 3, 3, 'S');

    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.text(ptr('page1Title', targetLang), margin + 5, y + 8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);
    const colW = contentWidth / 3;

    doc.text(`${ptr('totalEstimatedBalance', targetLang)}:`, margin + 5, y + 16);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(217, 119, 6);
    doc.text(formatPdfAmount(totalEstimatedBalanceMAD, targetLang), margin + 5, y + 23);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`~${formatMoney(totalEstimatedBalanceMAD, selectedCurrency)}`, margin + 5, y + 28);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);
    doc.text(`${ptr('vaultVsCard', targetLang)}:`, margin + colW + 5, y + 16);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text(`${ptr('vaultLabel', targetLang)}: ${formatPdfAmount(unallocatedVault, targetLang)}`, margin + colW + 5, y + 22);
    doc.text(`${ptr('cardLimitLabel', targetLang)}: ${formatPdfAmount(cardLimit, targetLang)}`, margin + colW + 5, y + 28);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);
    doc.text(`${ptr('spendingDeltaRunway', targetLang)}:`, margin + colW * 2 + 5, y + 16);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    const diffVal = spendDelta.diff;
    const deltaText = diffVal >= 0 ? `+${diffVal.toLocaleString()} DH ${ptr('overBudget', targetLang)}` : `${Math.abs(diffVal).toLocaleString()} DH ${ptr('savedUnderBudget', targetLang)}`;
    doc.text(deltaText, margin + colW * 2 + 5, y + 22);
    doc.setTextColor(16, 185, 129);
    doc.text(`${ptr('runwayMonths', targetLang)}: ${freeCashAnalysis.runwayMonths}`, margin + colW * 2 + 5, y + 28);

    y += 42;
    // Section 2
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.text(ptr('allocMatrixTitle', targetLang), margin, y);

    y += 6;
    doc.setFillColor(241, 245, 249);
    doc.rect(margin, y, contentWidth, 7, 'F');
    doc.setTextColor(71, 85, 105);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text(ptr('colPillar', targetLang), margin + 4, y + 5);
    doc.text(ptr('colShare', targetLang), margin + 95, y + 5);
    doc.text(ptr('colMonthly', targetLang), margin + 120, y + 5);
    doc.text(ptr('colObjective', targetLang), margin + 155, y + 5);

    y += 7;
    const pillarRows = [
      { name: ptr('pillar1Name', targetLang), pct: `${allocations.splits.personal}%`, amt: formatPdfAmount(allocations.personalAmount, targetLang), obj: ptr('pillar1Obj', targetLang) },
      { name: ptr('pillar2Name', targetLang), pct: `${allocations.splits.invest}%`, amt: formatPdfAmount(allocations.investAmount, targetLang), obj: ptr('pillar2Obj', targetLang) },
      { name: ptr('pillar3Name', targetLang), pct: `${allocations.splits.safe}%`, amt: formatPdfAmount(allocations.safeAmount, targetLang), obj: ptr('pillar3Obj', targetLang) },
      { name: ptr('pillar4Name', targetLang), pct: `${allocations.splits.emergency}%`, amt: formatPdfAmount(allocations.emergencyAmount, targetLang), obj: ptr('pillar4Obj', targetLang) },
      { name: ptr('pillar5Name', targetLang), pct: `${allocations.splits.parents}%`, amt: formatPdfAmount(allocations.parentsAmount, targetLang), obj: ptr('pillar5Obj', targetLang) },
      ...customFunds.map(cf => ({
        name: `+ ${cf.name}`,
        pct: `${cf.percent}%`,
        amt: formatPdfAmount(Math.round(salary * (cf.percent / 100)), targetLang),
        obj: ptr('customFundObj', targetLang)
      }))
    ];

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    pillarRows.forEach((r, idx) => {
      if (idx % 2 === 1) {
        doc.setFillColor(248, 250, 252);
        doc.rect(margin, y, contentWidth, 6.2, 'F');
      }
      doc.setTextColor(30, 41, 59);
      doc.text(r.name.substring(0, 45), margin + 4, y + 4.3);
      doc.text(r.pct, margin + 95, y + 4.3);
      doc.setFont('helvetica', 'bold');
      doc.text(r.amt, margin + 120, y + 4.3);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text(r.obj.substring(0, 35), margin + 155, y + 4.3);
      y += 6.2;
    });

    // Summary line
    doc.setDrawColor(203, 213, 225);
    doc.line(margin, y, margin + contentWidth, y);
    y += 5;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text(`${ptr('allocMonthlyBase', targetLang)}: ${formatPdfAmount(salary, targetLang)} (~${formatMoney(salary, selectedCurrency)})  |  ${ptr('totalAllocatedBalanced', targetLang)}`, margin + 4, y);

    y += 12;
    // Section 3: Expenses
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.text(ptr('livingExpensesTitle', targetLang), margin, y);

    y += 5;
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(margin, y, contentWidth, 20, 3, 3, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, y, contentWidth, 20, 3, 3, 'S');

    const burnRatio = salary > 0 ? Math.round((totalExpensesCost / salary) * 100) : 0;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);
    doc.text(`${ptr('totalCommittedCosts', targetLang)}: ${formatPdfAmount(totalExpensesCost, targetLang)}/mo (${burnRatio}% ${ptr('ofSalaryCommitted', targetLang)})`, margin + 5, y + 6);
    doc.text(`${ptr('coveredByPersonal', targetLang)}: ${formatPdfAmount(allocations.personalAmount, targetLang)}  |  ${ptr('unpaidDueThisPeriod', targetLang)}: ${formatPdfAmount(freeCashAnalysis.remainingUnpaidCost, targetLang)}`, margin + 5, y + 13);

    const isSurplus = freeCashBuffer >= 0;
    doc.setTextColor(isSurplus ? 16 : 225, isSurplus ? 185 : 29, isSurplus ? 129 : 72);
    doc.setFont('helvetica', 'bold');
    doc.text(`${ptr('freeCashBuffer', targetLang)}: ${isSurplus ? '+' : ''}${formatPdfAmount(freeCashBuffer, targetLang)}  (${isSurplus ? ptr('surplusCushion', targetLang) : ptr('deficitAlert', targetLang)})`, margin + 105, y + 6);
    doc.setTextColor(71, 85, 105);
    doc.text(`${freeCashAnalysis.runwayMonths} ${ptr('livingRunwayCosts', targetLang)}`, margin + 105, y + 13);

    // Page 1 Footer
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.setFont('helvetica', 'normal');
    doc.text(ptr('page1Footer', targetLang), margin, pageHeight - 10);
    doc.text('https://secretarea.app', pageWidth - margin - 30, pageHeight - 10);

    // PAGE 2
    doc.addPage();
    doc.setFillColor(11, 19, 43);
    doc.rect(0, 0, pageWidth, 20, 'F');
    doc.setFillColor(245, 158, 11);
    doc.rect(0, 20, pageWidth, 1.5, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(ptr('page2Header', targetLang), margin, 12);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(203, 213, 225);
    doc.text(`${ptr('docRef', targetLang)}: ${docId}`, margin, 17);

    y = 30;
    // Section 4: Shield
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.text(ptr('shieldSectionTitle', targetLang), margin, y);

    y += 5;
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(margin, y, contentWidth, 30, 3, 3, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, y, contentWidth, 30, 3, 3, 'S');

    const shieldQuest = quests.find(q => q.id === 'emergency_shield' || q.id === 'six_month_salary_shield') || quests[0];
    const shieldTarget = shieldQuest?.target || salary * 6;
    const shieldCurrent = shieldQuest?.current || 0;
    const shieldPercent = Math.min(100, Math.round((shieldCurrent / Math.max(1, shieldTarget)) * 100));
    const emergencyPillarInflow = allocations.emergencyAmount;
    const monthsToShield = emergencyPillarInflow > 0 ? Math.ceil(Math.max(0, shieldTarget - shieldCurrent) / emergencyPillarInflow) : 0;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text(`${ptr('protectionTarget', targetLang)}: ${formatPdfAmount(shieldTarget, targetLang)} (${ptr('sixMonthsBaselineReserve', targetLang)})`, margin + 5, y + 7);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text(`${ptr('currentAccumulatedReserve', targetLang)}: ${formatPdfAmount(shieldCurrent, targetLang)}  (${shieldPercent}% ${ptr('achieved', targetLang)})`, margin + 5, y + 14);
    doc.text(`${ptr('monthlyAutoFeedInflow', targetLang)}: +${formatPdfAmount(emergencyPillarInflow, targetLang)}/mo (${ptr('fromEmergencyPillar', targetLang)})`, margin + 5, y + 20);
    doc.text(`${ptr('estimatedCompletionPace', targetLang)}: ~${monthsToShield} ${ptr('monthsToInvulnerability', targetLang)}`, margin + 5, y + 26);

    y += 38;
    // Section 5: Income Solutions
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.text(ptr('incomePortfolioTitle', targetLang), margin, y);

    y += 5;
    doc.setFillColor(241, 245, 249);
    doc.rect(margin, y, contentWidth, 6, 'F');
    doc.setTextColor(71, 85, 105);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text(ptr('colStrategyLever', targetLang), margin + 4, y + 4.2);
    doc.text(ptr('colCategory', targetLang), margin + 95, y + 4.2);
    doc.text(ptr('colMonthlyBoost', targetLang), margin + 140, y + 4.2);

    y += 6;
    const solutionsList = [
      { title: ptr('incomeRaiseTitle', targetLang), cat: 'Career', boost: `+${formatPdfAmount(Math.round(salary * 0.2), targetLang)}/mo (+20%)` },
      { title: ptr('incomeFreelanceTitle', targetLang), cat: 'Freelance', boost: `+${formatPdfAmount(1500, targetLang)}/mo` },
      { title: ptr('incomeSpecializedTitle', targetLang), cat: 'Tech & Consulting', boost: `+${formatPdfAmount(3000, targetLang)}/mo` },
      ...customIncomeSolutions.map(cs => ({ title: cs.defaultTitle || cs.titleKey, cat: cs.category || 'Custom', boost: `+${formatPdfAmount(cs.boostAmount, targetLang)}/mo` }))
    ];

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    solutionsList.slice(0, 5).forEach((sol, idx) => {
      if (idx % 2 === 1) {
        doc.setFillColor(248, 250, 252);
        doc.rect(margin, y, contentWidth, 5.5, 'F');
      }
      doc.setTextColor(30, 41, 59);
      doc.text(sol.title.substring(0, 42), margin + 4, y + 4);
      doc.setTextColor(100, 116, 139);
      doc.text(sol.cat, margin + 95, y + 4);
      doc.setTextColor(217, 119, 6);
      doc.setFont('helvetica', 'bold');
      doc.text(sol.boost, margin + 140, y + 4);
      doc.setFont('helvetica', 'normal');
      y += 5.5;
    });

    y += 10;
    // Section 6: Target Purchase
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.text(ptr('targetRoadmapTitle', targetLang), margin, y);

    y += 5;
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(margin, y, contentWidth, 38, 3, 3, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, y, contentWidth, 38, 3, 3, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    doc.text(`${ptr('targetAsset', targetLang)}: ${calcItemName}`, margin + 5, y + 8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);
    doc.text(`${ptr('targetAssetPrice', targetLang)}: ${formatPdfAmount(calcCost, targetLang)} (~${formatMoney(calcCost, selectedCurrency)})`, margin + 5, y + 15);
    doc.text(`${ptr('dedicatedMonthlySavings', targetLang)}: ${formatPdfAmount(calcMonthlySaving, targetLang)}/mo`, margin + 5, y + 22);
    doc.text(`${ptr('standardTimeline', targetLang)}: ${calcMonths} Months (~${(calcMonths / 12).toFixed(1)} ${ptr('yearsToDebtFree', targetLang)})`, margin + 5, y + 29);

    // Fast track box
    doc.setFillColor(238, 242, 255);
    doc.roundedRect(margin + 100, y + 4, contentWidth - 105, 30, 2, 2, 'F');
    doc.setTextColor(67, 56, 202);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text(ptr('aiFastTrackTitle', targetLang), margin + 104, y + 10);
    doc.setFontSize(7.5);
    doc.setTextColor(79, 70, 229);
    doc.text(`${ptr('boostedSavings', targetLang)}: ${formatPdfAmount(fastTrackMonthly, targetLang)}/mo`, margin + 104, y + 17);
    doc.text(`${ptr('targetAchievedIn', targetLang)}: ${targetPurchase.fastTrackMonths} Months`, margin + 104, y + 23);
    doc.setTextColor(16, 185, 129);
    doc.text(`${ptr('timeSavedEarlier', targetLang)}: ${Math.max(0, calcMonths - targetPurchase.fastTrackMonths)} ${ptr('monthsEarlier', targetLang)}`, margin + 104, y + 29);

    y += 46;
    // Quotes
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(margin, y, contentWidth, 22, 2, 2, 'F');
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.text(ptr('wealthQuote1', targetLang), margin + 8, y + 7);
    doc.text(ptr('wealthQuote2', targetLang), margin + 8, y + 13);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text(ptr('verifiedStatus', targetLang), margin + 8, y + 19);

    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.setFont('helvetica', 'normal');
    doc.text(ptr('page2Footer', targetLang), margin, pageHeight - 10);

    const docFileName = `SecretArea_WealthBlueprint_${targetLang.toUpperCase()}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(docFileName);
    setActionSuccessMessage(ptr('pdfReadySuccess', targetLang));
    setTimeout(() => setActionSuccessMessage(''), 3500);
  };

  // Executive Multi-Language 2-Page PDF Generation via HTML2Canvas (Full Arabic RTL & Accent Fidelity)
  const handleDownloadPDF = async (targetLang?: Language) => {
    const chosenLang: Language = targetLang || pdfLanguage || language;
    setPdfLanguage(chosenLang);
    setIsGeneratingPDF(true);

    try {
      // 1. Ensure web fonts (Cairo, Inter) are loaded and rasterized
      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
      }
      // 2. Allow React DOM update to render target language template
      await new Promise(resolve => setTimeout(resolve, 250));

      const page1El = document.getElementById('pdf-blueprint-page-1');
      const page2El = document.getElementById('pdf-blueprint-page-2');

      if (page1El && page2El) {
        const [canvas1, canvas2] = await Promise.all([
          html2canvas(page1El, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff',
            width: 794,
            height: 1123,
            windowWidth: 794,
            windowHeight: 1123,
          }),
          html2canvas(page2El, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff',
            width: 794,
            height: 1123,
            windowWidth: 794,
            windowHeight: 1123,
          }),
        ]);

        const doc = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4',
          compress: true,
        });

        const imgData1 = canvas1.toDataURL('image/jpeg', 0.98);
        doc.addImage(imgData1, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');

        doc.addPage();
        const imgData2 = canvas2.toDataURL('image/jpeg', 0.98);
        doc.addImage(imgData2, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');

        const fileName = `SecretArea_WealthBlueprint_${chosenLang.toUpperCase()}_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(fileName);
        setActionSuccessMessage(ptr('pdfReadySuccess', chosenLang));
        setTimeout(() => setActionSuccessMessage(''), 3500);
        return;
      }
    } catch (err) {
      console.warn('html2canvas rendering fell back to vector jsPDF:', err);
      executeVectorPdfFallback(chosenLang);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Smart In-Section Financial Pointer Component (Replaces popup modal and floating arrows)
  const SmartSectionPointer = ({
    number,
    title,
    desc,
    badgeText,
    metricChip,
  }: {
    number: number;
    title: string;
    desc: string;
    badgeText?: string;
    metricChip?: string;
  }) => {
    if (!showStickyAnnotations) return null;

    return (
      <div className="mb-5 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent dark:from-amber-500/15 dark:via-amber-500/5 dark:to-transparent border border-amber-500/25 dark:border-amber-500/30 shadow-2xs relative overflow-hidden transition-all duration-300">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
              P{number}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  {badgeText || `${tr('pointerBadge')} #${number}`}
                </span>
                {metricChip && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white/90 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-amber-500/20 shadow-2xs">
                    {metricChip}
                  </span>
                )}
              </div>
              <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white mt-0.5">
                {title}
              </h4>
            </div>
          </div>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 sm:ps-11 leading-relaxed">
          {desc}
        </p>
      </div>
    );
  };

  return (
    <div className="w-full text-slate-900 dark:text-white transition-colors duration-200" dir={dir}>
      
      {/* ============================================================== */}
      {/* 1. TOP HEADER & QUICK TOOLBAR (Responsive Laptop, Tablet, Mobile) */}
      {/* ============================================================== */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-5 md:p-6 mb-6 sm:mb-8 shadow-sm">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>{tr('activeVaultBadge')}</span>
              </span>
              <span className="text-[10px] sm:text-xs text-slate-400 font-mono">ID: SA-VAULT-1337</span>
            </div>
            <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-black uppercase tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
              <Icon name="Wallet" className="text-amber-500 shrink-0" size={26} />
              <span>{tr('walletTitle')}</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl mt-1 leading-relaxed">
              {tr('walletSubtitle')}
            </p>
          </div>

          {/* Controls: Visual Pointers Toggle & Executive PDF Blueprint */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 w-full lg:w-auto">
            {/* TOGGLE SMART VISUAL POINTERS ON/OFF */}
            <button
              type="button"
              onClick={() => setShowStickyAnnotations(prev => !prev)}
              className={`flex-1 sm:flex-none px-3.5 sm:px-4 py-2 sm:py-2.5 min-h-[40px] sm:min-h-[44px] rounded-2xl border text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 ${
                showStickyAnnotations
                  ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-500 text-amber-800 dark:text-amber-300 shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-400'
              }`}
              title="Toggle smart inline visual pointers on page"
            >
              <Icon name="Sparkles" size={16} className={showStickyAnnotations ? 'text-amber-500' : ''} />
              <span>{tr('visualPointersBtn')}</span>
              <span className="text-[10px] sm:text-xs font-mono px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10 font-bold">
                {showStickyAnnotations ? tr('onState') : tr('offState')}
              </span>
            </button>

            {/* SAVE PDF ROADMAP WITH MULTI-LANGUAGE EXPORT */}
            <div className="relative flex items-center flex-1 sm:flex-none">
              <button
                type="button"
                onClick={() => handleDownloadPDF(pdfLanguage)}
                disabled={isGeneratingPDF}
                className="flex-1 sm:flex-none px-3.5 sm:px-4 py-2 sm:py-2.5 min-h-[40px] sm:min-h-[44px] rounded-s-2xl bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 disabled:opacity-60 text-white dark:text-slate-900 text-xs sm:text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all cursor-pointer"
                title={`Download Executive PDF Blueprint in ${pdfLanguage.toUpperCase()}`}
              >
                {isGeneratingPDF ? (
                  <>
                    <Icon name="Loader2" size={16} className="animate-spin text-amber-500" />
                    <span>{ptr('generatingPdf', pdfLanguage)}</span>
                  </>
                ) : (
                  <>
                    <Icon name="Download" size={16} />
                    <span>{tr('downloadPlan')}</span>
                    <span className="text-[10px] sm:text-xs px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 dark:text-amber-600 font-mono font-bold uppercase">
                      {pdfLanguage}
                    </span>
                  </>
                )}
              </button>

              {/* Language Selector Dropdown Toggle */}
              <button
                type="button"
                onClick={() => setShowPdfLangDropdown(prev => !prev)}
                className="px-2.5 sm:px-3 py-2 sm:py-2.5 min-h-[40px] sm:min-h-[44px] rounded-e-2xl bg-slate-800 dark:bg-slate-200 hover:bg-slate-700 dark:hover:bg-slate-300 text-white dark:text-slate-900 border-s border-slate-700 dark:border-slate-300 transition-all cursor-pointer flex items-center justify-center active:scale-95"
                title="Select PDF Language"
              >
                <Icon name="Globe" size={15} />
              </button>

              {/* PDF Language Popover */}
              {showPdfLangDropdown && (
                <div
                  className="absolute top-full right-0 mt-2 z-50 w-52 p-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-1"
                  onClick={e => e.stopPropagation()}
                >
                  <p className="text-[10px] sm:text-xs uppercase font-bold text-slate-400 px-2 py-1 tracking-wider">
                    {ptr('chooseLanguage', language)}
                  </p>
                  {(['en', 'fr', 'es', 'ar'] as Language[]).map(langCode => (
                    <button
                      key={langCode}
                      type="button"
                      onClick={() => {
                        setPdfLanguage(langCode);
                        setShowPdfLangDropdown(false);
                        handleDownloadPDF(langCode);
                      }}
                      className={`w-full px-3 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-between cursor-pointer transition-colors ${
                        pdfLanguage === langCode
                          ? 'bg-amber-500 text-slate-950 font-black'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span className="capitalize">
                        {langCode === 'en' ? 'English' : langCode === 'fr' ? 'Français' : langCode === 'es' ? 'Español' : 'العربية (Arabic)'}
                      </span>
                      <span className="text-[10px] uppercase font-mono font-bold opacity-75">{langCode}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. MASTER BALANCE & VIRTUAL CARD ROW (Connected Real-Time Math) */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 mb-6 sm:mb-8">
        
        {/* BALANCE DECK (7 Cols on LG, full width on mobile/tablet) */}
        <div
          id="guide-balance-card"
          className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-6 md:p-7 relative overflow-hidden shadow-sm flex flex-col justify-between"
        >
          {/* SMART IN-SECTION POINTER 1 */}
          <SmartSectionPointer
            number={1}
            title={tr('pointer1Title')}
            desc={tr('pointer1Desc')}
            metricChip={`${formatMoney(totalEstimatedBalanceMAD, selectedCurrency)} • Vault: ${unallocatedVault.toLocaleString()} DH`}
          />

          <div>
            {/* Header: Title, Visibility & Currency Switcher */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {tr('totalBalance')}
                </span>
                <button
                  type="button"
                  onClick={() => setIsBalanceHidden(!isBalanceHidden)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  title={isBalanceHidden ? tr('showBalance') : tr('hideBalance')}
                >
                  <Icon name={isBalanceHidden ? 'Eye' : 'EyeOff'} size={16} />
                </button>
              </div>

              {/* CURRENCY SELECTOR PILLS (Responsive scrollable/wrap on mobile & tablet) */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700/60 overflow-x-auto no-scrollbar">
                {Object.keys(CURRENCY_RATES).map(cur => (
                  <button
                    key={cur}
                    type="button"
                    onClick={() => setSelectedCurrency(cur)}
                    className={`px-2.5 sm:px-3 py-1 sm:py-1.5 min-h-[30px] sm:min-h-[34px] rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                      selectedCurrency === cur
                        ? 'bg-amber-500 text-white shadow-sm scale-105'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {cur}
                  </button>
                ))}
              </div>
            </div>

            {/* DIRECT BALANCE EDITOR / DISPLAY */}
            <div className="mb-4">
              {isEditingBalance ? (
                <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm font-bold text-amber-700 dark:text-amber-300">
                      {tr('adjustBalanceDirectly')}
                    </span>
                    <span className="text-[10px] sm:text-xs text-slate-500 font-mono">MAD</span>
                  </div>
                  <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      step="500"
                      value={editBalanceInput}
                      onChange={e => setEditBalanceInput(e.target.value)}
                      placeholder={totalEstimatedBalanceMAD.toString()}
                      className="flex-1 w-full sm:w-auto px-3.5 py-2 text-lg sm:text-xl md:text-2xl font-black font-mono bg-white dark:bg-slate-900 border border-amber-400 rounded-xl outline-none text-slate-900 dark:text-white"
                      autoFocus
                    />
                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                      <button
                        type="button"
                        onClick={() => handleUpdateTotalBalance(Number(editBalanceInput) || 0)}
                        className="flex-1 sm:flex-none px-4 py-2 sm:py-2.5 min-h-[38px] sm:min-h-[42px] rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs sm:text-sm uppercase tracking-wider transition-all active:scale-95 cursor-pointer shadow-sm flex items-center justify-center gap-1"
                      >
                        {tr('saveBalance')}
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditingBalance(false)}
                        className="px-3.5 py-2 sm:py-2.5 min-h-[38px] sm:min-h-[42px] rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs sm:text-sm transition-all active:scale-95 cursor-pointer flex items-center justify-center"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
                    <span>{tr('autoSyncAllocatorToggle')}</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={autoSyncBalanceToAllocator}
                        onChange={e => setAutoSyncBalanceToAllocator(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-8 h-4 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-amber-500"></div>
                    </label>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-baseline gap-2.5 sm:gap-3">
                    <span className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white font-mono tracking-tight break-all sm:break-normal">
                      {convertedDisplayBalance}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setEditBalanceInput(totalEstimatedBalanceMAD.toString());
                        setIsEditingBalance(true);
                      }}
                      className="p-2 sm:p-2.5 rounded-xl bg-slate-100 hover:bg-amber-100 dark:bg-slate-800 dark:hover:bg-amber-950/40 text-slate-600 hover:text-amber-600 dark:text-slate-400 dark:hover:text-amber-400 transition-all cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
                      title={tr('editBalanceTooltip')}
                    >
                      <Icon name="Pencil" size={16} />
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSyncBalanceToAllocator}
                      className="px-3 py-1.5 sm:py-2 min-h-[34px] sm:min-h-[38px] rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/50 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs sm:text-sm font-bold transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 shadow-2xs"
                      title={tr('syncBalanceToSalary')}
                    >
                      <Icon name="RefreshCw" size={13} />
                      <span>{tr('syncBalanceToSalary')}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* QUICK INFLOW DEPOSIT CHIPS & CONNECTED METRICS */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 mb-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">
                  {tr('quickAdd')}:
                </span>
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  {[1000, 5000, 10000, 25000].map(amt => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => handleQuickAddBalance(amt)}
                      className="px-2.5 sm:px-3 py-1 sm:py-1.5 min-h-[32px] sm:min-h-[36px] rounded-lg text-xs sm:text-sm font-bold font-mono bg-white dark:bg-slate-800 hover:bg-amber-500 hover:text-white dark:hover:bg-amber-500 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-2xs transition-all active:scale-95 cursor-pointer flex items-center justify-center"
                    >
                      +{amt.toLocaleString()} DH
                    </button>
                  ))}
                </div>
              </div>

              {/* DYNAMIC INTERCONNECTED METRICS: Runway, Burn, Vault (Responsive 2 cols mobile, 4 cols tablet/laptop) */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-800/80 text-xs">
                <div className="p-2 sm:p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
                  <span className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase block">{tr('financialRunway')}</span>
                  <span className="font-mono font-black text-xs sm:text-sm text-emerald-600 dark:text-emerald-400 mt-0.5">
                    {financialRunwayMonths} {tr('runwayMonthsText')}
                  </span>
                </div>
                <div className="p-2 sm:p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
                  <span className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase block">{tr('monthlyBurnRate')}</span>
                  <span className="font-mono font-black text-xs sm:text-sm text-amber-600 dark:text-amber-400 mt-0.5">
                    {monthlyBurnRatePercent}% / mo
                  </span>
                </div>
                <div className="p-2 sm:p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
                  <span className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase block">{tr('vaultBalanceLabel')}</span>
                  <span className="font-mono font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200 mt-0.5">
                    {unallocatedVault.toLocaleString()} DH
                  </span>
                </div>
                <div className="p-2 sm:p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
                  <span className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase block">{tr('cardAllocationLabel')}</span>
                  <span className="font-mono font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200 mt-0.5">
                    {cardLimit.toLocaleString()} DH
                  </span>
                </div>
              </div>
            </div>

            {/* MULTI-CURRENCY CONVERSION CONTEXT STRIP (Responsive 2 cols mobile, 4 cols tablet/laptop) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80">
              {['MAD', 'USD', 'EUR', 'BTC'].map(c => (
                <div key={c} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
                  <span className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase block">
                    {c} {tr('equivalentLabel')}
                  </span>
                  <span className="text-xs sm:text-sm font-bold font-mono text-slate-700 dark:text-slate-200 mt-0.5">
                    {formatMoney(totalEstimatedBalanceMAD, c)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ACTION BUTTONS (Responsive full-width on mobile, side-by-side on tablet/laptop) */}
          <div id="guide-quick-actions" className="pt-4 sm:pt-5 mt-4 sm:mt-5 border-t border-slate-100 dark:border-slate-800 relative">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
              <button
                type="button"
                onClick={() => setActiveActionModal('add')}
                className="flex items-center justify-center gap-2 py-3 sm:py-3.5 px-4 min-h-[42px] sm:min-h-[46px] rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs sm:text-sm uppercase tracking-wider transition-all active:scale-95 cursor-pointer shadow-md shadow-amber-500/20"
              >
                <Icon name="Plus" size={17} className="text-white shrink-0" />
                <span>{tr('addFunds')}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveActionModal('swap')}
                className="flex items-center justify-center gap-2 py-3 sm:py-3.5 px-4 min-h-[42px] sm:min-h-[46px] rounded-2xl bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-900/40 font-bold text-xs sm:text-sm uppercase tracking-wider transition-all active:scale-95 cursor-pointer shadow-sm"
              >
                <Icon name="ArrowsShuffle" size={17} className="text-purple-500 shrink-0" />
                <span>{tr('swapCurrencies')}</span>
              </button>
            </div>
          </div>
        </div>

        {/* VIRTUAL TITANIUM CARD & CONNECTED LAST MONTH SPEND (5 Cols on LG, full width on mobile/tablet) */}
        <div
          id="guide-card-simulator"
          className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-6 md:p-7 flex flex-col justify-between shadow-sm relative"
        >
          {/* SMART IN-SECTION POINTER 2 */}
          <SmartSectionPointer
            number={2}
            title={tr('pointer2Title')}
            desc={tr('pointer2Desc')}
            metricChip={`Limit: ${cardLimit.toLocaleString()} DH • Benchmark: ${lastMonthSpend.toLocaleString()} DH`}
          />

          <div>
            <div className="flex items-center justify-between mb-3.5 sm:mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {tr('titaniumVipCard')}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/25 text-[10px] sm:text-xs font-black uppercase tracking-wider">
                  TITANIUM VIP
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-emerald-500 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Active</span>
              </div>
            </div>

            {/* THE TITANIUM VIP CARD (Animated holographic sweep, 3D hover lift, metallic brush) */}
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              transition={{ duration: 0.3 }}
              className="w-full aspect-[1.58/1] min-h-[190px] sm:min-h-[220px] md:min-h-[235px] rounded-2xl p-4 sm:p-5 md:p-6 relative overflow-hidden transition-all duration-500 shadow-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950 text-white border border-amber-500/40 select-none group"
            >
              {/* Continuous holographic light sweep sheen animation */}
              <motion.div
                animate={{
                  x: ['-100%', '200%'],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 4,
                  ease: 'easeInOut',
                }}
                className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-[-20deg] pointer-events-none"
              />

              {/* Brushed metal noise texture overlay */}
              <div className="absolute inset-0 bg-radial-gradient from-amber-500/5 via-transparent to-black/40 pointer-events-none"></div>

              <div className="relative z-10 flex flex-col justify-between h-full text-white">
                {/* Card Top: EMV Chip, NFC signal, Brand */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    {/* Golden EMV Chip with micro circuit glow */}
                    <div className="w-8 sm:w-9 h-6 sm:h-7 rounded-md bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 border border-amber-200/80 shadow-md shadow-amber-400/30 flex items-center justify-center p-1 relative">
                      <div className="w-full h-full border border-amber-900/30 rounded-xs flex flex-col justify-between">
                        <div className="h-1/3 border-b border-amber-900/20"></div>
                        <div className="h-1/3 border-b border-amber-900/20"></div>
                      </div>
                    </div>
                    {/* Contactless waves icon */}
                    <div className="flex items-center text-amber-300">
                      <Icon name="Wifi" size={16} className="rotate-90 animate-pulse" />
                    </div>
                  </div>
                  <div className="text-end">
                    <span className="text-[10px] sm:text-xs md:text-sm font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-500 uppercase drop-shadow-xs">
                      SECRETAREA TITANIUM
                    </span>
                    <span className="text-[8px] sm:text-[9px] block text-amber-400/80 font-mono tracking-wider">
                      CONTACTLESS NFC
                    </span>
                  </div>
                </div>

                {/* Card Number with 1-Click Copy and Toast confirmation */}
                <div className="my-1.5 sm:my-2">
                  <button
                    type="button"
                    onClick={handleCopyCardNumber}
                    className="w-full text-start group/copy cursor-pointer"
                    title={tr('tapToCopy')}
                  >
                    <div className="font-mono text-sm sm:text-base md:text-lg lg:text-xl font-bold tracking-widest flex items-center justify-between text-slate-100 group-hover/copy:text-amber-300 transition-colors">
                      <span>4532  8910  2341  1337</span>
                      <span className="p-1 sm:p-1.5 rounded-md bg-white/10 group-hover/copy:bg-amber-400/20 text-amber-300 transition-colors">
                        <Icon name={cardCopied ? 'Check' : 'Copy'} size={14} />
                      </span>
                    </div>
                    <span className="text-[9px] sm:text-[10px] text-slate-400 group-hover/copy:text-amber-300/80 block mt-0.5">
                      {cardCopied ? tr('numberCopied') : tr('tapToCopy')}
                    </span>
                  </button>
                </div>

                {/* Footer Details: Cardholder, Expiry, CVV */}
                <div className="flex items-end justify-between text-xs pt-1 border-t border-white/10">
                  <div>
                    <span className="text-[8px] sm:text-[9px] uppercase tracking-wider text-slate-400 block">{tr('cardHolder')}</span>
                    <span className="font-bold tracking-wider text-slate-200 uppercase text-[11px] sm:text-xs">SECRETAREA VIP</span>
                  </div>
                  <div className="text-center">
                    <span className="text-[8px] sm:text-[9px] uppercase tracking-wider text-slate-400 block">{tr('expires')}</span>
                    <span className="font-mono font-bold text-slate-200 text-[11px] sm:text-xs">09 / 30</span>
                  </div>
                  <div className="text-end">
                    <span className="text-[8px] sm:text-[9px] uppercase tracking-wider text-slate-400 block">CVV</span>
                    <span className="font-mono font-bold text-amber-400 text-[11px] sm:text-xs">842</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* CONNECTED LAST MONTH SPEND BENCHMARK CARD */}
          <div className="pt-3.5 sm:pt-4 mt-3.5 sm:mt-4">
            <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/25 border border-amber-200/80 dark:border-amber-900/50 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                    <Icon name="Activity" size={16} />
                  </div>
                  <div>
                    <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight block">
                      {tr('lastMonthSpendTitle')}
                    </span>
                    <span className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400">
                      Benchmark linked to Allocator & Balance
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditingLastMonth(!isEditingLastMonth)}
                  className="px-2.5 sm:px-3 py-1 sm:py-1.5 min-h-[30px] sm:min-h-[34px] rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] sm:text-xs text-amber-600 dark:text-amber-400 font-bold hover:bg-amber-50 cursor-pointer transition-all active:scale-95 flex items-center justify-center"
                >
                  {isEditingLastMonth ? tr('saveBalance') : tr('editSpend')}
                </button>
              </div>

              {isEditingLastMonth ? (
                <div className="flex items-center gap-2 my-1">
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={lastMonthSpend}
                    onChange={e => setLastMonthSpend(Math.max(0, Number(e.target.value)))}
                    className="flex-1 px-3 py-2 text-xs sm:text-sm font-mono font-bold bg-white dark:bg-slate-900 border border-amber-400 rounded-lg outline-none text-slate-900 dark:text-white"
                  />
                  <span className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300">DH</span>
                </div>
              ) : (
                <div className="flex items-baseline justify-between">
                  <span className="text-xl sm:text-2xl md:text-3xl font-black font-mono text-slate-900 dark:text-white tracking-tight">
                    {lastMonthSpend.toLocaleString()} DH
                  </span>
                  <div className="text-end">
                    <span className="text-[10px] sm:text-xs text-slate-400 block uppercase font-bold">{tr('netMonthlySurplus')}</span>
                    <span
                      className={`text-xs sm:text-sm md:text-base font-black font-mono ${
                        netMonthlySurplusMAD >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                      }`}
                    >
                      {netMonthlySurplusMAD >= 0 ? '+' : ''}{netMonthlySurplusMAD.toLocaleString()} DH/mo
                    </span>
                  </div>
                </div>
              )}

              {/* Connected Financial Runway & Capital Burn Info */}
              <div className="p-2 sm:p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-amber-200/50 dark:border-amber-900/30 flex items-center justify-between text-xs sm:text-sm">
                <div>
                  <span className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase block">{tr('financialRunway')}</span>
                  <span className="font-mono font-bold text-xs sm:text-sm text-emerald-600 dark:text-emerald-400">
                    {financialRunwayMonths} {tr('runwayMonthsText')}
                  </span>
                </div>
                <div className="h-6 w-px bg-slate-200 dark:bg-slate-800"></div>
                <div className="text-end">
                  <span className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase block">{tr('monthlyBurnRate')}</span>
                  <span className="font-mono font-bold text-xs sm:text-sm text-amber-600 dark:text-amber-400">
                    {monthlyBurnRatePercent}% of Balance
                  </span>
                </div>
              </div>

              {/* Connected Actions with Smart Allocator & Expenses */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleAlignPersonalFundToSpend}
                  className="w-full py-2.5 sm:py-3 px-2.5 sm:px-3 min-h-[38px] sm:min-h-[42px] rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/25 text-xs sm:text-sm font-bold transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                  title="Tune Smart Allocator personal fund share to match last month spend"
                >
                  <Icon name="Sliders" size={14} />
                  <span className="truncate">{tr('alignPersonalFund')}</span>
                </button>

                <button
                  type="button"
                  onClick={handleSyncSpendWithExpenses}
                  className="w-full py-2.5 sm:py-3 px-2.5 sm:px-3 min-h-[38px] sm:min-h-[42px] rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-bold transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                  title="Match benchmark with current committed expenses"
                >
                  <Icon name="RefreshCw" size={14} />
                  <span className="truncate">{tr('syncWithExpenses')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ============================================================== */}
      {/* 3. SMART INCOME & BUDGET ALLOCATOR (Responsive Laptop, Tablet, Mobile) */}
      {/* ============================================================== */}
      <div
        id="guide-allocator"
        className="bg-white/95 dark:bg-slate-900/95 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-4 sm:p-6 md:p-8 mb-6 sm:mb-8 shadow-sm hover:shadow-md transition-all duration-300 relative backdrop-blur-xs"
      >
        {/* SMART IN-SECTION POINTER 4 */}
        <SmartSectionPointer
          number={4}
          title={tr('pointer4Title')}
          desc={tr('pointer4Desc')}
          metricChip={`Salary: ${salary.toLocaleString()} DH • 5 Pillars + ${customFunds.length} Custom Funds`}
        />

        {/* SECTION HEADER: Title, Subtitle & Responsive Presets */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5 sm:mb-6 pb-5 sm:pb-6 border-b border-slate-100 dark:border-slate-800/80">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 text-amber-600 dark:text-amber-400 border border-amber-500/25 flex items-center justify-center shrink-0 shadow-xs">
                <Icon name="Database" size={20} />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl md:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                  {tr('allocatorTitle')}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 max-w-2xl leading-relaxed">
                  {tr('allocatorDesc')}
                </p>
              </div>
            </div>
          </div>

          {/* SALARY PRESETS (Responsive Segmented Pills - No Clipping on Mobile/Tablet) */}
          <div className="flex flex-wrap items-center gap-2 self-start lg:self-center">
            <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0">
              {tr('presets')}:
            </span>
            <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
              {[
                { label: '3,000 DH', value: 3000 },
                { label: '5,500 DH', value: 5500 },
                { label: '8,500 DH', value: 8500 },
                { label: '16,000 DH', value: 16000 },
                { label: '35,000 DH', value: 35000 },
              ].map(p => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setSalary(p.value)}
                  className={`px-2.5 sm:px-3.5 py-1.5 sm:py-2 min-h-[34px] sm:min-h-[38px] rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 active:scale-95 cursor-pointer whitespace-nowrap flex items-center justify-center ${
                    salary === p.value
                      ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/25 scale-105'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/70 dark:hover:bg-slate-700/60'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* TOP COCKPIT: Left (Salary Engine) & Right (Distribution Bar & Controls) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch mb-6">
          
          {/* SALARY CUSTOM INPUT & DYNAMIC RANGE SLIDER */}
          <div className="lg:col-span-5 bg-gradient-to-br from-slate-50/90 via-white to-amber-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-amber-950/20 p-4 sm:p-5 md:p-6 rounded-3xl border border-slate-200/90 dark:border-slate-800 flex flex-col justify-between shadow-xs transition-all hover:border-amber-500/40 gap-4">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Icon name="Sliders" size={15} className="text-amber-500" />
                  {tr('monthlySalaryInput')}
                </span>
                <div className="flex items-center gap-1 font-mono text-xs sm:text-sm">
                  <button
                    type="button"
                    onClick={() => setSalary(prev => Math.max(500, prev - 1000))}
                    className="px-2 sm:px-2.5 py-1 sm:py-1.5 min-h-[32px] sm:min-h-[36px] rounded-lg bg-slate-200/80 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold transition-all active:scale-95 cursor-pointer flex items-center justify-center"
                    title="-1000 DH"
                  >
                    -1k
                  </button>
                  <button
                    type="button"
                    onClick={() => setSalary(prev => Math.max(500, prev - 500))}
                    className="px-2 sm:px-2.5 py-1 sm:py-1.5 min-h-[32px] sm:min-h-[36px] rounded-lg bg-slate-200/80 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold transition-all active:scale-95 cursor-pointer flex items-center justify-center"
                    title="-500 DH"
                  >
                    -500
                  </button>
                  <button
                    type="button"
                    onClick={() => setSalary(prev => Math.min(60000, prev + 500))}
                    className="px-2 sm:px-2.5 py-1 sm:py-1.5 min-h-[32px] sm:min-h-[36px] rounded-lg bg-slate-200/80 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold transition-all active:scale-95 cursor-pointer flex items-center justify-center"
                    title="+500 DH"
                  >
                    +500
                  </button>
                  <button
                    type="button"
                    onClick={() => setSalary(prev => Math.min(60000, prev + 1000))}
                    className="px-2 sm:px-2.5 py-1 sm:py-1.5 min-h-[32px] sm:min-h-[36px] rounded-lg bg-slate-200/80 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold transition-all active:scale-95 cursor-pointer flex items-center justify-center"
                    title="+1000 DH"
                  >
                    +1k
                  </button>
                </div>
              </div>

              <div className="relative flex items-baseline justify-between gap-3 py-1">
                <input
                  type="number"
                  min="500"
                  max="60000"
                  step="250"
                  value={salary}
                  onChange={e => setSalary(Math.max(500, Number(e.target.value)))}
                  className="w-full bg-transparent text-2xl sm:text-3xl md:text-4xl font-black font-mono tracking-tight text-slate-900 dark:text-white outline-none focus:text-amber-600 dark:focus:text-amber-400 transition-colors"
                />
                <span className="shrink-0 px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-xs sm:text-sm">
                  DH / mo
                </span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <input
                type="range"
                min="2000"
                max="60000"
                step="500"
                value={salary}
                onChange={e => setSalary(Number(e.target.value))}
                className="w-full accent-amber-500 h-2 sm:h-2.5 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer transition-all"
              />
              <div className="flex justify-between items-center text-[10px] sm:text-xs font-mono text-slate-400 px-0.5">
                <span>2,000 DH</span>
                <span className="font-bold text-amber-600 dark:text-amber-400">{salary.toLocaleString()} DH</span>
                <span>60,000 DH</span>
              </div>
            </div>

            {/* LIVE CONNECTION STRIP: Total Estimated Balance <-> Allocator */}
            <div className="pt-3 mt-1 border-t border-slate-200/60 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-bold">
                  {tr('connectedTotalBalanceBadge')}:
                </span>
                <span className="font-mono font-black text-blue-600 dark:text-blue-400 text-xs sm:text-sm">
                  {totalEstimatedBalanceMAD.toLocaleString()} DH
                </span>
              </div>
              <button
                type="button"
                onClick={handleSyncBalanceToAllocator}
                className="px-2.5 sm:px-3 py-1 sm:py-1.5 min-h-[32px] sm:min-h-[36px] rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs sm:text-sm font-bold transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                title="Sync salary directly from Total Liquid Balance"
              >
                <Icon name="RefreshCw" size={13} />
                <span>{tr('syncBalanceToSalary')}</span>
              </button>
            </div>
          </div>

          {/* ALLOCATION VISUAL BAR & TOOLBAR */}
          <div className="lg:col-span-7 bg-slate-50/80 dark:bg-slate-950/60 p-4 sm:p-5 md:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between gap-4">
            <div>
              <div className="flex flex-wrap justify-between items-center text-xs text-slate-500 gap-2 mb-3">
                <span className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm md:text-base">
                  {tr('pillarDistributionTitle')}
                </span>
                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                  {allocations.isOverAllocated ? (
                    <span className="px-2.5 py-1 rounded-xl text-[10px] sm:text-xs font-black bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 animate-pulse">
                      ⚠️ {tr('overAllocatedStatus') || 'Over-allocated'} ({allocations.totalAllocatedPercent}%)
                    </span>
                  ) : allocations.unallocatedPercent > 0 ? (
                    <span className="px-2.5 py-1 rounded-xl text-[10px] sm:text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                      {tr('unallocatedStatus') || 'Unallocated'}: {allocations.unallocatedPercent}% ({allocations.unallocatedAmount.toLocaleString()} DH)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs sm:text-sm border border-emerald-500/20">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
                      {tr('balancedStatus') || '100% Balanced'}
                    </span>
                  )}

                  {/* AUTO-OPTIMIZE BEST % BUTTON */}
                  <button
                    type="button"
                    onClick={handleAutoOptimizeSplits}
                    className="px-3 sm:px-3.5 py-1.5 sm:py-2 min-h-[36px] sm:min-h-[40px] rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs sm:text-sm font-bold transition-all duration-200 active:scale-95 cursor-pointer flex items-center gap-1.5 shadow-sm shadow-amber-500/20"
                    title={tr('autoOptimizeSplitsBtn')}
                  >
                    <Icon name="Sparkles" size={14} />
                    <span>{tr('autoOptimizeSplitsBtn')}</span>
                  </button>

                  {/* ADD CUSTOM FUND BUTTON */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowAddFundModal(true);
                    }}
                    className="px-3 sm:px-3.5 py-1.5 sm:py-2 min-h-[36px] sm:min-h-[40px] rounded-xl bg-teal-500/15 hover:bg-teal-500/25 text-teal-700 dark:text-teal-300 text-xs sm:text-sm font-bold transition-all duration-200 active:scale-95 cursor-pointer flex items-center gap-1.5 border border-teal-500/25"
                    title={tr('addCustomFundBtn')}
                  >
                    <Icon name="Plus" size={14} />
                    <span>{tr('addCustomFundBtn')}</span>
                  </button>

                  {(customSplits || customFunds.length > 0) && (
                    <button
                      type="button"
                      onClick={handleResetSplits}
                      className="text-xs sm:text-sm text-slate-400 hover:text-rose-500 underline font-bold cursor-pointer transition-colors px-1"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>

              {/* SEGMENTED ALLOCATION VISUAL BAR */}
              <div className="h-4 sm:h-5 md:h-6 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden flex p-0.5 gap-0.5 shadow-inner">
                <div
                  style={{ width: `${allocations.splits.personal}%` }}
                  className="bg-blue-500 h-full rounded-full transition-all duration-500 ease-out"
                  title={`Personal: ${allocations.splits.personal}% (${allocations.personalAmount.toLocaleString()} DH)`}
                />
                <div
                  style={{ width: `${allocations.splits.invest}%` }}
                  className="bg-amber-500 h-full rounded-full transition-all duration-500 ease-out"
                  title={`Invest: ${allocations.splits.invest}% (${allocations.investAmount.toLocaleString()} DH)`}
                />
                <div
                  style={{ width: `${allocations.splits.safe}%` }}
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500 ease-out"
                  title={`Safe Savings: ${allocations.splits.safe}% (${allocations.safeAmount.toLocaleString()} DH)`}
                />
                <div
                  style={{ width: `${allocations.splits.emergency}%` }}
                  className="bg-rose-500 h-full rounded-full transition-all duration-500 ease-out"
                  title={`Emergency: ${allocations.splits.emergency}% (${allocations.emergencyAmount.toLocaleString()} DH)`}
                />
                <div
                  style={{ width: `${allocations.splits.parents}%` }}
                  className="bg-purple-500 h-full rounded-full transition-all duration-500 ease-out"
                  title={`Family: ${allocations.splits.parents}% (${allocations.parentsAmount.toLocaleString()} DH)`}
                />
                {customFunds.map(cf => (
                  <div
                    key={cf.id}
                    style={{ width: `${cf.percent}%` }}
                    className="bg-teal-500 h-full rounded-full transition-all duration-500 ease-out"
                    title={`${cf.name}: ${cf.percent}% (${Math.round(salary * ((cf.percent || 0) / 100)).toLocaleString()} DH)`}
                  />
                ))}
              </div>

              {/* QUICK PILLAR SUMMARY BADGES (Responsive wrapping for all screens) */}
              <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1.5 mt-3 text-xs sm:text-sm font-mono">
                <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                  <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
                  {tr('personalFund')}: {allocations.splits.personal}% ({allocations.personalAmount.toLocaleString()} DH)
                </span>
                <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                  <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                  {tr('investFund')}: {allocations.splits.invest}% ({allocations.investAmount.toLocaleString()} DH)
                </span>
                <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                  {tr('savingsFund')}: {allocations.splits.safe}% ({allocations.safeAmount.toLocaleString()} DH)
                </span>
                <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
                  <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
                  {tr('emergencyFund')}: {allocations.splits.emergency}% ({allocations.emergencyAmount.toLocaleString()} DH)
                </span>
                <span className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400">
                  <span className="w-2 h-2 rounded-full bg-purple-500 inline-block" />
                  {tr('parentsFund')}: {allocations.splits.parents}% ({allocations.parentsAmount.toLocaleString()} DH)
                </span>
                {customFunds.map(cf => (
                  <span key={cf.id} className="flex items-center gap-1.5 text-teal-600 dark:text-teal-400">
                    <span className="w-2 h-2 rounded-full bg-teal-500 inline-block" />
                    {cf.name}: {cf.percent}% ({Math.round(salary * ((cf.percent || 0) / 100)).toLocaleString()} DH)
                  </span>
                ))}
              </div>
            </div>

            {/* SYNERGY ACTION SHORTCUTS */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-800">
              {trioSynergy.totalMonthlyStrategicSavings > 0 && unallocatedVault > 0 && (
                <button
                  type="button"
                  onClick={handleDepositAllMonthlyPillars}
                  className="px-3.5 sm:px-4 py-2 sm:py-2.5 min-h-[38px] sm:min-h-[42px] rounded-xl bg-slate-900 dark:bg-white dark:text-slate-900 text-white text-xs sm:text-sm font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                >
                  <Icon name="Award" size={15} />
                  <span>{tr('trioDepositAllPillars')} (+{Math.min(unallocatedVault, trioSynergy.totalMonthlyStrategicSavings).toLocaleString()} DH)</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* FUND STATS CARDS: FULL-WIDTH RESPONSIVE GRID (1 COL ON MOBILE, 2 ON TABLET, 3 ON LAPTOP, 5 ON DESKTOP) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5 sm:gap-4.5 pt-1">
          
          {/* CARD 1: PERSONAL & NEEDS */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-blue-400/50 dark:hover:border-blue-500/40 hover:shadow-md transition-all duration-200 flex flex-col justify-between group relative overflow-hidden min-h-[200px]">
            <div className="h-1.5 absolute top-0 inset-x-0 bg-blue-500" />
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                    <Icon name="Receipt2" size={16} />
                  </div>
                  <h4 className="text-xs sm:text-sm md:text-base font-bold text-slate-800 dark:text-slate-100 uppercase tracking-tight leading-snug break-words">
                    {tr('personalFund')}
                  </h4>
                </div>
                <span className="text-xs sm:text-sm font-black font-mono px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-900/40 shrink-0">
                  {allocations.splits.personal}%
                </span>
              </div>

              <div className="text-xl sm:text-2xl md:text-3xl font-black font-mono text-slate-900 dark:text-white my-1">
                {allocations.personalAmount.toLocaleString()} DH
              </div>

              <div className="mt-1 space-y-1">
                <div className="text-xs sm:text-sm font-mono text-slate-500 dark:text-slate-400">
                  Committed: {totalExpensesCost.toLocaleString()} DH ({trioSynergy.budgetUtilizationPercent}%)
                </div>
                {trioSynergy.isOverBudget ? (
                  <div className="text-xs sm:text-sm font-black text-rose-500 flex items-center gap-1">
                    ⚠️ Deficit: -{trioSynergy.budgetDeficitAmount.toLocaleString()} DH
                  </div>
                ) : (
                  <div className="text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    ✓ Free Buffer: +{trioSynergy.freeCashBuffer.toLocaleString()} DH
                  </div>
                )}
              </div>
            </div>

            {/* STEPPER CONTROLLER */}
            <div className="flex items-center justify-between text-xs sm:text-sm pt-3 mt-3 border-t border-slate-100 dark:border-slate-800">
              <span className="font-bold text-slate-400 uppercase tracking-wider">{tr('shareLabel') || 'Share'}</span>
              <div className="flex items-center gap-1 bg-slate-100/80 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-1 font-mono">
                <button
                  type="button"
                  onClick={() => handleSplitChange('personal', allocations.splits.personal - 1)}
                  className="w-8 h-8 sm:w-8 sm:h-8 min-w-[32px] min-h-[32px] flex items-center justify-center rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-sm sm:text-base transition-colors cursor-pointer active:scale-95"
                  aria-label="Decrease personal share"
                >
                  -
                </button>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={allocations.splits.personal}
                  onChange={e => handleSplitChange('personal', Number(e.target.value))}
                  className="w-10 sm:w-11 text-center font-black text-xs sm:text-sm bg-transparent outline-none text-slate-900 dark:text-white"
                />
                <span className="text-xs sm:text-sm text-slate-400 font-bold pe-1">%</span>
                <button
                  type="button"
                  onClick={() => handleSplitChange('personal', allocations.splits.personal + 1)}
                  className="w-8 h-8 sm:w-8 sm:h-8 min-w-[32px] min-h-[32px] flex items-center justify-center rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-sm sm:text-base transition-colors cursor-pointer active:scale-95"
                  aria-label="Increase personal share"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* CARD 2: FUTURE INVESTMENTS */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-amber-400/50 dark:hover:border-amber-500/40 hover:shadow-md transition-all duration-200 flex flex-col justify-between group relative overflow-hidden min-h-[200px]">
            <div className="h-1.5 absolute top-0 inset-x-0 bg-amber-500" />
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                    <Icon name="TrendingUp" size={16} />
                  </div>
                  <h4 className="text-xs sm:text-sm md:text-base font-bold text-slate-800 dark:text-slate-100 uppercase tracking-tight leading-snug break-words">
                    {tr('investFund')}
                  </h4>
                </div>
                <span className="text-xs sm:text-sm font-black font-mono px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-900/40 shrink-0">
                  {allocations.splits.invest}%
                </span>
              </div>

              <div className="text-xl sm:text-2xl md:text-3xl font-black font-mono text-slate-900 dark:text-white my-1">
                {allocations.investAmount.toLocaleString()} DH
              </div>

              <div className="mt-1">
                <span className="text-xs sm:text-sm font-bold text-amber-600 dark:text-amber-400 block leading-relaxed">
                  → Crypto Quest (+{trioSynergy.investmentsMonthlyAllocation.toLocaleString()} DH/mo)
                </span>
              </div>
            </div>

            {/* STEPPER CONTROLLER */}
            <div className="flex items-center justify-between text-xs sm:text-sm pt-3 mt-3 border-t border-slate-100 dark:border-slate-800">
              <span className="font-bold text-slate-400 uppercase tracking-wider">{tr('shareLabel') || 'Share'}</span>
              <div className="flex items-center gap-1 bg-slate-100/80 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-1 font-mono">
                <button
                  type="button"
                  onClick={() => handleSplitChange('invest', allocations.splits.invest - 1)}
                  className="w-8 h-8 sm:w-8 sm:h-8 min-w-[32px] min-h-[32px] flex items-center justify-center rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-sm sm:text-base transition-colors cursor-pointer active:scale-95"
                  aria-label="Decrease investment share"
                >
                  -
                </button>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={allocations.splits.invest}
                  onChange={e => handleSplitChange('invest', Number(e.target.value))}
                  className="w-10 sm:w-11 text-center font-black text-xs sm:text-sm bg-transparent outline-none text-slate-900 dark:text-white"
                />
                <span className="text-xs sm:text-sm text-slate-400 font-bold pe-1">%</span>
                <button
                  type="button"
                  onClick={() => handleSplitChange('invest', allocations.splits.invest + 1)}
                  className="w-8 h-8 sm:w-8 sm:h-8 min-w-[32px] min-h-[32px] flex items-center justify-center rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-sm sm:text-base transition-colors cursor-pointer active:scale-95"
                  aria-label="Increase investment share"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* CARD 3: SAFE LIQUID SAVINGS */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-emerald-400/50 dark:hover:border-emerald-500/40 hover:shadow-md transition-all duration-200 flex flex-col justify-between group relative overflow-hidden min-h-[200px]">
            <div className="h-1.5 absolute top-0 inset-x-0 bg-emerald-500" />
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <Icon name="ShieldCheck" size={16} />
                  </div>
                  <h4 className="text-xs sm:text-sm md:text-base font-bold text-slate-800 dark:text-slate-100 uppercase tracking-tight leading-snug break-words">
                    {tr('savingsFund')}
                  </h4>
                </div>
                <span className="text-xs sm:text-sm font-black font-mono px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900/40 shrink-0">
                  {allocations.splits.safe}%
                </span>
              </div>

              <div className="text-xl sm:text-2xl md:text-3xl font-black font-mono text-slate-900 dark:text-white my-1">
                {allocations.safeAmount.toLocaleString()} DH
              </div>

              <div className="mt-1">
                <span className="text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400 block leading-relaxed">
                  → 100k Goal (+{trioSynergy.safeSavingsMonthlyAllocation.toLocaleString()} DH/mo)
                </span>
              </div>
            </div>

            {/* STEPPER CONTROLLER */}
            <div className="flex items-center justify-between text-xs sm:text-sm pt-3 mt-3 border-t border-slate-100 dark:border-slate-800">
              <span className="font-bold text-slate-400 uppercase tracking-wider">{tr('shareLabel') || 'Share'}</span>
              <div className="flex items-center gap-1 bg-slate-100/80 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-1 font-mono">
                <button
                  type="button"
                  onClick={() => handleSplitChange('safe', allocations.splits.safe - 1)}
                  className="w-8 h-8 sm:w-8 sm:h-8 min-w-[32px] min-h-[32px] flex items-center justify-center rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-sm sm:text-base transition-colors cursor-pointer active:scale-95"
                  aria-label="Decrease savings share"
                >
                  -
                </button>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={allocations.splits.safe}
                  onChange={e => handleSplitChange('safe', Number(e.target.value))}
                  className="w-10 sm:w-11 text-center font-black text-xs sm:text-sm bg-transparent outline-none text-slate-900 dark:text-white"
                />
                <span className="text-xs sm:text-sm text-slate-400 font-bold pe-1">%</span>
                <button
                  type="button"
                  onClick={() => handleSplitChange('safe', allocations.splits.safe + 1)}
                  className="w-8 h-8 sm:w-8 sm:h-8 min-w-[32px] min-h-[32px] flex items-center justify-center rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-sm sm:text-base transition-colors cursor-pointer active:scale-95"
                  aria-label="Increase savings share"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* CARD 4: EMERGENCY SHIELD */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-rose-400/50 dark:hover:border-rose-500/40 hover:shadow-md transition-all duration-200 flex flex-col justify-between group relative overflow-hidden min-h-[200px]">
            <div className="h-1.5 absolute top-0 inset-x-0 bg-rose-500" />
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                    <Icon name="Flame" size={16} />
                  </div>
                  <h4 className="text-xs sm:text-sm md:text-base font-bold text-slate-800 dark:text-slate-100 uppercase tracking-tight leading-snug break-words">
                    {tr('emergencyFund')}
                  </h4>
                </div>
                <span className="text-xs sm:text-sm font-black font-mono px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-900/40 shrink-0">
                  {allocations.splits.emergency}%
                </span>
              </div>

              <div className="text-xl sm:text-2xl md:text-3xl font-black font-mono text-slate-900 dark:text-white my-1">
                {allocations.emergencyAmount.toLocaleString()} DH
              </div>

              <div className="mt-1">
                <span className="text-xs sm:text-sm font-bold text-rose-600 dark:text-rose-400 block leading-relaxed">
                  → Shield Quest (+{trioSynergy.emergencyMonthlyAllocation.toLocaleString()} DH/mo)
                </span>
              </div>
            </div>

            {/* STEPPER CONTROLLER */}
            <div className="flex items-center justify-between text-xs sm:text-sm pt-3 mt-3 border-t border-slate-100 dark:border-slate-800">
              <span className="font-bold text-slate-400 uppercase tracking-wider">{tr('shareLabel') || 'Share'}</span>
              <div className="flex items-center gap-1 bg-slate-100/80 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-1 font-mono">
                <button
                  type="button"
                  onClick={() => handleSplitChange('emergency', allocations.splits.emergency - 1)}
                  className="w-8 h-8 sm:w-8 sm:h-8 min-w-[32px] min-h-[32px] flex items-center justify-center rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-sm sm:text-base transition-colors cursor-pointer active:scale-95"
                  aria-label="Decrease emergency share"
                >
                  -
                </button>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={allocations.splits.emergency}
                  onChange={e => handleSplitChange('emergency', Number(e.target.value))}
                  className="w-10 sm:w-11 text-center font-black text-xs sm:text-sm bg-transparent outline-none text-slate-900 dark:text-white"
                />
                <span className="text-xs sm:text-sm text-slate-400 font-bold pe-1">%</span>
                <button
                  type="button"
                  onClick={() => handleSplitChange('emergency', allocations.splits.emergency + 1)}
                  className="w-8 h-8 sm:w-8 sm:h-8 min-w-[32px] min-h-[32px] flex items-center justify-center rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-sm sm:text-base transition-colors cursor-pointer active:scale-95"
                  aria-label="Increase emergency share"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* CARD 5: FAMILY & GENEROSITY */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-purple-400/50 dark:hover:border-purple-500/40 hover:shadow-md transition-all duration-200 flex flex-col justify-between group relative overflow-hidden min-h-[200px]">
            <div className="h-1.5 absolute top-0 inset-x-0 bg-purple-500" />
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                    <Icon name="Heart" size={16} />
                  </div>
                  <h4 className="text-xs sm:text-sm md:text-base font-bold text-slate-800 dark:text-slate-100 uppercase tracking-tight leading-snug break-words">
                    {tr('parentsFund')}
                  </h4>
                </div>
                <span className="text-xs sm:text-sm font-black font-mono px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 border border-purple-200/60 dark:border-purple-900/40 shrink-0">
                  {allocations.splits.parents}%
                </span>
              </div>

              <div className="text-xl sm:text-2xl md:text-3xl font-black font-mono text-slate-900 dark:text-white my-1">
                {allocations.parentsAmount.toLocaleString()} DH
              </div>

              <div className="mt-1">
                <span className="text-xs sm:text-sm font-bold text-purple-600 dark:text-purple-400 block leading-relaxed">
                  Family & Generosity (+{allocations.parentsAmount.toLocaleString()} DH/mo)
                </span>
              </div>
            </div>

            {/* STEPPER CONTROLLER */}
            <div className="flex items-center justify-between text-xs sm:text-sm pt-3 mt-3 border-t border-slate-100 dark:border-slate-800">
              <span className="font-bold text-slate-400 uppercase tracking-wider">{tr('shareLabel') || 'Share'}</span>
              <div className="flex items-center gap-1 bg-slate-100/80 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-1 font-mono">
                <button
                  type="button"
                  onClick={() => handleSplitChange('parents', allocations.splits.parents - 1)}
                  className="w-8 h-8 sm:w-8 sm:h-8 min-w-[32px] min-h-[32px] flex items-center justify-center rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-sm sm:text-base transition-colors cursor-pointer active:scale-95"
                  aria-label="Decrease family share"
                >
                  -
                </button>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={allocations.splits.parents}
                  onChange={e => handleSplitChange('parents', Number(e.target.value))}
                  className="w-10 sm:w-11 text-center font-black text-xs sm:text-sm bg-transparent outline-none text-slate-900 dark:text-white"
                />
                <span className="text-xs sm:text-sm text-slate-400 font-bold pe-1">%</span>
                <button
                  type="button"
                  onClick={() => handleSplitChange('parents', allocations.splits.parents + 1)}
                  className="w-8 h-8 sm:w-8 sm:h-8 min-w-[32px] min-h-[32px] flex items-center justify-center rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-sm sm:text-base transition-colors cursor-pointer active:scale-95"
                  aria-label="Increase family share"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* CUSTOM USER-ADDED FUNDS CARDS */}
          {customFunds.map(cf => (
            <div
              key={cf.id}
              className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-teal-400/50 dark:hover:border-teal-500/40 hover:shadow-md transition-all duration-200 flex flex-col justify-between group relative overflow-hidden min-h-[200px]"
            >
              <div className="h-1.5 absolute top-0 inset-x-0 bg-teal-500" />
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
                      <Icon name="FolderPlus" size={16} />
                    </div>
                    <h4 className="text-xs sm:text-sm md:text-base font-bold text-slate-800 dark:text-slate-100 uppercase tracking-tight leading-snug break-words">
                      {cf.name}
                    </h4>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-xs sm:text-sm font-black font-mono px-2 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 border border-teal-200/60 dark:border-teal-900/40">
                      {cf.percent}%
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveCustomFund(cf.id)}
                      className="text-slate-400 hover:text-rose-500 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer transition-colors"
                      title={tr('removeFund')}
                      aria-label="Remove custom fund"
                    >
                      <Icon name="Trash" size={15} />
                    </button>
                  </div>
                </div>

                <div className="text-xl sm:text-2xl md:text-3xl font-black font-mono text-slate-900 dark:text-white my-1">
                  {Math.round(salary * ((cf.percent || 0) / 100)).toLocaleString()} DH
                </div>

                <div className="mt-1">
                  <span className="text-xs sm:text-sm font-bold text-teal-600 dark:text-teal-400 block leading-relaxed">
                    Custom Reserve (+{Math.round(salary * ((cf.percent || 0) / 100)).toLocaleString()} DH/mo)
                  </span>
                </div>
              </div>

              {/* STEPPER CONTROLLER */}
              <div className="flex items-center justify-between text-xs sm:text-sm pt-3 mt-3 border-t border-slate-100 dark:border-slate-800">
                <span className="font-bold text-slate-400 uppercase tracking-wider">{tr('shareLabel') || 'Share'}</span>
                <div className="flex items-center gap-1 bg-slate-100/80 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-1 font-mono">
                  <button
                    type="button"
                    onClick={() => handleCustomFundPercentChange(cf.id, Math.max(0, cf.percent - 1))}
                    className="w-8 h-8 sm:w-8 sm:h-8 min-w-[32px] min-h-[32px] flex items-center justify-center rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-sm sm:text-base transition-colors cursor-pointer active:scale-95"
                    aria-label="Decrease custom fund share"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={cf.percent}
                    onChange={e => handleCustomFundPercentChange(cf.id, Number(e.target.value))}
                    className="w-10 sm:w-11 text-center font-black text-xs sm:text-sm bg-transparent outline-none text-slate-900 dark:text-white"
                  />
                  <span className="text-xs sm:text-sm text-slate-400 font-bold pe-1">%</span>
                  <button
                    type="button"
                    onClick={() => handleCustomFundPercentChange(cf.id, Math.min(100, cf.percent + 1))}
                    className="w-8 h-8 sm:w-8 sm:h-8 min-w-[32px] min-h-[32px] flex items-center justify-center rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-sm sm:text-base transition-colors cursor-pointer active:scale-95"
                    aria-label="Increase custom fund share"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* INLINE ADD CUSTOM FUND CARD */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowAddFundModal(true);
            }}
            className="p-4 sm:p-5 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-teal-500/60 dark:hover:border-teal-400/60 bg-slate-50/50 dark:bg-slate-900/40 hover:bg-teal-50/20 dark:hover:bg-teal-950/10 transition-all duration-200 flex flex-col items-center justify-center text-center gap-2.5 group cursor-pointer min-h-[200px] active:scale-98"
          >
            <div className="w-11 h-11 rounded-2xl bg-teal-500/10 group-hover:bg-teal-500/20 text-teal-600 dark:text-teal-400 flex items-center justify-center transition-all group-hover:scale-110 shadow-xs">
              <Icon name="Plus" size={22} />
            </div>
            <div>
              <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors block">
                {tr('addCustomFundBtn')}
              </span>
              <span className="text-[11px] sm:text-xs text-slate-400 block mt-0.5">
                Add travel, skills or business fund
              </span>
            </div>
          </button>

        </div>
      </div>

      {/* ============================================================== */}
      {/* 4. EXPENSES & FINANCIAL QUESTS (Step 5) */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 mb-8 items-start">
        
        {/* EXPENSES TRACKER (7 Cols) */}
        <div
          id="guide-expenses"
          className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-4 sm:p-6 md:p-7 relative shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
        >
          {/* SMART IN-SECTION POINTER 5 */}
          <SmartSectionPointer
            number={5}
            title={tr('pointer5Title')}
            desc={tr('pointer5Desc')}
            metricChip={`Committed: ${totalExpensesCost.toLocaleString()} DH • Burn: ${Math.round((totalExpensesCost / (salary || 1)) * 100)}% • Runway: ${freeCashAnalysis.runwayMonths} Mo`}
          />

          {/* 1. LINKED MONTHLY SALARY & PERSONAL FUND COVERAGE BANNER */}
          <div className="p-3.5 sm:p-4 md:p-5 rounded-2xl bg-gradient-to-r from-indigo-50/90 via-indigo-50/40 to-blue-50/80 dark:from-indigo-950/40 dark:via-slate-900/70 dark:to-blue-950/30 border border-indigo-200/80 dark:border-indigo-900/50 mb-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/20">
                  <Icon name="Sliders" size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                      {tr('monthlySalaryInflow')}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[9px] sm:text-[10px] font-extrabold uppercase bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20">
                      {tr('syncedWithAllocator')}
                    </span>
                  </div>
                  <div className="text-xl sm:text-2xl font-black font-mono text-slate-900 dark:text-white mt-0.5">
                    {salary.toLocaleString()} DH <span className="text-xs sm:text-sm font-bold text-slate-400">/ mo</span>
                  </div>
                </div>
              </div>

              <div className="sm:text-end pt-2 sm:pt-0 border-t sm:border-t-0 border-indigo-200/50 dark:border-indigo-900/40">
                <div className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase">
                  {tr('trioPersonalCoverage')} ({allocations.splits.personal}%)
                </div>
                <div className="text-base sm:text-lg font-black font-mono text-slate-800 dark:text-slate-100 mt-0.5">
                  {allocations.personalAmount.toLocaleString()} DH
                </div>
                <div className="mt-1 flex items-center sm:justify-end gap-1.5 text-[10px] sm:text-xs font-bold">
                  {allocations.personalAmount >= totalExpensesCost ? (
                    <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      {tr('coverageFull')}
                    </span>
                  ) : (
                    <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                      {tr('coveragePartial')} {trioSynergy.personalCoverageOfExpensesPercent}%
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 2. SECTION HEADER & COMMITTED TOTAL */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20 shrink-0 shadow-xs">
                <Icon name="Receipt2" size={22} />
              </div>
              <div>
                <h3 className="text-base sm:text-lg md:text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                  {tr('expensesTitle')}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  {tr('totalCommitted')}: <strong className="font-mono text-slate-900 dark:text-white">{totalExpensesCost.toLocaleString()} DH</strong> ({Math.round((totalExpensesCost / (salary || 1)) * 100)}% {tr('committedOfSalary')})
                </p>
              </div>
            </div>

            <div className="flex items-center sm:flex-col sm:items-end justify-between gap-1">
              <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider sm:block">
                {tr('totalCommitted')}
              </span>
              <div className="text-xl sm:text-2xl md:text-3xl font-black font-mono text-slate-900 dark:text-white">
                {totalExpensesCost.toLocaleString()} DH
              </div>
              <span className={`text-[10px] sm:text-xs font-black uppercase px-2.5 py-1 rounded-lg border ${
                trioSynergy.isDeficit
                  ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                  : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
              }`}>
                {trioSynergy.budgetUtilizationPercent}% {trioSynergy.isDeficit ? tr('highBurnRatio') : tr('healthyBurnRatio')}
              </span>
            </div>
          </div>

          {/* 3. FILTER TABS & SEARCH CONTROLS */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 mb-3.5">
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100/90 dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/70">
              <button
                type="button"
                onClick={() => setExpenseFilter('all')}
                className={`px-3 sm:px-3.5 py-1.5 min-h-[34px] sm:min-h-[36px] rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  expenseFilter === 'all'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tr('filterAll')} ({expenses.length})
              </button>
              <button
                type="button"
                onClick={() => setExpenseFilter('due')}
                className={`px-3 sm:px-3.5 py-1.5 min-h-[34px] sm:min-h-[36px] rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  expenseFilter === 'due'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'text-slate-500 hover:text-amber-600 dark:hover:text-amber-400'
                }`}
              >
                {dueExpensesCount > 0 && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />}
                {tr('filterDue')} ({dueExpensesCount})
              </button>
              <button
                type="button"
                onClick={() => setExpenseFilter('paid')}
                className={`px-3 sm:px-3.5 py-1.5 min-h-[34px] sm:min-h-[36px] rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  expenseFilter === 'paid'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400'
                }`}
              >
                <Icon name="Check" size={13} />
                {tr('filterPaid')} ({paidExpensesCount})
              </button>
            </div>

            {/* Quick Search */}
            <div className="relative flex-1 sm:flex-initial min-w-[140px] max-w-[220px]">
              <Icon name="Search" size={14} className="absolute start-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={expenseSearchQuery}
                onChange={e => setExpenseSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full bg-slate-100/80 dark:bg-slate-800/70 border border-slate-200/70 dark:border-slate-700/70 rounded-xl ps-8 pe-7 py-1.5 min-h-[34px] sm:min-h-[36px] text-xs sm:text-sm text-slate-900 dark:text-white outline-none focus:border-amber-500 transition-colors"
              />
              {expenseSearchQuery && (
                <button
                  type="button"
                  onClick={() => setExpenseSearchQuery('')}
                  className="absolute end-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  <Icon name="X" size={13} />
                </button>
              )}
            </div>
          </div>

          {/* 4. EXPENSES LIST */}
          <div className="space-y-2.5 max-h-[380px] overflow-y-auto pe-1 no-scrollbar">
            {filteredExpenses.length === 0 ? (
              <div className="py-8 text-center bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-2">
                  <Icon name="Receipt" size={20} />
                </div>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-bold">
                  {tr('noExpensesMatch')}
                </p>
              </div>
            ) : (
              filteredExpenses.map(exp => {
                // Category styling helper
                const isRent = exp.icon === 'Home';
                const isFood = exp.icon === 'ShoppingBag';
                const isTech = exp.icon === 'Wifi' || exp.icon === 'Code';
                const isSport = exp.icon === 'Activity';
                const iconBg = isRent
                  ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
                  : isFood
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                  : isTech
                  ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20'
                  : isSport
                  ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20'
                  : 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';

                return (
                  <div
                    key={exp.id}
                    className={`flex flex-col p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 ${
                      exp.paid
                        ? 'bg-slate-50/70 dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700'
                        : 'bg-white dark:bg-slate-900 border-2 border-amber-500/35 dark:border-amber-500/30 hover:border-amber-500/70 shadow-xs'
                    }`}
                  >
                    {editingExpenseId === exp.id ? (
                      /* INLINE EDIT FORM */
                      <div className="space-y-3 py-1">
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-2.5">
                          <input
                            type="text"
                            value={editExpenseLabel}
                            onChange={e => setEditExpenseLabel(e.target.value)}
                            className="sm:col-span-4 bg-white dark:bg-slate-950 border border-amber-400 rounded-xl px-3 py-2 min-h-[38px] sm:min-h-[40px] text-xs sm:text-sm text-slate-900 dark:text-white outline-none font-bold"
                            placeholder="Expense label"
                          />
                          <input
                            type="number"
                            value={editExpenseCost}
                            onChange={e => setEditExpenseCost(e.target.value)}
                            className="sm:col-span-2 bg-white dark:bg-slate-950 border border-amber-400 rounded-xl px-3 py-2 min-h-[38px] sm:min-h-[40px] text-xs sm:text-sm font-mono font-bold text-slate-900 dark:text-white outline-none"
                            placeholder="Cost"
                          />
                          <select
                            value={editExpenseCategory}
                            onChange={e => setEditExpenseCategory(e.target.value)}
                            className="sm:col-span-3 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-2 min-h-[38px] sm:min-h-[40px] text-xs sm:text-sm text-slate-700 dark:text-slate-300 outline-none font-bold"
                          >
                            <option value="fixed">{tr('fixedCosts')}</option>
                            <option value="lifestyle">{tr('lifestyleCosts')}</option>
                            {customCategories.filter(c => c !== 'fixed' && c !== 'lifestyle').map(c => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </select>
                          <input
                            type="url"
                            value={editExpenseLogoUrl}
                            onChange={e => setEditExpenseLogoUrl(e.target.value)}
                            className="sm:col-span-3 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-2 min-h-[38px] sm:min-h-[40px] text-xs sm:text-sm text-slate-900 dark:text-white outline-none"
                            placeholder="Logo URL (https://...)"
                          />
                        </div>
                        <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                          <button
                            type="button"
                            onClick={() => setEditingExpenseId(null)}
                            className="px-3.5 py-2 min-h-[36px] text-xs sm:text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-bold cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveEditExpense(exp.id)}
                            className="px-4 py-2 min-h-[36px] bg-amber-500 hover:bg-amber-600 text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-xs cursor-pointer active:scale-95"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* EXPENSE ITEM DISPLAY ROW (Responsive on Mobile & Tablet) */
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          {/* DEDICATED THEMED CATEGORY ICON OR CUSTOM LOGO */}
                          <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center shrink-0 border shadow-2xs overflow-hidden relative ${iconBg}`}>
                            {exp.logoUrl ? (
                              <img
                                src={exp.logoUrl}
                                alt={exp.label}
                                className="w-full h-full object-cover rounded-2xl"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  const fallback = e.currentTarget.parentElement?.querySelector('.icon-fallback');
                                  if (fallback) fallback.classList.remove('hidden');
                                }}
                              />
                            ) : null}
                            <span className={`icon-fallback ${exp.logoUrl ? 'hidden' : 'flex'} items-center justify-center`}>
                              <Icon name={exp.icon || 'Receipt'} size={19} />
                            </span>
                          </div>

                          <div className="min-w-0">
                            <span className={`text-sm sm:text-base font-bold block truncate transition-all ${
                              exp.paid
                                ? 'text-slate-400 dark:text-slate-500 line-through'
                                : 'text-slate-900 dark:text-white'
                            }`}>
                              {exp.label}
                            </span>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">
                                {exp.category === 'fixed' ? tr('fixedCosts') : exp.category === 'lifestyle' ? tr('lifestyleCosts') : exp.category}
                              </span>
                              <span className="text-slate-300 dark:text-slate-600 text-xs">•</span>
                              <span className="text-[10px] sm:text-xs text-slate-400 font-medium">
                                {tr('recurringMonthly')}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-2.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800/80">
                          {/* AMOUNT */}
                          <span className={`text-sm sm:text-base md:text-lg font-mono font-black ${
                            exp.paid ? 'text-slate-400 dark:text-slate-500 line-through' : 'text-slate-900 dark:text-white'
                          }`}>
                            {exp.cost.toLocaleString()} DH
                          </span>

                          {/* INTERACTIVE STATUS BADGE BUTTON */}
                          <button
                            type="button"
                            onClick={() => toggleExpensePaid(exp.id)}
                            className={`px-3 py-1.5 min-h-[36px] sm:min-h-[38px] rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 ${
                              exp.paid
                                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25 hover:bg-emerald-500/25'
                                : 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/35 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 group'
                            }`}
                            title={exp.paid ? tr('markUnpaidTooltip') : tr('markPaidTooltip')}
                          >
                            {exp.paid ? (
                              <>
                                <Icon name="Check" size={13} />
                                <span>{tr('paidStatus')}</span>
                              </>
                            ) : (
                              <>
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 group-hover:bg-white animate-pulse" />
                                <span>{tr('dueStatus')}</span>
                              </>
                            )}
                          </button>

                          {/* ACTION BUTTONS (TOUCH-FRIENDLY 36px) */}
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleStartEditExpense(exp)}
                              className="w-9 h-9 min-w-[36px] min-h-[36px] rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 flex items-center justify-center transition-all cursor-pointer active:scale-90"
                              title={tr('editExpenseTooltip')}
                              aria-label="Edit expense"
                            >
                              <Icon name="Edit2" size={15} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteExpense(exp.id)}
                              className="w-9 h-9 min-w-[36px] min-h-[36px] rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center justify-center transition-all cursor-pointer active:scale-90"
                              title={tr('deleteExpenseTooltip')}
                              aria-label="Delete expense"
                            >
                              <Icon name="Trash" size={15} />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* 5. ADD CUSTOM EXPENSE FORM (RESPONSIVE GRID) */}
          <form onSubmit={handleAddExpense} className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2.5">
            <div className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Icon name="Plus" size={14} className="text-emerald-500" />
              <span>{tr('addNewExpenseSectionTitle')}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
              {/* Expense Label Input */}
              <div className="sm:col-span-4">
                <input
                  type="text"
                  placeholder={tr('newExpensePlaceholder')}
                  value={newExpenseLabel}
                  onChange={e => setNewExpenseLabel(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 sm:py-3 min-h-[42px] sm:min-h-[44px] text-xs sm:text-sm text-slate-900 dark:text-white outline-none focus:border-amber-500 font-bold transition-colors"
                />
              </div>

              {/* Cost Input with DH Pill */}
              <div className="sm:col-span-2 relative">
                <input
                  type="number"
                  placeholder={tr('costPlaceholder')}
                  value={newExpenseCost}
                  onChange={e => setNewExpenseCost(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl ps-3.5 pe-8 py-2.5 sm:py-3 min-h-[42px] sm:min-h-[44px] text-xs sm:text-sm font-mono font-bold text-slate-900 dark:text-white outline-none focus:border-amber-500 transition-colors"
                />
                <span className="absolute end-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">
                  DH
                </span>
              </div>

              {/* Category Select */}
              <div className="sm:col-span-2">
                <select
                  value={isCreatingNewCategory ? '__create_new__' : newExpenseCategory}
                  onChange={e => {
                    if (e.target.value === '__create_new__') {
                      setIsCreatingNewCategory(true);
                    } else {
                      setIsCreatingNewCategory(false);
                      setNewExpenseCategory(e.target.value);
                    }
                  }}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-2.5 sm:py-3 min-h-[42px] sm:min-h-[44px] text-xs sm:text-sm text-slate-700 dark:text-slate-200 outline-none focus:border-amber-500 font-bold transition-colors"
                >
                  <option value="fixed">{tr('fixedCosts')}</option>
                  <option value="lifestyle">{tr('lifestyleCosts')}</option>
                  {customCategories.filter(c => c !== 'fixed' && c !== 'lifestyle').map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                  <option value="__create_new__">+ Custom Category</option>
                </select>
              </div>

              {/* Custom Logo URL */}
              <div className="sm:col-span-2">
                <input
                  type="url"
                  placeholder={tr('logoUrlPlaceholder') || "Logo URL (opt)"}
                  value={newExpenseLogoUrl}
                  onChange={e => setNewExpenseLogoUrl(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-2.5 sm:py-3 min-h-[42px] sm:min-h-[44px] text-xs sm:text-sm text-slate-900 dark:text-white outline-none focus:border-amber-500 transition-colors"
                  title={tr('logoUrlLabel')}
                />
              </div>

              {/* Submit Button */}
              <div className="sm:col-span-2">
                <button
                  type="submit"
                  className="w-full h-full py-2.5 sm:py-3 px-3 min-h-[42px] sm:min-h-[44px] bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider hover:bg-slate-800 dark:hover:bg-slate-100 shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Icon name="Plus" size={15} />
                  <span>{tr('addExpenseBtn')}</span>
                </button>
              </div>
            </div>

            {/* LIVE PROJECTED FREE CASH BUFFER (+ or -) PREVIEW */}
            {Number(newExpenseCost) > 0 && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm">
                <span className="text-slate-500 text-xs font-medium flex items-center gap-1.5">
                  <Icon name="Sparkles" size={14} className="text-amber-500" />
                  {tr('projectedFreeCashBuffer')}:
                </span>
                <div className="flex items-center gap-2 font-mono font-black">
                  <span className={freeCashBuffer - Number(newExpenseCost) >= 0 ? 'text-emerald-500 text-sm sm:text-base' : 'text-rose-500 text-sm sm:text-base'}>
                    {freeCashBuffer - Number(newExpenseCost) >= 0
                      ? `+${(freeCashBuffer - Number(newExpenseCost)).toLocaleString()} DH`
                      : `-${Math.abs(freeCashBuffer - Number(newExpenseCost)).toLocaleString()} DH`}
                  </span>
                  <span className={`text-[10px] sm:text-xs px-2 py-0.5 rounded-md font-bold uppercase ${
                    freeCashBuffer - Number(newExpenseCost) >= 0
                      ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                      : 'bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300'
                  }`}>
                    {freeCashBuffer - Number(newExpenseCost) >= 0 ? tr('bufferSurplusLabel') : tr('bufferDeficitLabel')}
                  </span>
                </div>
              </div>
            )}

            {isCreatingNewCategory && (
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="text"
                  placeholder="New category name (e.g. Subscriptions, Travel)..."
                  value={newCategoryName}
                  onChange={e => setNewCategoryName(e.target.value)}
                  className="flex-1 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-300 dark:border-amber-800 rounded-xl px-3.5 py-2.5 min-h-[40px] text-xs sm:text-sm text-slate-900 dark:text-white outline-none focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newCategoryName.trim()) {
                      const trimmed = newCategoryName.trim().toLowerCase();
                      if (!customCategories.includes(trimmed)) {
                        setCustomCategories(c => [...c, trimmed]);
                      }
                      setNewExpenseCategory(trimmed);
                    }
                    setIsCreatingNewCategory(false);
                  }}
                  className="px-4 py-2.5 min-h-[40px] bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs sm:text-sm font-bold cursor-pointer transition-colors"
                >
                  Done
                </button>
              </div>
            )}
          </form>

          {/* 6. FREE CASH HEALTH CARD WITH 1-CLICK ACTION */}
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className={`p-4 sm:p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 ${
              freeCashBuffer >= 0
                ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200/80 dark:border-emerald-900/40'
                : 'bg-rose-50/70 dark:bg-rose-950/20 border-rose-200/80 dark:border-rose-900/40'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                  freeCashBuffer >= 0
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                    : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                }`}>
                  <Icon name={freeCashBuffer >= 0 ? 'ShieldCheck' : 'Flame'} size={20} />
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 flex-wrap">
                    <span>{tr('freeCashLeft')}</span>
                    <span className={`text-[10px] sm:text-xs px-2 py-0.5 rounded-md font-extrabold uppercase ${
                      freeCashBuffer >= 0
                        ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
                        : 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300'
                    }`}>
                      {freeCashBuffer >= 0 ? tr('bufferSurplusLabel') : tr('bufferDeficitLabel')}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {tr('runwayLabel')}: <strong className="text-slate-700 dark:text-slate-300">{freeCashAnalysis.runwayMonths}</strong> {tr('runwayMonthsUnit')}
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:items-end gap-1.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/50 dark:border-slate-800/50">
                <div className={`text-xl sm:text-2xl md:text-3xl font-black font-mono ${
                  freeCashBuffer >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                }`}>
                  {freeCashBuffer >= 0 ? `+${freeCashBuffer.toLocaleString()} DH` : `-${Math.abs(freeCashBuffer).toLocaleString()} DH`}
                </div>
                {/* Dynamic 1-Click Action Button */}
                {freeCashBuffer > 0 && (
                  <button
                    type="button"
                    onClick={handleSweepBufferToQuests}
                    className="px-3.5 py-2 min-h-[38px] sm:min-h-[42px] rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95 self-start sm:self-auto"
                  >
                    <Icon name="Sparkles" size={14} />
                    <span>{tr('trioSweepSurplusBtn')} (+{freeCashBuffer.toLocaleString()} DH)</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* FINANCIAL QUESTS & SAVINGS MILESTONES (5 Cols) */}
        <div
          id="guide-quests"
          className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-6 md:p-7 relative shadow-sm flex flex-col justify-between"
        >
          {/* SMART IN-SECTION POINTER 6 */}
          <SmartSectionPointer
            number={6}
            title={tr('pointer6Title')}
            desc={tr('pointer6Desc')}
            metricChip={`Pillar Inflow: +${allocations.emergencyAmount.toLocaleString()} DH/mo`}
          />

          <div>
            {/* 1. EXECUTIVE HEADER */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20 shrink-0 shadow-xs">
                  <Icon name="ShieldCheck" size={22} />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg md:text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                    {tr('questsTitle')}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs sm:text-sm text-amber-600 dark:text-amber-400 font-bold mt-0.5">
                    <Icon name="Sparkles" size={14} />
                    <span>+{trioSynergy.emergencyMonthlyAllocation.toLocaleString()} DH/mo {tr('trioMonthlyInflow')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. DEDICATED 6-MONTH EMERGENCY SHIELD FROM SALARY */}
            {(() => {
              const emergencyQuest = quests.find(q => q.id === 'q1' || q.title.toLowerCase().includes('emergency') || q.title.toLowerCase().includes('shield') || q.title.toLowerCase().includes('طوارئ')) || quests[0];
              const targetSalary6Mo = salary * 6;
              const targetExpenses6Mo = trioSynergy.recommended6MonthEmergencyTarget;
              const activeTarget = emergencyQuest ? emergencyQuest.target : targetSalary6Mo;
              const activeCurrent = emergencyQuest ? emergencyQuest.current : 0;
              const percent = activeTarget > 0 ? Math.min(100, Math.round((activeCurrent / activeTarget) * 100)) : 100;
              const isDone = activeCurrent >= activeTarget;
              const remaining = Math.max(0, activeTarget - activeCurrent);
              const deficitPercent = Math.max(0, 100 - percent);
              const monthlyInflow = trioSynergy.emergencyMonthlyAllocation || allocations.emergencyAmount || 0;
              const paceMonths = monthlyInflow > 0 ? Math.ceil(remaining / monthlyInflow) : (remaining === 0 ? 0 : 999);
              const isSalarySynced = Math.abs(activeTarget - targetSalary6Mo) < 10;
              const isExpensesSynced = Math.abs(activeTarget - targetExpenses6Mo) < 10;

              return (
                <div className="p-4 sm:p-5 md:p-6 rounded-2xl bg-gradient-to-br from-emerald-500/5 via-teal-500/5 to-transparent border border-emerald-500/20 dark:border-emerald-500/25 space-y-4 shadow-xs">
                  {/* Card Title & Values */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/30 shrink-0">
                        <Icon name="Shield" size={20} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm sm:text-base md:text-lg font-black text-slate-900 dark:text-white">
                            {tr('sixMonthSalaryShield')}
                          </span>
                          <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-md font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-800">
                            {isSalarySynced ? '6× Salary' : isExpensesSynced ? '6× Expenses' : 'Custom Target'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                          {tr('sixMonthSalaryDesc')}
                        </p>
                      </div>
                    </div>

                    <div className="sm:text-end shrink-0 ps-13 sm:ps-0">
                      <div className="text-lg sm:text-xl md:text-2xl font-black font-mono text-slate-900 dark:text-white">
                        {activeCurrent.toLocaleString()} <span className="text-xs sm:text-sm font-normal text-slate-400">/ {activeTarget.toLocaleString()} DH</span>
                      </div>
                      <span className="text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400">
                        {percent}% {tr('achievedLabel')}
                      </span>
                    </div>
                  </div>

                  {/* High-Resolution Dual-Color Progress Bar: Green for (+), Red for (-) with Animations */}
                  <div className="space-y-2.5 p-3.5 sm:p-4 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 shadow-xs">
                    {/* Top status pills: Green for (+) and Red for (-) */}
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm">
                      {/* Green (+) Pill */}
                      <div className="flex items-center gap-1.5 px-3 py-1.5 sm:py-2 min-h-[34px] sm:min-h-[38px] rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-bold">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-sm shadow-emerald-500/50" />
                        <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider">(+) Funded:</span>
                        <span className="font-mono font-black text-xs sm:text-sm md:text-base">+{activeCurrent.toLocaleString()} DH</span>
                        <span className="text-[10px] sm:text-xs opacity-80 font-mono">({percent}%)</span>
                      </div>

                      {/* Red (-) Pill */}
                      <div className="flex items-center gap-1.5 px-3 py-1.5 sm:py-2 min-h-[34px] sm:min-h-[38px] rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-700 dark:text-rose-300 font-bold">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping shadow-sm shadow-rose-500/50" />
                        <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider">(-) Shortfall:</span>
                        <span className="font-mono font-black text-xs sm:text-sm md:text-base">-{remaining.toLocaleString()} DH</span>
                        <span className="text-[10px] sm:text-xs opacity-80 font-mono">({deficitPercent}%)</span>
                      </div>
                    </div>

                    {/* Dual-Color Segmented Animated Bar */}
                    <div className="w-full h-8 sm:h-9 md:h-10 rounded-2xl bg-slate-900/15 dark:bg-slate-950 p-1 flex items-stretch relative overflow-hidden shadow-inner border border-slate-300/80 dark:border-slate-800">
                      {/* Left: Green segment for (+) */}
                      {percent > 0 && (
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percent}%` }}
                          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                          className="h-full rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-400 flex items-center justify-center text-white text-xs sm:text-sm font-mono font-black relative overflow-hidden shadow-md shadow-emerald-500/30 shrink-0"
                          style={{ minWidth: percent > 4 ? undefined : '16px' }}
                        >
                          {/* Continuous shimmer light sweep */}
                          <motion.div
                            className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-20deg]"
                            animate={{ x: ['-100%', '200%'] }}
                            transition={{ repeat: Infinity, duration: 2.5, ease: 'linear' }}
                          />
                          {percent >= 16 && (
                            <span className="relative z-10 px-2 truncate drop-shadow-xs flex items-center gap-1">
                              <span>+</span>{activeCurrent.toLocaleString()} DH
                            </span>
                          )}
                        </motion.div>
                      )}

                      {/* Right: Red segment for (-) */}
                      {deficitPercent > 0 && (
                        <motion.div
                          initial={{ width: '100%' }}
                          animate={{ width: percent > 0 ? `${deficitPercent}%` : '100%' }}
                          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                          className={`h-full rounded-xl bg-gradient-to-r from-rose-500 via-red-500 to-rose-600 flex items-center justify-center text-white text-xs sm:text-sm font-mono font-black relative overflow-hidden shadow-md shadow-rose-500/25 flex-1 ${
                            percent > 0 ? 'ms-1' : ''
                          }`}
                        >
                          {/* Pulsing light effect for shortfall deficit */}
                          <motion.div
                            className="absolute inset-0 bg-white/10"
                            animate={{ opacity: [0.2, 0.6, 0.2] }}
                            transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
                          />
                          <span className="relative z-10 px-2 truncate drop-shadow-xs flex items-center gap-1">
                            <span>-</span>{remaining.toLocaleString()} DH Gap ({deficitPercent}%)
                          </span>
                        </motion.div>
                      )}
                    </div>

                    {/* Bottom Metadata: Inflow & Pace */}
                    <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1 pt-0.5 gap-2">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
                        <span>{tr('trioAutoFedBy')}:</span>
                        <strong className="text-slate-800 dark:text-slate-200">
                          {tr('emergencyFund')} (+{monthlyInflow.toLocaleString()} DH/mo)
                        </strong>
                      </span>
                      <span className="font-mono text-slate-600 dark:text-slate-300 font-bold text-xs sm:text-sm">
                        {isDone
                          ? '✓ ' + tr('achievedLabel')
                          : paceMonths < 999
                          ? `~${paceMonths} ${tr('trioMonthsRemaining')}`
                          : 'Ongoing'}
                      </span>
                    </div>
                  </div>

                  {/* Benchmark Alignment Sync Pills */}
                  <div className="p-3.5 sm:p-4 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 space-y-2">
                    <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Target Benchmarks (1-Click Sync):
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {/* 6-Month Salary Button */}
                      <button
                        type="button"
                        onClick={handleSyncEmergencySalaryTarget}
                        className={`px-3.5 py-2.5 min-h-[50px] sm:min-h-[54px] rounded-xl text-xs sm:text-sm font-bold border transition-all text-start flex items-center justify-between cursor-pointer ${
                          isSalarySynced
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-800 dark:text-emerald-200 shadow-xs'
                            : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-emerald-400'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-1">
                            {isSalarySynced && <Icon name="Check" size={13} className="text-emerald-600" />}
                            <span>{tr('sixMoSalaryBenchmark')}</span>
                          </div>
                          <span className="text-[10px] sm:text-xs font-normal opacity-80 block">(6 × {salary.toLocaleString()} DH salary)</span>
                        </div>
                        <span className="font-mono font-black text-xs sm:text-sm">{targetSalary6Mo.toLocaleString()} DH</span>
                      </button>

                      {/* 6-Month Living Expenses Button */}
                      <button
                        type="button"
                        onClick={handleSyncEmergencyTarget}
                        className={`px-3.5 py-2.5 min-h-[50px] sm:min-h-[54px] rounded-xl text-xs sm:text-sm font-bold border transition-all text-start flex items-center justify-between cursor-pointer ${
                          isExpensesSynced
                            ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-500 text-amber-800 dark:text-amber-200 shadow-xs'
                            : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-amber-400'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-1">
                            {isExpensesSynced && <Icon name="Check" size={13} className="text-amber-600" />}
                            <span>{tr('sixMoExpenseBenchmark')}</span>
                          </div>
                          <span className="text-[10px] sm:text-xs font-normal opacity-80 block">(6 × {totalExpensesCost.toLocaleString()} DH bills)</span>
                        </div>
                        <span className="font-mono font-black text-xs sm:text-sm">{targetExpenses6Mo.toLocaleString()} DH</span>
                      </button>
                    </div>
                  </div>

                  {/* Quick Contribution Bar */}
                  <div className="pt-2 border-t border-emerald-500/15 flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm">
                    <span className="font-bold text-slate-600 dark:text-slate-300 text-xs sm:text-sm flex items-center gap-1">
                      <Icon name="Plus" size={14} className="text-emerald-500" />
                      {tr('quickContributeLabel')}:
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button
                        type="button"
                        onClick={() => emergencyQuest && handleContributeQuest(emergencyQuest.id, 100)}
                        className="px-3 py-1.5 min-h-[34px] sm:min-h-[38px] rounded-lg bg-slate-200/80 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold transition-all cursor-pointer active:scale-95"
                      >
                        +100 DH
                      </button>
                      <button
                        type="button"
                        onClick={() => emergencyQuest && handleContributeQuest(emergencyQuest.id, 500)}
                        className="px-3 py-1.5 min-h-[34px] sm:min-h-[38px] rounded-lg bg-slate-200/80 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold transition-all cursor-pointer active:scale-95"
                      >
                        +500 DH
                      </button>
                      <button
                        type="button"
                        onClick={() => emergencyQuest && handleContributeQuest(emergencyQuest.id, 1000)}
                        className="px-3 py-1.5 min-h-[34px] sm:min-h-[38px] rounded-lg bg-slate-200/80 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold transition-all cursor-pointer active:scale-95"
                      >
                        +1,000 DH
                      </button>
                      <button
                        type="button"
                        onClick={() => emergencyQuest && handleContributeQuest(emergencyQuest.id, monthlyInflow > 0 ? monthlyInflow : 500)}
                        className="px-3.5 py-1.5 min-h-[34px] sm:min-h-[38px] rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all cursor-pointer flex items-center gap-1 active:scale-95 shadow-xs"
                      >
                        <Icon name="ArrowUpRight" size={13} />
                        <span>+{monthlyInflow > 0 ? monthlyInflow.toLocaleString() : 500} DH</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400 italic text-center">
            "{tr('questsQuote')}"
          </div>
        </div>

      </div>

      {/* ============================================================== */}
      {/* 5. SOLUTIONS FOR DEVELOPING CURRENT INCOME (UNIQUE SECTION) */}
      {/* ============================================================== */}
      <div
        id="guide-income-solutions"
        className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-4 sm:p-6 md:p-8 mb-8 shadow-sm transition-all duration-300 relative"
      >
        {/* SMART IN-SECTION POINTER 7 */}
        <SmartSectionPointer
          number={7}
          title={tr('pointer7Title')}
          desc={tr('pointer7Desc')}
          metricChip={`Potential Boost: +${Math.round(salary * 0.2).toLocaleString()} to +3,000 DH/mo`}
        />

        {/* SECTION HEADER: Title, Subtitle & Add Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0 shadow-2xs">
              <Icon name="TrendingUp" size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                  {tr('incomeSolutionsTitle')}
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[10px] sm:text-xs font-black uppercase tracking-wider">
                  {tr('strategicBoostsBadge')}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-3xl leading-relaxed">
                {tr('incomeSolutionsSubtitle')}
              </p>
            </div>
          </div>

          {/* Button: Add Custom Solution */}
          <button
            type="button"
            onClick={() => setShowAddSolutionModal(prev => !prev)}
            className="w-full sm:w-auto px-4 py-2.5 min-h-[42px] sm:min-h-[44px] rounded-xl text-xs sm:text-sm font-bold bg-amber-500 text-white hover:bg-amber-600 shadow-sm shadow-amber-500/20 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 shrink-0 self-start sm:self-center"
          >
            <Icon name={showAddSolutionModal ? 'X' : 'Plus'} size={15} />
            <span>{showAddSolutionModal ? tr('cancelBtn') : tr('addCustomSolutionBtn')}</span>
          </button>
        </div>

        {/* FORM: ADD CUSTOM INCOME SOLUTION */}
        {showAddSolutionModal && (
          <form
            onSubmit={handleAddCustomSolution}
            className="p-4 sm:p-6 mb-6 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 space-y-4 transition-all shadow-xs"
          >
            <div className="text-xs sm:text-sm font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300 flex items-center gap-2">
              <Icon name="Sparkles" size={16} className="text-amber-500" />
              <span>{tr('addNewSolutionModalTitle')}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 sm:gap-4">
              {/* Solution Title */}
              <div className="sm:col-span-2 lg:col-span-6">
                <label className="text-[11px] sm:text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                  {tr('newSolutionTitleLabel')}
                </label>
                <input
                  type="text"
                  required
                  placeholder={tr('newSolutionTitlePlaceholder')}
                  value={newSolutionTitle}
                  onChange={e => setNewSolutionTitle(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 sm:py-3 min-h-[42px] sm:min-h-[44px] text-xs sm:text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              {/* Boost Amount */}
              <div className="sm:col-span-1 lg:col-span-3">
                <label className="text-[11px] sm:text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                  {tr('newSolutionBoostLabel')}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    required
                    min="50"
                    step="100"
                    placeholder={tr('newSolutionBoostPlaceholder')}
                    value={newSolutionBoost}
                    onChange={e => setNewSolutionBoost(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl ps-3 pe-8 py-2.5 sm:py-3 min-h-[42px] sm:min-h-[44px] text-xs sm:text-sm font-mono font-bold text-slate-900 dark:text-white outline-none focus:border-amber-500 transition-colors"
                  />
                  <span className="absolute end-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">DH</span>
                </div>
              </div>

              {/* Category Select */}
              <div className="sm:col-span-1 lg:col-span-3">
                <label className="text-[11px] sm:text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                  {tr('newSolutionCategoryLabel')}
                </label>
                <select
                  value={newSolutionCategory}
                  onChange={e => setNewSolutionCategory(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 sm:py-3 min-h-[42px] sm:min-h-[44px] text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 outline-none focus:border-amber-500 transition-colors"
                >
                  <option value="Side Hustle">{tr('catSideHustle')}</option>
                  <option value="Freelance">{tr('catFreelance')}</option>
                  <option value="Career Promotion">{tr('catCareer')}</option>
                  <option value="Passive Income">{tr('catPassive')}</option>
                  <option value="Consulting">{tr('catConsulting')}</option>
                  <option value="Digital Product">{tr('catDigital')}</option>
                </select>
              </div>
            </div>

            {/* Logo URL & Description */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 sm:gap-4">
              <div className="sm:col-span-1 lg:col-span-5">
                <label className="text-[11px] sm:text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                  {tr('logoUrlLabel')}
                </label>
                <input
                  type="url"
                  placeholder={tr('logoUrlPlaceholder')}
                  value={newSolutionLogoUrl}
                  onChange={e => setNewSolutionLogoUrl(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 sm:py-3 min-h-[42px] sm:min-h-[44px] text-xs sm:text-sm text-slate-900 dark:text-white outline-none focus:border-amber-500 transition-colors"
                />
              </div>
              <div className="sm:col-span-1 lg:col-span-7">
                <label className="text-[11px] sm:text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                  {tr('strategySummaryLabel')}
                </label>
                <input
                  type="text"
                  placeholder={tr('strategySummaryPlaceholder')}
                  value={newSolutionDesc}
                  onChange={e => setNewSolutionDesc(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 sm:py-3 min-h-[42px] sm:min-h-[44px] text-xs sm:text-sm text-slate-900 dark:text-white outline-none focus:border-amber-500 transition-colors"
                />
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-amber-200/60 dark:border-amber-900/40">
              <button
                type="button"
                onClick={() => setShowAddSolutionModal(false)}
                className="px-4 py-2.5 min-h-[40px] rounded-xl text-xs sm:text-sm font-bold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 transition-colors cursor-pointer"
              >
                {tr('cancelBtn')}
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 min-h-[40px] rounded-xl text-xs sm:text-sm font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 transition-all shadow-xs cursor-pointer active:scale-95"
              >
                {tr('saveSolutionBtn')}
              </button>
            </div>
          </form>
        )}

        {/* RESPONSIVE GRID OF STRATEGIC INCOME SOLUTIONS (Mobile: 1 Col, Tablet/Laptop: 2 Cols) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {incomeSolutions.map(sol => {
            const localizedTitle = sol.isCustom ? sol.defaultTitle : (tr(sol.titleKey) || sol.defaultTitle);
            const localizedDesc = sol.isCustom ? sol.defaultDesc : (tr(sol.descKey) || sol.defaultDesc);

            return (
              <div
                key={sol.id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col justify-between gap-3.5 shadow-2xs ${
                  sol.isCustom
                    ? 'bg-amber-500/5 dark:bg-amber-950/20 border-amber-300/80 dark:border-amber-800/60 hover:border-amber-400 hover:shadow-sm'
                    : 'bg-slate-50/70 dark:bg-slate-950/60 border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm'
                }`}
              >
                {editingSolutionId === sol.id ? (
                  /* INLINE EDIT FORM FOR SOLUTION */
                  <form onSubmit={handleSaveEditSolution} className="space-y-3 py-1">
                    <div className="flex items-center justify-between pb-1 border-b border-slate-200 dark:border-slate-800">
                      <span className="text-xs sm:text-sm font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Icon name="Pencil" size={14} />
                        {tr('editSolutionModalTitle')}
                      </span>
                      <button
                        type="button"
                        onClick={() => setEditingSolutionId(null)}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                      >
                        <Icon name="X" size={15} />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-2.5">
                      <div className="sm:col-span-6">
                        <label className="text-[10px] sm:text-xs font-bold text-slate-500 block mb-0.5">{tr('newSolutionTitleLabel')}</label>
                        <input
                          type="text"
                          required
                          value={editSolutionTitle}
                          onChange={e => setEditSolutionTitle(e.target.value)}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 min-h-[38px] sm:min-h-[40px] text-xs sm:text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-amber-500"
                        />
                      </div>
                      <div className="sm:col-span-3">
                        <label className="text-[10px] sm:text-xs font-bold text-slate-500 block mb-0.5">{tr('newSolutionBoostLabel')} (DH)</label>
                        <input
                          type="number"
                          required
                          min="50"
                          value={editSolutionBoost}
                          onChange={e => setEditSolutionBoost(e.target.value)}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 min-h-[38px] sm:min-h-[40px] text-xs sm:text-sm font-mono font-bold text-slate-900 dark:text-white outline-none focus:border-amber-500"
                        />
                      </div>
                      <div className="sm:col-span-3">
                        <label className="text-[10px] sm:text-xs font-bold text-slate-500 block mb-0.5">{tr('newSolutionCategoryLabel')}</label>
                        <select
                          value={editSolutionCategory}
                          onChange={e => setEditSolutionCategory(e.target.value)}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 min-h-[38px] sm:min-h-[40px] text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 outline-none focus:border-amber-500"
                        >
                          <option value="Side Hustle">{tr('catSideHustle')}</option>
                          <option value="Freelance">{tr('catFreelance')}</option>
                          <option value="Career Promotion">{tr('catCareer')}</option>
                          <option value="Passive Income">{tr('catPassive')}</option>
                          <option value="Consulting">{tr('catConsulting')}</option>
                          <option value="Digital Product">{tr('catDigital')}</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-2.5">
                      <div className="sm:col-span-6">
                        <label className="text-[10px] sm:text-xs font-bold text-slate-500 block mb-0.5">{tr('strategySummaryLabel')}</label>
                        <input
                          type="text"
                          value={editSolutionDesc}
                          onChange={e => setEditSolutionDesc(e.target.value)}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 min-h-[38px] sm:min-h-[40px] text-xs sm:text-sm text-slate-900 dark:text-white outline-none focus:border-amber-500"
                          placeholder={tr('strategySummaryPlaceholder')}
                        />
                      </div>
                      <div className="sm:col-span-6">
                        <label className="text-[10px] sm:text-xs font-bold text-slate-500 block mb-0.5">{tr('logoUrlLabel')}</label>
                        <input
                          type="url"
                          value={editSolutionLogoUrl}
                          onChange={e => setEditSolutionLogoUrl(e.target.value)}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 min-h-[38px] sm:min-h-[40px] text-xs sm:text-sm text-slate-900 dark:text-white outline-none focus:border-amber-500"
                          placeholder="https://... (logo image)"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() => setEditingSolutionId(null)}
                        className="px-3.5 py-2 min-h-[36px] text-xs sm:text-sm font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer"
                      >
                        {tr('cancelBtn')}
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 min-h-[36px] rounded-xl text-xs sm:text-sm font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-xs transition-all cursor-pointer"
                      >
                        {tr('saveChangesBtn')}
                      </button>
                    </div>
                  </form>
                ) : (
                  /* STANDARD SOLUTION ROW */
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
                    <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                      {/* ICON OR LOGO IMAGE WITH SMOOTH FALLBACK */}
                      <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center shrink-0 border overflow-hidden relative shadow-2xs ${
                        sol.isCustom
                          ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
                          : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                      }`}>
                        {sol.logoUrl ? (
                          <img
                            src={sol.logoUrl}
                            alt={localizedTitle}
                            className="w-full h-full object-cover rounded-2xl"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              const fallback = e.currentTarget.parentElement?.querySelector('.sol-icon-fallback');
                              if (fallback) fallback.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        <span className={`sol-icon-fallback ${sol.logoUrl ? 'hidden' : 'flex'} items-center justify-center`}>
                          <Icon name={sol.icon || 'TrendingUp'} size={20} />
                        </span>
                      </div>

                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-snug break-words">
                            {localizedTitle}
                          </span>
                          {sol.isCustom ? (
                            <span className="text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-md font-extrabold uppercase tracking-wider bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300/60 dark:border-amber-800">
                              {tr('customBadge')}
                            </span>
                          ) : (
                            <span className="text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                              {sol.category}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug break-words">
                          {localizedDesc}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-stretch sm:self-center justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800/80">
                      {/* EDIT BUTTON */}
                      <button
                        type="button"
                        onClick={() => handleStartEditSolution(sol)}
                        className="w-9 h-9 min-w-[36px] min-h-[36px] rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-amber-100 dark:hover:bg-amber-950/40 text-slate-500 hover:text-amber-600 dark:text-slate-400 dark:hover:text-amber-400 transition-all flex items-center justify-center cursor-pointer active:scale-90"
                        title={tr('editSolutionTooltip')}
                        aria-label="Edit solution"
                      >
                        <Icon name="Edit2" size={15} />
                      </button>

                      {/* DELETE BUTTON */}
                      <button
                        type="button"
                        onClick={() => handleDeleteSolution(sol.id)}
                        className="w-9 h-9 min-w-[36px] min-h-[36px] rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-100 dark:hover:bg-rose-950/40 text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 transition-all flex items-center justify-center cursor-pointer active:scale-90"
                        title={tr('deleteSolutionTooltip')}
                        aria-label="Delete solution"
                      >
                        <Icon name="Trash" size={15} />
                      </button>

                      {/* APPLY BOOST BUTTON */}
                      <button
                        type="button"
                        onClick={() => handleApplyIncomeBoost(sol.boostAmount)}
                        className="flex-1 sm:flex-initial px-3.5 py-2 min-h-[40px] sm:min-h-[42px] bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
                        title={tr('appliedToSalaryTooltip')}
                      >
                        <Icon name="ArrowUpRight" size={14} className="text-amber-400 dark:text-amber-600" />
                        <span>+{sol.boostAmount.toLocaleString()} DH / mo</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* QUICK CUSTOM TARGET BOOST INPUT BAR */}
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/90 dark:border-amber-900/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Icon name="Zap" size={20} />
            </div>
            <div>
              <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white block">
                {tr('customIncomeTargetLabel')}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {tr('customIncomeTargetDesc')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-40">
              <input
                type="number"
                min="100"
                step="500"
                value={customIncomeBoostInput}
                onChange={e => setCustomIncomeBoostInput(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-800 rounded-xl ps-3.5 pe-8 py-2.5 min-h-[42px] sm:min-h-[44px] text-xs sm:text-sm font-mono font-bold text-slate-900 dark:text-white outline-none focus:border-amber-500"
              />
              <span className="absolute end-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold pointer-events-none">DH</span>
            </div>
            <button
              type="button"
              onClick={() => handleApplyIncomeBoost(Math.max(100, Number(customIncomeBoostInput) || 0))}
              className="px-4 py-2.5 min-h-[42px] sm:min-h-[44px] bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm active:scale-95 transition-all cursor-pointer shrink-0 flex items-center gap-1.5"
            >
              <Icon name="Plus" size={15} />
              <span>{tr('upgradeAllocatorSalary')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 6. TARGET PURCHASE & FAST-TRACK PLANNER (EXACT REDESIGN MATCH) */}
      {/* ============================================================== */}
      <div
        id="guide-calculator"
        className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-7 md:p-9 mb-8 shadow-sm relative transition-colors duration-200"
      >
        {/* SMART IN-SECTION POINTER 8 */}
        <SmartSectionPointer
          number={8}
          title={tr('pointer8Title')}
          desc={tr('pointer8Desc')}
          metricChip={`Target: ${calcCost.toLocaleString()} DH • AI Fast-Track: ${targetPurchase.fastTrackMonths} Mo`}
        />

        {/* SECTION HEADER: Modern Icon, Title & Subtitle */}
        <div className="flex items-start sm:items-center gap-3.5 mb-6 sm:mb-8">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/70 dark:border-indigo-800/70 flex items-center justify-center shrink-0 shadow-2xs">
            <Icon name="Calculator" size={22} />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl md:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
              {tr('calculatorTitle')}
            </h3>
            <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
              {tr('calculatorSubtitle')}
            </p>
          </div>
        </div>

        {/* MAIN RESPONSIVE CONTENT GRID (Inputs on Left, Timeline Card on Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
          
          {/* LEFT COLUMN: Input Fields & Fast Sync Helpers */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-4 sm:space-y-6">
            
            {/* Field 1: Target Objective / Acquisition Item */}
            <div>
              <label className="text-[11px] sm:text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1.5 sm:mb-2">
                {tr('targetObjectiveLabel')}
              </label>
              <input
                type="text"
                value={calcItemName}
                onChange={e => setCalcItemName(e.target.value)}
                placeholder={tr('calcTargetPlaceholder')}
                className="w-full bg-slate-50/80 dark:bg-slate-950/80 border border-slate-200/80 dark:border-slate-800 rounded-2xl px-4 sm:px-5 py-3 sm:py-3.5 min-h-[46px] sm:min-h-[50px] text-sm sm:text-base font-bold text-slate-900 dark:text-white outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-950 shadow-2xs transition-all"
              />
            </div>

            {/* Fields 2 & 3: Asset Price & Dedicated Monthly Savings */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="text-[11px] sm:text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1.5 sm:mb-2">
                  {tr('targetPrice')} (DH)
                </label>
                <input
                  type="number"
                  min="100"
                  value={calcCost || ''}
                  onChange={e => setCalcCost(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-slate-50/80 dark:bg-slate-950/80 border border-slate-200/80 dark:border-slate-800 rounded-2xl px-4 sm:px-5 py-3 sm:py-3.5 min-h-[46px] sm:min-h-[50px] text-base sm:text-lg font-black font-mono text-slate-900 dark:text-white outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-950 shadow-2xs transition-all"
                />
              </div>

              <div>
                <label className="text-[11px] sm:text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1.5 sm:mb-2">
                  {tr('monthlySavingRate')} (DH)
                </label>
                <input
                  type="number"
                  min="50"
                  value={calcMonthlySaving || ''}
                  onChange={e => setCalcMonthlySaving(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-slate-50/80 dark:bg-slate-950/80 border border-slate-200/80 dark:border-slate-800 rounded-2xl px-4 sm:px-5 py-3 sm:py-3.5 min-h-[46px] sm:min-h-[50px] text-base sm:text-lg font-black font-mono text-slate-900 dark:text-white outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-950 shadow-2xs transition-all"
                />
              </div>
            </div>

            {/* Quick 1-Click Sync & Preset Helpers */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[11px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">
                Quick Sync:
              </span>
              {allocations.safeAmount > 0 && (
                <button
                  type="button"
                  onClick={() => setCalcMonthlySaving(allocations.safeAmount)}
                  className="px-3 sm:px-3.5 py-1.5 min-h-[36px] sm:min-h-[38px] rounded-xl text-xs sm:text-sm font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all cursor-pointer active:scale-95"
                >
                  {tr('syncWithSavingsPillar')} (+{allocations.safeAmount.toLocaleString()} DH)
                </button>
              )}
              {freeCashBuffer > 0 && (
                <button
                  type="button"
                  onClick={() => setCalcMonthlySaving(freeCashBuffer)}
                  className="px-3 sm:px-3.5 py-1.5 min-h-[36px] sm:min-h-[38px] rounded-xl text-xs sm:text-sm font-bold bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20 hover:bg-indigo-500/20 transition-all cursor-pointer active:scale-95"
                >
                  {tr('syncWithFreeBuffer')} (+{freeCashBuffer.toLocaleString()} DH)
                </button>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Estimated Timeline & Save PDF Plan Card (Pixel-matching screenshot) */}
          <div className="lg:col-span-5 p-5 sm:p-7 md:p-8 rounded-3xl border border-indigo-200/90 dark:border-indigo-900/50 bg-indigo-50/40 dark:bg-indigo-950/20 flex flex-col justify-between gap-5 sm:gap-6 relative shadow-xs">
            <div>
              {/* Timeline Header Label */}
              <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block mb-1.5">
                {tr('estimatedDuration')}
              </span>

              {/* Big Metric Display */}
              <div className="flex items-baseline flex-wrap gap-1 mb-4">
                <span className="text-4xl sm:text-5xl md:text-6xl font-black font-mono text-indigo-600 dark:text-indigo-300 tracking-tight">
                  {calcMonths}
                </span>
                <span className="text-xl sm:text-2xl font-bold text-slate-700 dark:text-slate-200 ms-2">
                  {tr('monthsLabel')}
                </span>
                <span className="text-xs sm:text-sm font-semibold text-slate-400 dark:text-slate-500 ms-1.5">
                  ({(calcMonths / 12).toFixed(1)} {tr('yearsLabel')})
                </span>
              </div>

              {/* White Inner Card: AI Fast-Track Boost */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-1.5">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm font-black">
                  <Icon name="Rocket" size={16} />
                  <span>{tr('fastTrackTipTitle')}</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  {tr('fastTrackMsg')
                    .replace('{amount}', fastTrackMonthly.toLocaleString())
                    .replace('{months}', String(targetPurchase.fastTrackMonths || Math.max(1, Math.floor(calcMonths * 0.7))))}
                </p>
              </div>
            </div>

            {/* Sleek Action Button: SAVE PDF PLAN WITH MULTI-LANGUAGE CONTROLS */}
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => handleDownloadPDF(pdfLanguage)}
                disabled={isGeneratingPDF}
                className="w-full py-3.5 sm:py-4 px-6 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 disabled:opacity-60 text-white dark:text-slate-900 text-xs sm:text-sm md:text-base font-black uppercase tracking-wider transition-all shadow-md active:scale-98 cursor-pointer flex items-center justify-center gap-2.5 min-h-[48px] sm:min-h-[52px]"
              >
                {isGeneratingPDF ? (
                  <>
                    <Icon name="Loader2" size={18} className="animate-spin text-amber-500" />
                    <span>{ptr('generatingPdf', pdfLanguage)}</span>
                  </>
                ) : (
                  <>
                    <Icon name="Download" size={18} />
                    <span>{tr('savePdfPlan')}</span>
                    <span className="text-[11px] sm:text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 dark:text-amber-600 font-mono font-bold uppercase">
                      {pdfLanguage}
                    </span>
                  </>
                )}
              </button>

              {/* Fast Language Selection Bar for PDF Export */}
              <div className="flex items-center justify-between px-1 pt-0.5 text-xs text-slate-500 dark:text-slate-400 flex-wrap gap-2">
                <span className="font-semibold flex items-center gap-1.5 text-xs">
                  <Icon name="Globe" size={13} />
                  <span>{ptr('chooseLanguage', language)}:</span>
                </span>
                <div className="flex items-center gap-1.5">
                  {(['en', 'fr', 'es', 'ar'] as Language[]).map(langCode => (
                    <button
                      key={langCode}
                      type="button"
                      onClick={() => {
                        setPdfLanguage(langCode);
                        handleDownloadPDF(langCode);
                      }}
                      className={`px-2.5 sm:px-3 py-1 min-h-[30px] sm:min-h-[34px] rounded-lg font-bold text-xs uppercase transition-all cursor-pointer ${
                        pdfLanguage === langCode
                          ? 'bg-amber-500 text-slate-950 font-black shadow-xs scale-105'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {langCode}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* ============================================================== */}
      {/* 7. QUICK ACTION MODALS (Send, Receive, Add, Swap) */}
      {/* ============================================================== */}
      <AnimatePresence>
        {activeActionModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/80 md:backdrop-blur-sm p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-7 md:p-8 rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto relative z-10 shadow-2xl"
              dir={dir}
            >
              <button
                type="button"
                onClick={() => {
                  setActiveActionModal(null);
                  setActionSuccessMessage('');
                }}
                className="absolute top-4 sm:top-5 end-4 sm:end-5 text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer w-8 h-8 rounded-xl flex items-center justify-center"
              >
                <Icon name="X" size={20} />
              </button>

              {/* MODAL 1: SEND MONEY (Repurposed to Record Expense Entry) */}
              {activeActionModal === 'send' && (
                <div>
                  <div className="flex items-center gap-3 mb-5 sm:mb-6">
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                      <Icon name="Send" size={22} />
                    </div>
                    <div>
                      <h4 className="text-base sm:text-lg md:text-xl font-black uppercase text-slate-900 dark:text-white">
                        {tr('sendMoney')}
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-400">Record expense & payment entry</p>
                    </div>
                  </div>

                  {actionSuccessMessage ? (
                    <div className="p-4 sm:p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-2.5">
                      <Icon name="CheckCircle" size={36} className="text-emerald-500 mx-auto" />
                      <h5 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">{actionSuccessMessage}</h5>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveActionModal(null);
                          setActionSuccessMessage('');
                        }}
                        className="mt-3 px-5 py-2.5 min-h-[40px] sm:min-h-[44px] bg-emerald-500 text-white rounded-xl text-xs sm:text-sm font-bold cursor-pointer"
                      >
                        {tr('transferDone')}
                      </button>
                    </div>
                  ) : (
                    <form
                      onSubmit={e => {
                        e.preventDefault();
                        const amount = Math.max(0, Math.round(Number(sendExpenseCost)));
                        if (!sendExpenseLabel.trim() || amount <= 0) return;
                        
                        const availableSourceFunds = sendExpensePaidFrom === 'card' ? cardLimit : unallocatedVault;
                        if (sendExpensePaid && amount > availableSourceFunds) {
                          alert(`Insufficient funds in chosen source. Available: ${availableSourceFunds.toLocaleString()} DH`);
                          return;
                        }

                        if (sendExpensePaid) {
                          if (sendExpensePaidFrom === 'card') {
                            setCardAllocation(curr => Math.max(0, curr - amount));
                            setTotalLiquidFunds(curr => Math.max(0, curr - amount));
                          } else {
                            setTotalLiquidFunds(curr => Math.max(0, curr - amount));
                          }
                        }

                        const newExpense: ExpenseRecord = {
                          id: `exp_${Date.now()}`,
                          label: sendExpenseLabel.trim(),
                          cost: amount,
                          paid: sendExpensePaid,
                          icon: sendExpenseCategory === 'fixed' ? 'Home' : 'CreditCard',
                          category: sendExpenseCategory,
                          paidFrom: sendExpensePaidFrom,
                        };
                        setExpenses(prev => [newExpense, ...prev]);

                        const newTx: FinancialTransaction = {
                          id: `tx_${Date.now()}`,
                          type: 'expense',
                          amount,
                          currency: 'MAD',
                          amountMAD: amount,
                          description: `Expense: ${sendExpenseLabel.trim()}`,
                          category: sendExpenseCategory,
                          sourceAccount: sendExpensePaidFrom === 'card' ? 'Titanium Card' : 'Unallocated Vault',
                          timestamp: Date.now(),
                          status: sendExpensePaid ? 'completed' : 'pending',
                        };
                        setTransactions(prev => [newTx, ...prev]);

                        setActionSuccessMessage(`Recorded expense of ${amount.toLocaleString()} DH for "${sendExpenseLabel.trim()}".`);
                        setSendExpenseLabel('');
                        setSendExpenseCost('');
                      }}
                      className="space-y-3.5"
                    >
                      <div>
                        <label className="text-xs sm:text-sm font-bold text-slate-400 block mb-1">Vendor / Description</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. AWS Cloud, Cafe, Rent, Supermarket..."
                          value={sendExpenseLabel}
                          onChange={e => setSendExpenseLabel(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 sm:py-3 min-h-[42px] sm:min-h-[44px] text-xs sm:text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500 font-bold"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs sm:text-sm font-bold text-slate-400 block mb-1">Amount (DH)</label>
                          <input
                            type="number"
                            required
                            min="1"
                            placeholder="0.00"
                            value={sendExpenseCost}
                            onChange={e => setSendExpenseCost(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 sm:py-3 min-h-[42px] sm:min-h-[44px] text-base sm:text-lg font-black font-mono text-slate-900 dark:text-white outline-none focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label className="text-xs sm:text-sm font-bold text-slate-400 block mb-1">Category</label>
                          <select
                            value={sendExpenseCategory}
                            onChange={e => setSendExpenseCategory(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 sm:py-3 min-h-[42px] sm:min-h-[44px] text-xs sm:text-sm text-slate-700 dark:text-slate-300 outline-none font-bold"
                          >
                            <option value="fixed">{tr('fixedCosts')}</option>
                            <option value="lifestyle">{tr('lifestyleCosts')}</option>
                            {customCategories.filter(c => c !== 'fixed' && c !== 'lifestyle').map(c => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="text-xs sm:text-sm font-bold text-slate-400 block mb-1">Payment Source</label>
                        <div className="grid grid-cols-2 gap-2.5">
                          <button
                            type="button"
                            onClick={() => setSendExpensePaidFrom('card')}
                            className={`p-3 min-h-[46px] rounded-xl border text-xs sm:text-sm font-bold text-start transition-all cursor-pointer ${
                              sendExpensePaidFrom === 'card'
                                ? 'bg-amber-500/10 border-amber-500 text-amber-600 dark:text-amber-400'
                                : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            <span className="block font-black">Titanium Card</span>
                            <span className="text-[10px] sm:text-xs opacity-75 font-mono">{cardLimit.toLocaleString()} DH avail.</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setSendExpensePaidFrom('vault')}
                            className={`p-3 min-h-[46px] rounded-xl border text-xs sm:text-sm font-bold text-start transition-all cursor-pointer ${
                              sendExpensePaidFrom === 'vault'
                                ? 'bg-blue-500/10 border-blue-500 text-blue-600 dark:text-blue-400'
                                : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            <span className="block font-black">Liquid Vault</span>
                            <span className="text-[10px] sm:text-xs opacity-75 font-mono">{unallocatedVault.toLocaleString()} DH avail.</span>
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 gap-3">
                        <div>
                          <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white block">Status</span>
                          <span className="text-[10px] sm:text-xs text-slate-400">
                            {sendExpensePaid ? 'Paid immediately (deducts liquid balance)' : 'Pending / Due (liability to pay later)'}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSendExpensePaid(!sendExpensePaid)}
                          className={`px-3.5 py-1.5 min-h-[36px] sm:min-h-[38px] rounded-xl text-xs sm:text-sm font-bold cursor-pointer transition-colors shrink-0 ${
                            sendExpensePaid ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          {sendExpensePaid ? 'Paid Now' : 'Pending'}
                        </button>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3.5 min-h-[46px] sm:min-h-[48px] bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm uppercase tracking-wider rounded-xl shadow-md transition-colors cursor-pointer"
                      >
                        Record Expense Entry
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* MODAL 2: RECEIVE (QR) + RECORD INCOME ENTRY */}
              {activeActionModal === 'receive' && (
                <div className="text-center">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 mx-auto flex items-center justify-center mb-3">
                    <Icon name="GridDots" size={24} />
                  </div>
                  <h4 className="text-base sm:text-lg md:text-xl font-black uppercase text-slate-900 dark:text-white mb-1">
                    {tr('receiveMoney')}
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-400 mb-4">{tr('scanQrSubtitle')}</p>

                  {/* QR SIMULATOR PRESERVED */}
                  <div className="w-32 h-32 sm:w-36 sm:h-36 bg-white p-3 rounded-2xl mx-auto shadow-inner border border-slate-200 mb-3 flex items-center justify-center">
                    <svg className="w-full h-full text-slate-900" viewBox="0 0 100 100" fill="currentColor">
                      <rect x="10" y="10" width="25" height="25" />
                      <rect x="15" y="15" width="15" height="15" fill="white" />
                      <rect x="18" y="18" width="9" height="9" />
                      <rect x="65" y="10" width="25" height="25" />
                      <rect x="70" y="15" width="15" height="15" fill="white" />
                      <rect x="73" y="18" width="9" height="9" />
                      <rect x="10" y="65" width="25" height="25" />
                      <rect x="15" y="70" width="15" height="15" fill="white" />
                      <rect x="18" y="73" width="9" height="9" />
                      <rect x="42" y="15" width="10" height="20" />
                      <rect x="42" y="45" width="16" height="16" />
                      <rect x="65" y="65" width="12" height="12" />
                      <rect x="80" y="70" width="10" height="20" />
                    </svg>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-mono text-slate-700 dark:text-slate-300 flex items-center justify-between mb-4">
                    <span className="truncate">sa_vault_0x984f1337babe</span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard?.writeText('sa_vault_0x984f1337babe');
                        setCardCopied(true);
                        setTimeout(() => setCardCopied(false), 2000);
                      }}
                      className="text-amber-500 font-bold ps-2 shrink-0 cursor-pointer min-h-[32px] flex items-center"
                    >
                      {cardCopied ? tr('copiedBtn') : tr('copyBtn')}
                    </button>
                  </div>

                  {actionSuccessMessage ? (
                    <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm font-bold mb-3">
                      {actionSuccessMessage}
                    </div>
                  ) : (
                    /* RECORD INCOME ENTRY FORM */
                    <form
                      onSubmit={e => {
                        e.preventDefault();
                        const amount = Math.max(0, Math.round(Number(receiveIncomeAmount)));
                        if (amount <= 0) return;
                        const safeSource = receiveIncomeSource.trim() || 'Incoming Payment';

                        setTotalLiquidFunds(curr => curr + amount);
                        const newTx: FinancialTransaction = {
                          id: `tx_${Date.now()}`,
                          type: 'income',
                          amount,
                          currency: 'MAD',
                          amountMAD: amount,
                          description: `Income: ${safeSource}`,
                          destinationAccount: 'Unallocated Vault',
                          timestamp: Date.now(),
                          status: 'completed',
                        };
                        setTransactions(prev => [newTx, ...prev]);
                        setActionSuccessMessage(`Recorded incoming payment of +${amount.toLocaleString()} DH from "${safeSource}".`);
                        setReceiveIncomeSource('');
                        setReceiveIncomeAmount('');
                      }}
                      className="space-y-2.5 text-start pt-3 border-t border-slate-100 dark:border-slate-800"
                    >
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Record Income Entry</span>
                      <input
                        type="text"
                        placeholder="Source (e.g. Client Payment, Freelance, Gift)..."
                        value={receiveIncomeSource}
                        onChange={e => setReceiveIncomeSource(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 min-h-[42px] sm:min-h-[44px] text-xs sm:text-sm text-slate-900 dark:text-white outline-none focus:border-emerald-500 font-bold"
                      />
                      <div className="flex gap-2">
                        <input
                          type="number"
                          min="1"
                          placeholder="Amount in DH..."
                          value={receiveIncomeAmount}
                          onChange={e => setReceiveIncomeAmount(e.target.value)}
                          className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 min-h-[42px] sm:min-h-[44px] text-xs sm:text-sm font-mono font-bold text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                        />
                        <button
                          type="submit"
                          className="px-4 py-2.5 min-h-[42px] sm:min-h-[44px] bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md cursor-pointer transition-colors shrink-0"
                        >
                          Record Income
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* MODAL 3: ADD FUNDS / OPENING BALANCE ADJUSTMENT */}
              {activeActionModal === 'add' && (
                <div>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                      <Icon name="Plus" size={22} />
                    </div>
                    <div>
                      <h4 className="text-base sm:text-lg md:text-xl font-black uppercase text-slate-900 dark:text-white">
                        {tr('addFunds')}
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-400">Manual balance adjustment & deposit recording</p>
                    </div>
                  </div>

                  {actionSuccessMessage ? (
                    <div className="p-4 sm:p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-2.5">
                      <Icon name="CheckCircle" size={36} className="text-emerald-500 mx-auto" />
                      <h5 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">{actionSuccessMessage}</h5>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveActionModal(null);
                          setActionSuccessMessage('');
                        }}
                        className="mt-3 px-5 py-2.5 min-h-[40px] sm:min-h-[44px] bg-emerald-500 text-white rounded-xl text-xs sm:text-sm font-bold cursor-pointer"
                      >
                        Done
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Mode Switcher: Deposit vs Opening Balance */}
                      <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl gap-1">
                        <button
                          type="button"
                          onClick={() => setDepositMode('deposit')}
                          className={`flex-1 py-2 min-h-[38px] sm:min-h-[40px] text-xs sm:text-sm font-bold rounded-lg transition-colors cursor-pointer ${
                            depositMode === 'deposit'
                              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                              : 'text-slate-500'
                          }`}
                        >
                          Top-Up Deposit
                        </button>
                        <button
                          type="button"
                          onClick={() => setDepositMode('opening_balance')}
                          className={`flex-1 py-2 min-h-[38px] sm:min-h-[40px] text-xs sm:text-sm font-bold rounded-lg transition-colors cursor-pointer ${
                            depositMode === 'opening_balance'
                              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                              : 'text-slate-500'
                          }`}
                        >
                          Set Opening Balance
                        </button>
                      </div>

                      <div>
                        <label className="text-xs sm:text-sm font-bold text-slate-400 block mb-1">
                          {depositMode === 'deposit' ? 'Deposit Amount (DH)' : 'Opening Baseline Balance (DH)'}
                        </label>
                        <input
                          type="number"
                          min="0"
                          placeholder="e.g. 5000"
                          value={depositAmountInput}
                          onChange={e => setDepositAmountInput(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 sm:py-3 min-h-[48px] sm:min-h-[52px] text-xl sm:text-2xl font-black font-mono text-slate-900 dark:text-white outline-none focus:border-amber-500"
                        />
                      </div>

                      {/* Quick Presets */}
                      <div className="flex flex-wrap gap-2">
                        {[1000, 2500, 5000, 15000].map(val => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => setDepositAmountInput(String(val))}
                            className="px-3 py-1.5 min-h-[34px] sm:min-h-[36px] rounded-lg text-xs sm:text-sm font-mono font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 cursor-pointer"
                          >
                            +{val.toLocaleString()} DH
                          </button>
                        ))}
                      </div>

                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        {depositMode === 'deposit'
                          ? 'Adds liquid cash directly to your Unallocated Vault without phantom money.'
                          : 'Establishes the initial baseline capital of your personal wallet honestly.'}
                      </p>

                      <button
                        type="button"
                        onClick={() => {
                          const val = Math.max(0, Math.round(Number(depositAmountInput)));
                          if (depositMode === 'deposit') {
                            if (val <= 0) return;
                            setTotalLiquidFunds(curr => curr + val);
                            const newTx: FinancialTransaction = {
                              id: `tx_${Date.now()}`,
                              type: 'deposit',
                              amount: val,
                              currency: 'MAD',
                              amountMAD: val,
                              description: 'Manual deposit to Liquid Vault',
                              timestamp: Date.now(),
                              status: 'completed',
                            };
                            setTransactions(prev => [newTx, ...prev]);
                            setActionSuccessMessage(`Successfully deposited +${val.toLocaleString()} DH.`);
                          } else {
                            setOpeningBalance(val);
                            setTotalLiquidFunds(val);
                            setOpeningBalanceConfigured(true);
                            const newTx: FinancialTransaction = {
                              id: `tx_${Date.now()}`,
                              type: 'opening_balance',
                              amount: val,
                              currency: 'MAD',
                              amountMAD: val,
                              description: 'Set initial opening balance',
                              timestamp: Date.now(),
                              status: 'completed',
                            };
                            setTransactions(prev => [newTx, ...prev]);
                            setActionSuccessMessage(`Opening balance set to ${val.toLocaleString()} DH.`);
                          }
                          setDepositAmountInput('');
                        }}
                        className="w-full py-3.5 min-h-[46px] sm:min-h-[48px] bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs sm:text-sm uppercase tracking-wider rounded-xl shadow-md transition-colors cursor-pointer"
                      >
                        {depositMode === 'deposit' ? 'Confirm Deposit' : 'Save Opening Balance'}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* MODAL 4: SWAP / CONVERT (Transparent Reference Baseline) */}
              {activeActionModal === 'swap' && (
                <div>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0">
                      <Icon name="ArrowsShuffle" size={22} />
                    </div>
                    <div>
                      <h4 className="text-base sm:text-lg md:text-xl font-black uppercase text-slate-900 dark:text-white">
                        {tr('swapCurrencies')}
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-400">{tr('swapSubtitle')}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase">{tr('fromLabel')}</span>
                        <span className="text-[10px] sm:text-xs font-mono text-slate-400">
                          Avail: {unallocatedVault.toLocaleString()} DH
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <input
                          type="number"
                          value={swapAmount}
                          onChange={e => setSwapAmount(e.target.value)}
                          className="bg-transparent text-xl sm:text-2xl font-black font-mono text-slate-900 dark:text-white outline-none w-36 sm:w-44"
                        />
                        <select
                          value={swapFrom}
                          onChange={e => setSwapFrom(e.target.value)}
                          className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 min-h-[38px] sm:min-h-[40px] text-xs sm:text-sm font-bold text-slate-900 dark:text-white outline-none"
                        >
                          {Object.keys(SUPPORTED_CURRENCIES).map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="flex justify-center -my-2 relative z-10">
                      <button
                        type="button"
                        onClick={() => {
                          const temp = swapFrom;
                          setSwapFrom(swapTo);
                          setSwapTo(temp);
                        }}
                        className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center shadow-md hover:rotate-180 transition-transform cursor-pointer"
                      >
                        <Icon name="ArrowsShuffle" size={16} />
                      </button>
                    </div>

                    <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase block mb-1">{tr('toEstimatedLabel')}</span>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-xl sm:text-2xl font-black font-mono text-purple-600 dark:text-purple-400 truncate">
                          {swapResult.toAmount.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                        </span>
                        <select
                          value={swapTo}
                          onChange={e => setSwapTo(e.target.value)}
                          className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 min-h-[38px] sm:min-h-[40px] text-xs sm:text-sm font-bold text-slate-900 dark:text-white outline-none shrink-0"
                        >
                          {Object.keys(SUPPORTED_CURRENCIES).map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* TRANSPARENT RATE DISCLAIMER */}
                    <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs space-y-1">
                      <div className="flex justify-between font-bold text-purple-700 dark:text-purple-300 font-mono text-xs">
                        <span>1 {swapFrom} ≈ {(SUPPORTED_CURRENCIES[swapTo]?.rateFromMAD / (SUPPORTED_CURRENCIES[swapFrom]?.rateFromMAD || 1)).toFixed(4)} {swapTo}</span>
                        <span>{swapResult.rateSource}</span>
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 leading-snug text-[11px] sm:text-xs">
                        Indicative valuation baseline for asset estimation. Swapping records an allocation note without creating phantom wealth.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const numAmount = Number(swapAmount) || 0;
                        if (numAmount > 0) {
                          const newTx: FinancialTransaction = {
                            id: `tx_${Date.now()}`,
                            type: 'swap',
                            amount: numAmount,
                            currency: swapFrom,
                            amountMAD: convertToMAD(numAmount, swapFrom),
                            description: `Portfolio currency allocation: ${numAmount} ${swapFrom} -> ${swapResult.toAmount} ${swapTo}`,
                            timestamp: Date.now(),
                            status: 'completed',
                          };
                          setTransactions(prev => [newTx, ...prev]);
                        }
                        setActiveActionModal(null);
                      }}
                      className="w-full py-3.5 min-h-[46px] sm:min-h-[48px] bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs sm:text-sm uppercase tracking-wider rounded-xl shadow-md transition-colors cursor-pointer"
                    >
                      Record Currency Conversion
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ADD CUSTOM FUND MODAL */}
      <AnimatePresence>
        {showAddFundModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowAddFundModal(false);
            }}
            className="fixed inset-0 z-[120] bg-slate-950/80 md:backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
            dir={dir}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-7 md:p-8 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl relative z-10"
            >
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-teal-500/15 text-teal-600 dark:text-teal-400 flex items-center justify-center border border-teal-500/20 shrink-0">
                    <Icon name="Plus" size={22} />
                  </div>
                  <div>
                    <h3 className="font-black text-base sm:text-lg md:text-xl text-slate-900 dark:text-white uppercase tracking-tight">
                      {tr('newFundModalTitle')}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                      {tr('autoOptimalApplied')}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddFundModal(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                  aria-label="Close modal"
                >
                  <Icon name="X" size={18} />
                </button>
              </div>

              <form onSubmit={handleAddCustomFund} className="space-y-4">
                <div>
                  <label className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1.5">
                    Fund Name / Label
                  </label>
                  <input
                    type="text"
                    required
                    autoFocus
                    value={newFundName}
                    onChange={e => setNewFundName(e.target.value)}
                    placeholder={tr('fundNamePlaceholder')}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 min-h-[44px] sm:min-h-[46px] text-xs sm:text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-teal-500 transition-colors shadow-inner"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      {tr('fundShareLabel')}
                    </label>
                    <span className="text-xs sm:text-sm text-teal-600 dark:text-teal-400 font-bold font-mono">
                      ~{Math.round(salary * ((Number(newFundPercent) || 5) / 100)).toLocaleString()} DH / mo
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={newFundPercent}
                      onChange={e => setNewFundPercent(e.target.value)}
                      className="w-24 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 min-h-[40px] text-xs sm:text-sm font-mono font-bold text-slate-900 dark:text-white outline-none focus:border-teal-500 text-center"
                    />
                    <span className="text-sm font-bold text-slate-400">%</span>
                    <input
                      type="range"
                      min="1"
                      max="25"
                      value={newFundPercent}
                      onChange={e => setNewFundPercent(e.target.value)}
                      className="flex-1 accent-teal-500 h-2 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer"
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    When you add this fund, the engine will automatically calculate and balance the best optimal % distribution across all standard pillars and your new fund!
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowAddFundModal(false)}
                    className="px-4 py-2.5 min-h-[40px] text-xs sm:text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-bold cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 min-h-[40px] bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-1.5"
                  >
                    <Icon name="Plus" size={15} />
                    <span>{tr('addCustomFundBtn')}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============================================================== */}
      {/* 8. HIGH-PRECISION MULTI-LANGUAGE A4 PRINT ENGINE (HTML2CANVAS) */}
      {/* Supports EN, FR, ES, and full native RTL Arabic font shaping   */}
      {/* ============================================================== */}
      {/* Premium Full-Screen Generation Overlay */}
      {isGeneratingPDF && (
        <div className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-slate-950/85 backdrop-blur-md text-white select-none">
          <div className="p-7 rounded-3xl bg-slate-900/95 border border-amber-500/30 shadow-2xl flex flex-col items-center text-center space-y-4 max-w-sm mx-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Icon name="Download" size={32} className="animate-bounce" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-black text-white tracking-wide">
                {ptr('generatingPdf', pdfLanguage)}
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                {pdfLanguage === 'ar' ? 'جارٍ إنشاء المخطط المالي التنفيذي بجودة فائقة...' : 'Rendering high-resolution executive wealth blueprint...'}
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-400">
              <Icon name="Loader2" size={16} className="animate-spin" />
              <span>{pdfLanguage.toUpperCase()} • A4 ULTRA-HD</span>
            </div>
          </div>
        </div>
      )}

      {/* Document Root Container */}
      <div
        id="pdf-export-container"
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '794px',
          zIndex: isGeneratingPDF ? 99990 : -9999,
          opacity: 1,
          visibility: isGeneratingPDF ? 'visible' : 'hidden',
          pointerEvents: 'none',
          backgroundColor: '#ffffff',
        }}
      >
        {/* ==================== PAGE 1 ==================== */}
        <div
          id="pdf-blueprint-page-1"
          dir={pdfLanguage === 'ar' ? 'rtl' : 'ltr'}
          className={`bg-white text-slate-900 box-border flex flex-col justify-between overflow-hidden ${
            pdfLanguage === 'ar' ? 'text-right' : 'text-left'
          }`}
          style={{
            width: '794px',
            height: '1123px',
            minHeight: '1123px',
            maxHeight: '1123px',
            padding: '24px 28px',
            boxSizing: 'border-box',
            fontFamily:
              pdfLanguage === 'ar'
                ? "'Cairo', 'Segoe UI', Tahoma, Arial, sans-serif"
                : "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
          }}
        >
          <div className="space-y-4">
            {/* Top Luxury Banner */}
            <div className="rounded-2xl p-5 bg-[#0B132B] text-white border-b-4 border-amber-500 shadow-md relative overflow-hidden">
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black tracking-widest uppercase px-2 py-0.5 rounded bg-amber-500 text-slate-950">
                      SECRETAREA
                    </span>
                    <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider">
                      {ptr('verifiedSeal', pdfLanguage)}
                    </span>
                  </div>
                  <h1 className="text-lg font-black tracking-tight text-white leading-tight">
                    {ptr('blueprintTitle', pdfLanguage)}
                  </h1>
                  <p className="text-[11px] text-slate-300 font-medium">
                    {ptr('blueprintSubtitle', pdfLanguage)}
                  </p>
                </div>
              </div>

              {/* Meta bar */}
              <div className="mt-3 pt-2.5 border-t border-slate-700/80 flex items-center justify-between text-[10px] text-slate-300 font-mono">
                <div>
                  <span className="text-slate-400 font-sans">{ptr('docRef', pdfLanguage)}: </span>
                  <span className="text-amber-400 font-bold" dir="ltr">
                    SA-{Math.abs(Math.round(salary * 31 + totalLiquidFunds)).toString(36).toUpperCase()}-{new Date().getFullYear()}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-sans">{ptr('generatedOn', pdfLanguage)}: </span>
                  <span className="text-white font-semibold">
                    {new Date().toLocaleDateString(pdfLanguage === 'ar' ? 'ar-MA' : pdfLanguage === 'fr' ? 'fr-FR' : pdfLanguage === 'es' ? 'es-ES' : 'en-US')}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-sans">{ptr('baseCurrency', pdfLanguage)}: </span>
                  <span className="text-amber-300 font-bold">{selectedCurrency} ({CURRENCY_RATES[selectedCurrency]?.symbol || selectedCurrency})</span>
                </div>
              </div>
            </div>

            {/* SECTION 1: MASTER BALANCE & LIQUIDITY AUDIT */}
            <div className="space-y-2">
              <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                <h2 className="text-[11px] font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                  {ptr('page1Title', pdfLanguage)}
                </h2>
                <span className="text-[9px] text-slate-500 font-bold uppercase">
                  {ptr('connectedAudit', pdfLanguage)}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                {/* Box 1: Balance */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-0.5">
                  <p className="text-[10px] font-bold text-slate-500">{ptr('totalEstimatedBalance', pdfLanguage)}</p>
                  <p className="text-base font-black text-amber-600">
                    {formatPdfAmount(totalEstimatedBalanceMAD, pdfLanguage)}
                  </p>
                  <p className="text-[9px] text-slate-400 font-medium">
                    ≈ {formatMoney(totalEstimatedBalanceMAD, selectedCurrency)}
                  </p>
                </div>

                {/* Box 2: Vault vs Card */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <p className="text-[10px] font-bold text-slate-500">{ptr('vaultVsCard', pdfLanguage)}</p>
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-800">
                    <span className="text-slate-500">{ptr('vaultLabel', pdfLanguage)}:</span>
                    <span className="text-emerald-700 font-black">{formatPdfAmount(unallocatedVault, pdfLanguage)}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-800">
                    <span className="text-slate-500">{ptr('cardLimitLabel', pdfLanguage)}:</span>
                    <span className="text-indigo-700 font-black">{formatPdfAmount(cardLimit, pdfLanguage)}</span>
                  </div>
                </div>

                {/* Box 3: Spend Delta & Runway */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <p className="text-[10px] font-bold text-slate-500">{ptr('spendingDeltaRunway', pdfLanguage)}</p>
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span className="text-slate-500">{ptr('spendDeltaLabel', pdfLanguage)}:</span>
                    <span className={spendDelta.diff >= 0 ? 'text-rose-600 font-black' : 'text-emerald-600 font-black'}>
                      {spendDelta.diff >= 0
                        ? `+${Math.abs(spendDelta.diff).toLocaleString()} ${ptr('currencyMAD', pdfLanguage)} ${ptr('overBudget', pdfLanguage)}`
                        : `${Math.abs(spendDelta.diff).toLocaleString()} ${ptr('currencyMAD', pdfLanguage)} ${ptr('savedUnderBudget', pdfLanguage)}`}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-800">
                    <span className="text-slate-500">{ptr('runwayMonths', pdfLanguage)}:</span>
                    <span className="text-emerald-600 font-black">{freeCashAnalysis.runwayMonths} {ptr('monthsLabel', pdfLanguage)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 2: 5-PILLAR SMART ALLOCATION MATRIX */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                <h2 className="text-[11px] font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-600 inline-block" />
                  {ptr('allocMatrixTitle', pdfLanguage)}
                </h2>
                <span className="text-[9px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {ptr('totalAllocatedBalanced', pdfLanguage)}
                </span>
              </div>

              <table className="w-full text-[10px] border-collapse border border-slate-200 rounded-xl overflow-hidden">
                <thead>
                  <tr className="bg-slate-800 text-white font-bold">
                    <th className={`p-2 ${pdfLanguage === 'ar' ? 'text-right' : 'text-left'}`} style={{ width: '38%' }}>
                      {ptr('colPillar', pdfLanguage)}
                    </th>
                    <th className="p-2 text-center" style={{ width: '14%' }}>
                      {ptr('colShare', pdfLanguage)}
                    </th>
                    <th className={`p-2 ${pdfLanguage === 'ar' ? 'text-left' : 'text-right'}`} style={{ width: '22%' }}>
                      {ptr('colMonthly', pdfLanguage)}
                    </th>
                    <th className={`p-2 ${pdfLanguage === 'ar' ? 'text-right' : 'text-left'}`} style={{ width: '26%' }}>
                      {ptr('colObjective', pdfLanguage)}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50">
                    <td className={`p-1.5 font-bold text-slate-900 ${pdfLanguage === 'ar' ? 'text-right' : 'text-left'}`}>
                      {ptr('pillar1Name', pdfLanguage)}
                    </td>
                    <td className="p-1.5 text-center font-bold text-slate-700">{allocations.splits.personal}%</td>
                    <td className={`p-1.5 font-black text-indigo-700 ${pdfLanguage === 'ar' ? 'text-left' : 'text-right'}`}>
                      {formatPdfAmount(allocations.personalAmount, pdfLanguage)}
                    </td>
                    <td className={`p-1.5 text-slate-500 ${pdfLanguage === 'ar' ? 'text-right' : 'text-left'}`}>
                      {ptr('pillar1Obj', pdfLanguage)}
                    </td>
                  </tr>
                  <tr className="bg-slate-50/70 hover:bg-slate-50">
                    <td className={`p-1.5 font-bold text-slate-900 ${pdfLanguage === 'ar' ? 'text-right' : 'text-left'}`}>
                      {ptr('pillar2Name', pdfLanguage)}
                    </td>
                    <td className="p-1.5 text-center font-bold text-slate-700">{allocations.splits.invest}%</td>
                    <td className={`p-1.5 font-black text-indigo-700 ${pdfLanguage === 'ar' ? 'text-left' : 'text-right'}`}>
                      {formatPdfAmount(allocations.investAmount, pdfLanguage)}
                    </td>
                    <td className={`p-1.5 text-slate-500 ${pdfLanguage === 'ar' ? 'text-right' : 'text-left'}`}>
                      {ptr('pillar2Obj', pdfLanguage)}
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className={`p-1.5 font-bold text-slate-900 ${pdfLanguage === 'ar' ? 'text-right' : 'text-left'}`}>
                      {ptr('pillar3Name', pdfLanguage)}
                    </td>
                    <td className="p-1.5 text-center font-bold text-slate-700">{allocations.splits.safe}%</td>
                    <td className={`p-1.5 font-black text-indigo-700 ${pdfLanguage === 'ar' ? 'text-left' : 'text-right'}`}>
                      {formatPdfAmount(allocations.safeAmount, pdfLanguage)}
                    </td>
                    <td className={`p-1.5 text-slate-500 ${pdfLanguage === 'ar' ? 'text-right' : 'text-left'}`}>
                      {ptr('pillar3Obj', pdfLanguage)}
                    </td>
                  </tr>
                  <tr className="bg-slate-50/70 hover:bg-slate-50">
                    <td className={`p-1.5 font-bold text-slate-900 ${pdfLanguage === 'ar' ? 'text-right' : 'text-left'}`}>
                      {ptr('pillar4Name', pdfLanguage)}
                    </td>
                    <td className="p-1.5 text-center font-bold text-slate-700">{allocations.splits.emergency}%</td>
                    <td className={`p-1.5 font-black text-indigo-700 ${pdfLanguage === 'ar' ? 'text-left' : 'text-right'}`}>
                      {formatPdfAmount(allocations.emergencyAmount, pdfLanguage)}
                    </td>
                    <td className={`p-1.5 text-slate-500 ${pdfLanguage === 'ar' ? 'text-right' : 'text-left'}`}>
                      {ptr('pillar4Obj', pdfLanguage)}
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className={`p-1.5 font-bold text-slate-900 ${pdfLanguage === 'ar' ? 'text-right' : 'text-left'}`}>
                      {ptr('pillar5Name', pdfLanguage)}
                    </td>
                    <td className="p-1.5 text-center font-bold text-slate-700">{allocations.splits.parents}%</td>
                    <td className={`p-1.5 font-black text-indigo-700 ${pdfLanguage === 'ar' ? 'text-left' : 'text-right'}`}>
                      {formatPdfAmount(allocations.parentsAmount, pdfLanguage)}
                    </td>
                    <td className={`p-1.5 text-slate-500 ${pdfLanguage === 'ar' ? 'text-right' : 'text-left'}`}>
                      {ptr('pillar5Obj', pdfLanguage)}
                    </td>
                  </tr>
                  {customFunds.map(cf => (
                    <tr key={cf.id} className="bg-amber-50/40 hover:bg-amber-50/70">
                      <td className={`p-1.5 font-bold text-amber-900 ${pdfLanguage === 'ar' ? 'text-right' : 'text-left'}`}>
                        + {cf.name}
                      </td>
                      <td className="p-1.5 text-center font-bold text-amber-800">{cf.percent}%</td>
                      <td className={`p-1.5 font-black text-amber-900 ${pdfLanguage === 'ar' ? 'text-left' : 'text-right'}`}>
                        {formatPdfAmount(Math.round(salary * (cf.percent / 100)), pdfLanguage)}
                      </td>
                      <td className={`p-1.5 text-amber-700/80 ${pdfLanguage === 'ar' ? 'text-right' : 'text-left'}`}>
                        {ptr('customFundObj', pdfLanguage)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="p-2 rounded-xl bg-slate-100 text-slate-800 text-[10px] font-bold flex items-center justify-between">
                <span>
                  {ptr('allocMonthlyBase', pdfLanguage)}: <strong className="text-slate-950 font-black">{formatPdfAmount(salary, pdfLanguage)}</strong> (~{formatMoney(salary, selectedCurrency)})
                </span>
                <span className="text-emerald-700 font-black">
                  {ptr('totalAllocatedBalanced', pdfLanguage)}
                </span>
              </div>
            </div>

            {/* SECTION 3: LIVING EXPENSES & CASHFLOW RUNWAY AUDIT */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                <h2 className="text-[11px] font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
                  {ptr('livingExpensesTitle', pdfLanguage)}
                </h2>
                <span className="text-[9px] text-slate-500 font-bold">
                  {salary > 0 ? Math.round((totalExpensesCost / salary) * 100) : 0}% {ptr('ofSalaryCommitted', pdfLanguage)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[10px]">
                <div className="space-y-0.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">{ptr('totalCommittedCosts', pdfLanguage)}:</span>
                    <strong className="text-slate-900">{formatPdfAmount(totalExpensesCost, pdfLanguage)}/mo</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">{ptr('coveredByPersonal', pdfLanguage)}:</span>
                    <strong className="text-indigo-700">{formatPdfAmount(allocations.personalAmount, pdfLanguage)}</strong>
                  </div>
                </div>
                <div className={`space-y-0.5 ${pdfLanguage === 'ar' ? 'border-r pr-2.5' : 'border-l pl-2.5'} border-slate-200`}>
                  <div className="flex justify-between">
                    <span className="text-slate-500">{ptr('freeCashBuffer', pdfLanguage)}:</span>
                    <strong className={freeCashBuffer >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                      {freeCashBuffer >= 0 ? '+' : ''}{formatPdfAmount(freeCashBuffer, pdfLanguage)}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">{ptr('runwayMonths', pdfLanguage)}:</span>
                    <strong className="text-slate-900">{freeCashAnalysis.runwayMonths} {ptr('monthsLabel', pdfLanguage)}</strong>
                  </div>
                </div>
              </div>

              {/* Top Expenses List */}
              <table className="w-full text-[9.5px] border-collapse border border-slate-200 rounded-xl overflow-hidden">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <th className={`p-1.5 ${pdfLanguage === 'ar' ? 'text-right' : 'text-left'}`}>{ptr('colCommitmentItem', pdfLanguage)}</th>
                    <th className="p-1.5 text-center">{ptr('colCategory', pdfLanguage)}</th>
                    <th className="p-1.5 text-center">{ptr('colStatus', pdfLanguage)}</th>
                    <th className={`p-1.5 ${pdfLanguage === 'ar' ? 'text-left' : 'text-right'}`}>{ptr('colMonthlyCost', pdfLanguage)}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {expenses.slice(0, 5).map((exp, idx) => (
                    <tr key={exp.id || idx} className={idx % 2 === 1 ? 'bg-slate-50/70' : ''}>
                      <td className={`p-1.5 font-bold text-slate-800 ${pdfLanguage === 'ar' ? 'text-right' : 'text-left'}`}>{exp.label}</td>
                      <td className="p-1.5 text-center text-slate-500">
                        {exp.category === 'fixed' ? ptr('fixedNeeds', pdfLanguage) : ptr('lifestyleTools', pdfLanguage)}
                      </td>
                      <td className="p-1.5 text-center">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[8.5px] font-black uppercase ${
                            exp.paid ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {exp.paid ? ptr('paidStatus', pdfLanguage) : ptr('dueStatus', pdfLanguage)}
                        </span>
                      </td>
                      <td className={`p-1.5 font-bold text-slate-900 ${pdfLanguage === 'ar' ? 'text-left' : 'text-right'}`}>
                        {formatPdfAmount(exp.cost, pdfLanguage)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Page 1 Footer */}
          <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[9px] text-slate-400 font-medium">
            <span>{ptr('confidentialDoc', pdfLanguage)}</span>
            <span>https://secretarea.app</span>
            <span>{ptr('page1Of2', pdfLanguage)}</span>
          </div>
        </div>

        {/* ==================== PAGE 2 ==================== */}
        <div
          id="pdf-blueprint-page-2"
          dir={pdfLanguage === 'ar' ? 'rtl' : 'ltr'}
          className={`bg-white text-slate-900 box-border flex flex-col justify-between overflow-hidden ${
            pdfLanguage === 'ar' ? 'text-right' : 'text-left'
          }`}
          style={{
            width: '794px',
            height: '1123px',
            minHeight: '1123px',
            maxHeight: '1123px',
            padding: '24px 28px',
            boxSizing: 'border-box',
            fontFamily:
              pdfLanguage === 'ar'
                ? "'Cairo', 'Segoe UI', Tahoma, Arial, sans-serif"
                : "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
          }}
        >
          <div className="space-y-4">
            {/* Page 2 Mini Header */}
            <div className="rounded-xl p-3.5 bg-[#0B132B] text-white border-b-2 border-amber-500 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[9px] font-bold text-amber-400 uppercase tracking-wider">
                  SECRETAREA WEALTH ACCELERATION
                </span>
                <h2 className="text-xs font-black text-white">{ptr('page2Header', pdfLanguage)}</h2>
              </div>
              <div className="text-end text-[9.5px] text-slate-300 font-mono">
                <div>{ptr('page2Of2', pdfLanguage)}</div>
                <div className="text-amber-400 font-bold" dir="ltr">
                  SA-{Math.abs(Math.round(salary * 31 + totalLiquidFunds)).toString(36).toUpperCase()}
                </div>
              </div>
            </div>

            {/* SECTION 4: 6-MONTH EMERGENCY PROTECTION SHIELD */}
            <div className="space-y-2">
              <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                <h2 className="text-[11px] font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                  {ptr('shieldSectionTitle', pdfLanguage)}
                </h2>
                <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {ptr('sixMonthsBaselineReserve', pdfLanguage)}
                </span>
              </div>

              {(() => {
                const shieldQuest = quests.find(q => q.id === 'emergency_shield' || q.id === 'six_month_salary_shield') || quests[0];
                const shieldTarget = shieldQuest?.target || salary * 6;
                const shieldCurrent = shieldQuest?.current || 0;
                const shieldPercent = Math.min(100, Math.round((shieldCurrent / Math.max(1, shieldTarget)) * 100));
                const emergencyPillarInflow = allocations.emergencyAmount;
                const monthsToShield = emergencyPillarInflow > 0 ? Math.ceil(Math.max(0, shieldTarget - shieldCurrent) / emergencyPillarInflow) : 0;

                return (
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <div>
                        <span className="text-slate-500 font-bold">{ptr('protectionTarget', pdfLanguage)}: </span>
                        <strong className="text-slate-900 font-black">{formatPdfAmount(shieldTarget, pdfLanguage)}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 font-bold">{ptr('currentAccumulatedReserve', pdfLanguage)}: </span>
                        <strong className="text-emerald-700 font-black">{formatPdfAmount(shieldCurrent, pdfLanguage)} ({shieldPercent}% {ptr('achieved', pdfLanguage)})</strong>
                      </div>
                    </div>

                    {/* Visual Progress Bar */}
                    <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden p-0.5">
                      <div
                        className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all"
                        style={{ width: `${shieldPercent}%` }}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-600">
                      <div className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
                        <span>
                          {ptr('monthlyAutoFeedInflow', pdfLanguage)}: <strong className="text-slate-900 font-black">+{formatPdfAmount(emergencyPillarInflow, pdfLanguage)}/mo</strong> ({ptr('fromEmergencyPillar', pdfLanguage)})
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 inline-block" />
                        <span>
                          {ptr('estimatedCompletionPace', pdfLanguage)}: <strong className="text-indigo-800 font-black">~{monthsToShield} {ptr('monthsLabel', pdfLanguage)}</strong>
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* SECTION 5: STRATEGIC SOLUTIONS FOR DEVELOPING CURRENT INCOME */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                <h2 className="text-[11px] font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                  {ptr('incomePortfolioTitle', pdfLanguage)}
                </h2>
                <span className="text-[9px] text-slate-500 font-bold">
                  {ptr('actionableGrowthStrategies', pdfLanguage)}
                </span>
              </div>

              <table className="w-full text-[10px] border-collapse border border-slate-200 rounded-xl overflow-hidden">
                <thead>
                  <tr className="bg-slate-800 text-white font-bold">
                    <th className={`p-1.5 ${pdfLanguage === 'ar' ? 'text-right' : 'text-left'}`}>{ptr('colStrategyLever', pdfLanguage)}</th>
                    <th className="p-1.5 text-center">{ptr('colCategory', pdfLanguage)}</th>
                    <th className={`p-1.5 ${pdfLanguage === 'ar' ? 'text-left' : 'text-right'}`}>{ptr('colMonthlyBoost', pdfLanguage)}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50">
                    <td className={`p-1.5 font-bold text-slate-900 ${pdfLanguage === 'ar' ? 'text-right' : 'text-left'}`}>{ptr('incomeRaiseTitle', pdfLanguage)}</td>
                    <td className="p-1.5 text-center text-slate-500">Career</td>
                    <td className={`p-1.5 font-black text-amber-600 ${pdfLanguage === 'ar' ? 'text-left' : 'text-right'}`}>
                      +{formatPdfAmount(Math.round(salary * 0.2), pdfLanguage)}/mo (+20%)
                    </td>
                  </tr>
                  <tr className="bg-slate-50/70 hover:bg-slate-50">
                    <td className={`p-1.5 font-bold text-slate-900 ${pdfLanguage === 'ar' ? 'text-right' : 'text-left'}`}>{ptr('incomeFreelanceTitle', pdfLanguage)}</td>
                    <td className="p-1.5 text-center text-slate-500">Freelance</td>
                    <td className={`p-1.5 font-black text-amber-600 ${pdfLanguage === 'ar' ? 'text-left' : 'text-right'}`}>
                      +{formatPdfAmount(1500, pdfLanguage)}/mo
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className={`p-1.5 font-bold text-slate-900 ${pdfLanguage === 'ar' ? 'text-right' : 'text-left'}`}>{ptr('incomeSpecializedTitle', pdfLanguage)}</td>
                    <td className="p-1.5 text-center text-slate-500">Tech & Consulting</td>
                    <td className={`p-1.5 font-black text-amber-600 ${pdfLanguage === 'ar' ? 'text-left' : 'text-right'}`}>
                      +{formatPdfAmount(3000, pdfLanguage)}/mo
                    </td>
                  </tr>
                  {customIncomeSolutions.map((cs, idx) => (
                    <tr key={cs.id || idx} className="bg-amber-50/30 hover:bg-amber-50/60">
                      <td className={`p-1.5 font-bold text-amber-950 ${pdfLanguage === 'ar' ? 'text-right' : 'text-left'}`}>+ {cs.defaultTitle || cs.titleKey}</td>
                      <td className="p-1.5 text-center text-amber-800">{cs.category || 'Custom'}</td>
                      <td className={`p-1.5 font-black text-amber-700 ${pdfLanguage === 'ar' ? 'text-left' : 'text-right'}`}>
                        +{formatPdfAmount(cs.boostAmount, pdfLanguage)}/mo
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* SECTION 6: TARGET PURCHASE & FAST-TRACK ROADMAP */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                <h2 className="text-[11px] font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-violet-600 inline-block" />
                  {ptr('targetRoadmapTitle', pdfLanguage)}
                </h2>
                <span className="text-[9px] text-violet-700 font-bold bg-violet-50 px-2 py-0.5 rounded border border-violet-200">
                  {ptr('zeroDebtProtocol', pdfLanguage)}
                </span>
              </div>

              <div className="grid grid-cols-12 gap-2.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                {/* Standard Plan (7 cols) */}
                <div className="col-span-7 space-y-1 text-[10px]">
                  <div>
                    <span className="text-slate-400 uppercase text-[8.5px] font-black tracking-wider block">
                      {ptr('targetAsset', pdfLanguage)}
                    </span>
                    <strong className="text-xs font-black text-slate-900">{calcItemName}</strong>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-0.5">
                    <div>
                      <span className="text-slate-500 block">{ptr('targetAssetPrice', pdfLanguage)}</span>
                      <strong className="text-slate-900 font-bold">{formatPdfAmount(calcCost, pdfLanguage)}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">{ptr('dedicatedMonthlySavings', pdfLanguage)}</span>
                      <strong className="text-indigo-700 font-bold">{formatPdfAmount(calcMonthlySaving, pdfLanguage)}/mo</strong>
                    </div>
                  </div>
                  <div className="pt-0.5">
                    <span className="text-slate-500">{ptr('standardTimeline', pdfLanguage)}: </span>
                    <strong className="text-slate-900 font-black">{calcMonths} {ptr('monthsLabel', pdfLanguage)}</strong>
                    <span className="text-slate-400 font-medium"> (~{(calcMonths / 12).toFixed(1)} {ptr('yearsToDebtFree', pdfLanguage)})</span>
                  </div>
                </div>

                {/* AI Fast Track (5 cols) */}
                <div className="col-span-5 p-2.5 rounded-lg bg-indigo-50 border border-indigo-100 text-[10px] space-y-1 flex flex-col justify-center">
                  <span className="text-[9px] font-black uppercase text-indigo-700 tracking-wider">
                    {ptr('aiFastTrackTitle', pdfLanguage)}
                  </span>
                  <div className="text-[10.5px]">
                    <span className="text-indigo-600">{ptr('boostedSavings', pdfLanguage)}: </span>
                    <strong className="text-indigo-950 font-black">{formatPdfAmount(fastTrackMonthly, pdfLanguage)}/mo</strong>
                  </div>
                  <div className="text-[10.5px]">
                    <span className="text-indigo-600">{ptr('targetAchievedIn', pdfLanguage)}: </span>
                    <strong className="text-indigo-950 font-black">{targetPurchase.fastTrackMonths} {ptr('monthsLabel', pdfLanguage)}</strong>
                  </div>
                  <div className="text-[9.5px] font-black text-emerald-600">
                    ✓ {Math.max(0, calcMonths - targetPurchase.fastTrackMonths)} {ptr('monthsEarlier', pdfLanguage)}
                  </div>
                </div>
              </div>
            </div>

            {/* EXECUTIVE QUOTE & SIGN-OFF */}
            <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 text-center space-y-0.5">
              <p className="text-[11px] italic text-slate-700 font-serif leading-snug">
                {ptr('wealthQuote1', pdfLanguage)} {ptr('wealthQuote2', pdfLanguage)}
              </p>
              <p className="text-[8.5px] font-mono font-bold text-slate-500 uppercase tracking-widest">
                {ptr('verifiedStatus', pdfLanguage)}
              </p>
            </div>
          </div>

          {/* Page 2 Footer */}
          <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[9px] text-slate-400 font-medium">
            <span>{ptr('confidentialDoc', pdfLanguage)}</span>
            <span>https://secretarea.app</span>
            <span>{ptr('page2Of2', pdfLanguage)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernEWallet;
