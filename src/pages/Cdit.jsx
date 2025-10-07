import { useState } from 'react';
import Header from '../partials/Header';
import Sidebar from '../partials/Sidebar';
const samples = [
  { date: '2024-01-01', start: '09:00', end: '10:00', desc: 'Email' },
  { date: '2024-01-02', start: '10:00', end: '11:30', desc: 'Team Standup' },
  { date: '2024-01-03', start: '13:00', end: '14:00', desc: 'Lunch Break' },
  { date: '2024-01-04', start: '14:30', end: '15:30', desc: 'Code Review' },
  { date: '2024-01-05', start: '16:00', end: '17:00', desc: 'Planning' },
];

function getRandomActivities() {
  return samples.sort(() => 0.5 - Math.random()).slice(0, 3);
}

function Cdit() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [rows, setRows] = useState(() => {
    const cached = localStorage.getItem('cachedRows');
    return cached ? JSON.parse(cached) : getRandomActivities();
  });
  const [editing, setEditing] = useState(null);
  const [feedback, setFeedback] = useState('');

  const handleSave = (idx) => {
    const newStart = document.getElementById(`start-${idx}`).value;
    const newEnd = document.getElementById(`end-${idx}`).value;
    const newDesc = document.getElementById(`desc-${idx}`).value;

    const newRows = [...rows];
    newRows[idx] = { ...newRows[idx], start: newStart, end: newEnd, desc: newDesc };
    setRows(newRows);
    localStorage.setItem('cachedRows', JSON.stringify(newRows));
    setEditing(null);

    setFeedback('Activity edited successfully!');
    setTimeout(() => setFeedback(''), 3000);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className="p-6 space-y-6">
          <h2 className="text-2xl font-bold text-gray-800">Edit Activity</h2>

          {feedback && (
            <div className="p-4 bg-green-100 text-green-700 rounded shadow-sm transition-all duration-500">
              ✅ {feedback}
            </div>
          )}

          <div className="bg-white rounded shadow p-4 overflow-auto">
            <table className="min-w-full table-auto border">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3 border">Date</th>
                  <th className="p-3 border">Start</th>
                  <th className="p-3 border">End</th>
                  <th className="p-3 border">Description</th>
                  <th className="p-3 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => (
                  <tr key={idx} className="border-t hover:bg-gray-50">
                    <td className="p-2 border text-sm">{row.date}</td>
                    <td className="p-2 border">
                      {editing === idx ? (
                        <input id={`start-${idx}`} type="time" defaultValue={row.start} className="border p-1 rounded" />
                      ) : (
                        <span>{row.start}</span>
                      )}
                    </td>
                    <td className="p-2 border">
                      {editing === idx ? (
                        <input id={`end-${idx}`} type="time" defaultValue={row.end} className="border p-1 rounded" />
                      ) : (
                        <span>{row.end}</span>
                      )}
                    </td>
                    <td className="p-2 border">
                      {editing === idx ? (
                        <input id={`desc-${idx}`} defaultValue={row.desc} className="border p-1 rounded w-full" />
                      ) : (
                        <span>{row.desc}</span>
                      )}
                    </td>
                    <td className="p-2 border">
                      {editing === idx ? (
                        <>
                          <button className="bg-blue-500 text-white px-3 py-1 rounded mr-2" onClick={() => handleSave(idx)}>Save</button>
                          <button className="bg-gray-300 px-3 py-1 rounded" onClick={() => setEditing(null)}>Cancel</button>
                        </>
                      ) : (
                        <button className="bg-indigo-600 text-white px-3 py-1 rounded" onClick={() => setEditing(idx)}>Edit</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-sm text-gray-500">You can only edit your own logs. Changes will be cached temporarily.</p>
          <button className="mt-2 bg-gray-200 px-4 py-2 rounded hover:bg-gray-300 text-sm">View Audit Log</button>
        </main>
      </div>
    </div>
  );
}

export default Cdit;
