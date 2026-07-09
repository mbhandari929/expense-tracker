type SummaryCardProps = {
  title: string;
  amount: number;
  className?: string;
};

function SummaryCard({ title, amount, className = "" }: SummaryCardProps) {
  return (
    <div className={`summary-card ${className}`}>
      <h3>{title}</h3>
      <p>¥{amount}</p>
    </div>
  );
}

export default SummaryCard;