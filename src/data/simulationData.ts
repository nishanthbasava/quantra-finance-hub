// ─── Types ───────────────────────────────────────────────────────────────────

export type SimulationType =
  | "budgeting"
  | "habits"
  | "subscriptions"
  | "one-time"
  | "income";

export interface BudgetingInputs {
  preset: "50/30/20" | "zero-based" | "aggressive" | "debt-first" | "custom";
  needs: number;
  wants: number;
  savings: number;
}

export interface HabitInputs {
  reduceDiningOut: number;   // $/week reduction
  capRideshare: number;      // $/month cap
  increaseGroceries: number; // $/month increase
}

export interface SubscriptionInputs {
  toggles: Record<string, boolean>; // subscription name → active
}

export interface OneTimeInputs {
  amount: number;
  month: number; // 1–12
}

export interface IncomeInputs {
  amount: number;    // $/month
  startMonth: number; // 1–12
}

export type ScenarioInputs =
  | { type: "budgeting"; data: BudgetingInputs }
  | { type: "habits"; data: HabitInputs }
  | { type: "subscriptions"; data: SubscriptionInputs }
  | { type: "one-time"; data: OneTimeInputs }
  | { type: "income"; data: IncomeInputs };

export interface Scenario {
  id: string;
  name: string;
  inputs: ScenarioInputs;
  color: string;
}

export type ForecastMetric = "balance" | "cashflow" | "expenses" | "savings";

export interface ForecastPoint {
  month: string;
  value: number;
}

// ─── Defaults ────────────────────────────────────────────────────────────────

export const SIMULATION_TYPES: { value: SimulationType; label: string }[] = [
  { value: "budgeting", label: "Budgeting Plans" },
  { value: "habits", label: "Habit Changes" },
  { value: "subscriptions", label: "Subscription Changes" },
  { value: "one-time", label: "One-Time Purchase" },
  { value: "income", label: "Income Changes" },
];

export const BUDGET_PRESETS: { value: BudgetingInputs["preset"]; label: string; needs: number; wants: number; savings: number }[] = [
  { value: "50/30/20", label: "50 / 30 / 20", needs: 50, wants: 30, savings: 20 },
  { value: "zero-based", label: "Zero-Based", needs: 40, wants: 25, savings: 35 },
  { value: "aggressive", label: "Aggressive Saving", needs: 45, wants: 15, savings: 40 },
  { value: "debt-first", label: "Debt-First", needs: 50, wants: 10, savings: 40 },
  { value: "custom", label: "Custom", needs: 50, wants: 30, savings: 20 },
];

export const DEFAULT_SUBSCRIPTIONS: { name: string; cost: number }[] = [
  { name: "Netflix", cost: 15.49 },
  { name: "Spotify", cost: 10.99 },
  { name: "YouTube Premium", cost: 13.99 },
  { name: "iCloud+", cost: 2.99 },
  { name: "ChatGPT Plus", cost: 20.00 },
  { name: "Gym Membership", cost: 49.99 },
];

export const SCENARIO_COLORS = [
  "hsl(170, 70%, 50%)",  // teal
  "hsl(260, 50%, 60%)",  // purple
  "hsl(30, 80%, 55%)",   // orange
  "hsl(340, 60%, 60%)",  // pink
];

export const FORECAST_METRICS: { value: ForecastMetric; label: string }[] = [
  { value: "balance", label: "Total Balance" },
  { value: "cashflow", label: "Cash Flow" },
  { value: "expenses", label: "Monthly Expenses" },
  { value: "savings", label: "Savings Rate" },
];

// ─── Baseline Data ──────────────────────────────────────────────────────────

const MONTHS = ["Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const BASELINE = {
  monthlyIncome: 5260,
  monthlyExpenses: 2750,
  balance: 20543,
  diningOut: 320,
  rideshare: 180,
  groceries: 400,
  subscriptionTotal: DEFAULT_SUBSCRIPTIONS.reduce((s, sub) => s + sub.cost, 0),
};

// ─── Forecast Engine ────────────────────────────────────────────────────────

