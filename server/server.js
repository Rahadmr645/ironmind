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
    server.listen(port, () => {
      console.log(`Server listening on http://10.62.62.227:${port}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
};

start();
