const http = require('http');
const next = require('next');

const port = parseInt(process.env.PORT, 10) || 3000;
const hostname = '0.0.0.0';
const app = next({ dev: false, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = http.createServer((req, res) => {
    handle(req, res);
  });

  server.listen(port, hostname, () => {
    console.log(`Servidor rodando em http://${hostname}:${port}`);
  });
});
