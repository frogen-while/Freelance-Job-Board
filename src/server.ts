import 'dotenv/config';
import app from './app.js';
import { openDb } from './config/init_db.js';

const PORT = 12170;

async function startServer() {
  try {
    await openDb();
    console.log('Database connected and initialized successfully.');

    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error('Failed to start the server:', error);
    process.exit(1);
  }
}

startServer();