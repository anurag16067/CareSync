import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import 'dotenv/config';
import connectDB from './config/mongodb.js';
import connectCloudinary from './config/cloudinary.js';
import adminRouter from './routes/adminRoute.js';
import doctorRouter from './routes/doctorRoute.js';
import userRouter from './routes/userRoute.js';
import authRouter from './routes/authRoute.js';

// app config
const app = express();
const port = process.env.PORT || 4000;
await connectDB();
connectCloudinary();

// middleware
// only these sites may call the API with cookies (comma-separated in CLIENT_URLS)
const allowedOrigins = (process.env.CLIENT_URLS || 'http://localhost:5173,http://localhost:5174')
    .split(',').map(o => o.trim()).filter(Boolean);

app.set('trust proxy', 1); // behind Render/Vercel proxies, so req.secure reflects HTTPS
app.use(express.json()); // parse incoming request with JSON payloads
app.use(cookieParser()); // read the httpOnly refresh token cookie
app.use(cors({ origin: allowedOrigins, credentials: true }));

// Middleware to parse URL-encoded data
// app.use(express.urlencoded({ extended: true }));

// API endpoints
app.use('/api/admin',adminRouter);
app.use('/api/doctor',doctorRouter);
app.use('/api/user',userRouter);
app.use('/api/auth',authRouter);
// localhost:4000/api/admin


app.get('/', (req,res)=>{
    res.send('API WORKING AT 4000');
})

app.listen(port, ()=> console.log("Server Started",port));