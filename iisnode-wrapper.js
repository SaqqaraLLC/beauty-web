'use strict';
// iisnode wrapper for Next.js standalone on Azure Windows App Service
// Problem: iisnode sets PORT=\\.\pipe\... (named pipe), but Next.js
// standalone server.js does parseInt(process.env.PORT) which returns NaN,
// so server.listen(NaN) binds to wrong address and iisnode gets a 500.
// Fix: monkeypatch net.Server.prototype.listen BEFORE loading server.js
// so any NaN port is replaced with the original pipe path.

const net = require('net');
const originalPort = process.env.PORT;
const _listen = net.Server.prototype.listen;

net.Server.prototype.listen = function (port) {
  const args = Array.from(arguments);
  if (typeof port === 'number' && isNaN(port)) {
    args[0] = originalPort; // restore the named pipe
  }
  return _listen.apply(this, args);
};

// Load the real Next.js standalone server
require('./nextjs-server.js');
