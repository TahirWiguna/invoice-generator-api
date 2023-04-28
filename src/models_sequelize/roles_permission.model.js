"use strict"
const { Model } = require("sequelize")

const MODEL_NAME = "roles_permission"

module.exports = (sequelize, Sequelize) => {
  class model extends Model {
    static associate(models) {
      this.belongsTo(models.roles, {
        foreignKey: "roles_id",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      })
      this.belongsTo(models.permission, {
        foreignKey: "permission_id",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      })
      this.belongsTo(models.users, {
        foreignKey: "created_by",
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
      roles_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      permission_id: {
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
    }
  )

  return model
}
