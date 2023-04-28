"use strict"
const bcrypt = require("bcrypt")
const models = require("../src/models_sequelize")
const saltRounds = 10

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // inserting roles
      const data_role = [
        {
          name: "admin",
          description: "Administrator",
        },
      ]
      await queryInterface.bulkInsert("roles", data_role)

      // inserting user
      const role = await models.roles.findOne({ where: { name: "admin" } })
      const role_id = role.id
      const data_user = [
        {
          email: "mtahirwiguna@gmail.com",
          username: "tahir",
          password: await bcrypt.hash("123123", saltRounds),
          fullname: "Tahir Wiguna",
          active: true,
        },
        {
          email: "admin@hr.com",
          username: "admin",
          password: await bcrypt.hash("rahasia", saltRounds),
          fullname: "Admin HR",
          active: true,
        },
      ]
      await queryInterface.bulkInsert("users", data_user)

      const user_admin = await models.users.findOne({
        where: { username: "admin" },
      })

      // inserting permission
      let data_permission = []
      data_permission.push(...makePermission("users", user_admin.id))
      data_permission.push(...makePermission("roles", user_admin.id))
      data_permission.push(...makePermission("permission", user_admin.id))
      data_permission.push(...makePermission("roles_permission", user_admin.id))

      await queryInterface.bulkInsert("permission", data_permission)

      // inserting role_permission
      const permission = await models.permission.findAll()
      const permission_id = permission.map((item) => item.id)
      const data_role_permission = []
      permission_id.forEach((item) => {
        data_role_permission.push({
          roles_id: role_id,
          permission_id: item,
          created_by: user_admin.id,
        })
      })
      await queryInterface.bulkInsert("roles_permission", data_role_permission)

      // inserting user_role
      const users = await models.users.findAll()
      const users_id = users.map((item) => item.id)
      const data_user_role = []
      users_id.forEach((item) => {
        data_user_role.push({
          users_id: item,
          roles_id: role_id,
          created_by: user_admin.id,
        })
      })
      await queryInterface.bulkInsert("users_roles", data_user_role)
    } catch (error) {
      console.log(error)
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      // start deleting roles,user
      await queryInterface.sequelize.query(
        "ALTER TABLE roles DISABLE TRIGGER ALL",
        null
      )
      await queryInterface.sequelize.query(
        "ALTER TABLE users DISABLE TRIGGER ALL",
        null
      )

      await queryInterface.bulkDelete("roles", null, {
        truncate: true,
        cascade: true,
      })
      await queryInterface.bulkDelete("users", null, {
        truncate: true,
        cascade: true,
      })

      await queryInterface.sequelize.query(
        "ALTER TABLE roles ENABLE TRIGGER ALL",
        null
      )
      await queryInterface.sequelize.query(
        "ALTER TABLE users ENABLE TRIGGER ALL",
        null
      )

      // start deleting permission
      await queryInterface.bulkDelete("permission", null, {
        truncate: true,
        cascade: true,
      })
      await queryInterface.bulkDelete("roles_permission", null, {
        truncate: true,
        cascade: true,
      })
    } catch (error) {
      console.log(error)
    }
  },
}

/**
 * @param {string} modules The date
 * @param {int} id_admin The date
 */
function makePermission(modules, id_admin) {
  return [
    {
      name: `${modules}.create`,
      description: `Create ${modules}`,
      module: modules,
      created_by: id_admin,
    },
    {
      name: `${modules}.read`,
      description: `Read ${modules}`,
      module: modules,
      created_by: id_admin,
    },
    {
      name: `${modules}.update`,
      description: `Update ${modules}`,
      module: modules,
      created_by: id_admin,
    },
    {
      name: `${modules}.delete`,
      description: `Delete ${modules}`,
      module: modules,
      created_by: id_admin,
    },
    {
      name: `${modules}.export`,
      description: `Export ${modules}`,
      module: modules,
      created_by: id_admin,
    },
  ]
}
