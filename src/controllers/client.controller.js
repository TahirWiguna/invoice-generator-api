const Joi = require("joi")

const {
  responseType,
  response,
  responseCatch,
} = require("../../utils/response")
const { validateID, validateDatatable } = require("../../utils/joiValidator")
const { logger } = require("../../utils/logger")
const { datatable } = require("../../utils/datatable")

const { checkRolePermission } = require("../../models/auth/permission.model")

const db = require("../../models_sequelize")
const Op = db.Sequelize.Op
const Clients = db.client

exports.findAll = async (req, res) => {
    const { rolesId } = req
    try {
        // Validation
        const perm = await checkRolePermission(rolesId, "client.read")
        if (!perm) return response(res, responseType.FORBIDDEN)
        
        // Start transaction
        
    }
}