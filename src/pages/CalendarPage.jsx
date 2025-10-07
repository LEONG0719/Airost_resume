import { useEffect, useState } from 'react';
import Header from '../partials/Header';
import Sidebar from '../partials/Sidebar';

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const statuses = [
  { label: 'In Progress', color: 'bg-blue-100 text-blue-800' },
  { label: 'Completed', color: 'bg-green-100 text-green-800' },
  { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  { label: 'Delayed', color: 'bg-red-100 text-red-800' },
];

const tasks = ['Bug Fix', 'API Hookup', 'Design Audit', 'QA Testing', 'Refactor', 'Story Grooming'];
const projects = ['Alpha', 'Beta', 'Gamma', 'Delta'];

const generateActivities = () => {
  const data = {};
  daysOfWeek.forEach(day => {
    const count = Math.floor(Math.random() * 3) + 1;
    data[day] = Array.from({ length: count }, () => {
      const task = tasks[Math.floor(Math.random() * tasks.length)];
      const project = projects[Math.floor(Math.random() * projects.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      return {
        task: `${task} - ${project}`,
        status,
        time: `${8 + Math.floor(Math.random() * 9)}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
      };
    });
  });
  return data;
};

function CalendarPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activities, setActivities] = useState({});

  useEffect(() => {
    setActivities(generateActivities());
  }, []);

  const syncCalendar = () => {
    setActivities(generateActivities());
  };

  return (
    <div className="flex h-screen overflow-hidden  from-indigo-100 via-blue-50 to-pink-100">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="relative flex flex-col flex-1 overflow-y-auto">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className="p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold text-gray-800 dark:text-amber-100">Sprint Activity Calendar</h1>
            <button
              onClick={syncCalendar}
              className="px-4 py-2 btn-primary text-white rounded-lg shadow-md hover:bg-blue-700 transition"
            >
             Sync Activities
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {daysOfWeek.map(day => (
              <div
                key={day}
                className="rounded-xl p-4 shadow-lg border glass border-white/30 min-h-[180px] bg-white/30 backdrop-blur-sm"
              >
                <h2 className="text-lg font-semibold text-blue-900 dark:text-amber-100 mb-2">{day}</h2>
                {activities[day]?.map((item, idx) => (
                  <div
                    key={idx}
                    className={`mb-2 p-2 rounded text-sm font-medium shadow-sm ${item.status.color}`}
                  >
                    <div>{item.task}</div>
                    <div className="text-xs">{item.time}</div>
                    <div className="text-xs font-normal">{item.status.label}</div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}

export default CalendarPage;
