"use strict"
const { Model } = require("sequelize")

const MODEL_NAME = "users_token"

module.exports = (sequelize, Sequelize) => {
  class model extends Model {
    static associate(models) {
      this.belongsTo(models.users, {
        foreignKey: "user_id",
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
      user_id: {
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
