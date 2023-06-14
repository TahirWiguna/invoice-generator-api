"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class invoice_item extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      invoice_item.belongsTo(models.invoice, {
        foreignKey: "invoice_id",
        as: "invoice",
      });
    }
  }
  invoice_item.init(
    {
      invoice_id: DataTypes.BIGINT,
      item_name: DataTypes.STRING(100),
      item_description: DataTypes.TEXT,
      quantity: DataTypes.SMALLINT,
      item_price: DataTypes.DECIMAL(15, 2),
      total_price: DataTypes.DECIMAL(15, 2),
    },
    {
      sequelize,
      modelName: "invoice_item",
    }
  );
  return invoice_item;
};
