const Employee = require("../models/employeeModel");
const createError = require("../helpers/error_response");
const createResponse = require("../helpers/success_response");
const { logger, fileLogger } = require("../helpers/logger");
const { createEmployeeSchema } = require("../helpers/validation_schema");

const csv = require("fast-csv");
const fs = require("fs");

exports.getAll = async (req, res) => {
  try {
    const queryParams = JSON.parse(req.query.lazyEvent);
    const rows = queryParams.rows || 10; // Number of results per page
    const first = parseInt(queryParams.first) || 0;
    const sortField = queryParams.sortField || "id";
    const sortOrder = queryParams.sortOrder || "1";

    // Get property names and values where value is not null
    let filters = Object.entries(queryParams.filters)
      .filter(([, value]) => value.value !== null && value.value)
      .map(([key, value]) => ({ [key]: value.value }));
    filters = filters.length == 0 ? {} : filters;

    // mongoose.connect(
    //   "mongodb+srv://<>@employeemgtappcluster.qdo6ksz.mongodb.net/"
    // );

    const query = await Employee.find(filters[0])
      .sort({ [sortField]: sortOrder })
      .skip(first)
      .limit(rows);

    const totalCountQuery = Employee.countDocuments(filters[0]);

    const [employees, totalCount] = await Promise.all([query, totalCountQuery]);

    var result = {
      employees,
      totalCount,
      totalPages: Math.ceil(totalCount / rows),
      currentPage: first,
    };

    return res.status(200).send(createResponse(result));
  } catch (error) {
    console.log("ERROR : ", error);
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

    // mongoose.connect(
    //   "mongodb+srv://<>@employeemgtappcluster.qdo6ksz.mongodb.net/"
    // );
    // Fetch existing employee IDs and logins from the database
    const existingEmployees = await Employee.find({}, { id: 1, login: 1 });
    existingEmployees.forEach((employee) => {
      existingEmployeeIds.add(employee.id);
      existingEmployeeLogins.add(employee.login);
    });

    if (importFilename && importedFilepath) {
      fs.createReadStream(importedFilepath)
        .pipe(csv.parse({ headers: false }))
        .on("error", (error) => {
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
