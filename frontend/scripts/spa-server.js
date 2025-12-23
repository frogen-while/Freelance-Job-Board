const express = require('express');
const path = require('path');
const history = require('connect-history-api-fallback');

const app = express();
const port = process.env.PORT || 4200;

app.use(history());
app.use(express.static(path.join(__dirname, '..', 'dist', 'frontend')));

app.listen(port, () => {
  console.log(`SPA server listening on http://127.0.0.1:${port}`);
});
