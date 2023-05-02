const { response, responseType } = require("../../utils/response")
const db = require("../../models_sequelize")
const { Op } = require("sequelize")
const Users = db.users

const checkId = async (id, res) => {
  const existingId = await Users.findOne({ where: { id, active: true } })
  if (existingId) {
    return existingId
  }
  return null
}

const checkExistingEmail = async (email, exceptId, res) => {
  const where = {
    email,
    active: true,
  }
  if (exceptId) where.id = { [Op.ne]: exceptId }

  const existingEmail = await Users.findOne({ where })
  if (existingEmail) {
    if (res) {
      return response(
        res,
        responseType.VALIDATION_ERROR,
        "The email is already taken."
      )
    } else {
      return existingEmail
    }
  }
  return null
}

const checkExistingUsername = async (username, exceptId, res) => {
  const where = {
    username,
    active: true,
  }
  if (exceptId) where.id = { [Op.ne]: exceptId }

  const existingUsername = await Users.findOne({ where })
  if (existingUsername) {
    if (res) {
      return response(
        res,
        responseType.VALIDATION_ERROR,
        "The username is already taken."
      )
    } else {
      return existingUsername
    }
  }
  return null
}

module.exports = { checkExistingEmail, checkExistingUsername, checkId }
