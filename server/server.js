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
    origin: [
        'http://localhost:5173',
        process.env.FRONTEND_URL
    ],
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
