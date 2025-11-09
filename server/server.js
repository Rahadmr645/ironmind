import express from 'express'
import dotenv from 'dotenv'
import connectToDB from './config/db.js';
dotenv.config();
import authRoutes from './routes/authRoutes.js'
const app = express();

const port = process.env.PORT;
app.use(express.json());

// connect to mongo
connectToDB();



// router section
app.use('/api/user/', authRoutes)
app.use('/', (req, res) => {
    res.json("hello");
});


app.listen(port, () => {
    console.log(`server is runnig on http://localhost:${port}`)
})
