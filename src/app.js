const express = require("express");
const cors = require("cors");
const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUI = require("swagger-ui-express");

// const mongoose = require("mongoose");
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

module.exports = app;
// const Employee = require("./models/employeeModel");

// app.get("/", (req, res) => {
//   res.send("Hello World  ");
// });

// app.post("/employee", async (req, res) => {
//   try {
//     const employee = await Employee.create(req.body);
//     res.status(200).json(employee);
//   } catch (error) {
//     console.log(error);
//   }
// });

// app.get("/employees", async (req, res) => {
//   try {
//     const employees = await Employee.find({});
//     res.status(200).json(employees);
//   } catch (error) {
//     console.log(error);
//   }
// });

// mongoose
//   .connect(
//     "mongodb+srv://admin:1234@employeemgtappcluster.qdo6ksz.mongodb.net/"
//   )
//   .then(() => {
//     app.listen(3200, () => {
//       console.log(`Listening on 3200`);
//     });
//     console.log("connected to Mongo");
//   })
//   .catch((error) => {
//     console.log(error);
//   });
