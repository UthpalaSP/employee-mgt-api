const express = require("express");
const cors = require("cors");
const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUI = require("swagger-ui-express");
const employeeRoute = require("./routes/employeeRoutes");

const app = express();
// swagger documentation
const swaggerOptions = {
  definition: {
    info: {
      title: "Employee Mgt Application API",
      version: "1.0.0",
      description: "Api for Employee Mgt Application",
      servers: ["http://localhost:5000"],
    },
  },
  apis: ["./src/routes/*.js"],
};
const swaggerDocs = swaggerJSDoc(swaggerOptions);
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerDocs));

// Allow Cross-Origin requests
app.use(cors());

// Body parser, reading data from body into req.body
app.use(express.json());

// Routes
app.use("/api/employee", employeeRoute);

module.exports = app;
