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

const validateDatatable = (req) => {
  const rules = Joi.object({
    draw: Joi.number().required(),
    start: Joi.number().required(),
    length: Joi.number().required(),
    search: Joi.object({
      value: Joi.string().allow(""),
      regex: Joi.boolean(),
    }),
    order: Joi.array().items(
      Joi.object({
        column: Joi.number(),
        dir: Joi.string().valid("asc", "desc"),
      })
    ),
    columns: Joi.array().items(
      Joi.object({
        data: Joi.string(), // Only allow name and description
        name: Joi.string(),
        searchable: Joi.boolean(),
        orderable: Joi.boolean(),
        search: Joi.object({
          value: Joi.string().allow(""),
          regex: Joi.boolean(),
        }),
      }).optional()
    ),
  })

  const { error, value } = rules.validate(req.body, { abortEarly: false })

  return { error, value }
}

module.exports = { validateID, validateDatatable }
