import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

type ChartItem = {
  name: string;
  total: number;
};

type TransactionChartProps = {
  data: ChartItem[];
};

const COLORS = [
  "#00C49F",
  "#0088FE",
  "#FFBB28",
  "#FF8042",
  "#FF4560",
];

function TransactionChart({
  data,
}: TransactionChartProps) {
  const chartKey = data
    .map((item) => `${item.name}:${item.total}`)
    .join("|");

  return (
    <div className="chart-area single-chart-area">
      <div className="chart-box">
     <h2>All-time Income & Expense Pie Chart</h2>

        {data.length === 0 ? (
          <p>No chart data yet.</p>
        ) : (
          <ResponsiveContainer
            key={chartKey}
            width="100%"
            height={350}
            minWidth={0}
          >
            <PieChart>
              <Pie
                data={data}
                dataKey="total"
                nameKey="name"
                outerRadius={110}
                label
              >
                {data.map((item, index) => (
                  <Cell
                    key={item.name}
                    fill={
                      COLORS[
                        index % COLORS.length
                      ]
                    }
                  />
                ))}
              </Pie>

              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

export default TransactionChart;