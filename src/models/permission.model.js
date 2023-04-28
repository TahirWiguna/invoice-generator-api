const { response, responseType } = require("../utils/response")
const db = require("../models_sequelize")
const { Op } = require("sequelize")
const Permission = db.permission
const RolesPermission = db.roles_permission

const checkId = async (id, res) => {
  const existingId = await Permission.findOne({ where: { id, active: true } })
  if (existingId) {
    return existingId
  }
  return null
}

/**
 * Check if a role has a permission
 * @param {string | string[]} role_ids
 * @param {string} permission_name
 * @returns {boolean}
 * @example
 * const hasPermission = await checkRolePermission("1", "users.read")
 * const hasPermission = await checkRolePermission(["1","2","3"], "users.read")
 */
const checkRolePermission = async (role_ids, permission_name) => {
  const existingPermission = await Permission.findOne({
    where: { name: permission_name },
  })

  if (!existingPermission) {
    return false
  }

  if (typeof role_ids === "string") {
    role_ids = [role_ids]
  }

  if (Array.isArray(role_ids)) {
    for (const role_id of role_ids) {
      const existingRolePermission = await RolesPermission.findOne({
        where: { roles_id: role_id, permission_id: existingPermission.id },
      })
      if (existingRolePermission) {
        return true
      }
    }
    return false
  }

  return false
}

module.exports = { checkId, checkRolePermission }
