const mongoose = require("mongoose");
// var uniqueValidator = require("mongoose-unique-validator");

const employeeSchema = mongoose.Schema(
  {
    id: {
      type: String,
      required: [true, "Please enter id"],
      // unique: true,
    },
    name: {
      type: String,
      required: [true, "Please enter a name"],
    },
    login: {
      type: String,
      required: [true, "Please enter a login"],
      // unique: true,
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

// employeeSchema.plugin(uniqueValidator);

const Employee = mongoose.model("Employee", employeeSchema);

module.exports = Employee;
