"use strict"
const { Model } = require("sequelize")

const MODEL_NAME = "users_roles"

module.exports = (sequelize, Sequelize) => {
  class model extends Model {
    static associate(models) {}
  }

  model.init(
    {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      users_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      roles_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("now"),
        allowNull: false,
      },
      created_by: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: MODEL_NAME,
      indexes: [
        {
          fields: ["users_id", "roles_id"],
          unique: true,
        },
      ],
    }
  )

  return model
}
