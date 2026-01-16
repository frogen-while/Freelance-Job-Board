import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import userRoutes from './routes/userRoutes.js'
import categoryRoutes from './routes/categoryRoutes.js'
import jobRoutes from './routes/jobRoutes.js'
import jobaplRoutes from './routes/jobaplRoutes.js'
import assignmentRoutes from './routes/assignmentsRoutes.js'
import paymentsRoutes from './routes/paymentsRoutes.js'
import supportticketsRoutes from './routes/supportticketsRoutes.js'
import authRoutes from './routes/authRoutes.js'
import skillsRoutes from './routes/skillsRoutes.js'
import profilesRoutes from './routes/profilesRoutes.js'
import messageRoutes from './routes/messageRoutes.js'
import reviewRoutes from './routes/reviewRoutes.js'
import adminRoutes from './routes/adminRoutes.js'
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { sendError, sendSuccess } from './utils/http.js';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app: Application = express();

app.use(express.json());
app.use(cors());

app.get('/api/health', (req: Request, res: Response) => {
  return sendSuccess(res, { status: 'ok' }, 200);
});


app.use('/api/auth', authRoutes)
app.use('/api/skills', skillsRoutes)
app.use('/api/profiles', profilesRoutes)
app.use('/api/users', userRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/jobs', jobRoutes)
app.use('/api/jobapplications', jobaplRoutes)
app.use('/api/assignments', assignmentRoutes)
app.use('/api/payments', paymentsRoutes)
app.use('/api/supporttickets', supportticketsRoutes)
app.use('/api/messages', messageRoutes)
app.use('/api/reviews', reviewRoutes)
app.use('/api/admin', adminRoutes)

app.use('/api', (req: Request, res: Response) => {
  return sendError(res, 404, 'Not Found');
});

const docsPath = path.join(__dirname, '..', 'docs');
if (fs.existsSync(docsPath)) {
  console.log('Serving docs from:', docsPath);
  app.use('/docs', express.static(docsPath));
} else {
  console.log('Docs folder not found at:', docsPath);
}

const distPath = path.join(__dirname, '..', 'frontend', 'dist', 'frontend');

if (fs.existsSync(distPath)) {
  const indexHtml = path.join(distPath, 'index.html');
  app.use(express.static(distPath));

  const spaRoute = /^\/(?!api(?:\/|$)).*/;
  app.get(spaRoute, (req: Request, res: Response) => {
    res.sendFile(indexHtml);
  });
  app.head(spaRoute, (req: Request, res: Response) => {
    res.sendFile(indexHtml);
  });
}

export default app;