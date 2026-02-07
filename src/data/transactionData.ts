export interface Transaction {
  id: string;
  date: string;
  merchant: string;
  category: string;
  subcategory: string;
  subsubcategory: string;
  account: string;
  amount: number;
  type: "expense" | "income";
}

const accounts = ["Chase Checking", "Amex Gold", "Capital One", "Apple Card", "Savings"];

// Maps to Sankey data: Category → Subcategory → Sub-subcategory (merchant)
export const demoTransactions: Transaction[] = [
  // Shopping → Clothing
  { id: "t01", date: "2024-04-02", merchant: "Zara", category: "Shopping", subcategory: "Clothing", subsubcategory: "Zara", account: "Amex Gold", amount: 89.00, type: "expense" },
  { id: "t02", date: "2024-04-08", merchant: "Zara", category: "Shopping", subcategory: "Clothing", subsubcategory: "Zara", account: "Amex Gold", amount: 96.00, type: "expense" },
  { id: "t03", date: "2024-04-05", merchant: "H&M", category: "Shopping", subcategory: "Clothing", subsubcategory: "H&M", account: "Apple Card", amount: 67.50, type: "expense" },
  { id: "t04", date: "2024-04-14", merchant: "H&M", category: "Shopping", subcategory: "Clothing", subsubcategory: "H&M", account: "Apple Card", amount: 67.50, type: "expense" },
  { id: "t05", date: "2024-04-10", merchant: "Nike", category: "Shopping", subcategory: "Clothing", subsubcategory: "Nike", account: "Amex Gold", amount: 100.00, type: "expense" },
  // Shopping → Electronics
  { id: "t06", date: "2024-04-03", merchant: "Amazon", category: "Shopping", subcategory: "Electronics", subsubcategory: "Amazon", account: "Chase Checking", amount: 89.00, type: "expense" },
  { id: "t07", date: "2024-04-18", merchant: "Amazon", category: "Shopping", subcategory: "Electronics", subsubcategory: "Amazon", account: "Chase Checking", amount: 89.00, type: "expense" },
  { id: "t08", date: "2024-04-12", merchant: "Best Buy", category: "Shopping", subcategory: "Electronics", subsubcategory: "Best Buy", account: "Capital One", amount: 134.00, type: "expense" },
  // Shopping → Home
  { id: "t09", date: "2024-04-06", merchant: "IKEA", category: "Shopping", subcategory: "Home", subsubcategory: "IKEA", account: "Chase Checking", amount: 120.00, type: "expense" },
  { id: "t10", date: "2024-04-20", merchant: "Target", category: "Shopping", subcategory: "Home", subsubcategory: "Target", account: "Apple Card", amount: 60.00, type: "expense" },

  // Food → Groceries
  { id: "t11", date: "2024-04-01", merchant: "Trader Joe's", category: "Food", subcategory: "Groceries", subsubcategory: "Trader Joe's", account: "Chase Checking", amount: 82.40, type: "expense" },
  { id: "t12", date: "2024-04-09", merchant: "Trader Joe's", category: "Food", subcategory: "Groceries", subsubcategory: "Trader Joe's", account: "Chase Checking", amount: 82.60, type: "expense" },
  { id: "t13", date: "2024-04-04", merchant: "Whole Foods", category: "Food", subcategory: "Groceries", subsubcategory: "Whole Foods", account: "Amex Gold", amount: 65.00, type: "expense" },
  { id: "t14", date: "2024-04-16", merchant: "Whole Foods", category: "Food", subcategory: "Groceries", subsubcategory: "Whole Foods", account: "Amex Gold", amount: 65.00, type: "expense" },
  { id: "t15", date: "2024-04-22", merchant: "Costco", category: "Food", subcategory: "Groceries", subsubcategory: "Costco", account: "Capital One", amount: 85.00, type: "expense" },
  // Food → Dining Out
  { id: "t16", date: "2024-04-07", merchant: "Nobu", category: "Food", subcategory: "Dining Out", subsubcategory: "Restaurants", account: "Amex Gold", amount: 56.00, type: "expense" },
  { id: "t17", date: "2024-04-15", merchant: "Sweetgreen", category: "Food", subcategory: "Dining Out", subsubcategory: "Restaurants", account: "Apple Card", amount: 56.00, type: "expense" },
  { id: "t18", date: "2024-04-11", merchant: "DoorDash", category: "Food", subcategory: "Dining Out", subsubcategory: "Takeout", account: "Chase Checking", amount: 38.00, type: "expense" },
  { id: "t19", date: "2024-04-25", merchant: "Uber Eats", category: "Food", subcategory: "Dining Out", subsubcategory: "Takeout", account: "Chase Checking", amount: 37.00, type: "expense" },
  // Food → Coffee
  { id: "t20", date: "2024-04-03", merchant: "Starbucks", category: "Food", subcategory: "Coffee", subsubcategory: "Starbucks", account: "Apple Card", amount: 6.20, type: "expense" },
  { id: "t21", date: "2024-04-10", merchant: "Starbucks", category: "Food", subcategory: "Coffee", subsubcategory: "Starbucks", account: "Apple Card", amount: 5.80, type: "expense" },
  { id: "t22", date: "2024-04-17", merchant: "Starbucks", category: "Food", subcategory: "Coffee", subsubcategory: "Starbucks", account: "Apple Card", amount: 6.50, type: "expense" },
  { id: "t23", date: "2024-04-24", merchant: "Starbucks", category: "Food", subcategory: "Coffee", subsubcategory: "Starbucks", account: "Apple Card", amount: 5.50, type: "expense" },
  { id: "t24", date: "2024-04-06", merchant: "Blue Bottle", category: "Food", subcategory: "Coffee", subsubcategory: "Local Café", account: "Chase Checking", amount: 5.80, type: "expense" },
  { id: "t25", date: "2024-04-19", merchant: "Blue Bottle", category: "Food", subcategory: "Coffee", subsubcategory: "Local Café", account: "Chase Checking", amount: 6.20, type: "expense" },
  { id: "t60", date: "2024-04-13", merchant: "Starbucks", category: "Food", subcategory: "Coffee", subsubcategory: "Starbucks", account: "Apple Card", amount: 6.00, type: "expense" },
  { id: "t61", date: "2024-04-21", merchant: "Starbucks", category: "Food", subcategory: "Coffee", subsubcategory: "Starbucks", account: "Apple Card", amount: 6.00, type: "expense" },
  { id: "t62", date: "2024-04-08", merchant: "Blue Bottle", category: "Food", subcategory: "Coffee", subsubcategory: "Local Café", account: "Chase Checking", amount: 6.00, type: "expense" },
  { id: "t63", date: "2024-04-15", merchant: "Blue Bottle", category: "Food", subcategory: "Coffee", subsubcategory: "Local Café", account: "Chase Checking", amount: 7.00, type: "expense" },
  { id: "t64", date: "2024-04-22", merchant: "Blue Bottle", category: "Food", subcategory: "Coffee", subsubcategory: "Local Café", account: "Chase Checking", amount: 7.00, type: "expense" },
  { id: "t65", date: "2024-04-28", merchant: "Starbucks", category: "Food", subcategory: "Coffee", subsubcategory: "Starbucks", account: "Apple Card", amount: 6.00, type: "expense" },

  // Travel → Flights
  { id: "t26", date: "2024-04-01", merchant: "Delta Airlines", category: "Travel", subcategory: "Flights", subsubcategory: "Delta", account: "Amex Gold", amount: 190.00, type: "expense" },
  { id: "t27", date: "2024-04-19", merchant: "United Airlines", category: "Travel", subcategory: "Flights", subsubcategory: "United", account: "Capital One", amount: 100.00, type: "expense" },
  // Travel → Rideshare
  { id: "t28", date: "2024-04-04", merchant: "Uber", category: "Travel", subcategory: "Rideshare", subsubcategory: "Uber", account: "Chase Checking", amount: 23.00, type: "expense" },
  { id: "t29", date: "2024-04-11", merchant: "Uber", category: "Travel", subcategory: "Rideshare", subsubcategory: "Uber", account: "Chase Checking", amount: 23.00, type: "expense" },
  { id: "t30", date: "2024-04-18", merchant: "Uber", category: "Travel", subcategory: "Rideshare", subsubcategory: "Uber", account: "Chase Checking", amount: 23.00, type: "expense" },
  { id: "t31", date: "2024-04-25", merchant: "Uber", category: "Travel", subcategory: "Rideshare", subsubcategory: "Uber", account: "Chase Checking", amount: 23.00, type: "expense" },
  { id: "t32", date: "2024-04-08", merchant: "Lyft", category: "Travel", subcategory: "Rideshare", subsubcategory: "Lyft", account: "Apple Card", amount: 25.00, type: "expense" },
  { id: "t33", date: "2024-04-22", merchant: "Lyft", category: "Travel", subcategory: "Rideshare", subsubcategory: "Lyft", account: "Apple Card", amount: 25.00, type: "expense" },
  // Travel → Transport
  { id: "t34", date: "2024-04-05", merchant: "Metro Card", category: "Travel", subcategory: "Transport", subsubcategory: "Metro", account: "Chase Checking", amount: 55.00, type: "expense" },
  { id: "t35", date: "2024-04-12", merchant: "Bus Pass", category: "Travel", subcategory: "Transport", subsubcategory: "Bus", account: "Chase Checking", amount: 25.00, type: "expense" },

  // Bills & Utilities → Rent
  { id: "t36", date: "2024-04-01", merchant: "Apartment Mgmt", category: "Bills & Utilities", subcategory: "Rent", subsubcategory: "Apartment", account: "Chase Checking", amount: 145.00, type: "expense" },
  // Bills & Utilities → Internet
  { id: "t37", date: "2024-04-05", merchant: "Comcast", category: "Bills & Utilities", subcategory: "Internet", subsubcategory: "Comcast", account: "Chase Checking", amount: 89.00, type: "expense" },
  // Bills & Utilities → Electricity
  { id: "t38", date: "2024-04-10", merchant: "ConEd", category: "Bills & Utilities", subcategory: "Electricity", subsubcategory: "ConEd", account: "Chase Checking", amount: 65.00, type: "expense" },
  // Bills & Utilities → Water
  { id: "t39", date: "2024-04-15", merchant: "City Water", category: "Bills & Utilities", subcategory: "Water", subsubcategory: "City Water", account: "Chase Checking", amount: 125.00, type: "expense" },

  // Subscriptions → Streaming
  { id: "t40", date: "2024-04-01", merchant: "Netflix", category: "Subscriptions", subcategory: "Streaming", subsubcategory: "Netflix", account: "Apple Card", amount: 16.00, type: "expense" },
  { id: "t41", date: "2024-04-01", merchant: "Spotify", category: "Subscriptions", subcategory: "Streaming", subsubcategory: "Spotify", account: "Apple Card", amount: 14.00, type: "expense" },
  { id: "t42", date: "2024-04-01", merchant: "Disney+", category: "Subscriptions", subcategory: "Streaming", subsubcategory: "Disney+", account: "Apple Card", amount: 15.00, type: "expense" },
  // Subscriptions → Software
  { id: "t43", date: "2024-04-01", merchant: "Adobe", category: "Subscriptions", subcategory: "Software", subsubcategory: "Adobe", account: "Chase Checking", amount: 55.00, type: "expense" },
  { id: "t44", date: "2024-04-01", merchant: "Notion", category: "Subscriptions", subcategory: "Software", subsubcategory: "Notion", account: "Chase Checking", amount: 34.00, type: "expense" },
  // Subscriptions → Gym
  { id: "t45", date: "2024-04-01", merchant: "Equinox", category: "Subscriptions", subcategory: "Gym", subsubcategory: "Equinox", account: "Amex Gold", amount: 54.00, type: "expense" },

  // Other
  { id: "t46", date: "2024-04-07", merchant: "ATM Withdrawal", category: "Other", subcategory: "Miscellaneous", subsubcategory: "Cash", account: "Chase Checking", amount: 40.00, type: "expense" },
  { id: "t47", date: "2024-04-14", merchant: "ATM Fee", category: "Other", subcategory: "Miscellaneous", subsubcategory: "ATM Fee", account: "Chase Checking", amount: 26.00, type: "expense" },

  // Income
  { id: "t48", date: "2024-04-01", merchant: "Employer Inc.", category: "Income", subcategory: "Salary", subsubcategory: "Payroll", account: "Chase Checking", amount: 3500.00, type: "income" },
  { id: "t49", date: "2024-04-15", merchant: "Employer Inc.", category: "Income", subcategory: "Salary", subsubcategory: "Payroll", account: "Chase Checking", amount: 3500.00, type: "income" },
  { id: "t50", date: "2024-04-10", merchant: "Freelance Client", category: "Income", subcategory: "Freelance", subsubcategory: "Invoice", account: "Savings", amount: 1260.00, type: "income" },
];

export const allCategories = [...new Set(demoTransactions.map((t) => t.category))];
export const allAccounts = [...new Set(demoTransactions.map((t) => t.account))];
