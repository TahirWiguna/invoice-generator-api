"use strict"
const { Model } = require("sequelize")

const MODEL_NAME = "roles"

module.exports = (sequelize, Sequelize) => {
  class model extends Model {
    static associate(models) {
      this.belongsTo(models.users, {
        foreignKey: "created_by",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
        as: "creator",
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
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      description: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("now"),
        allowNull: false,
      },
      created_by: {
        type: Sequelize.BIGINT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: MODEL_NAME,
      indexes: [
        {
          fields: ["name"],
          unique: true,
        },
      ],
    }
  )

  return model
}
