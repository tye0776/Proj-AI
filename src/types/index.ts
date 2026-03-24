export interface Product {
  id: string;
  name: string;
  costPrice: number;
  sellingPrice: number;
  isCombo?: boolean;
  comboItems?: string[]; // Array of product IDs that make up the combo
  priceHistory?: {
    date: string; // ISO date string
    costPrice: number;
    sellingPrice: number;
  }[];
}

export interface Sale {
  id: string;
  productId: string;
  quantity: number;
  date: string; // ISO date string
}