export function generateBaseline(metric: ForecastMetric): ForecastPoint[] {
  return MONTHS.map((month, i) => {
    const noise = Math.sin(i * 1.3) * 120 + Math.cos(i * 0.7) * 80;
    switch (metric) {
      case "balance":
        return { month, value: Math.round(BASELINE.balance + (BASELINE.monthlyIncome - BASELINE.monthlyExpenses) * i + noise) };
      case "cashflow":
        return { month, value: Math.round(BASELINE.monthlyIncome - BASELINE.monthlyExpenses + noise) };
      case "expenses":
        return { month, value: Math.round(BASELINE.monthlyExpenses + noise * 0.5) };
      case "savings":
        return { month, value: Math.round(((BASELINE.monthlyIncome - BASELINE.monthlyExpenses) / BASELINE.monthlyIncome) * 100 + noise * 0.02) };
    }
  });
}

export function generateScenarioForecast(
  scenario: Scenario,
  metric: ForecastMetric
): ForecastPoint[] {
  const baseline = generateBaseline(metric);

  return baseline.map((point, i) => {
    let delta = 0;

    switch (scenario.inputs.type) {
      case "budgeting": {
        const d = scenario.inputs.data;
        const targetExpenses = BASELINE.monthlyIncome * ((d.needs + d.wants) / 100);
        delta = BASELINE.monthlyExpenses - targetExpenses;
        break;
      }
      case "habits": {
        const d = scenario.inputs.data;
        delta = d.reduceDiningOut * 4 + Math.max(0, BASELINE.rideshare - d.capRideshare) - d.increaseGroceries;
        break;
      }
      case "subscriptions": {
        const d = scenario.inputs.data;
        const cancelledSavings = DEFAULT_SUBSCRIPTIONS.reduce(
          (acc, sub) => acc + (d.toggles[sub.name] === false ? sub.cost : 0), 0
        );
        delta = cancelledSavings;
        break;
      }
      case "one-time": {
        const d = scenario.inputs.data;
        if (i + 1 === d.month) delta = -d.amount;
        break;
      }
      case "income": {
        const d = scenario.inputs.data;
        if (i + 1 >= d.startMonth) delta = d.amount;
        break;
      }
    }

    // Apply delta to the right metric
    switch (metric) {
      case "balance":
        return { month: point.month, value: Math.round(point.value + delta * (i + 1)) };
      case "cashflow":
        return { month: point.month, value: Math.round(point.value + delta) };
      case "expenses":
        return { month: point.month, value: Math.round(point.value - delta) };
      case "savings": {
        const newExpenses = BASELINE.monthlyExpenses - delta;
        const rate = ((BASELINE.monthlyIncome - newExpenses) / BASELINE.monthlyIncome) * 100;
        return { month: point.month, value: Math.round(rate) };
      }
    }
  });
}

// ─── Suggestion Engine ──────────────────────────────────────────────────────

export function generateSuggestions(scenarios: Scenario[]): string[] {
  const suggestions: string[] = [];

  for (const s of scenarios) {
    switch (s.inputs.type) {
      case "subscriptions": {
        const subData = s.inputs.data as SubscriptionInputs;
        const cancelled = DEFAULT_SUBSCRIPTIONS.filter(
          sub => subData.toggles[sub.name] === false
        );
        if (cancelled.length > 0) {
          const total = cancelled.reduce((a, c) => a + c.cost, 0);
          suggestions.push(`Cancelling ${cancelled.map(c => c.name).join(", ")} saves ~$${total.toFixed(0)}/mo`);
        }
        break;
      }
      case "habits": {
        const d = s.inputs.data;
        if (d.reduceDiningOut > 0) {
          suggestions.push(`Cutting dining out by $${d.reduceDiningOut}/wk saves ~$${(d.reduceDiningOut * 4).toFixed(0)}/mo`);
        }
        if (d.capRideshare < BASELINE.rideshare) {
          suggestions.push(`Capping rideshare to $${d.capRideshare}/mo saves ~$${(BASELINE.rideshare - d.capRideshare).toFixed(0)}/mo`);
        }
        break;
      }
      case "budgeting": {
        const d = s.inputs.data;
        suggestions.push(`${d.savings}% savings rate targets ~$${Math.round(BASELINE.monthlyIncome * d.savings / 100)}/mo saved`);
        break;
      }
      case "income": {
        const d = s.inputs.data;
        suggestions.push(`Extra $${d.amount}/mo starting month ${d.startMonth} adds ~$${d.amount * (10 - d.startMonth + 1)} over the forecast`);
        break;
      }
      case "one-time": {
        const d = s.inputs.data;
        suggestions.push(`One-time $${d.amount} purchase in month ${d.month} temporarily reduces your balance`);
        break;
      }
    }
  }

  if (suggestions.length === 0) {
    suggestions.push(
      "Try adjusting your budget allocations to see the impact on savings",
      "Consider which subscriptions provide the most value",
      "Small habit changes compound over time"
    );
  }

  return suggestions.slice(0, 5);
}

