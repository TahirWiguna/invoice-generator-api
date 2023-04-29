const Joi = require("joi")
const { responseType, response, responseCatch } = require("../utils/response")

const db = require("../models_sequelize")
const Op = db.Sequelize.Op
const UsersRoles = db.users_roles

const { validateID } = require("../utils/joiValidator")
const { logger } = require("../utils/logger")

const { checkRolePermission } = require("../models/permission.model")

exports.findAll = async (req, res) => {
  try {
    // Validation
    const perm = await checkRolePermission(req.rolesId, "users_roles.read")
    if (!perm) return response(res, responseType.FORBIDDEN)

    // Start transaction
    const usersRoles = await UsersRoles.findAll({
      include: [
        {
          model: db.users,
          as: "user",
          attributes: ["id", "username", "email"],
        },
        {
          model: db.users,
          as: "creator",
          attributes: ["id", "username", "email"],
        },
        {
          model: db.roles,
          attributes: ["id", "name"],
        },
      ],
    })

    return response(
      res,
      responseType.SUCCESS,
      "Get all data success",
      usersRoles
    )
  } catch (error) {
    logger.error(error.message)
    responseCatch(res, error)
  }
}

exports.findById = async (req, res) => {
  const { id } = req.params

  try {
    // Validation
    const perm = await checkRolePermission(req.rolesId, "users_roles.read")
    if (!perm) return response(res, responseType.FORBIDDEN)

    const idValidationResult = validateID(id, res)
    if (idValidationResult) return idValidationResult

    // Start transaction
    const role = await UsersRoles.findOne({
      where: { id },
      include: [
        {
          model: db.users,
          attributes: ["id", "username", "email"],
        },
        {
          model: db.roles,
          attributes: ["id", "name"],
        },
      ],
    })

    if (!role) return response(res, responseType.NOT_FOUND, "Role not found")

    return response(res, responseType.SUCCESS, "Get data success", role)
  } catch (error) {
    logger.error(error.message)
    responseCatch(res, error)
  }
}

exports.create = async (req, res) => {
  const { user, rolesId, body } = req
  try {
    // Validation
    const perm = await checkRolePermission(rolesId, "users_roles.create")
    if (!perm) return response(res, responseType.FORBIDDEN)

    const rules = Joi.object({
      users_id: Joi.number().required(),
      roles_id: Joi.number().required(),
    })

    const { error, value } = rules.validate(body)
    if (error) return response(res, responseType.BAD_REQUEST, error.message)

    // Start transaction
    let data = {
      ...value,
      created_by: user.id,
    }
    const role = await UsersRoles.create(data)

    return response(res, responseType.SUCCESS, "Create data success", role)
  } catch (error) {
    logger.error(error.message)
    responseCatch(res, error)
  }
}

exports.update = async (req, res) => {
  const { user, rolesId, body, params } = req
  const { id } = params
  try {
    // Validation
    const perm = await checkRolePermission(rolesId, "users_roles.update")
    if (!perm) return response(res, responseType.FORBIDDEN)

    const idValidationResult = validateID(id, res)
    if (idValidationResult) return idValidationResult

    const rules = Joi.object({
      users_id: Joi.integer().required(),
      roles_id: Joi.integer().required(),
    })

    const { error, value } = rules.validate(body)
    if (error) return response(res, responseType.BAD_REQUEST, error.message)

    // Start transaction
    let updateData = {}
    if (value.users_id) updateData.users_id = value.users_id
    if (value.roles_id) updateData.roles_id = value.roles_id
    updateData.updated_by = user.id

    const role = await UsersRoles.update(updateData, { where: { id: id } })
    if (!role) return response(res, responseType.NOT_FOUND, "Role not found")

    return response(res, responseType.SUCCESS, "Update data success", role)
  } catch (error) {
    logger.error(error.message)
    responseCatch(res, error)
  }
}

exports.delete = async (req, res) => {
  const { rolesId, params } = req
  const { id } = params

  try {
    // Validation
    const perm = await checkRolePermission(rolesId, "users_roles.delete")
    if (!perm) return response(res, responseType.FORBIDDEN)

    const idValidationResult = validateID(id, res)
    if (idValidationResult) return idValidationResult

    // Start transaction
    const role = await UsersRoles.destroy({ where: { id: id } })
    if (!role) return response(res, responseType.NOT_FOUND, "Role not found")

    return response(
      res,
      responseType.SUCCESS,
      "Data has been deleted successfully",
      role
    )
  } catch (error) {
    logger.error(error.message)
    responseCatch(res, error)
  }
}
