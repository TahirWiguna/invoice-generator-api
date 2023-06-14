const responseType = {
  SUCCESS: {
    code: 200,
    status: true,
    message: "Success",
  },
  CREATED: {
    code: 201,
    status: true,
    message: "Data has been created successfully",
  },
  UPDATED: {
    code: 200,
    status: true,
    message: "Data has been updated successfully",
  },
  DELETED: {
    code: 200,
    status: true,
    message: "Data has been deleted successfully",
  },

  FAILED: {
    code: 500,
    status: false,
    message: "Failed",
  },
  FAILED_CREATE: {
    code: 400,
    status: false,
    message: "Failed to create data",
  },
  FAILED_UPDATE: {
    code: 400,
    status: false,
    message: "Failed to update data",
  },
  FAILED_DELETE: {
    code: 400,
    status: false,
    message: "Failed to delete data",
  },

  BAD_REQUEST: {
    code: 400,
    status: false,
    message: "Bad Request",
  },
  UNAUTHORIZED: {
    code: 401,
    status: false,
    message: "Unauthorized",
  },
  FORBIDDEN: {
    code: 403,
    status: false,
    message: "Forbidden",
  },
  NOT_FOUND: {
    code: 404,
    status: false,
    message: "Not Found",
  },

  VALIDATION_ERROR: {
    code: 422,
    status: false,
    message: "Form Validation Error",
  },
  DATABASE_ERROR: {
    code: 400,
    status: false,
    message: "Error connecting to database",
  },
  DATABASE_VALIDATION_ERROR: {
    code: 400,
    status: false,
    message: "Database Validation Error",
  },
};

/**
 * @param {Response} res
 * @param {ResponseType} type
 * @param {String} message
 * @param {Array} data
 * @returns {Response}
 * @description
 * This function is used to send response to client
 * @example
 * response(res, responseType.SUCCESS, "Data has been created successfully", data)
 */
const response = (res, type, message, data = null) => {
  return res.status(type.code).json({
    status: type.status,
    message: message || type.message,
    data: data,
  });
};

/**
 * @param {Response} res
 * @param {Error} err
 * @returns {Response}
 */
const responseCatch = (res, err) => {
  let resp = responseType.FAILED;
  if (err.name == "SequelizeUniqueConstraintError") {
    err.message = err.errors.map((e) => e.message);
    resp = responseType.DATABASE_VALIDATION_ERROR;
  } else if (err.name == "SequelizeForeignKeyConstraintError") {
    err.message =
      process.env.NODE_ENV === "development"
        ? `Unable to create or update record: ${err.parent.detail}`
        : `Unable to create or update record.`;
    resp = responseType.DATABASE_VALIDATION_ERROR;
  } else if (err.name == "SequelizeDatabaseError") {
    err.message = `Oops! Something went wrong.`;
    resp = responseType.FAILED;
  } else if (err.message == "Validation error") {
    err.message = "DB Validation Error";
    resp = responseType.DATABASE_VALIDATION_ERROR;
  }
  return response(
    res,
    resp,
    err.message || "Some error occurred while connecting to databases.",
    process.env.NODE_ENV === "development" ? err : null
  );
};

module.exports = { responseType, response, responseCatch };
