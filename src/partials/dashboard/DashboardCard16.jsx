import axios from 'axios';
import { useEffect, useState } from 'react';
import { nameTranslations } from '../../lib/name';


const statusPool = ["Active", "Offline"];
const tasks = [
  "Sprint Planning", "Bug Fix", "Refactoring", "Testing", "Design", "Documentation"
];

function DashboardCard10() {
  const [members, setMembers] = useState([]);
  const [pageNo, setPageNo] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const fetchMembers = async (page = 1) => {
    try {
      const res = await axios.get(`https:///whohk.olgtx.dpdns.org/members?pageNo=${page}&pageSize=10`);
      const results = res.data?.page?.result || [];
      const formatted = results.map((item, index) => ({
        id: item.id,
        name: nameTranslations[item.name] || item.name,
        workingId: `A24CS${item.id.slice(-4)}`,
        avatar: item.avatarPath,
        status: statusPool[index % 2],
        task: tasks[index % tasks.length],
      }));

      setMembers(formatted);
      setHasMore(res.data?.page?.hasMore);
    } catch (err) {
      console.error("Failed to fetch members:", err);
    }
  };

  useEffect(() => {
    fetchMembers(pageNo);
  }, [pageNo]);

  const nextPage = () => setPageNo((prev) => prev + 1);
  const prevPage = () => setPageNo((prev) => (prev > 1 ? prev - 1 : 1));

  return (
    <div className="col-span-full xl:col-span-6 bg-glass dark:bg-gray-800  glass shadow-xs rounded-xl">
      <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60">
        <h2 className="font-semibold text-gray-800 dark:text-gray-100">Team Member Overview</h2>
      </header>
      
      <div className="p-3">
        
        <div className="overflow-x-auto">
          <table className="table-auto w-full">
            <thead className="text-xs font-semibold uppercase text-gray-400 glass dark:text-gray-500 bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="p-2 text-left">Name</th>
                <th className="p-2 text-left">Working ID</th>
                <th className="p-2 text-left">Status</th>
                <th className="p-2 text-left">Current Task</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-100 dark:divide-gray-700/60">
              {members.map((m) => (
                <tr key={m.id}>
                  <td className="p-2">
                    <div className="flex items-center">
                      <img className="w-10 h-10 rounded-full mr-3" src={m.avatar} alt={m.name} />
                      <span className="text-gray-800 dark:text-gray-100">{m.name}</span>
                    </div>
                  </td>
                  <td className="p-2 text-gray-700 dark:text-gray-300">{m.workingId}</td>
                  <td className="p-2">
                    <span className={`font-medium ${m.status === 'Active' ? 'text-green-500' : 'text-gray-400'}`}>{m.status}</span>
                  </td>
                  <td className="p-2 text-gray-600 dark:text-gray-300">{m.task}</td>
                </tr>
              ))}
              {members.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-center text-sm text-gray-400 py-4">No data found</td>
                </tr>
              )}
            </tbody>
          </table>
          
        </div>
        

        <div className="flex justify-between items-center mt-4 px-2">
          
          <button
            onClick={prevPage}
            disabled={pageNo === 1}
            className="bg-gray-200 dark:bg-gray-600 text-sm font-medium px-3 py-1 rounded disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-gray-600 dark:text-gray-300 text-sm">Page {pageNo}</span>
          
          <button
            onClick={nextPage}
            disabled={!hasMore}
            className="bg-gray-200 dark:bg-gray-600 text-sm font-medium px-3 py-1 rounded disabled:opacity-40"
          >
            Next
          </button>
          
        </div>
      </div>
    </div>
    
  );
}

export default DashboardCard10;
