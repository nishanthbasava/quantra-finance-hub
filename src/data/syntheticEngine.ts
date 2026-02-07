// ─── Synthetic Transaction Generator ────────────────────────────────────────
// Generates 90 days of realistic personal finance transactions using seeded RNG

import { SeededRNG } from "@/lib/rng";
import type { Transaction } from "./transactionData";

// ─── Merchant Taxonomy ──────────────────────────────────────────────────────

interface MerchantDef {
  merchant: string;
  categoryPath: [string, string, string];
  amountRange: [number, number];
}

// Coffee
const COFFEE: MerchantDef[] = [
  { merchant: "Starbucks", categoryPath: ["Food", "Coffee", "Starbucks"], amountRange: [4, 8] },
  { merchant: "Blue Bottle", categoryPath: ["Food", "Coffee", "Blue Bottle"], amountRange: [5, 9] },
  { merchant: "Dunkin'", categoryPath: ["Food", "Coffee", "Dunkin'"], amountRange: [3, 7] },
  { merchant: "Peet's Coffee", categoryPath: ["Food", "Coffee", "Peet's"], amountRange: [4, 8] },
];

// Groceries
const GROCERIES: MerchantDef[] = [
  { merchant: "Trader Joe's", categoryPath: ["Food", "Groceries", "Trader Joe's"], amountRange: [35, 120] },
  { merchant: "Whole Foods", categoryPath: ["Food", "Groceries", "Whole Foods"], amountRange: [40, 150] },
  { merchant: "Costco", categoryPath: ["Food", "Groceries", "Costco"], amountRange: [60, 200] },
  { merchant: "Safeway", categoryPath: ["Food", "Groceries", "Safeway"], amountRange: [25, 90] },
];

// Dining
const DINING: MerchantDef[] = [
  { merchant: "Chipotle", categoryPath: ["Food", "Dining Out", "Restaurants"], amountRange: [10, 18] },
  { merchant: "Nobu", categoryPath: ["Food", "Dining Out", "Restaurants"], amountRange: [45, 130] },
  { merchant: "Sweetgreen", categoryPath: ["Food", "Dining Out", "Restaurants"], amountRange: [12, 20] },
  { merchant: "Shake Shack", categoryPath: ["Food", "Dining Out", "Restaurants"], amountRange: [12, 25] },
];

const TAKEOUT: MerchantDef[] = [
  { merchant: "DoorDash", categoryPath: ["Food", "Dining Out", "Takeout"], amountRange: [18, 50] },
  { merchant: "Uber Eats", categoryPath: ["Food", "Dining Out", "Takeout"], amountRange: [15, 45] },
];

// Shopping
const CLOTHING: MerchantDef[] = [
  { merchant: "Zara", categoryPath: ["Shopping", "Clothing", "Zara"], amountRange: [35, 180] },
  { merchant: "H&M", categoryPath: ["Shopping", "Clothing", "H&M"], amountRange: [20, 120] },
  { merchant: "Nike", categoryPath: ["Shopping", "Clothing", "Nike"], amountRange: [50, 200] },
  { merchant: "Uniqlo", categoryPath: ["Shopping", "Clothing", "Uniqlo"], amountRange: [25, 100] },
];

const ELECTRONICS: MerchantDef[] = [
  { merchant: "Amazon", categoryPath: ["Shopping", "Electronics", "Amazon"], amountRange: [15, 250] },
  { merchant: "Best Buy", categoryPath: ["Shopping", "Electronics", "Best Buy"], amountRange: [30, 400] },
];

const HOME: MerchantDef[] = [
  { merchant: "IKEA", categoryPath: ["Shopping", "Home", "IKEA"], amountRange: [30, 250] },
  { merchant: "Target", categoryPath: ["Shopping", "Home", "Target"], amountRange: [20, 100] },
];

// Transport
const RIDESHARE: MerchantDef[] = [
  { merchant: "Uber", categoryPath: ["Travel", "Rideshare", "Uber"], amountRange: [8, 35] },
  { merchant: "Lyft", categoryPath: ["Travel", "Rideshare", "Lyft"], amountRange: [8, 30] },
];

const TRANSIT: MerchantDef[] = [
  { merchant: "Metro Card", categoryPath: ["Travel", "Transport", "Metro"], amountRange: [2.75, 33] },
];

