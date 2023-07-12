const Joi = require("joi");

const createEmployeeSchema = Joi.object({
  id: Joi.string().min(3).max(255).required(),
  name: Joi.string().min(3).max(255).required(),
  login: Joi.string().min(3).max(255).required(),
  salary: Joi.number().required(),
});

const updateEmployeeSchema = Joi.object({
  name: Joi.string().min(3).max(255).required(),
  login: Joi.string().min(3).max(2500).required(),
  salary: Joi.number().required(),
});

module.exports = {
  createEmployeeSchema,
  updateEmployeeSchema,
};
