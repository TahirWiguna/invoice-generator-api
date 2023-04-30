const db = require("../models_sequelize")
const Op = db.Sequelize.Op
const moment = require("moment")

const DEFAULT_OPTIONS = {
  hideColumns: [],
  onlyColumns: [],
}

function _type(type) {
  switch (type) {
    case "STRING":
    case "CHAR":
    case "TEXT":
      return "text"
    case "INTEGER":
    case "BIGINT":
    case "FLOAT":
    case "DOUBLE":
    case "DECIMAL":
    case "REAL":
    case "NUMERIC":
    case "SMALLINT":
    case "TINYINT":
    case "MEDIUMINT":
      return "integer"
    case "DATE":
    case "DATEONLY":
      return "date"
    default:
      return "text"
  }
}

const datatable = (model, value, options = {}) => {
  const { draw, start, length, search, order, columns } = value
  const { hideColumns, onlyColumns } = { ...DEFAULT_OPTIONS, ...options }

  const searchValue = search.value
  const searchRegex = search.regex

  const orderColumn = order[0].column
  const orderDir = order[0].dir
  const orderColumnName = columns[orderColumn].data

  const tableName = model.tableName

  const tableColumns = []
  for (let key in model.rawAttributes) {
    tableColumns.push({
      name: key,
      type: model.rawAttributes[key].type.key,
    })
  }

  var where = null

  // GLOBAL SEARCH
  if (searchValue !== "") {
    const whereArray = tableColumns
      .filter((col) => {
        if (hideColumns.includes(col.data)) return false
        if (onlyColumns.length && !onlyColumns.includes(col.data)) return false

        return true
      })
      .map((col) => {
        const type = _type(col.type)
        if (type == "text") {
          return {
            [col.data]: { [Op.iLike]: `%${searchValue}%` },
          }
        } else if (type == "integer") {
          return {
            [col.data]: { [Op.iLike]: searchValue },
          }
        } else if (type == "date") {
          return db.sequelize.where(
            db.sequelize.fn(
              "DATE",
              db.sequelize.col(tableName + "." + col.data)
            ),
            {
              [Op.eq]: moment(searchValue, "YYYY-MM-DD", true).isValid()
                ? searchValue
                : null,
            }
          )
        }
      })
    where = { [Op.or]: [...whereArray] }
  }

  const whereColumns = columns
    .filter((col) => col.search.value !== "")
    .map((col) => {
      const column = tableColumns.find((c) => c.name === col.data)
      if (!column) return null
      const type = _type(column.type)

      const searchValue = col.search.value
      const searchRegex = col.search.regex

      if (type == "text") {
        return {
          [col.data]: { [Op.iLike]: `%${col.search.value}%` },
        }
      } else if (type == "integer") {
        return {
          [col.data]: { [Op.eq]: parseInt(col.search.value) },
        }
      } else if (type == "date") {
        return db.sequelize.where(
          db.sequelize.fn("DATE", db.sequelize.col(tableName + "." + col.data)),
          {
            [Op.eq]: moment(searchValue, "YYYY-MM-DD", true).isValid()
              ? searchValue
              : null,
          }
        )
      }
    })

  return { [Op.and]: [where, ...whereColumns] }
}

module.exports = { datatable }
