import { useState } from 'react';
import Header from '../partials/Header';
import Sidebar from '../partials/Sidebar';

const statuses = [
  { label: 'In Progress', color: 'bg-blue-100 text-blue-700' },
  { label: 'Completed', color: 'bg-green-100 text-green-700' },
  { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  { label: 'Delayed', color: 'bg-red-100 text-red-700' },
];

const generateProjectData = () => {
  const tasks = ['Bug Fixing', 'API Integration', 'UI Design', 'Code Review', 'Testing', 'Documentation'];
  const projects = ['Project Alpha', 'Project Beta', 'Project Gamma'];
  const getTime = () => `${String(8 + Math.floor(Math.random() * 10)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`;
  const getDuration = () => `${10 + Math.floor(Math.random() * 50)}m`;

  return Array.from({ length: 30 }, () => {
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    return {
      time: getTime(),
      task: `${tasks[Math.floor(Math.random() * tasks.length)]} - ${projects[Math.floor(Math.random() * projects.length)]}`,
      duration: getDuration(),
      status,
    };
  });
};

function ActivityDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [offline, setOffline] = useState(false);
  const [projectData, setProjectData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const syncRandom = () => {
    const newData = generateProjectData();
    setProjectData(newData);
    setOffline(false);
    setCurrentPage(1);
  };

  const paginatedData = projectData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(projectData.length / itemsPerPage);

  return (
    <div className="flex h-screen overflow-hidden">
      
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden from-purple-100 via-blue-50 to-pink-100">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className="p-4 space-y-4">
          {offline && (
            <div className="bg-yellow-300 glass text-yellow-900 p-3 rounded-md shadow-md">
              Offline - syncing when connection resumes
            </div>
          )}

          <div className="backdrop-blur-sm  rounded-lg glass shadow-md overflow-hidden border border-gray-200">
            <table className="min-w-full text-sm text-left">
              <thead className="bg-white/20 backdrop-blur-md glass text-gray-700 dark:text-amber-100">
                <tr>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Project Task</th>
                  <th className="p-3">Duration</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.length > 0 ? (
                  paginatedData.map((row, idx) => (
                    <tr key={idx} className="border-t border-white/20 glass hover:bg-white/10 transition">
                      <td className="p-3 dark:text-amber-100 ">{row.time}</td>
                      <td className="p-3 dark:text-amber-100 ">{row.task}</td>
                      <td className="p-3 dark:text-amber-100 ">{row.duration}</td>
                      <td className="p-3 dark:text-amber-100 ">
                        <span className={`px-2 py-1 rounded-full  text-xs font-medium ${row.status.color}`}>
                          {row.status.label}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="p-4 text-center text-gray-600 dark:text-amber-100 ">No synced data. Click "Sync Now".</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="space-x-2">
              <button className="px-4 py-2 bg-blue-600 text-white rounded shadow" onClick={syncRandom}>Sync Now</button>
              <button className="px-4 py-2 bg-yellow-500 text-white rounded shadow" onClick={() => setOffline(true)}>Simulate Offline</button>
            </div>
            {projectData.length > 0 && (
              <div className="flex space-x-2 items-center">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                >
                  Prev
                </button>
                <span className="text-sm text-gray-700 dark:text-blue-200">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default ActivityDashboard;
