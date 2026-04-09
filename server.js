'use strict';
// Custom iisnode-compatible server for Next.js standalone
// iisnode passes a named pipe path (e.g. \\.\pipe\...) as process.env.PORT
// The built-in standalone server.js does parseInt() which loses the pipe path.
process.env.NODE_ENV = 'production';
process.env.NEXT_TELEMETRY_DISABLED = '1';

const http = require('http');
const { parse } = require('url');
const next = require('next');

// PORT can be a named pipe string on Windows (iisnode) or a number
const port = process.env.PORT || 3000;

const app = next({ dev: false, dir: __dirname });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  http.createServer((req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Request error:', err);
      res.statusCode = 500;
      res.end('Internal server error');
    }
  }).listen(port, (err) => {
    if (err) throw err;
    console.log('> Saqqara ready on port/pipe:', port);
  });
}).catch((err) => {
  console.error('> Failed to start server:', err);
  process.exit(1);
});
