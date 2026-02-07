export interface SubSubCategory {
  name: string;
  amount: number;
}

export interface SubCategory {
  name: string;
  amount: number;
  children: SubSubCategory[];
}

export interface Category {
  name: string;
  amount: number;
  color: string;
  children: SubCategory[];
}

export const categories: Category[] = [
  {
    name: "Shopping",
    amount: 912,
    color: "hsl(260, 50%, 65%)",
    children: [
      {
        name: "Clothing",
        amount: 420,
        children: [
          { name: "Zara", amount: 185 },
          { name: "H&M", amount: 135 },
          { name: "Nike", amount: 100 },
        ],
      },
      {
        name: "Electronics",
        amount: 312,
        children: [
          { name: "Amazon", amount: 178 },
          { name: "Best Buy", amount: 134 },
        ],
      },
      {
        name: "Home",
        amount: 180,
        children: [
          { name: "IKEA", amount: 120 },
          { name: "Target", amount: 60 },
        ],
      },
    ],
  },
  {
    name: "Food",
    amount: 647,
    color: "hsl(170, 65%, 48%)",
    children: [
      {
        name: "Groceries",
        amount: 380,
        children: [
          { name: "Trader Joe's", amount: 165 },
          { name: "Whole Foods", amount: 130 },
          { name: "Costco", amount: 85 },
        ],
      },
      {
        name: "Dining Out",
        amount: 187,
        children: [
          { name: "Restaurants", amount: 112 },
          { name: "Takeout", amount: 75 },
        ],
      },
      {
        name: "Coffee",
        amount: 80,
        children: [
          { name: "Starbucks", amount: 48 },
          { name: "Local Café", amount: 32 },
        ],
      },
    ],
  },
  {
    name: "Travel",
    amount: 512,
    color: "hsl(200, 70%, 55%)",
    children: [
      {
        name: "Flights",
        amount: 290,
        children: [
          { name: "Delta", amount: 190 },
          { name: "United", amount: 100 },
        ],
      },
      {
        name: "Rideshare",
        amount: 142,
        children: [
          { name: "Uber", amount: 92 },
          { name: "Lyft", amount: 50 },
        ],
      },
      {
        name: "Transport",
        amount: 80,
        children: [
          { name: "Metro", amount: 55 },
          { name: "Bus", amount: 25 },
        ],
      },
    ],
  },
  {
    name: "Bills & Utilities",
    amount: 424,
    color: "hsl(215, 45%, 55%)",
    children: [
      {
        name: "Rent",
        amount: 145,
        children: [
          { name: "Apartment", amount: 145 },
        ],
      },
      {
        name: "Internet",
        amount: 89,
        children: [
          { name: "Comcast", amount: 89 },
        ],
      },
      {
        name: "Electricity",
        amount: 65,
        children: [
          { name: "ConEd", amount: 65 },
        ],
      },
      {
        name: "Water",
        amount: 125,
        children: [
          { name: "City Water", amount: 125 },
        ],
      },
    ],
  },
  {
    name: "Subscriptions",
    amount: 188,
    color: "hsl(185, 55%, 50%)",
    children: [
      {
        name: "Streaming",
        amount: 45,
        children: [
          { name: "Netflix", amount: 16 },
          { name: "Spotify", amount: 14 },
          { name: "Disney+", amount: 15 },
        ],
      },
      {
        name: "Software",
        amount: 89,
        children: [
          { name: "Adobe", amount: 55 },
          { name: "Notion", amount: 34 },
        ],
      },
      {
        name: "Gym",
        amount: 54,
        children: [
          { name: "Equinox", amount: 54 },
        ],
      },
    ],
  },
  {
    name: "Other",
    amount: 66,
    color: "hsl(210, 20%, 70%)",
    children: [
      {
        name: "Miscellaneous",
        amount: 66,
        children: [
          { name: "Cash", amount: 40 },
          { name: "ATM Fee", amount: 26 },
        ],
      },
    ],
  },
];

export const totalExpenses = categories.reduce((sum, c) => sum + c.amount, 0);

// Helpers
export function getCategoryByName(name: string): Category | undefined {
  return categories.find((c) => c.name === name);
}

export function getSubCategoryByName(catName: string, subName: string): SubCategory | undefined {
  return getCategoryByName(catName)?.children.find((s) => s.name === subName);
}