// Flights
const FLIGHTS: MerchantDef[] = [
  { merchant: "Delta Airlines", categoryPath: ["Travel", "Flights", "Delta"], amountRange: [150, 600] },
  { merchant: "United Airlines", categoryPath: ["Travel", "Flights", "United"], amountRange: [130, 500] },
  { merchant: "JetBlue", categoryPath: ["Travel", "Flights", "JetBlue"], amountRange: [90, 350] },
];

// Entertainment
const ENTERTAINMENT: MerchantDef[] = [
  { merchant: "AMC Theatres", categoryPath: ["Other", "Miscellaneous", "Entertainment"], amountRange: [15, 35] },
  { merchant: "Steam", categoryPath: ["Other", "Miscellaneous", "Games"], amountRange: [10, 60] },
];

// Subscription pool
const SUBSCRIPTION_POOL = [
  { merchant: "Netflix", categoryPath: ["Subscriptions", "Streaming", "Netflix"] as [string, string, string], cost: 15.49 },
  { merchant: "Spotify", categoryPath: ["Subscriptions", "Streaming", "Spotify"] as [string, string, string], cost: 10.99 },
  { merchant: "Disney+", categoryPath: ["Subscriptions", "Streaming", "Disney+"] as [string, string, string], cost: 13.99 },
  { merchant: "YouTube Premium", categoryPath: ["Subscriptions", "Streaming", "YouTube"] as [string, string, string], cost: 13.99 },
  { merchant: "HBO Max", categoryPath: ["Subscriptions", "Streaming", "HBO"] as [string, string, string], cost: 15.99 },
  { merchant: "Adobe CC", categoryPath: ["Subscriptions", "Software", "Adobe"] as [string, string, string], cost: 54.99 },
  { merchant: "Notion", categoryPath: ["Subscriptions", "Software", "Notion"] as [string, string, string], cost: 10.00 },
  { merchant: "ChatGPT Plus", categoryPath: ["Subscriptions", "Software", "ChatGPT"] as [string, string, string], cost: 20.00 },
  { merchant: "iCloud+", categoryPath: ["Subscriptions", "Software", "iCloud"] as [string, string, string], cost: 2.99 },
  { merchant: "Equinox", categoryPath: ["Subscriptions", "Gym", "Equinox"] as [string, string, string], cost: 220.00 },
  { merchant: "Planet Fitness", categoryPath: ["Subscriptions", "Gym", "Planet Fitness"] as [string, string, string], cost: 24.99 },
  { merchant: "ClassPass", categoryPath: ["Subscriptions", "Gym", "ClassPass"] as [string, string, string], cost: 49.00 },
];

const ACCOUNTS = ["Chase Checking", "Amex Gold", "Capital One", "Apple Card", "Savings"] as const;

// ─── Persona ────────────────────────────────────────────────────────────────

export interface Persona {
  payFrequency: "biweekly" | "monthly";
  paycheckAmount: number;
  rent: number;
  electricity: number;
  internet: number;
  water: number;
  subscriptions: typeof SUBSCRIPTION_POOL[number][];
  coffeeFrequency: number; // days per week
  groceryFrequency: number; // times per week
  diningFrequency: number; // times per week
  rideshareFrequency: number; // times per week
  shoppingVolatility: number; // 0.3–1.5 controls burst probability
  favoriteCoffee: MerchantDef[];
  favoriteGrocery: MerchantDef[];
  favoriteDining: MerchantDef[];
  favoriteRideshare: MerchantDef[];
  primaryAccount: string;
  creditCard: string;
}

