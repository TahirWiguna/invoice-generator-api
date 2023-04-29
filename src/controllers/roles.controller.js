const Joi = require("joi")

const db = require("../models_sequelize")
const Op = db.Sequelize.Op
const Roles = db.roles

const { validateID } = require("../utils/joiValidator")
const { checkRolePermission } = require("../models/permission.model")
const { responseType, response, responseCatch } = require("../utils/response")
const { logger } = require("../utils/logger")

exports.findAll = async (req, res) => {
  const { rolesId } = req

  try {
    // Validation
    const perm = await checkRolePermission(rolesId, "roles.read")
    if (!perm) return response(res, responseType.FORBIDDEN)

    // Start transaction
    const roles = await Roles.findAll()

    return response(res, responseType.SUCCESS, "Get all data success", roles)
  } catch (error) {
    logger.error(error.message)
    responseCatch(res, error)
  }
}

exports.findById = async (req, res) => {
  const { rolesId } = req

  try {
    // Validation
    const perm = await checkRolePermission(req.rolesId, "roles.read")
    if (!perm) return response(res, responseType.FORBIDDEN)

    const { id } = req.params
    const idValidationResult = validateID(id, res)
    if (idValidationResult) return idValidationResult

    // Start transaction
    const roles = await Roles.findOne({
      where: { id: id },
    })

    if (!roles) return response(res, responseType.NOT_FOUND, "Role not found")

    return response(res, responseType.SUCCESS, "Get data success", roles)
  } catch (error) {
    logger.error(error.message)
    responseCatch(res, error)
  }
}

exports.create = async (req, res) => {
  const perm = await checkRolePermission(req.rolesId, "roles.create")
  if (!perm) return response(res, responseType.FORBIDDEN)

  const rules = Joi.object({
    name: Joi.string().required(),
    description: Joi.string().required(),
  })

  const { error, value } = rules.validate(req.body)
  if (error) return response(res, responseType.BAD_REQUEST, error.message)

  try {
    var data = {
      ...value,
      created_by: req.user.id,
    }
    const roles = await Roles.create(data)

    return response(res, responseType.SUCCESS, "Create data success", roles)
  } catch (error) {
    logger.error(error.message)
    responseCatch(res, error)
  }
}

exports.update = async (req, res) => {
  const perm = await checkRolePermission(req.rolesId, "roles.update")
  if (!perm) return response(res, responseType.FORBIDDEN)

  const { id } = req.params
  const idValidationResult = validateID(id, res)
  if (idValidationResult) return idValidationResult

  const rules = Joi.object({
    name: Joi.string().optional(),
    description: Joi.string().optional(),
    module: Joi.string().optional(),
  })

  const { error, value } = rules.validate(req.body)
  if (error) return response(res, responseType.BAD_REQUEST, error.message)

  try {
    const { name, description, module } = value

    var updateData = {}
    if (name) updateData.name = name
    if (description) updateData.description = description
    if (module) updateData.module = module

    updateData.updated_by = req.user.id

    const roles = await Roles.update(updateData, {
      where: { id: id },
    })

    if (!roles) return response(res, responseType.NOT_FOUND, "Role not found")

    return response(res, responseType.SUCCESS, "Update data success")
  } catch (error) {
    logger.error(error.message)
    responseCatch(res, error)
  }
}

exports.delete = async (req, res) => {
  const perm = await checkRolePermission(req.rolesId, "roles.delete")
  if (!perm) return response(res, responseType.FORBIDDEN)

  const { id } = req.params
  const idValidationResult = validateID(id, res)
  if (idValidationResult) return idValidationResult

  try {
    const roles = await Roles.destroy({
      where: { id: id },
    })

    if (!roles) return response(res, responseType.NOT_FOUND, "Role not found")

    return response(
      res,
      responseType.SUCCESS,
      "Data has been deleted successfully"
    )
  } catch (error) {
    logger.error(error.message)
    responseCatch(res, error)
  }
}
