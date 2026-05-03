import './config/loadEnv.js';
import express from 'express';
import cors from 'cors';
import http from 'http';
import connectToDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import appLockRoutes from './routes/appLockRoutes.js';
import { initSocket } from './socket/Socket.js';

const app = express();
const port = process.env.PORT || 5003;

app.use(express.json());
app.use(cors());

const server = http.createServer(app);
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${port} is already in use. Stop the other process or set PORT in .env.`);
  } else {
    console.error('Server error:', err.message);
  }
  process.exit(1);
});
initSocket(server);

app.use('/api/user/', authRoutes);
app.use('/api/task', taskRoutes);
app.use('/api/lock', appLockRoutes);
app.use('/', (req, res) => {
  res.json('hello');
});

const start = async () => {
  try {
    await connectToDB();
    // Bind all IPv4 interfaces so LAN phones / other machines can reach this API (not only localhost).
    server.listen(port, '0.0.0.0', () => {
      console.log(`Server listening on http://0.0.0.0:${port} (all IPv4 interfaces)`);
    });
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
};

start();
