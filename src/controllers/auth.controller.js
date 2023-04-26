const Validator = require("validatorjs")
const bcrypt = require("bcrypt")
const db = require("../models")
const User = db.users
const saltRounds = 10

exports.create = (req, res) => {
  const rules = {
    email: "required|email",
    username: "required",
    password: "required",
    fullname: "required",
  }

  let validation = new Validator(req.body, rules)
  if (validation.fails()) {
    return res.status(422).json({
      status: false,
      message: "Form Validation Error",
      data: validation.errors.all(),
    })
  }

  let { email, username, password, fullname } = req.body

  User.create({
    email: email,
    username: username,
    password: bcrypt.hash(password, saltRounds),
    fullname: fullname,
    role: 1,
  })
    .then((user) => {
      res.status(200).json({
        status: true,
        message: "User created successfully",
        data: user,
      })
    })
    .catch((err) => {
      let code = 500
      if (err.message == "Validation error") {
        code = 422
      }
      res.status(code).json({
        status: false,
        message: err.message || "Some error occurred while creating the User.",
      })
    })
}
