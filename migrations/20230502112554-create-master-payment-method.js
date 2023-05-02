"use strict"
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("master_payment_method", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      name: {
        type: Sequelize.STRING(100),
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

    await queryInterface.addIndex("master_payment_method", {
      unique: true,
      fields: ["name"],
      where: {
        deleted: true,
      },
    })
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("master_payment_method")
  },
}
