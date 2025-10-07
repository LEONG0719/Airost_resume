import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Link } from 'react-router-dom';
import EditMenu from '../../components/DropdownEditMenu';
import { adjustColorOpacity, getCssVariable } from '../../utils/Utils';

// Register required chart components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler, Legend);

function DashboardCard15() {
  const chartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Completed Tasks',
        data: [5, 8, 6, 10, 12, 7, 4],
        fill: true,
        backgroundColor: adjustColorOpacity(getCssVariable('--color-violet-500'), 0.2),
        borderColor: getCssVariable('--color-violet-500'),
        borderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 5,
        pointBackgroundColor: getCssVariable('--color-violet-500'),
        tension: 0.3,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        ticks: {
          color: getCssVariable('--color-gray-700'),
        },
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: getCssVariable('--color-gray-700'),
        },
        grid: {
          color: adjustColorOpacity(getCssVariable('--color-gray-300'), 0.3),
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return `${context.parsed.y} tasks`;
          },
        },
      },
    },
  };

  return (
    <div className="flex flex-col col-span-full sm:col-span-6 xl:col-span-4 glass bg-white dark:bg-gray-800 shadow-xs rounded-xl">
      <div className="px-5 pt-5">
        <header className="flex justify-between items-start mb-2">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">Weekly Task Completion</h2>
          <EditMenu align="right" className="relative inline-flex">
            <li>
              <Link className="font-medium text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-200 flex py-1 px-3" to="#0">
                Option 1
              </Link>
            </li>
            <li>
              <Link className="font-medium text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-200 flex py-1 px-3" to="#0">
                Option 2
              </Link>
            </li>
            <li>
              <Link className="font-medium text-sm text-red-500 hover:text-red-600 flex py-1 px-3" to="#0">
                Remove
              </Link>
            </li>
          </EditMenu>
        </header>
        <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase mb-1">Team Output</div>
        <div className="flex items-start mb-2">
          <div className="text-3xl font-bold text-gray-800 dark:text-gray-100 mr-2">52 tasks</div>
          <div className="text-sm font-medium text-green-700 px-1.5 bg-green-500/20 rounded-full">+12%</div>
        </div>
      </div>
      <div className="grow h-[256px] px-3 pb-5">
        <Line data={chartData} options={chartOptions} />
      </div>
    </div>
  );
}

export default DashboardCard15;
