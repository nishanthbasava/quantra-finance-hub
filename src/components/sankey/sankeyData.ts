// ─── Sankey Data Types & Helpers ─────────────────────────────────────────────
// Types are now shared with DataContext. This file provides lookup helpers.

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

// Helpers that work with dynamic categories
export function getCategoryByName(categories: Category[], name: string): Category | undefined {
  return categories.find((c) => c.name === name);
}

export function getSubCategoryByName(categories: Category[], catName: string, subName: string): SubCategory | undefined {
  return getCategoryByName(categories, catName)?.children.find((s) => s.name === subName);
}
