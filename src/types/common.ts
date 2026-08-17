export type MonthlyBudgets = Record<string, number>;

export type DialogMessage = {
  title: string;
  message: string;
  type: "success" | "error";
};