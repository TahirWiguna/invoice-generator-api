const Joi = require("joi")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

const { responseType, response, responseCatch } = require("../utils/response")
const { validateID, validateDatatable } = require("../utils/joiValidator")
const { logger } = require("../utils/logger")
const { datatable } = require("../utils/datatable")

const {
  checkExistingUsername,
  checkExistingEmail,
  checkId,
} = require("../models/users.model")
const { checkRolePermission } = require("../models/permission.model")

const db = require("../models_sequelize")
const Op = db.Sequelize.Op
const Users = db.users

const saltRounds = 10

exports.findAll = async (req, res) => {
  const { rolesId } = req
  try {
    // Validation
    const perm = await checkRolePermission(rolesId, "users.read")
    if (!perm) return response(res, responseType.FORBIDDEN)

    // Start transaction
    const users = await Users.findAll({
      attributes: { exclude: ["password"] },
    })

    return response(res, responseType.SUCCESS, "Get all data success", users)
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
    const perm = await checkRolePermission(rolesId, "users.read")
    if (!perm) return response(res, responseType.FORBIDDEN)

    var idValidationResult = validateID(id, res)
    if (idValidationResult) return idValidationResult

    // Start transaction
    const user = await Users.findOne({
      where: { id: id },
      attributes: { exclude: ["password"] },
    })

    if (!user) return response(res, responseType.NOT_FOUND, "User not found")

    return response(res, responseType.SUCCESS, "Get data success", user)
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

    const dttable = datatable(Users, value)

    const users = await Users.findAndCountAll({
      where: dttable,
      order: [[orderColumnName, orderDir]],
      offset: start,
      limit: length,
    })

    return response(res, responseType.SUCCESS, "Get data success", {
      draw,
      recordsTotal: users.count,
      recordsFiltered: users.rows.length,
      data: users.rows,
    })
  } catch (error) {
    logger.error(error.message)
    responseCatch(res, error)
  }
}

exports.create = async (req, res) => {
  const { rolesId } = req
  try {
    // Validation
    const perm = await checkRolePermission(rolesId, "users.create")
    if (!perm) return response(res, responseType.FORBIDDEN)

    const rules = Joi.object({
      email: Joi.string().email().required(),
      username: Joi.string().required(),
      password: Joi.string().required(),
      fullname: Joi.string().required(),
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
    let { email, username, password, fullname } = value

    const validateEmail = await checkExistingEmail(email, null, res)
    if (validateEmail) return validateEmail

    const validateUsername = await checkExistingUsername(username, null, res)
    if (validateUsername) return validateUsername

    const create = await Users.create({
      email: email,
      username: username,
      password: await bcrypt.hash(password, saltRounds),
      fullname: fullname,
      active: true,
      role: 1,
    })

    if (!create) return response(res, responseType.FAILED_CREATE)

    return response(
      res,
      responseType.CREATED,
      "Data has been created successfully",
      create
    )
  } catch (error) {
    logger.error(error.message)
    responseCatch(res, error)
  }
}

exports.update = async (req, res) => {
  const { rolesId } = req
  const { id } = req.params

  try {
    // Validation
    const perm = await checkRolePermission(rolesId, "users.update")
    if (!perm) return response(res, responseType.FORBIDDEN)

    var idValidationResult = validateID(id, res)
    if (idValidationResult) return idValidationResult

    var validatorId = await checkId(id, res)
    if (!validatorId)
      return response(
        res,
        responseType.NOT_FOUND,
        "Data not found or has been deleted"
      )

    const rules = Joi.object({
      email: Joi.string().email().optional(),
      username: Joi.string().optional(),
      password: Joi.string().optional(),
      fullname: Joi.string().optional(),
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
    const { email, username, password, fullname } = value
    const updateData = {}

    if (email) {
      const validateEmail = await checkExistingEmail(email, id, res)
      if (validateEmail) return validateEmail
      updateData.email = email
    }

    if (username) {
      const validateUsername = await checkExistingUsername(username, id, res)
      if (validateUsername) return validateUsername
      updateData.username = username
    }

    if (password) updateData.password = await bcrypt.hash(password, saltRounds)
    if (fullname) updateData.fullname = fullname

    const [countAffectedUser, updatedUser] = await Users.update(updateData, {
      where: {
        id,
      },
      returning: true,
    })

    if (!updatedUser) return response(res, responseType.FAILED_UPDATE)

    return response(
      res,
      responseType.SUCCESS,
      "Data has been updated successfully",
      updatedUser
    )
  } catch (error) {
    logger.error(error.message)
    responseCatch(res, error)
  }
}

exports.deactivate = async (req, res) => {
  const { rolesId } = req
  const { id } = req.params

  try {
    // Validation
    const perm = await checkRolePermission(rolesId, "users.deactivate")
    if (!perm) return response(res, responseType.FORBIDDEN)

    var idValidationResult = validateID(id, res)
    if (idValidationResult) return idValidationResult

    var validatorId = await checkId(id, res)
    if (!validatorId)
      return response(
        res,
        responseType.NOT_FOUND,
        "Data not found or has been deleted"
      )

    // Start transaction
    const [countAffectedUser, updatedUser] = await Users.update(
      { active: false },
      {
        where: {
          id,
        },
        returning: true,
      }
    )

    if (!updatedUser) return response(res, responseType.FAILED_UPDATE)

    return response(
      res,
      responseType.SUCCESS,
      "Data has been updated successfully",
      updatedUser
    )
  } catch (error) {
    logger.error(error.message)
    responseCatch(res, error)
  }
}

exports.activate = async (req, res) => {
  const { rolesId } = req

  try {
    // Validation
    const perm = await checkRolePermission(rolesId, "users.activate")
    if (!perm) return response(res, responseType.FORBIDDEN)

    const { id } = req.params

    var idValidationResult = validateID(id, res)
    if (idValidationResult) return idValidationResult

    // Start transaction
    const [countAffectedUser, updatedUser] = await Users.update(
      { active: true },
      {
        where: {
          id: id,
        },
        returning: true,
      }
    )

    if (!updatedUser) return response(res, responseType.FAILED_UPDATE)

    return response(
      res,
      responseType.SUCCESS,
      "Data has been updated successfully",
      updatedUser
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
    const perm = await checkRolePermission(rolesId, "users.delete")
    if (!perm) return response(res, responseType.FORBIDDEN)

    var idValidationResult = validateID(id, res)
    if (idValidationResult) return idValidationResult

    var validatorId = await checkId(id, res)
    if (!validatorId)
      return response(
        res,
        responseType.NOT_FOUND,
        "Data not found or has been deleted"
      )

    // Start transaction
    const deleteUser = await Users.destroy({
      where: {
        id: id,
      },
    })

    if (!deleteUser) return response(res, responseType.FAILED_DELETE)

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
