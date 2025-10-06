import express from 'express';
import cors from 'cors';
import 'dotenv/config';  
import connectDB from './config/mongodb.js';
import connectCloudinary from './config/cloudinary.js';
import adminRouter from './routes/adminRoute.js';
const app = express();
const port = process.env.PORT || 4000;


app.use(express.json());
app.use(cors());
app.use('/api/admin', adminRouter)
app.get('/api', (req, res) => res.send('hi there from api route'));



const startServer = async () => {
  await connectDB();
  // connectCloudinary();
  app.listen(port, () => console.log('Server started at port', port));
};
startServer();




