import Plot from 'react-plotly.js';

function Task3DHeatmap({ heatmapData = [] }) {
  if (!heatmapData.length) return null;

  const xLabels = [...new Set(heatmapData.map(d => d.day))].sort();
  const yLabels = Array.from({ length: 24 }, (_, i) => i);
  const zMatrix = yLabels.map(hour =>
    xLabels.map(day => {
      const match = heatmapData.find(d => d.day === day && d.hour === hour);
      return match ? match.value : 0;
    })
  );

  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold mb-2">📊 3D Task Heatmap</h3>
      <Plot
        data={[
          {
            z: zMatrix,
            x: xLabels,
            y: yLabels,
            type: 'surface',
            colorscale: 'Jet',
          },
        ]}
        layout={{
          title: 'Task Density (3D)',
          scene: {
            xaxis: { title: 'Date' },
            yaxis: { title: 'Hour' },
            zaxis: { title: 'Tasks' },
          },
          autosize: true,
          margin: { l: 60, r: 30, b: 60, t: 40 },
        }}
        style={{ width: '100%', height: '600px' }}
      />
    </div>
  );
}

export default Task3DHeatmap;
