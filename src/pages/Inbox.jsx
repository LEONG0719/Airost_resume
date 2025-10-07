import { useEffect, useState } from 'react';
import Header from '../partials/Header';
import Sidebar from '../partials/Sidebar';

const developmentMessages = [
  { title: 'Backend Sync', content: 'API syncing completed for attendance module.' },
  { title: 'UI Overhaul', content: 'Sidebar navigation redesigned with Tailwind.' },
  { title: 'Bug Fix', content: 'Resolved 500 error on login endpoint.' },
  { title: 'Sprint Planning', content: 'Tasks estimated for Q3 Sprint 1.' },
  { title: 'Database Migration', content: 'PostgreSQL migration finished for analytics logs.' },
  { title: 'Component Refactor', content: 'Modularized Button and Card components.' },
  { title: 'Deployment', content: 'Production deployment succeeded for v2.1.0.' },
  { title: 'Monitoring', content: 'Integrated Prometheus with Grafana dashboards.' },
  { title: 'Load Testing', content: 'JMeter benchmarks complete with 50k RPS.' },
  { title: 'Authentication', content: '2FA implemented using TOTP and QR auth.' },
  { title: 'Error Tracking', content: 'Sentry integrated for all frontend routes.' },
  { title: 'Dark Mode', content: 'Theme toggle enabled site-wide.' },
  { title: 'Hotfix', content: 'Urgent patch pushed for data desync issue.' },
  { title: 'Build Pipeline', content: 'CI/CD optimized with parallel workflows.' },
  { title: 'Feature Toggle', content: 'New flagging system added with LaunchDarkly.' },
  { title: 'Mobile Fixes', content: 'Responsive styles corrected for Safari iOS.' },
  { title: 'SEO Update', content: 'Meta tags dynamically injected per route.' },
  { title: 'Chat Module', content: 'Socket.io chat stable and scalable.' },
  { title: 'Accessibility', content: 'Passed WCAG 2.1 AA audit.' },
  { title: 'Code Review', content: 'Peer-reviewed PRs merged for analytics branch.' },
  { title: 'Data Cleanup', content: 'Obsolete logs purged from audit DB.' },
  { title: 'Localization', content: 'i18n added for English, Spanish, Chinese.' },
];

// Randomly assign status dot color or none
const getRandomStatusDot = () => {
  const options = ['green', 'red', 'orange', null];
  return options[Math.floor(Math.random() * options.length)];
};

const getRandomMessages = (count = 5) => {
  const shuffled = [...developmentMessages].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count).map((msg) => ({
    ...msg,
    statusDot: getRandomStatusDot(),
  }));
};

function Inbox() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [messages, setMessages] = useState(getRandomMessages());

  useEffect(() => {
    const interval = setInterval(() => {
      setMessages(getRandomMessages());
    }, 5000); // every 20 seconds

    return () => clearInterval(interval);
  }, []);

  const renderDot = (color) => {
    if (!color) return null;
    const dotClass = {
      green: 'bg-green-500',
      red: 'bg-red-500',
      orange: 'bg-orange-400',
    }[color];

    return <span className={`w-3 h-3 rounded-full mr-2 mt-1 ${dotClass}`} />;
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="relative flex flex-col flex-1 overflow-y-auto">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className="p-6 space-y-4">
          <h1 className="text-2xl font-bold">Inbox</h1>
          <ul className="space-y-4">
            {messages.map((m, index) => (
              <li
                key={index}
                className="p-4 rounded-xl shadow bg-white/30 dark:bg-gray-800/40 backdrop-blur-md border border-white/30"
              >
                <div className="flex items-start">
                  {renderDot(m.statusDot)}
                  <div>
                    <h2 className="text-lg font-semibold text-black dark:text-white">{m.title}</h2>
                    <p className="text-gray-700 dark:text-gray-300">{m.content}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </main>
      </div>
    </div>
  );
}

export default Inbox;
