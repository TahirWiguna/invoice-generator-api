const winston = require("winston")

// create logger instance
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    // new winston.transports.Console(),
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "info.log", level: "info" }),
    new winston.transports.File({ filename: "combined.log" }),
  ],
})

// log request info middleware
const logRequest = (req, res, next) => {
  logger.info({
    message: "Request info",
    method: req.method,
    url: req.originalUrl,
    body: req.body,
  })
  next()
}

// log error middleware
const logError = (err, req, res, next) => {
  logger.error({
    message: "Request error",
    method: req.method,
    url: req.originalUrl,
    body: req.body,
    error: err.stack,
  })
  next(err)
}

module.exports = { logger, logRequest, logError }
