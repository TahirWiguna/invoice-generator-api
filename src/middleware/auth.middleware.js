const jwt = require("jsonwebtoken")
const db = require("../models_sequelize")
const { response, responseType } = require("../utils/response")
const Op = db.Sequelize.Op
const Users = db.users
const UsersTokens = db.users_token
const UsersRoles = db.users_roles

const auth = async (req, res, next) => {
  try {
    if (!req.header("Authorization")) throw new Error("Please authenticate")

    const token = req.header("Authorization").replace("Bearer ", "")
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    const findToken = await UsersTokens.findOne({
      where: { users_id: decoded.id, token: token },
    })
    if (!findToken) throw new Error("invalid token")
    if (!findToken.active) throw new Error("Please re-login")

    const user = await Users.findOne({
      where: { id: decoded.id, active: true },
    })
    if (!user) throw new Error("user not found")

    const roles = await UsersRoles.findAll({
      attributes: ["id", "roles_id"],
      raw: true,
      where: { users_id: decoded.id },
    })
    const rolesId = roles.map((role) => role.roles_id)

    req.user = user
    req.rolesId = rolesId

    next()
  } catch (e) {
    response(res, responseType.UNAUTHORIZED, e.message || "Please authenticate")
  }
}

module.exports = auth
