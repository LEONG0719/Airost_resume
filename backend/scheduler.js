import cron from 'node-cron';
import { generatePDFReport, generatePPTReport } from './reportGenerator.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function loadData() {
  const dataPath = path.join(__dirname, 'data', 'reports.json');
  const raw = fs.readFileSync(dataPath, 'utf-8');
  return JSON.parse(raw);
}

cron.schedule('0 6 * * *', () => {
  const data = loadData();
  generatePDFReport(data);
  generatePPTReport(data);
});