export function generatePersona(profileSeed: number): Persona {
  const rng = new SeededRNG(profileSeed);

  const payFrequency = rng.chance(0.6) ? "biweekly" : "monthly";
  const annualIncome = rng.randInt(55000, 120000);
  const paycheckAmount = payFrequency === "biweekly"
    ? Math.round(annualIncome / 26)
    : Math.round(annualIncome / 12);

  const rent = rng.randInt(1200, 2800);
  const electricity = rng.randInt(50, 150);
  const internet = rng.randInt(60, 120);
  const water = rng.randInt(30, 80);

  // Pick 4–7 subscriptions
  const numSubs = rng.randInt(4, 7);
  const subscriptions = rng.sample(SUBSCRIPTION_POOL, numSubs);

  const coffeeFrequency = rng.randInt(2, 5);
  const groceryFrequency = rng.randInt(1, 3);
  const diningFrequency = rng.randInt(1, 4);
  const rideshareFrequency = rng.randInt(1, 3);
  const shoppingVolatility = rng.randFloat(0.3, 1.2);

  const favoriteCoffee = rng.sample(COFFEE, rng.randInt(1, 3));
  const favoriteGrocery = rng.sample(GROCERIES, rng.randInt(1, 3));
  const favoriteDining = [...rng.sample(DINING, rng.randInt(2, 3)), ...rng.sample(TAKEOUT, rng.randInt(1, 2))];
  const favoriteRideshare = rng.sample(RIDESHARE, rng.randInt(1, 2));

  const primaryAccount = "Chase Checking";
  const creditCard = rng.choice(["Amex Gold", "Capital One", "Apple Card"]);

  return {
    payFrequency, paycheckAmount, rent, electricity, internet, water,
    subscriptions, coffeeFrequency, groceryFrequency, diningFrequency,
    rideshareFrequency, shoppingVolatility, favoriteCoffee, favoriteGrocery,
    favoriteDining, favoriteRideshare, primaryAccount, creditCard,
  };
}

// ─── Transaction Generation ─────────────────────────────────────────────────

function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function makeTx(
  id: string,
  date: Date,
  def: { merchant: string; categoryPath: [string, string, string] },
  amount: number,
  account: string,
  type: "expense" | "income"
): Transaction {
  return {
    id,
    date: formatDate(date),
    merchant: def.merchant,
    category: def.categoryPath[0],
    subcategory: def.categoryPath[1],
    subsubcategory: def.categoryPath[2],
    categoryPath: [...def.categoryPath],
    account,
    amount: Math.round(Math.abs(amount) * 100) / 100,
    type,
  };
}

