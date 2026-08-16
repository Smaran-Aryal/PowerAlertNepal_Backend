// src/index.js

require("dotenv").config();

const app = require("./app");
const connectDatabase = require("./config/db");

const dns = require("dns");

dns.setServers(["8.8.8.8", "1.1.1.1"]);

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  await connectDatabase();

  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
};

startServer();