"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class payment_history extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      payment_history.belongsTo(models.users, {
        foreignKey: "created_by",
        as: "creator",
      });
      payment_history.belongsTo(models.users, {
        foreignKey: "updated_by",
        as: "updater",
      });
      payment_history.belongsTo(models.invoice, {
        foreignKey: "invoice_id",
        as: "invoice",
      });
      payment_history.belongsTo(models.master_payment_method, {
        foreignKey: "payment_method_id",
        as: "payment",
      });
    }
  }
  payment_history.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.BIGINT,
      },
      invoice_id: {
        type: DataTypes.BIGINT,
      },
      payment_method_id: {
        type: DataTypes.BIGINT,
      },
      amount: DataTypes.DECIMAL(15, 2),
      created_at: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: sequelize.fn("now"),
      },
      updated_at: DataTypes.DATE,
      updated_by: {
        allowNull: true,
        type: DataTypes.BIGINT,
      },
    },
    {
      sequelize,
      modelName: "payment_history",
    }
  );
  return payment_history;
};
