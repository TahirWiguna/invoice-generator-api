"use strict";
const models = require("../src/models_sequelize");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const data = [
      {
        name: "QRIS",
      },
    ];

    await queryInterface.bulkInsert("master_payment_method", data);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("master_payment_method", null, {
      truncate: true,
      cascade: true,
    });
  },
};
