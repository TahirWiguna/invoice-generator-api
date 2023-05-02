const Joi = require("joi")
const {
  responseType,
  response,
  responseCatch,
} = require("../../utils/response")

const db = require("../../models_sequelize")
const Op = db.Sequelize.Op
const UsersRoles = db.users_roles

const { validateID, validateDatatable } = require("../../utils/joiValidator")
const { logger } = require("../../utils/logger")
const { datatable } = require("../../utils/datatable")

const { checkRolePermission } = require("../../models/auth/permission.model")

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
          attributes: ["id", "fullname", "email"],
        },
        {
          model: db.users,
          as: "creator",
          attributes: ["id", "fullname", "email"],
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
          attributes: ["id", "fullname", "email"],
        },
        {
          model: db.users,
          attributes: ["id", "fullname", "email"],
          as: "creator",
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

    const dttable = datatable(UsersRoles, value)

    const usersRoles = await UsersRoles.findAndCountAll({
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
        {
          model: db.users,
          as: "user",
          attributes: ["id", "fullname", "email"],
        },
        {
          model: db.roles,
          attributes: ["id", "name"],
        },
      ],
    })

    return response(res, responseType.SUCCESS, "Get data success", {
      draw,
      recordsTotal: usersRoles.count,
      recordsFiltered: usersRoles.rows.length,
      data: usersRoles.rows,
    })
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

    const { error, value } = rules.validate(req.body, { abortEarly: false })
    if (error) {
      return response(
        res,
        responseType.VALIDATION_ERROR,
        "Form Validation Error",
        error.details
      )
    }

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
      users_id: Joi.number().required(),
      roles_id: Joi.number().required(),
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

    // Start transaction
    let updateData = {}
    if (value.users_id) updateData.users_id = value.users_id
    if (value.roles_id) updateData.roles_id = value.roles_id
    updateData.updated_by = user.id

    const role = await UsersRoles.update(updateData, {
      where: { id: id },
      returning: true,
    })
    if (!role) return response(res, responseType.NOT_FOUND, "Role not found")

    return response(res, responseType.SUCCESS, "Update data success", role[1])
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
