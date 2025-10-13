import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv'; // import dotenv first
import connectDB from './config/mongodb.js';
import cloudinary from './config/cloudinary.js'; // configured instance
import adminRouter from './routes/adminRoute.js';
import doctorRouter from './routes/doctorRoute.js';
import userRouter from './routes/userRoute.js';

// silently load environment variables
dotenv.config({ quiet: true });

const app = express();
const port = process.env.PORT || 4000;

app.use(express.json());
app.use(cors());
app.use('/api/admin', adminRouter);
app.use('/api/doctor', doctorRouter);
app.use('/api/user', userRouter);

app.get('/api', (req, res) => res.send('hi there from api route'));

const startServer = async () => {
  await connectDB();
  app.listen(port, () => console.log('Server started at port', port));
};

startServer();
