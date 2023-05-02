"use strict"
const { Model } = require("sequelize")
module.exports = (sequelize, DataTypes) => {
  class invoice extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      invoice.belongsTo(models.users, {
        foreignKey: "created_by",
        as: "creator",
      })
      invoice.belongsTo(models.users, {
        foreignKey: "updated_by",
        as: "updater",
      })
      invoice.belongsTo(models.client, {
        foreignKey: "client_id",
        as: "client",
      })
      invoice.hasMany(models.invoice_item, {
        foreignKey: "invoice_id",
        as: "items",
      })
    }
  }
  invoice.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.BIGINT,
      },
      due_date: DataTypes.DATE,
      client_id: DataTypes.BIGINT,
      total_amount: DataTypes.DECIMAL(15, 2),
      amount_paid: DataTypes.DECIMAL(15, 2),
      payment_method: DataTypes.ENUM([
        "cash",
        "transfer",
        "credit_card",
        "debit_card",
      ]),
      payment_date: DataTypes.DATE,
      status: DataTypes.ENUM(["unpaid", "partial", "paid"]),
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
      modelName: "invoice",
    }
  )
  return invoice
}
