const conf = {
  development: {
    username: process.env.DEV_DB_USER,
    password: process.env.DEV_DB_PASSWORD,
    database: process.env.DEV_DB_NAME,
    host: process.env.DEV_DB_HOST,
    dialect: process.env.DEV_DB_PROVIDER,
    port: process.env.DEV_DB_PORT,
    operatorsAliases: 0,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    init: {
      freezeTableName: true, //prevent sequelize from pluralizing table names
      timestamps: false, // disable automatic timestamps
    },
    define: {
      freezeTableName: true, //prevent sequelize from pluralizing table names
      timestamps: false, // disable automatic timestamps
    },
  },
  test: {
    username: process.env.DEV_DB_USER,
    password: process.env.DEV_DB_PASSWORD,
    database: process.env.DEV_DB_NAME,
    host: process.env.DEV_DB_HOST,
    port: process.env.DEV_DB_PORT,
    dialect: process.env.DEV_DB_PROVIDER,
    operatorsAliases: 0,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    init: {
      freezeTableName: true, //prevent sequelize from pluralizing table names
      timestamps: false, // disable automatic timestamps
    },
    define: {
      freezeTableName: true, //prevent sequelize from pluralizing table names
      timestamps: false, // disable automatic timestamps
    },
  },
  production: {
    username: process.env.PROD_DB_USER,
    password: process.env.PROD_DB_PASSWORD,
    database: process.env.PROD_DB_NAME,
    host: process.env.PROD_DB_HOST,
    dialect: process.env.PROD_DB_PROVIDER,
    port: process.env.PROD_DB_PORT,
    operatorsAliases: 0,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    init: {
      freezeTableName: true, //prevent sequelize from pluralizing table names
      timestamps: false, // disable automatic timestamps
    },
    define: {
      freezeTableName: true, //prevent sequelize from pluralizing table names
      timestamps: false, // disable automatic timestamps
    },
  },
}

module.exports = conf
