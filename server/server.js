import express from 'express'
import dotenv from 'dotenv'
import cors from "cors"
import http from 'http';
import connectToDB from './config/db.js';
dotenv.config();
import authRoutes from './routes/authRoutes.js'
import taskRoutes from './routes/taskRoutes.js'
import { initSocket } from './socket/Socket.js';
const app = express();

const port = process.env.PORT;
app.use(express.json());
app.use(cors());
// connect to mongo
connectToDB();


const server = http.createServer(app);

// initialize socket.io
initSocket(server);

// router section
app.use('/api/user/', authRoutes);
app.use('/api/task', taskRoutes);
app.use('/', (req, res) => {
    res.json("hello");
});


server.listen(port, () => {
    console.log(`server is runnig  on http://10.62.62.227:${port}`)
})
