const requestIp = require("request-ip")
const helmet = require("helmet")

const { logger, logError, logRequest } = require("./utils/logger")

const authRouter = require("./routes/auth")
const usersRouter = require("./routes/users")
const rolesRouter = require("./routes/roles")
const usersRolesRouter = require("./routes/users_roles")
const permissionRouter = require("./routes/permission")
const rolesPermissionRouter = require("./routes/roles_permission")

// SETUP
const express = require("express")
const app = express()
const PORT = 3000

const API_URL = "/v1/api"

// MIDDLEWARE
app.use(helmet())
app.use(express.json())
app.use(errorHandler)
app.use(requestIp.mw())
app.use(logRequest)
app.use(logError)

// ROUTER
app.use(API_URL, authRouter)
app.use(API_URL, usersRouter)
app.use(API_URL, rolesRouter)
app.use(API_URL, usersRolesRouter)
app.use(API_URL, permissionRouter)
app.use(API_URL, rolesPermissionRouter)

// SYNC DB
const db = require("./models_sequelize")
db.sequelize
  .sync()
  .then(() => {
    console.log("Synced db.")
  })
  .catch((err) => {
    console.log("Failed to sync db: " + err.message)
  })

// LISTEN
app.listen(PORT, () => {
  console.log(`App is running on PORT ${PORT}`)
})

function errorHandler(err, req, res, next) {
  if (err.code === "23505") {
    // Handle unique constraint violation error
    res.status(409).json({ message: "Data already exist" })
  } else {
    res
      .status(err.status)
      .json({ message: "Oops! Something went wrong.", error: err.message, err })
  }
}
