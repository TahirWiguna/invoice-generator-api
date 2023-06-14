"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("invoice_item", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      invoice_id: {
        type: Sequelize.BIGINT,
        references: {
          model: "invoice",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      item_name: {
        type: Sequelize.STRING(100),
      },
      item_description: {
        type: Sequelize.TEXT,
      },
      quantity: {
        type: Sequelize.SMALLINT,
      },
      item_price: {
        type: Sequelize.DECIMAL(15, 2),
      },
      total_price: {
        type: Sequelize.DECIMAL(15, 2),
      },
    });

    await queryInterface.addIndex("invoice_item", {
      unique: true,
      fields: ["invoice_id", "item_name"],
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("invoice_item");
  },
};
