import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './config/mongodb.js';
import connectCloudinary from './config/cloudinary.js';
import adminRouter from './routes/adminRoute.js';
import doctorRouter from './routes/doctorRoute.js';
import userRouter from './routes/userRoute.js';

// app config
const app = express();
const port = process.env.PORT || 4000;
await connectDB();
connectCloudinary();

// middleware
app.use(express.json()); // parse incoming request with JSON payloads
app.use(cors()); // allow cross-origin requests to connect from frontend and backend

// Middleware to parse URL-encoded data
// app.use(express.urlencoded({ extended: true }));

// API endpoints
app.use('/api/admin',adminRouter);
app.use('/api/doctor',doctorRouter);
app.use('/api/user',userRouter);
// localhost:4000/api/admin


app.get('/', (req,res)=>{
    res.send('API WORKING AT 4000');
})

app.listen(port, ()=> console.log("Server Started",port));