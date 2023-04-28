const Joi = require("joi")
const { response, responseType } = require("./response")

const validateID = (id, res) => {
  const idRules = Joi.number().positive().required()
  const { error, value } = idRules.validate(id)
  console.log(error)
  if (error) {
    if (res) {
      return response(
        res,
        responseType.VALIDATION_ERROR,
        "Invalid id",
        error.details
      )
    }
    return error
  }
}

module.exports = { validateID }
