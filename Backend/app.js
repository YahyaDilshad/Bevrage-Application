import dotenv from "dotenv";
import path from 'path';
import { fileURLToPath } from 'url';

// Ensure the backend loads its own .env file even when the server
// is started from the workspace root (e.g. `node Backend/app.js`).
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });
import express from "express";
import cors from "cors";
import { connectDB } from "./config/db/dbconnect.js";
import categoryRoutes from "./routes/categoryRoute.js";
import brandRoutes from "./routes/brandRoute.js";
import productRoutes from "./routes/productRoute.js";
import authuser from './routes/userRouter.js'
import bannerRouter from './routes/bannerRouter.js' 
import pushnotification from './routes/pushnotificationroute.js'
import deviceRoutes from './routes/deviceRoutes.js';


const app = express();
app.use(express.json());

app.use(cors({
  origin: [
    'http://localhost:5173', // React web dashboard (Vite/React)
    'http://localhost:8081', // React Native web (Expo)
    'http://10.0.2.2:8081',  // Android emulator may send requests via this
    '*',                     // fallback for mobile devices (Expo Go)
  ],
  credentials: true,
}));
connectDB();


app.use("/api/auth", authuser);
app.use("/api/categories", categoryRoutes);
app.use("/api/brands", brandRoutes);
app.use("/api/products", productRoutes);
app.use('/api/banner' , bannerRouter)
app.use('/api/notification' , pushnotification )
app.use('/api/device', deviceRoutes);  // ✅ NEW


// Simple health endpoint for emulator/device connectivity checks
app.get('/api/ping', (req, res) => {
  res.json({ success: true, message: 'pong' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>{ 
  console.log(`🚀 Server running on port ${PORT}`)});
  
