const Employee = require("../models/employeeModel");
const createError = require("../helpers/error_response");
const createResponse = require("../helpers/success_response");
const { logger, fileLogger } = require("../helpers/logger");
const { createEmployeeSchema } = require("../helpers/validation_schema");
const mongoose = require("mongoose");

const csv = require("fast-csv");
const fs = require("fs");
const Joi = require("joi");

exports.getAll = async (req, res) => {
  try {
    const maxResults = req.query.pageSize; // Number of results per page
    const page = parseInt(req.query.page) || 1;
    const sort = req.query.sort || "id";
    const filter = req.query.filter || {};
    const sortOrder = req.query.sortOrder || "0";

    const allEmployees = await Employee.find(filter)
      .sort(sort)
      .skip((page - 1) * maxResults)
      .limit(maxResults); //.find({ id: req.payload.id });
    console.log("getAll endpoint: ");
    const totalCountQuery = Employee.countDocuments(filter);

    const [employees, totalCount] = await Promise.all([query, totalCountQuery]);

    var result = {
      employees,
      totalCount,
      totalPages: Math.ceil(totalCount / maxResults),
      currentPage: page,
    };

    return res.status(200).send(createResponse(result));
  } catch (error) {
    logger.error(error);
    fileLogger.error(error);
    return res.status(500).send(createError("Internal server error"));
  }
};

exports.upload = async (req, res) => {
  try {
    // validating request body
    const importFilename = req.file.filename;
    const importedFilepath = req.file.path;

    if (!req.file.originalname.endsWith("csv")) {
      invalidData.push({
        row: "NA",
        column: "General",
        notes: "File should be in CSV Format",
      });
      return res.send({ error: invalidData });
    }

    // Process the uploaded CSV file
    const employees = [];
    const existingEmployeeIds = new Set(); // To store existing employee IDs for validation
    const existingEmployeeLogins = new Set();
    let isFirstRow = true;

    mongoose.connect(
      "mongodb+srv://admin:1234@employeemgtappcluster.qdo6ksz.mongodb.net/"
    );
    // Fetch existing employee IDs and logins from the database
    const existingEmployees = await Employee.find({}, { id: 1, login: 1 });
    existingEmployees.forEach((employee) => {
      existingEmployeeIds.add(employee.id);
      existingEmployeeLogins.add(employee.login);
    });

    if (importFilename && importedFilepath) {
      const fileRows = [];

      fs.createReadStream(importedFilepath)
        .pipe(csv.parse({ headers: false }))
        .on("error", (error) => {
          console.error("FAST-CSV ERROR: ", error);
          return res.status(500).send(createError(error.message));
        })
        .on("data", (data) => {
          // Skip the first row (header)
          if (isFirstRow) {
            isFirstRow = false;
            return;
          }

          // Ignore comments
          if (data[0].startsWith("#")) return;

          const employeeArray = data[0].split(",");

          // Validate and process each row
          const employee = {
            id: employeeArray[0],
            login: employeeArray[1],
            name: employeeArray[2],
            salary: parseFloat(employeeArray[3]),
          };

          // Validate the row
          if (
            !isValidEmployee(
              employee,
              existingEmployeeIds,
              existingEmployeeLogins
            )
          ) {
            throw new Error(
              `Invalid employee data: ${JSON.stringify(employee)}`
            );
          }

          console.log("existingEmployeeIds: ", existingEmployeeIds);
          // Check if the employee ID already exists
          if (existingEmployeeIds.has(employee.id)) {
            // Update the existing entry in the database
            // Update logic goes here
          } else {
            // Create a new entry in the database
            employees.push(employee);
            existingEmployeeIds.add(employee.id);
            existingEmployeeLogins.add(employee.login);
          }
        })
        .on("end", async () => {
          console.log(
            "Insert new employees into the database - employees: ",
            employees
          );
          // Insert new employees into the database
          await Employee.insertMany(employees)
            .then(function () {
              console.log("Data inserted"); // Success
            })
            .catch(function (error) {
              console.log("Data insertion error: ", error); // Failure
            });

          // Delete the uploaded file
          fs.unlinkSync(importedFilepath);

          res.status(200).send("CSV file uploaded successfully");
        });
    }
  } catch (error) {
    console.log("ERROR: ", error);
    logger.error(error);
    fileLogger.error(error);
    return res.status(500).send(createError("Internal server error"));
  }
};

function isValidEmployee(
  employee,
  existingEmployeeIds,
  existingEmployeeLogins
) {
  console.log("isValidEmployee - employee: ", employee);
  // Check if required fields are present
  if (!employee.id || !employee.login || !employee.name || !employee.salary) {
    return false;
  }

  // Check for unique ID and login
  if (
    existingEmployeeIds.has(employee.id) ||
    existingEmployeeLogins.has(employee.login)
  ) {
    return false;
  }

  // Check salary is a positive number
  if (isNaN(employee.salary) || employee.salary < 0) {
    return false;
  }

  return true;
}

// exports.create = async (req, res) => {
//   try {
//     // validating request body
//     const validateBody = await createEmployeeSchema.validateAsync(req.body);

//     const newEmployee = new Employee({
//       name: validateBody.name,
//       login: validateBody.login,
//       salary: validateBody.salary,
//     });

//     const savedEmployee = await newEmployee.save();
//     return res.status(201).send(createResponse(savedEmployee));
//   } catch (error) {
//     logger.error(error);
//     fileLogger.error(error);
//     if (error.isJoi === true)
//       return res.status(400).send(createError("Invalid request body"));
//     return res.status(500).send(createError("Internal server error"));
//   }
// };

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
