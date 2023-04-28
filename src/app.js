const requestIp = require("request-ip")

const usersRouter = require("./routes/users")
const authRouter = require("./routes/auth")

// SETUP
const express = require("express")
const app = express()
const PORT = 3000

const API_URL = "/v1/api"

app.use(express.json())
app.use(errorHandler)
app.use(requestIp.mw())

// ROUTER
app.use(API_URL, authRouter)
app.use(API_URL, usersRouter)

// INIT DB
const db = require("./models_sequelize")
// db.sequelize
//   .sync({ alter: true })
//   .then(() => {
//     console.log("Synced db.")
//   })
//   .catch((err) => {
//     console.log("Failed to sync db: " + err.message)
//   })

// LISTEN
app.listen(PORT, () => {
  console.log(`App is running on PORT ${PORT}`)
})

function errorHandler(err, req, res, next) {
  if (err.code === "23505") {
    // Handle unique constraint violation error
    res.status(409).json({ error: "Duplicate key error" })
  } else {
    // Handle other database errors
    res.status(500).json({ error: "Database error" })
  }
}
