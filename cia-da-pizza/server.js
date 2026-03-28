const http = require('http');
const next = require('next');

const port = parseInt(process.env.PORT, 10) || 3000;
const app = next({ dev: false });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = http.createServer((req, res) => {
    // Override the Host header to bypass Next.js 14.2+ host validation.
    // This allows access via any IP address without 403 "Host not allowed".
    req.headers.host = `localhost:${port}`;
    handle(req, res);
  });

  server.listen(port, '0.0.0.0', () => {
    console.log(`Servidor rodando em http://0.0.0.0:${port}`);
  });
});
