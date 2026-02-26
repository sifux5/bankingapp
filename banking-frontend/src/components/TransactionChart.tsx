import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement
);

interface Transaction {
  id: number;
  amount: number;
  transactionType: 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER';
  createdAt: string;
  fromAccountNumber: string | null;
}

interface TransactionChartProps {
  transactions: Transaction[];
  currentAccountNumber: string;
}

function TransactionChart({ transactions, currentAccountNumber }: TransactionChartProps) {
  // Grupeeri tehingud kuupäeva järgi (viimased 7 päeva)
  const last7Days = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  });

  const groupedByDate = transactions.reduce((acc: any, transaction) => {
    const date = new Date(transaction.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    if (!acc[date]) {
      acc[date] = { deposits: 0, withdrawals: 0 };
    }

    if (transaction.transactionType === 'DEPOSIT') {
      acc[date].deposits += transaction.amount;
    } else if (transaction.transactionType === 'WITHDRAWAL') {
      acc[date].withdrawals += transaction.amount;
    } else if (transaction.transactionType === 'TRANSFER') {
      if (transaction.fromAccountNumber === currentAccountNumber) {
        acc[date].withdrawals += transaction.amount;
      } else {
        acc[date].deposits += transaction.amount;
      }
    }

    return acc;
  }, {});

  const deposits = last7Days.map(date => groupedByDate[date]?.deposits || 0);
  const withdrawals = last7Days.map(date => groupedByDate[date]?.withdrawals || 0);

  // Line Chart Data
  const lineData = {
    labels: last7Days,
    datasets: [
      {
        label: 'Income',
        data: deposits,
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: true,
        tension: 0.4,
        borderWidth: 2,
      },
      {
        label: 'Expenses',
        data: withdrawals,
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: true,
        tension: 0.4,
        borderWidth: 2,
      },
    ],
  };

  // Calculate totals
  const totalDeposits = transactions
    .filter(t => t.transactionType === 'DEPOSIT' || (t.transactionType === 'TRANSFER' && t.fromAccountNumber !== currentAccountNumber))
    .reduce((sum, t) => sum + t.amount, 0);

  const totalWithdrawals = transactions
    .filter(t => t.transactionType === 'WITHDRAWAL' || (t.transactionType === 'TRANSFER' && t.fromAccountNumber === currentAccountNumber))
    .reduce((sum, t) => sum + t.amount, 0);

  // Doughnut Chart Data
  const doughnutData = {
    labels: ['Income', 'Expenses'],
    datasets: [
      {
        data: [totalDeposits, totalWithdrawals],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderColor: [
          'rgb(34, 197, 94)',
          'rgb(239, 68, 68)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 15,
        }
      },
      title: {
        display: true,
        text: 'Last 7 Days Activity',
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return '€' + value.toFixed(0);
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        }
      },
      x: {
        grid: {
          display: false,
        }
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          padding: 15,
        }
      },
      title: {
        display: true,
        text: 'Income vs Expenses',
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: €${value.toFixed(2)} (${percentage}%)`;
          }
        }
      }
    }
  };

  if (transactions.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Analytics</h3>
        <p className="text-gray-500 text-center py-8">No transactions to display</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Line Chart */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div style={{ height: '300px' }}>
          <Line data={lineData} options={lineOptions} />
        </div>
      </div>

      {/* Doughnut Chart */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div style={{ height: '300px' }}>
          <Doughnut data={doughnutData} options={doughnutOptions} />
        </div>
      </div>
    </div>
  );
}

export default TransactionChart;