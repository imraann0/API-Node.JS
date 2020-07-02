const Joi = require('@hapi/joi')

// Register Valadtion
const registerValidation = data => {
  const schema = Joi.object({
    first_name: Joi.string().required(),
    last_name: Joi.string().required(),
    dob: Joi.date(),
    email: Joi.string().min(6).required().email(),
    username: Joi.string().min(4).required(),
    password: Joi.string().min(6).required()
  })
  return schema.validate(data)
}

module.exports.registerValidation = registerValidation

// Login Valadtion
const loginValidation = data => {
  const schema = Joi.object({
    email: Joi.string().min(6).required().email(),
    password: Joi.string().min(6).required()
  })

  return schema.validate(data)
}

module.exports.loginValidation = loginValidation
