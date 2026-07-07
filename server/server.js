import express from 'express'
import 'dotenv/config'
import cors from 'cors';
import connectDB from './configs/db.js';
import adminRouter from './routes/adminRoutes.js';
import blogRouter from './routes/blogRoutes.js';
import userRouter from "./routes/userRoutes.js";

const app = express();

await connectDB()
// Middleware 

app.use(cors({
    origin: function (origin, callback) {
        const allowedOrigins = [
            'http://localhost:5173',
            'http://localhost:3000',
            process.env.FRONTEND_URL,
        ];
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) return callback(null, true);
        // Allow any vercel.app preview URL
        if (origin.endsWith('.vercel.app') || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true
}))
app.use(express.json())

//Routes 
app.get('/',(req,res)=>{
    res.send("API is working")
})

app.use('/api/admin',adminRouter)
app.use('/api/blog',blogRouter)
app.use("/api/user", userRouter);

const PORT =process.env.PORT || 3000;

app.listen(PORT,()=>{
    console.log("server is runnig on port ", PORT)
});

export default app;
