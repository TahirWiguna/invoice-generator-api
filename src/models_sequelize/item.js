"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class item extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      item.belongsTo(models.users, {
        foreignKey: "created_by",
        as: "creator",
      });
      item.belongsTo(models.users, {
        foreignKey: "updated_by",
        as: "updater",
      });
    }
  }
  item.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.BIGINT,
      },
      name: DataTypes.STRING,
      description: DataTypes.TEXT,
      price: DataTypes.DECIMAL(15, 2),
      deleted: {
        allowNull: false,
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      created_at: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: DataTypes.fn("now"),
      },
      created_by: {
        allowNull: false,
        type: DataTypes.BIGINT,
      },
      updated_at: {
        allowNull: true,
        type: DataTypes.DATE,
      },
      updated_by: {
        allowNull: true,
        type: DataTypes.BIGINT,
      },
    },
    {
      sequelize,
      modelName: "item",
      indexes: [
        {
          unique: true,
          fields: ["name"],
          where: {
            deleted: true,
          },
        },
      ],
    }
  );
  return item;
};
