const { createServer } = require("http");
const { hostname } = require("os");

const server = createServer((_, res) => {
  res.writeHead(200, { "content-type": "text/plain" });
  res.end(`hello from ${hostname()} suoner\n`);
});
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
