const Joi = require("joi")

const db = require("../../models_sequelize")
const Op = db.Sequelize.Op
const Permission = db.permission

const { checkRolePermission } = require("../../models/auth/permission.model")

const { validateID, validateDatatable } = require("../../utils/joiValidator")
const {
  responseType,
  response,
  responseCatch,
} = require("../../utils/response")
const { logger } = require("../../utils/logger")
const { datatable } = require("../../utils/datatable")

exports.findAll = async (req, res) => {
  const { rolesId } = req

  try {
    // Validation
    const perm = await checkRolePermission(rolesId, "permission.read")
    if (!perm) return response(res, responseType.FORBIDDEN)

    // Start transaction
    const permission = await Permission.findAll({
      include: [
        {
          model: db.users,
          as: "creator",
          attributes: ["id", "fullname", "email"],
        },
      ],
    })

    return response(
      res,
      responseType.SUCCESS,
      "Get all data success",
      permission
    )
  } catch (error) {
    logger.error(error.message)
    responseCatch(res, error)
  }
}

exports.findById = async (req, res) => {
  const { rolesId } = req
  const { id } = req.params

  try {
    // Validation
    const perm = await checkRolePermission(rolesId, "permission.read")
    if (!perm) return response(res, responseType.FORBIDDEN)

    const idValidationResult = validateID(id, res)
    if (idValidationResult) return idValidationResult

    // Start transaction
    const permission = await Permission.findOne({
      where: { id },
      include: [
        {
          model: db.users,
          as: "creator",
          attributes: ["id", "fullname", "email"],
        },
      ],
    })

    if (!permission)
      return response(res, responseType.NOT_FOUND, "Permission not found")

    return response(res, responseType.SUCCESS, "Get data success", permission)
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

    const dttable = datatable(Permission, value)

    const permission = await Permission.findAndCountAll({
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
      recordsTotal: permission.count,
      recordsFiltered: permission.rows.length,
      data: permission.rows,
    })
  } catch (error) {
    logger.error(error.message)
    responseCatch(res, error)
  }
}

exports.create = async (req, res) => {
  const { rolesId, user } = req

  try {
    // Validation
    const perm = await checkRolePermission(rolesId, "permission.create")
    if (!perm) return response(res, responseType.FORBIDDEN)

    const rules = Joi.object({
      name: Joi.string().required(),
      description: Joi.string().required(),
      module: Joi.string().required(),
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
    var data = {
      ...value,
      created_by: user.id,
    }
    const permission = await Permission.create(data)

    return response(
      res,
      responseType.SUCCESS,
      "Create data success",
      permission
    )
  } catch (error) {
    logger.error(error.message)
    responseCatch(res, error)
  }
}

exports.createTemplate = async (req, res) => {
  const { rolesId, user } = req
  try {
    // Validation
    const perm = await checkRolePermission(rolesId, "permission.create")
    if (!perm) return response(res, responseType.FORBIDDEN)

    const rules = Joi.object({
      module: Joi.string().required(),
      allow_read: Joi.boolean().optional(),
      allow_create: Joi.boolean().optional(),
      allow_update: Joi.boolean().optional(),
      allow_delete: Joi.boolean().optional(),
      allow_export: Joi.boolean().optional(),
      allow_import: Joi.boolean().optional(),
    })
    const { error, value } = rules.validate(req.body)

    // Start transaction
    const {
      module,
      allow_create,
      allow_read,
      allow_update,
      allow_delete,
      allow_export,
      allow_import,
    } = value

    const permissions = []
    const createdPermissions = []
    const createPermission = async (module, name, description, created_by) => {
      try {
        const permission = await Permission.create({
          module,
          name,
          description,
          created_by,
        })
        return permission
      } catch (error) {
        return null
      }
    }

    if (allow_create) {
      const createPermissionPromise = createPermission(
        module,
        `${module}.create`,
        `Allow to Create ${module} data`,
        user.id
      )
      permissions.push(createPermissionPromise)
    }

    if (allow_read) {
      const readPermissionPromise = createPermission(
        module,
        `${module}.read`,
        `Allow to Read ${module} data`,
        user.id
      )
      permissions.push(readPermissionPromise)
    }

    if (allow_update) {
      const updatePermissionPromise = createPermission(
        module,
        `${module}.update`,
        `Allow to Update ${module} data`,
        user.id
      )
      permissions.push(updatePermissionPromise)
    }

    if (allow_delete) {
      const deletePermissionPromise = createPermission(
        module,
        `${module}.delete`,
        `Allow to Delete ${module} data`,
        user.id
      )
      permissions.push(deletePermissionPromise)
    }

    if (allow_export) {
      const exportPermissionPromise = createPermission(
        module,
        `${module}.export`,
        `Allow to Export ${module} data`,
        user.id
      )
      permissions.push(exportPermissionPromise)
    }

    if (allow_import) {
      const importPermissionPromise = createPermission(
        module,
        `${module}.import`,
        `Allow to Import ${module} data`,
        user.id
      )
      permissions.push(importPermissionPromise)
    }

    const results = await Promise.all(permissions)

    results.forEach((permission) => {
      if (permission) {
        createdPermissions.push(permission)
      }
    })

    const successPermissionNames = createdPermissions
      .map((permission) => permission.name)
      .join(" ")

    return response(
      res,
      responseType.CREATED,
      `${successPermissionNames || "No"} permission(s) created successfully`,
      createdPermissions
    )
  } catch (error) {
    logger.error(error.message)
    responseCatch(res, error)
  }
}

exports.update = async (req, res) => {
  const { rolesId, user } = req
  const { id } = req.params

  try {
    // Validation
    const perm = await checkRolePermission(rolesId, "permission.update")
    if (!perm) return response(res, responseType.FORBIDDEN)

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

    // Start transaction
    const { name, description, module } = value

    var updateData = {}
    if (name) updateData.name = name
    if (description) updateData.description = description
    if (module) updateData.module = module

    updateData.updated_by = user.id

    const permission = await Permission.update(updateData, {
      where: { id },
      returning: true,
    })

    if (!permission)
      return response(res, responseType.NOT_FOUND, "Permission not found")

    return response(
      res,
      responseType.SUCCESS,
      "Update data success",
      permission[1]
    )
  } catch (error) {
    logger.error(error.message)
    responseCatch(res, error)
  }
}

exports.delete = async (req, res) => {
  const { rolesId } = req
  const { id } = req.params

  try {
    // Validation
    const perm = await checkRolePermission(rolesId, "permission.delete")
    if (!perm) return response(res, responseType.FORBIDDEN)

    const idValidationResult = validateID(id, res)
    if (idValidationResult) return idValidationResult

    // Start transaction
    const permission = await Permission.destroy({
      where: { id },
    })

    if (!permission)
      return response(res, responseType.NOT_FOUND, "Permission not found")

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

exports.deleteModule = async (req, res) => {
  const { rolesId } = req

  try {
    // Validation
    const perm = await checkRolePermission(rolesId, "permission.delete")
    if (!perm) return response(res, responseType.FORBIDDEN)

    const rules = Joi.object({
      module: Joi.string().required(),
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
    const { module } = value
    const permission = await Permission.destroy({
      where: { module: module },
    })

    if (!permission)
      return response(res, responseType.NOT_FOUND, "Permission not found")

    return response(
      res,
      responseType.SUCCESS,
      permission + " data has been deleted successfully"
    )
  } catch (error) {
    logger.error(error.message)
    responseCatch(res, error)
  }
}