export function generateTransactions(
  persona: Persona,
  sessionSeed: number
): Transaction[] {
  const rng = new SeededRNG(sessionSeed);
  const txns: Transaction[] = [];
  let txId = 0;
  const nextId = () => `tx-${++txId}`;

  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - 89);

  // Determine which months are covered
  const months = new Set<string>();
  for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
    months.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }

  // ── A) Recurring income ──────────────────────────────────────────────────
  for (const monthKey of months) {
    const [year, month] = monthKey.split("-").map(Number);

    if (persona.payFrequency === "monthly") {
      const payDay = new Date(year, month - 1, 1);
      // Jitter by ±1 day
      payDay.setDate(payDay.getDate() + rng.randInt(-1, 1));
      if (payDay >= startDate && payDay <= today) {
        txns.push(makeTx(
          nextId(), payDay,
          { merchant: "Employer Inc.", categoryPath: ["Income", "Salary", "Payroll"] },
          rng.jitterAmount(persona.paycheckAmount, 1),
          persona.primaryAccount, "income"
        ));
      }
    } else {
      // Biweekly: 1st and 15th
      for (const baseDay of [1, 15]) {
        const payDay = new Date(year, month - 1, baseDay);
        payDay.setDate(payDay.getDate() + rng.randInt(-1, 1));
        if (payDay >= startDate && payDay <= today) {
          txns.push(makeTx(
            nextId(), payDay,
            { merchant: "Employer Inc.", categoryPath: ["Income", "Salary", "Payroll"] },
            rng.jitterAmount(persona.paycheckAmount, 1.5),
            persona.primaryAccount, "income"
          ));
        }
      }
    }

    // Occasional freelance income (~30% of months)
    if (rng.chance(0.3)) {
      const freelanceDay = new Date(year, month - 1, rng.randInt(5, 25));
      if (freelanceDay >= startDate && freelanceDay <= today) {
        txns.push(makeTx(
          nextId(), freelanceDay,
          { merchant: "Freelance Client", categoryPath: ["Income", "Freelance", "Invoice"] },
          rng.randInt(300, 2000),
          "Savings", "income"
        ));
      }
    }
  }

  // ── B) Fixed recurring expenses ──────────────────────────────────────────
  for (const monthKey of months) {
    const [year, month] = monthKey.split("-").map(Number);

    // Rent: day 1–3
    const rentDay = new Date(year, month - 1, rng.randInt(1, 3));
    if (rentDay >= startDate && rentDay <= today) {
      txns.push(makeTx(
        nextId(), rentDay,
        { merchant: "Apartment Mgmt", categoryPath: ["Bills & Utilities", "Rent", "Apartment"] },
        rng.jitterAmount(persona.rent, 0), // rent is fixed
        persona.primaryAccount, "expense"
      ));
    }

    // Utilities
    const elecDay = new Date(year, month - 1, rng.randInt(8, 12));
    if (elecDay >= startDate && elecDay <= today) {
      txns.push(makeTx(
        nextId(), elecDay,
        { merchant: "ConEd", categoryPath: ["Bills & Utilities", "Electricity", "ConEd"] },
        rng.jitterAmount(persona.electricity, 15),
        persona.primaryAccount, "expense"
      ));
    }

    const internetDay = new Date(year, month - 1, rng.randInt(3, 7));
    if (internetDay >= startDate && internetDay <= today) {
      txns.push(makeTx(
        nextId(), internetDay,
        { merchant: "Comcast", categoryPath: ["Bills & Utilities", "Internet", "Comcast"] },
        rng.jitterAmount(persona.internet, 5),
        persona.primaryAccount, "expense"
      ));
    }

    const waterDay = new Date(year, month - 1, rng.randInt(13, 17));
    if (waterDay >= startDate && waterDay <= today) {
      txns.push(makeTx(
        nextId(), waterDay,
        { merchant: "City Water", categoryPath: ["Bills & Utilities", "Water", "City Water"] },
        rng.jitterAmount(persona.water, 20),
        persona.primaryAccount, "expense"
      ));
    }

    // Subscriptions: each on a consistent day
    persona.subscriptions.forEach((sub, idx) => {
      const subDay = new Date(year, month - 1, Math.min(((idx * 7 + 3) % 28) + 1, 28));
      if (subDay >= startDate && subDay <= today) {
        txns.push(makeTx(
          nextId(), subDay,
          sub,
          rng.jitterAmount(sub.cost, 0.5), // subscriptions barely change
          rng.chance(0.6) ? persona.creditCard : persona.primaryAccount, "expense"
        ));
      }
    });
  }

  // ── C) Variable daily spending ───────────────────────────────────────────
  let groceryCounter = 0;
  let coffeeCounter = 0;

  for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
    const date = new Date(d);
    const dayOfWeek = date.getDay(); // 0=Sun, 6=Sat
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isFriSat = dayOfWeek === 5 || dayOfWeek === 6;

    // Coffee (persona.coffeeFrequency days/week on average)
    coffeeCounter++;
    if (coffeeCounter >= Math.round(7 / persona.coffeeFrequency) || rng.chance(persona.coffeeFrequency / 7)) {
      coffeeCounter = 0;
      const coffeeMerchant = rng.choice(persona.favoriteCoffee);
      txns.push(makeTx(
        nextId(), date, coffeeMerchant,
        rng.randFloat(coffeeMerchant.amountRange[0], coffeeMerchant.amountRange[1]),
        rng.choice(["Apple Card", persona.creditCard]), "expense"
      ));
    }

    // Groceries (persona.groceryFrequency times/week)
    groceryCounter++;
    if (groceryCounter >= Math.round(7 / persona.groceryFrequency)) {
      if (rng.chance(0.7)) {
        groceryCounter = 0;
        const groceryMerchant = rng.choice(persona.favoriteGrocery);
        txns.push(makeTx(
          nextId(), date, groceryMerchant,
          rng.randFloat(groceryMerchant.amountRange[0], groceryMerchant.amountRange[1]),
          rng.choice([persona.primaryAccount, persona.creditCard]), "expense"
        ));
      }
    }

    // Dining out (more on Fri/Sat)
    const diningChance = isFriSat
      ? persona.diningFrequency / 4
      : persona.diningFrequency / 10;
    if (rng.chance(diningChance)) {
      const diningMerchant = rng.choice(persona.favoriteDining);
      txns.push(makeTx(
        nextId(), date, diningMerchant,
        rng.randFloat(diningMerchant.amountRange[0], diningMerchant.amountRange[1]),
        rng.choice([persona.creditCard, "Apple Card"]), "expense"
      ));
    }

    // Rideshare
    const rideshareChance = isWeekend
      ? persona.rideshareFrequency / 5
      : persona.rideshareFrequency / 12;
    if (rng.chance(rideshareChance)) {
      const rsm = rng.choice(persona.favoriteRideshare);
      txns.push(makeTx(
        nextId(), date, rsm,
        rng.randFloat(rsm.amountRange[0], rsm.amountRange[1]),
        persona.primaryAccount, "expense"
      ));
    }

    // Transit (weekdays mostly)
    if (!isWeekend && rng.chance(0.15)) {
      const transitM = rng.choice(TRANSIT);
      txns.push(makeTx(
        nextId(), date, transitM,
        rng.randFloat(transitM.amountRange[0], transitM.amountRange[1]),
        persona.primaryAccount, "expense"
      ));
    }

    // Shopping bursts (clothing, electronics, home)
    if (rng.chance(0.04 * persona.shoppingVolatility)) {
      const shopPool = [...CLOTHING, ...ELECTRONICS, ...HOME];
      const shopMerchant = rng.choice(shopPool);
      txns.push(makeTx(
        nextId(), date, shopMerchant,
        rng.randFloat(shopMerchant.amountRange[0], shopMerchant.amountRange[1]),
        rng.choice([persona.creditCard, "Capital One"]), "expense"
      ));
    }

    // Entertainment (weekends)
    if (isWeekend && rng.chance(0.08)) {
      const entM = rng.choice(ENTERTAINMENT);
      txns.push(makeTx(
        nextId(), date, entM,
        rng.randFloat(entM.amountRange[0], entM.amountRange[1]),
        persona.creditCard, "expense"
      ));
    }

    // ATM/misc (rare)
    if (rng.chance(0.02)) {
      txns.push(makeTx(
        nextId(), date,
        { merchant: "ATM Withdrawal", categoryPath: ["Other", "Miscellaneous", "Cash"] },
        rng.randInt(20, 100),
        persona.primaryAccount, "expense"
      ));
    }
  }

  // ── D) Rare travel (0–2 trips in 90 days) ───────────────────────────────
  const numTrips = rng.randInt(0, 2);
  for (let t = 0; t < numTrips; t++) {
    const tripStart = new Date(startDate);
    tripStart.setDate(tripStart.getDate() + rng.randInt(10, 75));
    if (tripStart > today) continue;

    const flightM = rng.choice(FLIGHTS);
    txns.push(makeTx(
      nextId(), tripStart, flightM,
      rng.randFloat(flightM.amountRange[0], flightM.amountRange[1]),
      persona.creditCard, "expense"
    ));
  }

  // Sort by date
  txns.sort((a, b) => a.date.localeCompare(b.date));

  return txns;
}

