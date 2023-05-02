"use strict"
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("client", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT,
      },
      company_name: {
        type: Sequelize.STRING(100),
      },
      name: {
        type: Sequelize.STRING(100),
      },
      address: {
        type: Sequelize.STRING(255),
      },
      email: {
        type: Sequelize.STRING(50),
      },
      phone_number: {
        type: Sequelize.STRING(20),
      },
      deleted: {
        allowNull: false,
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      created_by: {
        allowNull: false,
        type: Sequelize.BIGINT,
        references: {
          model: "users",
          key: "id",
          as: "creator",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      updated_at: {
        allowNull: true,
        type: Sequelize.DATE,
      },
      updated_by: {
        allowNull: true,
        type: Sequelize.BIGINT,
        references: {
          model: "users",
          key: "id",
          as: "creator",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
    })

    await queryInterface.addIndex("client", {
      unique: true,
      fields: ["email"],
      where: {
        deleted: true,
      },
    })
    await queryInterface.addIndex("client", {
      unique: true,
      fields: ["company_name"],
      where: {
        deleted: true,
      },
    })
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("client")
  },
}
