"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class client extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      client.belongsTo(models.users, {
        foreignKey: "created_by",
        as: "creator",
      });
      client.belongsTo(models.users, {
        foreignKey: "updated_by",
        as: "updater",
      });
    }
  }
  client.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.BIGINT,
      },
      company_name: DataTypes.STRING,
      name: DataTypes.STRING,
      address: DataTypes.STRING,
      email: DataTypes.STRING,
      phone_number: DataTypes.STRING,
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
      modelName: "client",
      indexes: [
        {
          unique: true,
          fields: ["company_name"],
          where: {
            deleted: true,
          },
        },
        {
          unique: true,
          fields: ["email"],
          where: {
            deleted: true,
          },
        },
      ],
    }
  );
  return client;
};
