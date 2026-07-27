const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "JPY",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export const formatCurrency = (amount: number): string => {
  return currencyFormatter.format(amount);
};