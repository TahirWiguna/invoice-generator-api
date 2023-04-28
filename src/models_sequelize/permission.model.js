"use strict"
const { Model } = require("sequelize")

const MODEL_NAME = "permission"

module.exports = (sequelize, DataTypes) => {
  class model extends Model {
    static associate(models) {
      this.hasMany(models.roles_permission, {
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
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      module: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.fn("now"),
        allowNull: false,
      },
      created_by: {
        type: DataTypes.BIGINT,
        allowNull: false,
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
