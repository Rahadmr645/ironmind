import express from 'express'
import dotenv from 'dotenv'
import connectToDB from './config/db.js';
dotenv.config();
import authRoutes from './routes/authRoutes.js'
import taskRoutes from './routes/taskRoutes.js'
const app = express();

const port = process.env.PORT;
app.use(express.json());

// connect to mongo
connectToDB();



// router section
app.use('/api/user/', authRoutes);
app.use('/api/task', taskRoutes);
app.use('/', (req, res) => {
    res.json("hello");
});


app.listen(port, () => {
    console.log(`server is runnig on http://192.168.8.225:${port}`)
})
