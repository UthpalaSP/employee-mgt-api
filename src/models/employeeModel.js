const mongoose = require("mongoose");

const employeeSchema = mongoose.Schema(
  {
    id: {
      type: Number,
    },
    name: {
      type: String,
      required: [true, "Please enter a name"],
    },
    login: {
      type: String,
      required: [true],
    },
    salary: {
      type: Number,
      required: [true],
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Employee = mongoose.model("Employee", employeeSchema);

module.exports = Employee;
