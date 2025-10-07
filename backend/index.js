import express from 'express';
import fs from 'fs';
import path from 'path';
import cron from 'node-cron';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

function loadData() {
  const dataPath = path.join(__dirname, 'data', 'reports.json');
  const raw = fs.readFileSync(dataPath, 'utf-8');
  return JSON.parse(raw);
}

app.get('/api/reports', (req, res) => {
  const { team, start, end } = req.query;
  const data = loadData();
  let filtered = data;
  if (team) filtered = filtered.filter(r => r.team === team);
  if (start) filtered = filtered.filter(r => new Date(r.date) >= new Date(start));
  if (end) filtered = filtered.filter(r => new Date(r.date) <= new Date(end));

  // Simple aggregation by date
  const summary = {};
  for (const r of filtered) {
    if (!summary[r.date]) summary[r.date] = { tasks: 0, hours: 0 };
    summary[r.date].tasks += r.tasks;
    summary[r.date].hours += r.hours;
  }
  res.json({ data: summary });
});

// Placeholder cron job to generate reports
cron.schedule('0 0 * * *', () => {
  console.log('Running daily report generation');
});

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
