const Joi = require("joi");

const addTodoSchema = Joi.object({
  task: Joi.string()
    .trim()
    .min(1)
    .max(1000)
    .required()
    .describe("The todo task"),
  contact: Joi.string().email().optional(),
  tags: Joi.array(Joi.string()).min(1).optional().default([]),
  link: Joi.string().uri(),
});

// function validateAddTodo(addTodoInfo) {
//   return addTodoSchema.validate(addTodoInfo);
// }

module.exports = {
  addTodoSchema,
  // validateAddTodo
};
