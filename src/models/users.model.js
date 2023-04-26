"use strict"
const { Model } = require("sequelize")

const MODEL_NAME = "users"

module.exports = (sequelize, Sequelize) => {
  class model extends Model {
    static associate(models) {
      this.hasMany(models.users_token, {
        foreignKey: "user_id",
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
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      username: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      fullname: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      last_login: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      last_ip_address: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      login_attempts: {
        type: Sequelize.SMALLINT,
        allowNull: true,
      },
      banned_until: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      status: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("now"),
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: MODEL_NAME,
      indexes: [
        {
          unique: true,
          fields: ["email"],
          where: {
            status: true,
          },
        },
        {
          unique: true,
          fields: ["username"],
          where: {
            status: true,
          },
        },
        {
          fields: ["created_at"],
        },
        {
          fields: ["last_login"],
        },
      ],
    }
  )
  return model
}
