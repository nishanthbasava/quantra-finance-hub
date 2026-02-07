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
  reduceDiningOut: number;
  capRideshare: number;
  increaseGroceries: number;
}

export interface SubscriptionInputs {
  toggles: Record<string, boolean>;
}

export interface OneTimeInputs {
  amount: number;
  month: number;
}

export interface IncomeInputs {
  amount: number;
  startMonth: number;
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

export const SCENARIO_COLORS = [
  "hsl(170, 70%, 50%)",
  "hsl(260, 50%, 60%)",
  "hsl(30, 80%, 55%)",
  "hsl(340, 60%, 60%)",
];

export const FORECAST_METRICS: { value: ForecastMetric; label: string }[] = [
  { value: "balance", label: "Total Balance" },
  { value: "cashflow", label: "Cash Flow" },
  { value: "expenses", label: "Monthly Expenses" },
  { value: "savings", label: "Savings Rate" },
];

// ─── Dynamic Baseline ──────────────────────────────────────────────────────

export interface SimulationBaseline {
  monthlyIncome: number;
  monthlyExpenses: number;
  balance: number;
  diningOut: number;
  rideshare: number;
  groceries: number;
  subscriptionTotal: number;
  subscriptions: { name: string; cost: number }[];
}

const MONTHS = ["Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// ─── Forecast Engine ────────────────────────────────────────────────────────

export function generateBaseline(metric: ForecastMetric, bl: SimulationBaseline): ForecastPoint[] {
  return MONTHS.map((month, i) => {
    const noise = Math.sin(i * 1.3) * 120 + Math.cos(i * 0.7) * 80;
    switch (metric) {
      case "balance":
        return { month, value: Math.round(bl.balance + (bl.monthlyIncome - bl.monthlyExpenses) * i + noise) };
      case "cashflow":
        return { month, value: Math.round(bl.monthlyIncome - bl.monthlyExpenses + noise) };
      case "expenses":
        return { month, value: Math.round(bl.monthlyExpenses + noise * 0.5) };
      case "savings": {
        const rate = ((bl.monthlyIncome - bl.monthlyExpenses) / bl.monthlyIncome) * 100;
        return { month, value: Math.round(rate + noise * 0.02) };
      }
    }
  });
}

export function generateScenarioForecast(
  scenario: Scenario,
  metric: ForecastMetric,
  bl: SimulationBaseline
): ForecastPoint[] {
  const baseline = generateBaseline(metric, bl);

  return baseline.map((point, i) => {
    let delta = 0;

    switch (scenario.inputs.type) {
      case "budgeting": {
        const d = scenario.inputs.data;
        const targetExpenses = bl.monthlyIncome * ((d.needs + d.wants) / 100);
        delta = bl.monthlyExpenses - targetExpenses;
        break;
      }
      case "habits": {
        const d = scenario.inputs.data;
        delta = d.reduceDiningOut * 4 + Math.max(0, bl.rideshare - d.capRideshare) - d.increaseGroceries;
        break;
      }
      case "subscriptions": {
        const d = scenario.inputs.data;
        const cancelledSavings = bl.subscriptions.reduce(
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

    switch (metric) {
      case "balance":
        return { month: point.month, value: Math.round(point.value + delta * (i + 1)) };
      case "cashflow":
        return { month: point.month, value: Math.round(point.value + delta) };
      case "expenses":
        return { month: point.month, value: Math.round(point.value - delta) };
      case "savings": {
        const newExpenses = bl.monthlyExpenses - delta;
        const rate = ((bl.monthlyIncome - newExpenses) / bl.monthlyIncome) * 100;
        return { month: point.month, value: Math.round(rate) };
      }
    }
  });
}

// ─── Suggestion Engine ──────────────────────────────────────────────────────

export function generateSuggestions(scenarios: Scenario[], bl: SimulationBaseline): string[] {
  const suggestions: string[] = [];

  for (const s of scenarios) {
    switch (s.inputs.type) {
      case "subscriptions": {
        const subData = s.inputs.data as SubscriptionInputs;
        const cancelled = bl.subscriptions.filter(
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
        if (d.capRideshare < bl.rideshare) {
          suggestions.push(`Capping rideshare to $${d.capRideshare}/mo saves ~$${(bl.rideshare - d.capRideshare).toFixed(0)}/mo`);
        }
        break;
      }
      case "budgeting": {
        const d = s.inputs.data;
        suggestions.push(`${d.savings}% savings rate targets ~$${Math.round(bl.monthlyIncome * d.savings / 100)}/mo saved`);
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

export function parseNLPScenario(text: string, bl: SimulationBaseline): ScenarioInputs | null {
  const lower = text.toLowerCase();

  const diningMatch = lower.match(/(?:cut|reduce|lower)\s+(?:dining|eating)\s+(?:out\s+)?(?:by\s+)?\$?(\d+)/);
  const rideshareMatch = lower.match(/(?:cap|limit)\s+(?:rideshare|uber|lyft)\s+(?:to\s+)?\$?(\d+)/);
  const groceryMatch = lower.match(/(?:increase|raise|add)\s+(?:grocer\w*)\s+(?:by\s+)?\$?(\d+)/);

  if (diningMatch || rideshareMatch || groceryMatch) {
    return {
      type: "habits",
      data: {
        reduceDiningOut: diningMatch ? parseInt(diningMatch[1]) : 0,
        capRideshare: rideshareMatch ? parseInt(rideshareMatch[1]) : bl.rideshare,
        increaseGroceries: groceryMatch ? parseInt(groceryMatch[1]) : 0,
      },
    };
  }

  const cancelMatch = lower.match(/cancel\s+([\w\s,+]+)/);
  if (cancelMatch) {
    const toggles: Record<string, boolean> = {};
    bl.subscriptions.forEach(sub => {
      toggles[sub.name] = !cancelMatch[1].toLowerCase().includes(sub.name.toLowerCase());
    });
    return { type: "subscriptions", data: { toggles } };
  }

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
