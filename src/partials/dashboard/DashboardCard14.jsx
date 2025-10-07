import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { Link } from 'react-router-dom';
import EditMenu from '../../components/DropdownEditMenu';
import { adjustColorOpacity, getCssVariable } from '../../utils/Utils';

// Register chart components
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

function DashboardCard14() {
  const chartData = {
    labels: [
      'Alice',
      'Bob',
      'Charlie',
      'Diana',
      'Ethan',
      'Fiona',
      'George',
      'Hannah',
    ],
    datasets: [
      {
        label: 'Avg Task Completion Time (mins)',
        data: [35, 42, 30, 50, 38, 29, 44, 36],
        backgroundColor: getCssVariable('--color-violet-500'),
        borderRadius: 6,
        barThickness: 20,
      },
    ],
  };

  const chartOptions = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          color: getCssVariable('--color-gray-700'),
        },
        grid: {
          display: true,
          color: adjustColorOpacity(getCssVariable('--color-gray-300'), 0.3),
        },
      },
      y: {
        ticks: {
          color: getCssVariable('--color-gray-700'),
        },
        grid: {
          display: false,
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
            return `${context.parsed.x} minutes`;
          },
        },
      },
    },
  };

  return (
    <div className="flex flex-col col-span-full sm:col-span-6 xl:col-span-4 glass bg-white dark:bg-gray-800 shadow-xs rounded-xl">
      <div className="px-5 pt-5">
        <header className="flex justify-between items-start mb-2">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">Team Task Stats</h2>
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
        <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase mb-1">Performance</div>
        <div className="flex items-start mb-2">
          <div className="text-3xl font-bold text-gray-800 dark:text-gray-100 mr-2">Avg. 38 mins</div>
          <div className="text-sm font-medium text-green-700 px-1.5 bg-green-500/20 rounded-full">+5%</div>
        </div>
      </div>
      <div className="grow h-[256px] px-3 pb-5">
        <Bar data={chartData} options={chartOptions} />
      </div>
    </div>
  );
}

export default DashboardCard14;
