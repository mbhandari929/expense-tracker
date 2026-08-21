export type TransactionType = "income" | "expense";

export type Item = {
  id: string;
  text: string;
  amount: number;
  date: string;
  type: TransactionType;
};