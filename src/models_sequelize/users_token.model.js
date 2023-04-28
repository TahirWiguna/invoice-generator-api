"use strict"
const { Model } = require("sequelize")

const MODEL_NAME = "users_token"

module.exports = (sequelize, Sequelize) => {
  class model extends Model {
    static associate(models) {
      this.belongsTo(models.users, {
        foreignKey: "users_id",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      })
    }
  }

  model.init(
    {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      token: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      ip_address: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      user_agent: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      users_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("now"),
        allowNull: false,
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: MODEL_NAME,
      indexes: [
        {
          fields: ["token"],
        },
      ],
    }
  )

  return model
}
