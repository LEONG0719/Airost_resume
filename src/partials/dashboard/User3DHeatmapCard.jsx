import axios from 'axios';
import dayjs from 'dayjs';
import Cookies from 'js-cookie';
import { useEffect, useState } from 'react';
import Plot from 'react-plotly.js';

function User3DHeatmapCard() {
  const [data, setData] = useState([]);
  const [groupOptions, setGroupOptions] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const token = Cookies.get('token');
    const role = Cookies.get('role');
    if (!token) return;

    const payload = JSON.parse(atob(token.split('.')[1]));
    const groupIds = payload.group || [];
    const adminFlag = role?.includes('admin');
    setIsAdmin(adminFlag);
    if (!adminFlag && groupIds.length > 0) setSelectedGroup(groupIds[0]);

    if (adminFlag) {
      axios.get('https://who2.olgtx.dpdns.org/api/groups', {
        headers: { Authorization: `Bearer ${token}` },
      }).then(res => {
        setGroupOptions(res.data || []);
      });
    }

    const endDate = Cookies.get('date_range_end');
    const end = endDate ? dayjs(endDate) : dayjs();
    const start = end.subtract(5, 'day');

    const params = {
      start: start.format('YYYY-MM-DD'),
      end: end.format('YYYY-MM-DD'),
    };

    if (!adminFlag && groupIds[0]) params.group = groupIds[0];
    if (adminFlag && selectedGroup) params.group = selectedGroup;

    axios.get('https://who2.olgtx.dpdns.org/api/reports', {
      params,
      headers: { Authorization: `Bearer ${token}` },
    }).then(res => {
      const raw = res.data.data || {};
      const formatted = Object.entries(raw).map(([date, v], i) => ({
        date,
        tasks: v.tasks || 0,
        contents: v.contents?.join(', ') || '',
        hour: i % 24,
      }));
      setData(formatted);
    });
  }, [selectedGroup]);

  const heatData = data.map((d, i) => ({
    day: d.date,
    hour: i % 24,
    value: d.tasks,
  }));

  const xLabels = [...new Set(heatData.map(d => d.day))];
  const yLabels = [...Array(24).keys()];
  const zMatrix = yLabels.map(hour =>
    xLabels.map(date => {
      const entry = heatData.find(d => d.day === date && d.hour === hour);
      return entry ? entry.value : 0;
    })
  );

  return (
    <div className="flex flex-col col-span-full sm:col-span-6 xl:col-span-4 glass shadow-xs rounded-xl">
      <div className="px-5 pt-5">
        <header className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-3">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            3D Task Heatmap
          </h2>
          {isAdmin && (
            <select
              className="select select-sm w-full sm:w-auto"
              value={selectedGroup}
              onChange={e => setSelectedGroup(e.target.value)}
            >
              <option value="">All Groups</option>
              {groupOptions.map((g, i) => (
                <option key={i} value={g.group_name}>{g.group_name}</option>
              ))}
            </select>
          )}
        </header>
        <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase mb-1">
          Activity (Last 3 Days)
        </div>
      </div>

      <div className="grow h-[256px] sm:h-[300px] px-4 pb-4 w-full">
        <Plot
          data={[
            {
              x: xLabels,
              y: yLabels,
              z: zMatrix,
              type: 'surface',
              colorscale: 'Viridis',
              contours: {
                z: {
                  show: true,
                  usecolormap: true,
                  highlightcolor: "#42f462",
                  project: { z: true }
                }
              }
            }
          ]}
          layout={{
            autosize: true,
            height: 300,
            margin: { l: 60, r: 40, t: 30, b: 50 },
            scene: {
              xaxis: { title: 'Day' },
              yaxis: { title: 'Hour' },
              zaxis: { title: 'Tasks' },
            },
          }}
          style={{ width: '100%', height: '100%' }}
          config={{ responsive: true }}
          useResizeHandler
        />
      </div>
    </div>
  );
}

export default User3DHeatmapCard;
