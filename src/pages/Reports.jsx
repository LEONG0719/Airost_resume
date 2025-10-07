import axios from 'axios';
import { useEffect, useState } from 'react';
import Datepicker from '../components/Datepicker';
import GroupSelect from '../components/GroupSelect.jsx';
import Task3DHeatmap from '../components/Task3DHeatmap';
import Header from '../partials/Header';
import Sidebar from '../partials/Sidebar';
import { exportToCSV, exportToExcel } from '../utils/exportUtils.js';

function Reports() {
  const [groupValue, setGroupValue] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [team, setTeam] = useState('');
  const [range, setRange] = useState({ from: null, to: null });
  const [data, setData] = useState([]);
  const [heatmap, setHeatmap] = useState([]);
  const [groupOptions, setGroupOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  const heatData = data.map((d, i) => ({
    day: d.date,
    hour: i % 24,
    value: d.tasks,
  }));

  const getTokenFromCookie = () => {
    const match = document.cookie.match(/(^| )token=([^;]+)/);
    return match ? match[2] : null;
  };

  const fetchGroups = async () => {
    const token = getTokenFromCookie();
    if (!token) return;
    try {
      const res = await axios.get('https://who2.olgtx.dpdns.org/api/groups', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const transformed = [{ id: '', name: 'All Groups' }].concat(
        (res.data || []).map(g => ({
          id: g.group_name,
          name: g.group_name
        }))
      );
      setGroupOptions(transformed);
    } catch (err) {
      console.error('Failed to fetch group list:', err);
    }
  };

  const fetchReports = async () => {
    const token = getTokenFromCookie();
    if (!token) return;

    const params = {};
    if (range.from) params.start = range.from.toISOString().split('T')[0];
    if (range.to) params.end = range.to.toISOString().split('T')[0];
    if (team) params.group = team;

    try {
      setLoading(true);
      const res = await axios.get('https://who2.olgtx.dpdns.org/api/reports', {
        params,
        headers: { Authorization: `Bearer ${token}` },
      });

      const arr = Object.entries(res.data.data).map(([date, v]) => ({
        date,
        tasks: v.tasks,
        hours: v.hours,
        contents: v.contents.join(', ')
      }));
      setData(arr);
      setHeatmap(res.data.heatmap || []);
    } catch (err) {
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const generatePDFReport = async () => {
    const token = getTokenFromCookie();
    if (!token) {
      alert('Missing token');
      return;
    }

    const params = {};
    if (range.from) params.start = range.from.toISOString().split('T')[0];
    if (range.to) params.end = range.to.toISOString().split('T')[0];
    if (team) params.group = team;
    params.format = 'pdf';

    try {
      const res = await axios.get('https://who2.olgtx.dpdns.org/api/report/generate', {
        params,
        headers: { Authorization: `Bearer ${token}` }
      });

      const message = res.data?.message || '';
      if (message.includes('http')) {
        const url = message.replace('Report ready: ', '');
        window.open(url, '_blank');
      } else {
        alert('Unexpected response: ' + message);
      }
    } catch (err) {
      console.error('Report generation failed:', err);
      alert('Report generation failed.');
    }
  };

  useEffect(() => {
    fetchReports();
    fetchGroups();
  }, []);

  const exportCSV = () => {
    const rows = data.map((d) => [d.date, d.tasks, d.hours, d.contents]);
    rows.unshift(['Date', 'Tasks', 'Hours', 'Contents']);
    exportToCSV('report.csv', rows);
  };

  const exportXLSX = () => exportToExcel('report.xlsx', data);

  return (
    <div className="flex h-screen overflow-hidden text-gray-800 dark:text-gray-100">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="relative flex flex-col flex-1 overflow-y-auto">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className="p-4 sm:p-6 space-y-6">
          <h2 className="text-2xl font-bold mb-4">My Reports</h2>

          {/* Controls Card */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              {groupOptions.length > 0 && (
                <GroupSelect groupValue={team} setGroupValue={setTeam} groupOptions={groupOptions} />
              )}
              <Datepicker align="right" onChange={setRange} />
              <button className="w-full sm:w-auto btn btn-primary" onClick={fetchReports}>Apply</button>
            </div>
          </div>

          {/* Content Display */}
          {loading ? (
            <div className="text-center text-lg font-medium">Loading...</div>
          ) : data.length > 0 && (
            <>
              {/* Heatmap Card */}
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow overflow-x-auto">
  <div className="min-w-[300px] max-w-full">
    <Task3DHeatmap heatmapData={heatData} />
  </div>
</div>

              {/* Report Data Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.map((d, i) => (
                  <div key={i} className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow space-y-1">
                    <h4 className="font-semibold text-base">{d.date}</h4>
                    <p><span className="font-medium">Tasks:</span> {d.tasks}</p>
                    <p><span className="font-medium">Hours:</span> {d.hours}</p>
                    <p><span className="font-medium">Contents:</span> {d.contents}</p>
                  </div>
                ))}
              </div>

              {/* Export Buttons Card */}
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow flex flex-wrap gap-3">
                <button className="w-full sm:w-auto py-2 px-3 rounded bg-green-500 text-white hover:bg-green-600" onClick={exportCSV}>Export CSV</button>
                <button className="w-full sm:w-auto py-2 px-3 rounded bg-yellow-700 text-white hover:bg-yellow-800" onClick={exportXLSX}>Export Excel</button>
                <a
                  className="w-full sm:w-auto py-2 px-3 rounded bg-indigo-600 text-white hover:bg-indigo-700 text-center"
                  href="https://oos1.olgtx.com/cash/task_report_all_2025-06-18_2025-06-19.pdf"
                  download="task_report_all_2025-06-18_2025-06-19.pdf"
                >
                  Download PDF
                </a>
                <button
                  className="hidden btn btn-primary"
                  onClick={generatePDFReport}
                >
                  Generate PDF
                </button>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default Reports;
