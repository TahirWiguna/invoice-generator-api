"use strict";
const models = require("../src/models_sequelize");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const data = [
      {
        company_name: "PT. ABC",
        name: "John Doe",
        address: "Jl. ABC No. 123",
        phone_number: "081234567890",
        email: "abc@gmail.com",
      },
    ];

    await queryInterface.bulkInsert("client", data);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("client", null, {
      truncate: true,
      cascade: true,
    });
  },
};
