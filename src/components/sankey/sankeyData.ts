export interface SubCategory {
  name: string;
  amount: number;
}

export interface Category {
  name: string;
  amount: number;
  color: string;
  subcategories: SubCategory[];
}

export interface FlowItem {
  key: string;
  label: string;
  amount: number;
  color: string;
  parentName: string;
  isSub: boolean;
}

export const categories: Category[] = [
  {
    name: "Shopping",
    amount: 912,
    color: "hsl(260, 50%, 65%)",
    subcategories: [
      { name: "Clothing", amount: 420 },
      { name: "Electronics", amount: 312 },
      { name: "Home", amount: 180 },
    ],
  },
  {
    name: "Food",
    amount: 647,
    color: "hsl(170, 65%, 48%)",
    subcategories: [
      { name: "Groceries", amount: 380 },
      { name: "Dining Out", amount: 187 },
      { name: "Coffee", amount: 80 },
    ],
  },
  {
    name: "Travel",
    amount: 512,
    color: "hsl(200, 70%, 55%)",
    subcategories: [
      { name: "Flights", amount: 290 },
      { name: "Rideshare", amount: 142 },
      { name: "Transport", amount: 80 },
    ],
  },
  {
    name: "Bills & Utilities",
    amount: 424,
    color: "hsl(215, 45%, 55%)",
    subcategories: [
      { name: "Rent", amount: 145 },
      { name: "Internet", amount: 89 },
      { name: "Electricity", amount: 65 },
      { name: "Water", amount: 125 },
    ],
  },
  {
    name: "Subscriptions",
    amount: 188,
    color: "hsl(185, 55%, 50%)",
    subcategories: [
      { name: "Streaming", amount: 45 },
      { name: "Software", amount: 89 },
      { name: "Gym", amount: 54 },
    ],
  },
  {
    name: "Other",
    amount: 66,
    color: "hsl(210, 20%, 70%)",
    subcategories: [
      { name: "Miscellaneous", amount: 66 },
    ],
  },
];

export const totalExpenses = categories.reduce((sum, c) => sum + c.amount, 0);
