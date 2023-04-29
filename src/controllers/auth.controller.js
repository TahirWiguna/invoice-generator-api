const Joi = require("joi")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

const { responseType, response, responseCatch } = require("../utils/response")
const { validateID } = require("../utils/joiValidator")
const { logger } = require("../utils/logger")

const db = require("../models_sequelize")
const Op = db.Sequelize.Op
const Users = db.users
const UsersTokens = db.users_token

const saltRounds = 10

exports.login = async (req, res) => {
  const { rolesId } = req

  try {
    // Validation
    const rules = Joi.object({
      username: Joi.string().required(),
      password: Joi.string().required(),
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
    const { username, password } = value

    const user = await Users.findOne({
      where: { [Op.or]: [{ username: username }, { email: username }] },
    })

    if (!user) return response(res, responseType.NOT_FOUND, "User not found")

    if (user.active === false)
      return response(res, responseType.FORBIDDEN, "User is inactive")

    if (user.banned_until > new Date())
      return response(res, responseType.FORBIDDEN, "User has been banned")

    const validatePassword = await bcrypt.compare(password, user.password)
    if (!validatePassword)
      return response(res, responseType.NOT_FOUND, "username/password wrong")

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRED,
    })
    const decoded = jwt.decode(token)
    const expirationTime = new Date(decoded.exp * 1000)

    const insertToken = await UsersTokens.create({
      users_id: user.id,
      token: token,
      ip_address: req.clientIp,
      user_agent: req.headers["user-agent"],
      expires_at: expirationTime,
    })

    response(res, responseType.SUCCESS, "Login success", { token, user })
  } catch (error) {
    logger.error(error.message)
    responseCatch(res, error)
  }
}
