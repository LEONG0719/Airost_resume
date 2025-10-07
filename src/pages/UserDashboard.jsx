import axios from 'axios';
import Fingerprint2 from 'fingerprintjs2';
import html2canvas from 'html2canvas';
import Cookies from 'js-cookie';
import { useEffect, useRef, useState } from 'react';
import Header from '../partials/Header';
import Sidebar from '../partials/Sidebar';

function UserDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [location, setLocation] = useState({ latitude: null, longitude: null });
  const [fingerprint, setFingerprint] = useState('');
  const [status, setStatus] = useState('Not checked-in'); // 'Checked-in' or 'Not checked-in' or 'Checked-out'
  const [task, setTask] = useState('');
  const [taskSubmitted, setTaskSubmitted] = useState(false);
  const [timestamp, setTimestamp] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const screenshotRef = useRef(null);
  const [user, getUser] = useState({
      name: Cookies.get('user_name') || 'User',
      avatar: Cookies.get('user_avatar') || UserAvatar,
      role: 'User',
    });
  useEffect(() => {
    // Setup fingerprint and device limit
    Fingerprint2.get((components) => {
      const fp = Fingerprint2.x64hash128(components.map(c => c.value).join(''));
      setFingerprint(fp);
      const stored = Cookies.get('fingerprints');
      const list = stored ? stored.split(',') : [];
      if (!list.includes(fp)) {
        if (list.length >= 2) {
          alert('Maximum number of devices reached');
        } else {
          Cookies.set('fingerprints', [...list, fp].join(','), { expires: 365 });
        }
      }
    });

    // Get geolocation
    navigator.geolocation.getCurrentPosition((pos) => {
      setLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
    });

    // Online/offline detection
    const updateOnlineStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  const handleCheckIn = () => {
    const time = new Date().toLocaleTimeString();
    setTimestamp(time);
    setStatus('Checked-in');
    if (isOnline) {
      axios.post('/api/check-in', { ...location, fingerprint, time })
        .catch(() => alert('Error checking in online'));
    } else {
      localStorage.setItem('offlineCheckIn', JSON.stringify({ location, fingerprint, time }));
    }
  };

  const handleCheckOut = () => {
    const time = new Date().toLocaleTimeString();
    setStatus('Checked-out');
    if (isOnline) {
      axios.post('/api/check-out', { ...location, fingerprint, time })
        .catch(() => alert('Success checking out online'));
    } else {
      localStorage.setItem('offlineCheckOut', JSON.stringify({ location, fingerprint, time }));
    }
  };

  const handleTaskSubmit = () => {
    if (task.trim() !== '') {
      setTaskSubmitted(true);
    }
  };

  const captureAndUpload = () => {
    if (!screenshotRef.current) return;
    html2canvas(screenshotRef.current).then((canvas) => {
      const image = canvas.toDataURL('image/png');
      const ts = Date.now();
      const internalId = Cookies.get('internalId') || 'unknown';
      axios.post('/api/upload', { image, timestamp: ts, id: internalId });
    });
  };

  return (
    <div className="flex h-screen overflow-hidden" ref={screenshotRef}>
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className="p-4 m-4 space-y-6 glass">
          <div>
            <h2 className="text-2xl font-bold">Welcome, {user.name}</h2>
            <p>{new Date().toDateString()}, {new Date().toLocaleTimeString()}</p>
            <p>Current Status: <strong>{status}</strong></p>
            <p className={`italic ${isOnline ? 'text-green-600' : 'text-red-500'}`}>
              {isOnline ? 'Online mode' : 'Offline mode – data will sync when online'}
            </p>
          </div>

          {status === 'Not checked-in' && (
            <button className="btn-primary" onClick={handleCheckIn}>Check In</button>
          )}

          {status === 'Checked-in' && !taskSubmitted && (
            <div className="space-y-4">
              <p className="font-semibold">Check-in at {timestamp} {isOnline ? '(Saved)' : '(Saved locally)'}</p>
              <label className="block">Task:</label>
              <input
                type="text"
                value={task}
                onChange={(e) => setTask(e.target.value)}
                placeholder="e.g., Project SP"
                className="input w-full"
              />
              <button className="btn-primary" onClick={handleTaskSubmit}>OK</button>
            </div>
          )}

          {status === 'Checked-in' && taskSubmitted && (
            <div className="space-y-2">
              <button className="btn-secondary" onClick={handleCheckOut}>Check Out</button>
              <p className="text-green-700 font-semibold">✓ Task "{task}" recorded</p>
            </div>
          )}

          {status === 'Checked-out' && (
            <p className="text-green-600 font-bold">✓ Checked-Out</p>
          )}

          <div className="pt-4 space-y-2">
            <button className="btn-secondary" onClick={captureAndUpload}>Upload Screenshot</button>
          </div>
        </main>
      </div>
    </div>
  );
}

export default UserDashboard;
