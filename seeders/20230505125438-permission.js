"use strict";
const models = require("../src/models_sequelize");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      const user_admin = await models.users.findOne({
        where: { username: "admin" },
      });

      // inserting permission
      let data_permission = [];
      data_permission.push(...makePermission("users", user_admin.id));
      data_permission.push(...makePermission("roles", user_admin.id));
      data_permission.push(...makePermission("users_roles", user_admin.id));
      data_permission.push(...makePermission("permission", user_admin.id));
      data_permission.push(
        ...makePermission("roles_permission", user_admin.id)
      );

      data_permission.push(...makePermission("client", user_admin.id));
      data_permission.push(...makePermission("item", user_admin.id));
      data_permission.push(...makePermission("payment_method", user_admin.id));
      data_permission.push({
        name: `invoice.generate`,
        description: `Generate Invoice`,
        module: "invoice",
        created_by: user_admin.id,
      });

      await queryInterface.bulkInsert("permission", data_permission);

      // inserting role_permission
      const permission = await models.permission.findAll();
      const permission_id = permission.map((item) => item.id);
      const data_role_permission = [];
      permission_id.forEach((item) => {
        data_role_permission.push({
          roles_id: 1,
          permission_id: item,
          created_by: user_admin.id,
        });
      });
      await queryInterface.bulkInsert("roles_permission", data_role_permission);
    } catch (error) {
      console.log(error);
    }
  },

  async down(queryInterface, Sequelize) {
    // start deleting permission
    await queryInterface.bulkDelete("permission", null, {
      truncate: true,
      cascade: true,
    });
    await queryInterface.bulkDelete("roles_permission", null, {
      truncate: true,
      cascade: true,
    });
  },
};

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
  ];
}