// ─── Aggregation Helpers ────────────────────────────────────────────────────

export interface AggregatedBaseline {
  monthlyIncome: number;
  monthlyExpenses: number;
  balance: number;
  diningOut: number;
  rideshare: number;
  groceries: number;
  subscriptionTotal: number;
  subscriptions: { name: string; cost: number }[];
}

export function computeBaseline(transactions: Transaction[], persona: Persona): AggregatedBaseline {
  const expenses = transactions.filter(t => t.type === "expense");
  const income = transactions.filter(t => t.type === "income");

  const totalExpenses = expenses.reduce((s, t) => s + t.amount, 0);
  const totalIncome = income.reduce((s, t) => s + t.amount, 0);

  // Estimate monthly (90 days ≈ 3 months)
  const monthlyExpenses = Math.round(totalExpenses / 3);
  const monthlyIncome = Math.round(totalIncome / 3);

  // Category breakdowns
  const diningOut = Math.round(
    expenses.filter(t => t.subcategory === "Dining Out").reduce((s, t) => s + t.amount, 0) / 3
  );
  const rideshare = Math.round(
    expenses.filter(t => t.subcategory === "Rideshare").reduce((s, t) => s + t.amount, 0) / 3
  );
  const groceries = Math.round(
    expenses.filter(t => t.subcategory === "Groceries").reduce((s, t) => s + t.amount, 0) / 3
  );

  const subscriptions = persona.subscriptions.map(s => ({
    name: s.merchant,
    cost: s.cost,
  }));
  const subscriptionTotal = subscriptions.reduce((s, sub) => s + sub.cost, 0);

  // Estimate balance as ~4x monthly net positive
  const balance = Math.max(5000, Math.round((monthlyIncome - monthlyExpenses) * 4 + 15000));

  return {
    monthlyIncome,
    monthlyExpenses,
    balance,
    diningOut,
    rideshare,
    groceries,
    subscriptionTotal,
    subscriptions,
  };
}
