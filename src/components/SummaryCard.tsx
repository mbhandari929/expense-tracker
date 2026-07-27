type SummaryCardProps = {
  title: string;
  amount: number;
  className?: string;
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

function SummaryCard({
  title,
  amount,
  className = "",
}: SummaryCardProps) {
  return (
    <div className={`summary-card ${className}`}>
      <h3>{title}</h3>
      <p>{formatCurrency(amount)}</p>
    </div>
  );
}

export default SummaryCard;