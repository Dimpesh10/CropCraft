import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import { advisorRouter } from './routes/advisor';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// AI Advisor
app.use('/api/advisor', advisorRouter);

// Connect to MongoDB and start server (MongoDB is optional — advisor works without it)
async function start() {
  try {
    await connectDB();
  } catch {
    console.warn('[server] MongoDB unavailable — continuing without database');
  }
  app.listen(PORT, () => {
    console.log(`[server] Running on http://localhost:${PORT}`);
  });
}

start().catch(console.error);
