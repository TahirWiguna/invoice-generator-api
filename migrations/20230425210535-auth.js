"use strict"

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create tables
    await queryInterface.createTable("users", {
      id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      username: {
        type: Sequelize.STRING,
        allowNull: false,
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
      active: {
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
    })

    await queryInterface.createTable("roles", {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("now"),
        allowNull: false,
      },
      created_by: {
        type: Sequelize.BIGINT,
        allowNull: true,
      },
    })

    await queryInterface.createTable("users_roles", {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      users_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      roles_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: "roles",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
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
    })

    await queryInterface.createTable("permission", {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      module: {
        type: Sequelize.STRING,
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
        references: {
          model: "users",
          key: "id",
          onDelete: "CASCADE",
          onUpdate: "CASCADE",
        },
      },
    })

    await queryInterface.createTable("roles_permission", {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      roles_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: "roles",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      permission_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: "permission",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("now"),
        allowNull: false,
      },
      created_by: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
    })

    await queryInterface.createTable("users_token", {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      token: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      users_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      ip_address: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      user_agent: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        allowNull: false,
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false,
      },
    })

    // Options
    // user
    await queryInterface.addIndex("users", {
      unique: true,
      fields: ["email"],
      where: {
        active: true,
      },
    })
    await queryInterface.addIndex("users", {
      unique: true,
      fields: ["username"],
      where: {
        active: true,
      },
    })
    await queryInterface.addIndex("users", {
      fields: ["created_at"],
    })
    await queryInterface.addIndex("users", {
      fields: ["last_login"],
    })

    // roles
    await queryInterface.addIndex("roles", {
      fields: ["name"],
      unique: true,
    })

    // users roles
    await queryInterface.addIndex("users_roles", {
      fields: ["users_id", "roles_id"],
      unique: true,
    })

    // permission
    await queryInterface.addIndex("permission", {
      fields: ["name"],
      unique: true,
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("users_token")
    await queryInterface.dropTable("roles_permission")
    await queryInterface.dropTable("permission")
    await queryInterface.dropTable("users_roles")
    await queryInterface.dropTable("roles")
    await queryInterface.dropTable("users")
  },
}
