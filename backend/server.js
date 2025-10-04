import express from 'express';
import cors from 'cors';
import 'dotenv/config';  
import connectDB from './config/mongodb.js';
import connectCloudinary from './config/cloudinary.js';
const app = express();
const port = process.env.PORT || 4000;

const startServer = async () => {
  await connectDB();
  await connectCloudinary();
  app.listen(port, () => console.log('Server started at port', port));
};

startServer();

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => res.send('API working'));
