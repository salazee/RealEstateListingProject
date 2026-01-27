const http = require("http");
const app = require("./app");


const server = http.createServer(app);

const { initSocket } = require("./socket");
initSocket(server);

server.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
