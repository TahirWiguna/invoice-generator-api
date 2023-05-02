"use strict"
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("invoice", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT,
      },
      due_date: {
        type: Sequelize.DATE,
      },
      client_id: {
        type: Sequelize.BIGINT,
        references: {
          model: "client",
          key: "id",
          as: "client",
        },
      },
      total_amount: {
        type: Sequelize.DECIMAL(15, 2),
      },
      amount_paid: {
        type: Sequelize.DECIMAL(15, 2),
      },
      payment_method_id: {
        type: Sequelize.BIGINT,
        references: {
          model: "master_payment_method",
          key: "id",
          as: "payment_method",
        },
      },
      payment_date: {
        type: Sequelize.DATE,
      },
      status: {
        type: Sequelize.STRING,
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
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("invoice")
  },
}
