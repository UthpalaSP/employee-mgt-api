const Employee = require("./models/employeeModel");

// exports.getAll = async (req, res) => {
//     try {
//         const allEmployees = await Employee.find({ id: req.payload.id });
//         return res.status(200).send(createResponse(allEmployees));
//     } catch (error) {
//         logger.error(error);
//         fileLogger.error(error);
//         return res.status(500).send(createError('Internal server error'));
//     }
// };

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
