const Joi = require("joi")

const db = require("../models_sequelize")
const Op = db.Sequelize.Op
const Roles = db.roles

const { checkRolePermission } = require("../models/permission.model")

const { validateID, validateDatatable } = require("../utils/joiValidator")
const { responseType, response, responseCatch } = require("../utils/response")
const { logger } = require("../utils/logger")
const { datatable } = require("../utils/datatable")

exports.findAll = async (req, res) => {
  const { rolesId } = req

  try {
    // Validation
    const perm = await checkRolePermission(rolesId, "roles.read")
    if (!perm) return response(res, responseType.FORBIDDEN)

    // Start transaction
    const roles = await Roles.findAll({
      include: [
        {
          model: db.users,
          as: "creator",
          attributes: ["id", "fullname", "email"],
        },
      ],
    })

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
      include: [
        {
          model: db.users,
          as: "creator",
          attributes: ["id", "fullname", "email"],
        },
      ],
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

  const { error, value } = rules.validate(req.body, { abortEarly: false })
  if (error) {
    return response(
      res,
      responseType.VALIDATION_ERROR,
      "Form Validation Error",
      error.details
    )
  }

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

exports.datatable = async (req, res) => {
  const { rolesId } = req
  try {
    // Validation
    const perm = await checkRolePermission(rolesId, "permission.read")
    if (!perm) return response(res, responseType.FORBIDDEN)

    const { error, value } = validateDatatable(req)
    if (error) {
      return response(
        res,
        responseType.VALIDATION_ERROR,
        "Form Validation Error",
        error.details
      )
    }

    // Start transaction
    const { draw, start, length, search, order, columns } = value

    const orderColumn = order[0].column
    const orderDir = order[0].dir
    const orderColumnName = columns[orderColumn].data

    const dttable = datatable(Roles, value)

    const roles = await Roles.findAndCountAll({
      where: dttable,
      order: [[orderColumnName, orderDir]],
      offset: start,
      limit: length,
      include: [
        {
          model: db.users,
          as: "creator",
          attributes: ["id", "fullname", "email"],
        },
      ],
    })

    return response(res, responseType.SUCCESS, "Get data success", {
      draw,
      recordsTotal: roles.count,
      recordsFiltered: roles.rows.length,
      data: roles.rows,
    })
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

  const { error, value } = rules.validate(req.body, { abortEarly: false })
  if (error) {
    return response(
      res,
      responseType.VALIDATION_ERROR,
      "Form Validation Error",
      error.details
    )
  }

  try {
    const { name, description, module } = value

    var updateData = {}
    if (name) updateData.name = name
    if (description) updateData.description = description
    if (module) updateData.module = module

    updateData.updated_by = req.user.id

    const roles = await Roles.update(updateData, {
      where: { id: id },
      returning: true,
    })

    if (!roles) return response(res, responseType.NOT_FOUND, "Role not found")

    return response(res, responseType.SUCCESS, "Update data success", roles[1])
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
