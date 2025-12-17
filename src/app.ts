import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import userRoutes from './routes/userRoutes.js'
import categoryRoutes from './routes/categoryRoutes.js'
import jobRoutes from './routes/jobRoutes.js'

const app: Application = express();

app.use(express.json());
app.use(cors());

app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'API is running' });
});


app.use('/api/users', userRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/jobs', jobRoutes)

export default app;