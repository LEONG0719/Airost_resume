import axios from 'axios';
import { useEffect, useState } from 'react';
import { nameTranslations } from '../lib/name';
import Header from '../partials/Header';
import Sidebar from '../partials/Sidebar';
const tasks = ['Design', 'Fix bugs', 'Write docs', 'Deploy', 'Testing', 'Code review'];



function getRandomItem(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function TeamDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageNo, setPageNo] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const defaultVisibleColumns = {
    avatar: true,
    name: true,
    sex: true,
    age: true,
    internalNum: true,
    backup: false,
    entryDate: true,
    status: true,
    task: true,
    duration: true
  };
  const [visibleColumns, setVisibleColumns] = useState(defaultVisibleColumns);

  useEffect(() => {
    const fetchMembers = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`https://who.olgtx.dpdns.org/members?pageNo=${pageNo}&pageSize=10`);
        const results = res.data?.page?.result || [];

        const formatted = results.map((item) => ({
          name: nameTranslations[item.name] || item.name,
          status: Math.random() > 0.5 ? 'Active' : 'Offline',
          task: getRandomItem(tasks),
          duration: `${1 + Math.floor(Math.random() * 3)}h`,
          internalNum: item.memberDetail?.internalNum || '-',
          sex: item.memberDetail?.sex || '-',
          age: item.memberDetail?.age || '-',
          entryDate: item.memberDetail?.entryDate || '-',
          backup: item.backUp || '-',
          avatar: item.avatarPath || '',
        }));

        setMembers(formatted);
        setHasMore(res.data?.page?.hasMore);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching team members:', err.message);
        setLoading(false);
      }
    };

    fetchMembers();
  }, [pageNo]);

  const nextPage = () => setPageNo((p) => p + 1);
  const prevPage = () => setPageNo((p) => (p > 1 ? p - 1 : 1));

  return (
    <div className="flex h-screen overflow-hidden  text-gray-800 dark:text-gray-100">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className="p-6">
          <h2 className="text-2xl font-bold mb-6">Team Dashboard</h2>

          {/* Column Visibility Filter */}
          <div className="mb-6 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow rounded-lg">
            <h3 className="text-lg font-semibold mb-3">Toggle Columns</h3>
            <div className="flex flex-wrap gap-4">
              {Object.keys(defaultVisibleColumns).map((col) => (
                <label key={col} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="form-checkbox text-blue-600 dark:text-blue-400"
                    checked={visibleColumns[col]}
                    onChange={() =>
                      setVisibleColumns((prev) => ({
                        ...prev,
                        [col]: !prev[col],
                      }))
                    }
                  />
                  <span className="capitalize">{col}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Member Table */}
          {loading ? (
            <div className="text-gray-500 dark:text-gray-400">Loading...</div>
          ) : (
            <>
              <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                <table className="min-w-full text-sm table-auto">
                  <thead className="bg-gray-100 dark:bg-gray-700 text-left">
                    <tr>
                      {visibleColumns.avatar && <th className="px-4 py-3 border-b font-semibold">Avatar</th>}
                      {visibleColumns.name && <th className="px-4 py-3 border-b font-semibold">Name</th>}
                      {visibleColumns.sex && <th className="px-4 py-3 border-b font-semibold">Gender</th>}
                      {visibleColumns.age && <th className="px-4 py-3 border-b font-semibold">Age</th>}
                      {visibleColumns.internalNum && <th className="px-4 py-3 border-b font-semibold">Internal ID</th>}
                      {visibleColumns.backup && <th className="px-4 py-3 border-b font-semibold">Backup</th>}
                      {visibleColumns.entryDate && <th className="px-4 py-3 border-b font-semibold">Entry Date</th>}
                      {visibleColumns.status && <th className="px-4 py-3 border-b font-semibold">Status</th>}
                      {visibleColumns.task && <th className="px-4 py-3 border-b font-semibold">Current Task</th>}
                      {visibleColumns.duration && <th className="px-4 py-3 border-b font-semibold">Duration</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {members.map((row, idx) => (
                      <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        {visibleColumns.avatar && (
                          <td className="px-4 py-3 border-t">
                            <img src={row.avatar} alt="avatar" className="w-10 h-10 rounded-full object-cover" />
                          </td>
                        )}
                        {visibleColumns.name && <td className="px-4 py-3 border-t font-medium">{row.name}</td>}
                        {visibleColumns.sex && <td className="px-4 py-3 border-t">{row.sex}</td>}
                        {visibleColumns.age && <td className="px-4 py-3 border-t">{row.age}</td>}
                        {visibleColumns.internalNum && <td className="px-4 py-3 border-t">{row.internalNum}</td>}
                        {visibleColumns.backup && <td className="px-4 py-3 border-t">{row.backup}</td>}
                        {visibleColumns.entryDate && <td className="px-4 py-3 border-t">{row.entryDate}</td>}
                        {visibleColumns.status && (
                          <td className="px-4 py-3 border-t">
                            <span className={`inline-flex items-center gap-2 font-medium ${row.status === 'Active' ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                              <span className={`w-2 h-2 rounded-full ${row.status === 'Active' ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                              {row.status}
                            </span>
                          </td>
                        )}
                        {visibleColumns.task && <td className="px-4 py-3 border-t">{row.task}</td>}
                        {visibleColumns.duration && <td className="px-4 py-3 border-t">{row.duration}</td>}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="mt-6 flex justify-between items-center">
                <button
                  onClick={prevPage}
                  disabled={pageNo === 1}
                  className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-sm font-medium disabled:opacity-50"
                >
                  Previous
                </button>

                <span className="px-4 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 text-sm font-semibold rounded">{`Page ${pageNo}`}</span>

                <button
                  onClick={nextPage}
                  disabled={!hasMore}
                  className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-sm font-medium disabled:opacity-50"
                >
                  Next
                </button>
              </div>

              <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">WebSocket indicator (placeholder)</div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default TeamDashboard;