export function generateQuestion(scenarios: Scenario[], metric: ForecastMetric): string {
  if (scenarios.length === 0) {
    return "What area of your spending would you like to optimize first?";
  }
  
  const questions: Record<ForecastMetric, string[]> = {
    balance: [
      "Do you want to prioritize stability or maximum growth?",
      "What's your target balance by end of year?",
    ],
    cashflow: [
      "Should we optimize for consistent monthly cash flow?",
      "Are there months where you expect irregular expenses?",
    ],
    expenses: [
      "Which expense categories feel least essential to you?",
      "Would you prefer gradual or aggressive expense cuts?",
    ],
    savings: [
      "What savings rate feels sustainable long-term?",
      "Should we optimize for end-of-semester cash?",
    ],
  };

  const pool = questions[metric];
  return pool[scenarios.length % pool.length];
}

// ─── NLP Parser (demo) ─────────────────────────────────────────────────────

export function parseNLPScenario(text: string): ScenarioInputs | null {
  const lower = text.toLowerCase();

  // Try to match habit patterns
  const diningMatch = lower.match(/(?:cut|reduce|lower)\s+(?:dining|eating)\s+(?:out\s+)?(?:by\s+)?\$?(\d+)/);
  const rideshareMatch = lower.match(/(?:cap|limit)\s+(?:rideshare|uber|lyft)\s+(?:to\s+)?\$?(\d+)/);
  const groceryMatch = lower.match(/(?:increase|raise|add)\s+(?:grocer\w*)\s+(?:by\s+)?\$?(\d+)/);

  if (diningMatch || rideshareMatch || groceryMatch) {
    return {
      type: "habits",
      data: {
        reduceDiningOut: diningMatch ? parseInt(diningMatch[1]) : 0,
        capRideshare: rideshareMatch ? parseInt(rideshareMatch[1]) : BASELINE.rideshare,
        increaseGroceries: groceryMatch ? parseInt(groceryMatch[1]) : 0,
      },
    };
  }

  // Try to match subscription cancellations
  const cancelMatch = lower.match(/cancel\s+([\w\s,+]+)/);
  if (cancelMatch) {
    const toggles: Record<string, boolean> = {};
    DEFAULT_SUBSCRIPTIONS.forEach(sub => {
      toggles[sub.name] = !cancelMatch[1].toLowerCase().includes(sub.name.toLowerCase());
    });
    return { type: "subscriptions", data: { toggles } };
  }

  // Try to match income
  const incomeMatch = lower.match(/(?:add|earn|get)\s+(?:extra\s+)?\$?(\d+).*?(?:month|mo)\s*(\d+)?/);
  if (incomeMatch) {
    return {
      type: "income",
      data: {
        amount: parseInt(incomeMatch[1]),
        startMonth: incomeMatch[2] ? parseInt(incomeMatch[2]) : 1,
      },
    };
  }

  // Try to match one-time purchase
  const purchaseMatch = lower.match(/(?:buy|purchase|spend)\s+\$?(\d+).*?month\s*(\d+)?/);
  if (purchaseMatch) {
    return {
      type: "one-time",
      data: {
        amount: parseInt(purchaseMatch[1]),
        month: purchaseMatch[2] ? parseInt(purchaseMatch[2]) : 3,
      },
    };
  }

  return null;
}
