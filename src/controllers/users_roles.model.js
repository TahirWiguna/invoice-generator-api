const Joi = require("joi")
const { responseType, response, responseCatch } = require("../utils/response")

const db = require("../models_sequelize")
const Op = db.Sequelize.Op
const Roles = db.roles

const { validateID } = require("../utils/joiValidator")

const { checkRolePermission } = require("../models/permission.model")

exports.findAll = async (req, res) => {
  const perm = await checkRolePermission(req.rolesId, "users_roles.read")
  if (!perm) return response(res, responseType.FORBIDDEN)

  try {
    const roles = await Roles.findAll()

    return response(res, responseType.SUCCESS, "Get all data success", roles)
  } catch (error) {
    console.log(error.message)
    responseCatch(res, error)
  }
}

exports.findById = async (req, res) => {
  const perm = await checkRolePermission(req.rolesId, "users_roles.read")
  if (!perm) return response(res, responseType.FORBIDDEN)

  const { id } = req.params

  var joiId = validateID(id, res)
  if (joiId) return joiId

  try {
    const role = await Roles.findOne({
      where: { id: id },
    })

    if (!role) return response(res, responseType.NOT_FOUND, "Role not found")

    return response(res, responseType.SUCCESS, "Get data success", role)
  } catch (error) {
    console.log(error.message)
    responseCatch(res, error)
  }
}
