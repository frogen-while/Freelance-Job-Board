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
import { errorHandler, sendError, sendSuccess } from './utils/http.js';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

function resolveUnderRoot(rootDir: string, ...segments: string[]): string {
  const root = path.resolve(rootDir);
  const resolved = path.resolve(root, ...segments);

  if (resolved !== root && !resolved.startsWith(root + path.sep)) {
    throw new Error('Resolved path escapes configured root directory');
  }

  return resolved;
}

const app: Application = express();

app.use(express.json());
app.use(cors());

const projectRoot = path.resolve(__dirname, '..');
const uploadsRoot = resolveUnderRoot(projectRoot, 'uploads');
fs.mkdirSync(uploadsRoot, { recursive: true });
app.use('/uploads', express.static(uploadsRoot, { dotfiles: 'ignore', redirect: false }));

app.get('/api/health', (req: Request, res: Response) => {
  return sendSuccess(res, { status: 'ok' }, 200);
});

app.get('/favicon.ico', (req: Request, res: Response) => {
  res.status(204).end();
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

const distRoot = resolveUnderRoot(projectRoot, 'frontend', 'dist', 'frontend');

if (fs.existsSync(distRoot)) {
  app.use(express.static(distRoot));

  const spaRoute = /^\/(?!api(?:\/|$)).*/;
  app.get(spaRoute, (req: Request, res: Response) => {
    res.sendFile('index.html', { root: distRoot });
  });
  app.head(spaRoute, (req: Request, res: Response) => {
    res.sendFile('index.html', { root: distRoot });
  });
}

app.use(errorHandler);

export default app;