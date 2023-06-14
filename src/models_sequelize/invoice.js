"use strict";
const { Model } = require("sequelize");
const { format } = require("../utils/general");
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
      });
      invoice.belongsTo(models.users, {
        foreignKey: "updated_by",
        as: "updater",
      });
      invoice.belongsTo(models.client, {
        foreignKey: "client_id",
        as: "client",
      });
      invoice.hasMany(models.invoice_item, {
        foreignKey: "invoice_id",
        as: "items",
      });
    }

    get amount_paid_formatted() {
      return `${format(this.amount_paid)}`;
    }
    get total_amount_formatted() {
      return `${format(this.total_amount)}`;
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
      total_amount: {
        allowNull: false,
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0,
      },
      amount_paid: {
        allowNull: false,
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0,
      },
      payment_method_id: DataTypes.BIGINT,
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
      modelName: "invoice",
    }
  );
  return invoice;
};
