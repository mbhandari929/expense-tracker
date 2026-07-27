type SummaryCardProps = {
  title: string;
  amount: number;
  className?: string;
};

function formatCurrency(amount: number) {
  return `¥${amount.toLocaleString("en-US")}`;
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