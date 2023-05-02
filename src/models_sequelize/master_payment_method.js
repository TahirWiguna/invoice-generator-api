"use strict"
const { Model } = require("sequelize")
module.exports = (sequelize, DataTypes) => {
  class master_payment_method extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      master_payment_method.belongsTo(models.users, {
        foreignKey: "created_by",
        as: "creator",
      })
      master_payment_method.belongsTo(models.users, {
        foreignKey: "updated_by",
        as: "updater",
      })
    }
  }
  master_payment_method.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.BIGINT,
      },
      name: {
        type: DataTypes.STRING(100),
      },
      deleted: {
        allowNull: false,
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      created_at: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      created_by: {
        allowNull: false,
        type: DataTypes.BIGINT,
      },
      updated_at: DataTypes.DATE,
      updated_by: {
        allowNull: true,
        type: DataTypes.BIGINT,
      },
    },
    {
      sequelize,
      modelName: "master_payment_method",
      indexes: [
        {
          unique: true,
          fields: ["name"],
          where: {
            deleted: false,
          },
        },
      ],
    }
  )
  return master_payment_method
}
