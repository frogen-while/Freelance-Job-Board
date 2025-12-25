const express = require('express');
const path = require('path');
const history = require('connect-history-api-fallback');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const port = process.env.PORT || 4200;
const backend = process.env.BACKEND_URL || 'http://127.0.0.1:3000';

// Proxy API requests to backend server
app.use('/api', createProxyMiddleware({
  target: backend,
  changeOrigin: true,
  logLevel: 'warn',
  onError: (err, req, res) => {
    console.error('Proxy error', err && err.message || err);
    res.status(502).send('Bad gateway');
  }
}));

// history fallback must be after API proxy but before static to support client-side routing
app.use(history());
app.use(express.static(path.join(__dirname, '..', 'dist', 'frontend')));

app.listen(port, () => {
  console.log(`SPA server listening on http://127.0.0.1:${port}, proxying /api to ${backend}`);
});
