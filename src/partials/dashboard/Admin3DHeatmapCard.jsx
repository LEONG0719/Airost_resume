import axios from 'axios';
import { useEffect, useState } from 'react';
import Plot from 'react-plotly.js';

function Admin3DHeatmapCard({ token, isAdmin }) {
  const [heatData, setHeatData] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [range, setRange] = useState(3);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 800);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchHeatData = async () => {
      try {
        const params = { days: range };
        if (isAdmin && selectedGroup) params.group = selectedGroup;

        const res = await axios.get('https://who2.olgtx.dpdns.org/api/reports', {
          headers: { Authorization: `Bearer ${token}` },
          params,
        });

        setHeatData(res.data);
      } catch (err) {
        console.error('Error loading heatmap:', err);
      }
    };
    fetchHeatData();
  }, [token, range, selectedGroup, isAdmin]);

  useEffect(() => {
    if (isAdmin) {
      axios
        .get('https://who2.olgtx.dpdns.org/api/groups', {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => setGroups(res.data))
        .catch(console.error);
    }
  }, [token, isAdmin]);

  const trace = {
    z: heatData.map((d) => d.value),
    x: heatData.map((d) => d.day),
    y: heatData.map((d) => d.hour),
    type: 'surface',
    colorscale: 'Viridis',
  };

  return (
    <div className="glass p-4 rounded-xl shadow-md w-full max-w-full">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-4">
        <div>
          <h2 className="text-xl font-bold">📊 Task 3D Heatmap</h2>
          <p className="text-sm text-gray-500">Live data from recent tasks</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 bg-white dark:bg-gray-800 p-3 rounded-lg shadow w-full sm:w-auto">
          <select
            className="select select-sm w-full sm:w-auto"
            value={range}
            onChange={(e) => setRange(Number(e.target.value))}
          >
            <option value={3}>Last 3 days</option>
            <option value={5}>Last 5 days</option>
            <option value={7}>Last 7 days</option>
          </select>

          {isAdmin && (
            <select
              className="select select-sm w-full sm:w-auto"
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
            >
              <option value="">All Groups</option>
              {groups.map((g, i) => (
                <option key={i} value={g.group_name}>{g.group_name}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        <Plot
          data={[trace]}
          layout={{
            autosize: true,
            width: windowWidth - 64, // force Plotly to stay within screen
            height: 400,
            scene: {
              xaxis: { title: 'Date' },
              yaxis: { title: 'Hour' },
              zaxis: { title: 'Tasks' },
            },
            margin: { l: 40, r: 10, t: 20, b: 40 },
          }}
          style={{ width: '100%', height: '100%' }}
          config={{ responsive: true }}
          useResizeHandler
        />
      </div>
    </div>
  );
}

export default Admin3DHeatmapCard;
