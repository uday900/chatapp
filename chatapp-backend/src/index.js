const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
require("dotenv").config();
require("./config/redis");

const routes = require("./routes");
const sequelize = require("./config/db");
const initSocket = require("./socket");
const { swaggerUi, swaggerSpec } = require("./config/swagger");

const errorHandler = require("./middlewares/errorHandler");
const AppError = require("./utils/AppError");
const { ROUTE_NOT_FOUND } = require("./constants/errorCodes");
const { URL_SEPARATOR } = require("./constants/endpoints");

const app = express();

app.use(cors({
  origin: "*"
}));
app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec)
);
app.use(express.json());

// Logs all incoming requests
app.use((req, res, next) => {
  console.log(
    `Requested Path: ${req.method} ${req.originalUrl}`
  );
  next();
});

app.use(URL_SEPARATOR, routes);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*"
  }
});
app.set("io", io);
initSocket(io);

/*
  Invalid Route Handler
*/
app.use((req, res, next) => {
  next(
    new AppError(
      `Route ${req.originalUrl} not found`,
      404,
      ROUTE_NOT_FOUND
    )
  );
});

/*
  Global Error Handler
  MUST be last
*/
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

sequelize.sync({ alter: true })
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });