const http = require("http");
const app = require("./src/config/express.js");

const server = http.createServer(app);
const PORT = process.env.PORT || 3000;
// eslint-disable-next-line no-console
server.listen(PORT, console.log("Server is listening on 3000"));
